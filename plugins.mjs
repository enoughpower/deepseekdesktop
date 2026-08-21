#!/usr/bin/env node
/**
 * plugins.mjs - CLI to install/remove third-party plugins in the running
 * desktop profile, using the official dsh plugin mechanism.
 *
 * Usage:
 *   node plugins.mjs add <package> [--profile <name>]
 *   node plugins.mjs remove <package> [--profile <name>]
 *   node plugins.mjs list [--profile <name>]
 *
 * Ensures the desktop's own node+pnpm shims (desktop-bin.mjs), prepends them to
 * PATH, then runs `node <dsh> plugin --profile <name> <pnpm-args>`. `add` passes
 * -w because the profile is a pnpm workspace root.
 *
 * Non-bundle client plugins (declare `dsh.client` but no `dsh.bundle`) are not
 * auto-activated by `dsh plugin add`; this tool appends/removes their activation
 * row in the profile's user layer (cordis.patch.yml) so they take effect.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureDesktopBin } from "./desktop-bin.mjs";
import { resolveDesktopHome } from "./dsh-home.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DSH_BIN = join(HERE, "node_modules", "@deepseek-ai", "dsh", "lib", "bin.js");
const DEFAULT_PROFILE = "web";
const CORDIS_PATCH = "cordis.patch.yml";

function parseArgs(argv) {
  const args = argv.slice(2);
  let profile = DEFAULT_PROFILE;
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--profile" && i + 1 < args.length) { profile = args[++i]; continue; }
    positional.push(args[i]);
  }
  return { profile, verb: positional[0], pkg: positional[1] };
}

function profileDir(profile, home = process.env.DSH_HOME || resolveDesktopHome()) {
  return join(home, "profiles", profile);
}

async function listBundles(profile) {
  const dir = profileDir(profile);
  const manifestPath = join(dir, "package.json");
  if (!existsSync(manifestPath)) { console.log("(profile not initialized)"); return; }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const bundles = manifest.dsh?.profile?.bundles ?? [];
  const deps = Object.keys(manifest.dependencies ?? {});
  console.log(`profile: ${profile}`);
  console.log(`bundles (${bundles.length}): ${bundles.length ? bundles.join(", ") : "(none)"}`);
  if (deps.length) console.log(`dependencies: ${deps.join(", ")}`);
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }


async function reconcileClientActivation(profile, pkgName, installing) {
  const dir = profileDir(profile);
  const patchPath = join(dir, CORDIS_PATCH);
  const manifest = await readInstalledManifest(profile, pkgName);
  const isClient = manifest?.dsh?.client?.platform === "web";
  const isBundle = Boolean(manifest?.dsh?.bundle);
  // On add we require a client-only plugin; on remove the package may already
  // be gone from node_modules, so we strip the activation row by name.
  if (installing && (!isClient || isBundle)) return;

  let content = (existsSync(patchPath) ? await readFile(patchPath, "utf8") : "").trim();
  const id = pkgName.replace(/^@[^/]+\//, "").replace(/[^a-zA-Z0-9._-]/g, "_") || pkgName;
  const nameRe = escapeRe(pkgName);
  const has = new RegExp(`name:\\s*['\"]?${nameRe}`).test(content);

  if (installing) {
    if (has) { console.log(`[plugins] ${pkgName}: already activated; nothing to add`); return; }
    const entry = `- insert:\n    - id: ${id}\n      name: '${pkgName}'`;
    if (/\[\]\s*$/.test(content)) {
      await writeFile(patchPath, content.replace(/\[\]\s*$/, entry + "\n"), "utf8");
    } else {
      await writeFile(patchPath, content + (content ? "\n" : "") + entry + "\n", "utf8");
    }
    console.log(`[plugins] ${pkgName}: client-only plugin - added activation row`);
  } else {
    const re = new RegExp(`\\n?- insert:\\n    - id: ${id}\\n      name: '${escapeRe(pkgName)}'`, "g");
    let cleaned = content.replace(re, "");
    const stripped = cleaned.replace(/^#[^\n]*(\n|$)/gm, "").trim();
    if (stripped === "" || stripped === "[]") {
      await writeFile(patchPath, "[]\n", "utf8");
    } else {
      await writeFile(patchPath, cleaned.trimEnd() + "\n", "utf8");
    }
    console.log(`[plugins] ${pkgName}: removed activation row`);
  }
}

async function readInstalledManifest(profile, pkgName) {
  const file = join(profileDir(profile), "node_modules", pkgName, "package.json");
  if (!existsSync(file)) return null;
  try { return JSON.parse(await readFile(file, "utf8")); } catch { return null; }
}
async function resolveInstalledName(profile, spec) {
  if (existsSync(spec)) {
    const pj = join(spec, "package.json");
    if (existsSync(pj)) {
      try { return JSON.parse(await readFile(pj, "utf8")).name; } catch { /* fall through */ }
    }
  }
  const hash = spec.lastIndexOf("@");
  if (hash > 0 && !spec.startsWith("@")) return spec.slice(0, hash);
  return spec;
}

