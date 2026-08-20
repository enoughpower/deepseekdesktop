#!/usr/bin/env node
/**
 * desktop-bin.mjs - ensure the desktop's own node + pnpm are on PATH.
 *
 * The desktop app bundles its own Node runtime (backend/node) and (after 方案 C)
 * its own pnpm. The official 'dsh plugin --profile <name> <pnpm args>' command
 * shells out to bare `pnpm`, which must be resolvable WITHOUT a system install.
 * We create tiny POSIX shims under ~/.dsh/.desktop-bin/{node,pnpm} that exec the
 * bundled runtime, then prepend that directory (and the backend dir) to PATH.
 *
 * Idempotent and cheap: call it at launcher startup and from plugins.mjs.
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile, chmod } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

/** Directory holding the shims (kept alongside the harness home). */
export function desktopBinDir(home = process.env.DSH_HOME || join(homedir(), ".dsh")) {
  return join(home, ".desktop-bin");
}

/** The bundled Node executable, if this copy is a built app (backend/node). */
function bundledNode() {
  const p = join(HERE, "node");
  return existsSync(p) ? p : process.execPath; // repo/dev: use the running node
}

/** Resolve pnpm's JS entry (pnpm/bin/pnpm.cjs) next to this module. */
export function resolvePnpmEntry(here = HERE) {
  const candidates = [
    join(here, "node_modules", "pnpm", "bin", "pnpm.cjs"),
    join(here, "node_modules", "pnpm", "bin", "pnpm.mjs"),
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  return null;
}

function shellQuote(v) {
  return `'${String(v).replace(/'/g, `'\\''`)}'`;
}

/**
 * Create {node,pnpm} shims under ~/.dsh/.desktop-bin that exec the bundled
 * runtime. Returns the shim directory (or null if pnpm is not present).
 */
export async function ensureDesktopBin(home) {
  const nodePath = bundledNode();
  const pnpmEntry = resolvePnpmEntry();
  if (!pnpmEntry) return null;
  const dir = desktopBinDir(home);
  await mkdir(dir, { recursive: true });

  // Node shim
  const nodeShim = join(dir, "node");
  await writeFile(nodeShim, `#!/bin/sh\nexec ${shellQuote(nodePath)} \"$@\"\n`, { mode: 0o755 });
  await chmod(nodeShim, 0o755);

  // pnpm shim
  const pnpmShim = join(dir, "pnpm");
  await writeFile(pnpmShim, `#!/bin/sh\nexec ${shellQuote(nodePath)} ${shellQuote(pnpmEntry)} \"$@\"\n`, { mode: 0o755 });
  await chmod(pnpmShim, 0o755);
  return dir;
}

/** Prepend the shim dir (and backend) to a PATH string, dedup'd. */
export function withDesktopBinOnPath(pathValue, home) {
  const extra = [desktopBinDir(home), HERE];
  const seen = new Set((pathValue || "").split(":").filter(Boolean));
  for (const p of extra) if (!seen.has(p)) { seen.add(p); pathValue = pathValue ? pathValue + ":" + p : p; }
  return pathValue;
}

/* Allow running directly to sanity-check the shims. */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dir = await ensureDesktopBin();
  console.log(dir ? `shims ready in ${dir}` : "pnpm not bundled - no shim created");
}