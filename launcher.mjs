#!/usr/bin/env node
/**
 * Backend supervisor for the DeepSeek Harness desktop shell.
 *
 * The native shell spawns `node launcher.mjs`. This process then boots the
 * `dsh web` backend on a loopback port chosen by the OS, waits until the
 * frontend actually answers, prints a single `DSH_READY=<url>` line to its
 * own stdout (that is all the shell parses), and keeps the backend alive,
 * mirroring its logs to stderr and forwarding termination signals.
 *
 * Everything lives under <app>/Contents/Resources/backend, so paths are
 * resolved relative to this file, never the current working directory.
 */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

const HERE = dirname(fileURLToPath(import.meta.url));
const DSH_BIN = join(HERE, "node_modules", "@deepseek-ai", "dsh", "lib", "bin.js");
const PRUNE_PATCH = join(HERE, "prune.patch.yml");
const GIT_PATCH = join(HERE, "git.patch.yml");
const BILLING_PATCH = join(HERE, "billing.patch.yml");
const UPDATER_PATCH = join(HERE, "updater.patch.yml");
const IMAGE_INPUT_PATCH = join(HERE, "image-input.patch.yml");
const SKILL_MANAGER_PATCH = join(HERE, "skill-manager.patch.yml");
const MCP_SETTINGS_PATCH = join(HERE, "mcp-settings.patch.yml");

/** Build the backend environment. A Finder-launched app inherits a bare PATH,
 *  so we restore the standard macOS search path plus the Homebrew roots.
 *  The bundled `node` lives at <backend>/node; putting the backend dir first
 *  lets child processes (e.g. the image-input plugin's vision subprocess) run
 *  `node` against the bundled binary instead of a possibly-broken system one. */
function buildEnv() {
  const env = { ...process.env };
  const wanted = [
    HERE,
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/local/sbin",
    "/opt/homebrew/sbin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin",
  ];
  const seen = new Set((env.PATH ?? "").split(":").filter(Boolean));
  for (const p of wanted) if (!seen.has(p)) {
    seen.add(p);
    env.PATH = (env.PATH ? env.PATH + ":" : "") + p;
  }
  // Respect an explicit choice; otherwise disable telemetry by default.
  if (env.DSH_TELEMETRY_DISABLED === undefined) env.DSH_TELEMETRY_DISABLED = "1";
  return env;
}

import { existsSync } from "node:fs";

// Launcher flags must precede the web app's flags; `--patch` disables the
// optional provider/telemetry rows whose packages are pruned from the bundle.
const launcherArgs = [DSH_BIN, "web"];
if (existsSync(PRUNE_PATCH)) launcherArgs.push("--patch", PRUNE_PATCH);
if (existsSync(GIT_PATCH)) launcherArgs.push("--patch", GIT_PATCH);
if (existsSync(BILLING_PATCH)) launcherArgs.push("--patch", BILLING_PATCH);
if (existsSync(UPDATER_PATCH)) launcherArgs.push("--patch", UPDATER_PATCH);
if (existsSync(IMAGE_INPUT_PATCH)) launcherArgs.push("--patch", IMAGE_INPUT_PATCH);
if (existsSync(SKILL_MANAGER_PATCH)) launcherArgs.push("--patch", SKILL_MANAGER_PATCH);
if (existsSync(MCP_SETTINGS_PATCH)) launcherArgs.push("--patch", MCP_SETTINGS_PATCH);
launcherArgs.push("--host", "127.0.0.1", "--port", "0");

const child = spawn(
  process.execPath,
  launcherArgs,
  { cwd: process.env.HOME ?? HERE, env: buildEnv(), stdio: ["ignore", "pipe", "pipe"] },
);

let url = null;
let announced = false;

/** Poll the resolved loopback URL until the webserver answers, then tell the shell. */
function announceWhenReady() {
  if (announced || url === null) return;
  const target = new URL(url);
  const attempt = () => {
    if (announced) return;
    const req = http.get(
      { hostname: target.hostname, port: target.port, path: "/", timeout: 500 },
      (res) => {
        res.resume();
        announced = true;
        process.stdout.write(`DSH_READY=${url}\n`);
      },
    );
    req.on("error", () => {
      if (announced) return;
      setTimeout(attempt, 150);
    });
    req.on("timeout", () => {
      req.destroy();
      if (!announced) setTimeout(attempt, 150);
    });
  };
  attempt();
}

function onLine(line) {
  const m = line.match(/dsh web:\s+(http:\/\/[^\s]+)/);
  if (m && url === null) {
    url = m[1];
    announceWhenReady();
  }
  // Mirror backend logs to our stderr (visible when the shell is launched from a terminal).
  process.stderr.write("[dsh] " + line + "\n");
}

let buf = "";
child.stdout.on("data", (chunk) => {
  buf += chunk.toString();
  let idx;
  while ((idx = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, idx).replace(/\r$/, "");
    buf = buf.slice(idx + 1);
    if (line.length > 0) onLine(line);
  }
});
child.stderr.on("data", (chunk) => process.stderr.write(chunk));

let exiting = false;
function shutdown(code = 0) {
  if (exiting) return;
  exiting = true;
  try {
    child.kill("SIGTERM");
  } catch {}
  const force = setTimeout(() => {
    try { child.kill("SIGKILL"); } catch {}
  }, 3000);
  force.unref?.();
  child.once("exit", () => process.exit(code));
  // Safety net in case the child ignores the signal entirely.
  setTimeout(() => process.exit(code), 5000).unref?.();
}

process.on("SIGTERM", () => shutdown(0));
process.on("SIGINT", () => shutdown(0));
process.on("SIGQUIT", () => shutdown(0));
process.stdin.on("close", () => shutdown(0));

child.on("exit", (code) => {
  if (!exiting) {
    process.stderr.write(`[dsh] backend exited (code ${code})\n`);
    process.exit(code ?? 1);
  }
});
child.on("error", (err) => {
  process.stderr.write(`[dsh] failed to spawn backend: ${err.message}\n`);
  process.exit(1);
});