/**
 * Resolve a local-dir source to an absolute path before handing it to pnpm,
 * which runs in the profile directory. Without this a relative path like
 * `plugins/@scope/name` would resolve against the profile dir and mangle the
 * installed name/placement.
 */
function anchorSource(spec, cwd) {
  if (spec.startsWith("file:") || spec.startsWith("link:")) {
    const p = spec.slice(spec.indexOf(":") + 1);
    if (!isAbsolute(p) && existsSync(p)) return spec.slice(0, spec.indexOf(":") + 1) + join(cwd, p);
    return spec;
  }
  if (!isAbsolute(spec) && existsSync(spec)) return join(cwd, spec);
  return spec;
}

async function main() {
  const { profile, verb, pkg } = parseArgs(process.argv);
  if (!verb) {
    console.error("usage: node plugins.mjs <add|remove|list> <package> [--profile name]");
    process.exit(2);
  }

  // Target the desktop's isolated user-data home (unless the caller pinned
  // $DSH_HOME), so `dsh plugin` edits the same profile the app boots.
  if (process.env.DSH_HOME === undefined || process.env.DSH_HOME.trim() === "") {
    process.env.DSH_HOME = resolveDesktopHome();
  }

  const binDir = await ensureDesktopBin();
  if (!binDir) {
    console.error("error: pnpm is not bundled in this install (add it to package.json and rebuild).");
    process.exit(1);
  }

  if (verb === "list") { await listBundles(profile); return; }
  if (verb !== "add" && verb !== "remove") {
    console.error(`error: unknown verb '${verb}' (expected add|remove|list)`);
    process.exit(2);
  }
  if (!pkg) { console.error(`error: '${verb}' needs a <package>`); process.exit(2); }

  const env = { ...process.env, PATH: `${binDir}:${process.env.PATH ?? ""}` };
  const installSpec = anchorSource(pkg, process.cwd());
  const pnpmArgs = verb === "add" ? ["add", "-w", "--save-exact", installSpec] : ["remove", pkg];
  const args = [DSH_BIN, "plugin", "--profile", profile, ...pnpmArgs];

  console.log(`[plugins] ${verb} ${pkg} in profile '${profile}'`);
  const code = await new Promise((resolve) => {
    const child = spawn(process.execPath, args, { stdio: "inherit", env });
    child.on("exit", (c) => resolve(c ?? 1));
    child.on("error", (err) => { console.error(`[plugins] failed: ${err.message}`); resolve(1); });
  });
  if (code !== 0) process.exit(code);

  const realName = await resolveInstalledName(profile, pkg);
  await reconcileClientActivation(profile, realName, verb === "add");
  await listBundles(profile);
}

await main();
