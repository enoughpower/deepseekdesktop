#!/usr/bin/env node
/**
 * dsh-home.mjs - isolated user-data home for the desktop app.
 *
 * The desktop app keeps its own DeepSeek Harness home so its configuration,
 * credentials, sessions, attachments and profiles stay SEPARATE from the
 * command-line `dsh web` (which uses the shared `~/.dsh`). It does this the
 * same way the harness itself does: by setting `DSH_HOME` to a dedicated
 * directory before the backend boots.
 *
 * It also restores the bundled-plugin resolution contract: the profile patch
 * overlays (git/updater/vision/skills/mcp/theme usage…) register
 * plugin packages that live inside the app backend's `node_modules`, not in
 * the user profile's dependency tree. The official machine reads those as bare
 * ESM imports from the profile directory, walking through
 * `$DSH_HOME/profiles/node_modules` as a flat fallback (the same role the
 * harness's own `healProfilesModuleFallback` plays for the in-box closure).
 * This module creates those links so a fresh, isolated profile can resolve the
 * bundled plugins — the step that makes the app boot again on a new data dir.
 */
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

/** Directory name (under ~/Library/Application Support) holding app user data. */
export const DESKTOP_DATA_DIR_NAME = "DeepSeekHarness";

/**
 * Resolve the desktop app's user-data home (its `DSH_HOME`).
 *
 * Precedence: an explicit `$DSH_HOME` (respects a power-user override) wins;
 * otherwise the app uses its own data directory under the macOS Application
 * Support root. It NEVER falls back to `~/.dsh`, so desktop data never mixes
 * with the CLI `dsh web`'s shared home.
 * @param env - environment mapping used to read `DSH_HOME` (defaults to process.env).
 * @returns the absolute desktop home path.
 */
export function resolveDesktopHome(env = process.env) {
  const explicit = env.DSH_HOME;
  if (explicit !== undefined && typeof explicit === "string" && explicit.trim() !== "") return explicit;
  return join(homedir(), "Library", "Application Support", DESKTOP_DATA_DIR_NAME);
}

/**
 * Collect the bundle package names referenced by every `*.patch.yml` in a
 * directory. Each overlay patch `insert`s rows whose `name:` is a bare package
 * specifier that must resolve from the profile. Scoped names come through as
 * `@scope/name`; unscoped ones as `name`.
 * @param backendDir - the backend directory holding the overlay patches.
 * @returns a de-duplicated, order-stable list of package names.
 */
export function collectPatchPackageNames(backendDir) {
  const names = [];
  const seen = new Set();
  let files = [];
  try {
    files = readdirSync(backendDir).filter((f) => f.endsWith(".patch.yml")).sort();
  } catch {
    return names;
  }
  for (const file of files) {
    let content;
    try {
      content = readFileSync(join(backendDir, file), "utf8");
    } catch {
      continue;
    }
    // Only collect `name:` fields that belong to an `- insert:` block so
    // unrelated `name:` keys (if any ever appear) never get treated as plugins.
    const rows = [...content.matchAll(/- insert:[\s\S]*?(?=\n- |\n[A-Za-z]|$)/g)];
    for (const block of rows) {
      for (const m of block[0].matchAll(/name:\s*['"]([^'"]+)['"]/g)) {
        const pkg = m[1];
        if (pkg && !seen.has(pkg)) {
          seen.add(pkg);
          names.push(pkg);
        }
      }
    }
  }
  return names;
}

/**
 * Point `link` at `target`, replacing only a wrong or dangling symlink. A real
 * directory that already occupies the name is left untouched (it may be a
 * user-installed plugin), mirroring the safety of the harness's own
 * `healProfilesModuleFallback`. Absolute links only.
 */
function linkOrReplace(link, target) {
  let stat = null;
  try {
    stat = lstatSync(link);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (stat === null) {
    mkdirSync(dirname(link), { recursive: true });
    symlinkSync(target, link);
    return;
  }
  if (!stat.isSymbolicLink()) return; // real dir → hands off
  let current = null;
  try {
    current = realpathSync(link);
  } catch {
    current = null; // dangling link
  }
  if (current !== null && current === realpathSync(target)) return; // already correct
  rmSync(link, { force: true });
  symlinkSync(target, link);
}

/**
 * Ensure every bundled overlay plugin is reachable from the profile by
 * symlinking it into `$DSH_HOME/profiles/node_modules`. Idempotent: correct
 * links are kept, wrong/dangling links are re-pointed. Skipped when the
 * package is not actually bundled (dev tree, or the plugin was pruned).
 * @param backendDir - backend directory: holds the `*.patch.yml` overlays and `node_modules/`.
 * @param home - the resolved desktop home (`$DSH_HOME`).
 * @returns the number of packages linked.
 */
export function linkBundledPlugins(backendDir, home) {
  const nodeModules = join(backendDir, "node_modules");
  const profilesNodeModules = join(home, "profiles", "node_modules");
  const names = collectPatchPackageNames(backendDir);
  let linked = 0;
  for (const name of names) {
    const src = join(nodeModules, name);
    if (!existsSync(join(src, "package.json"))) continue; // not bundled here
    const link = join(profilesNodeModules, name);
    linkOrReplace(link, src);
    linked++;
  }
  return linked;
}
