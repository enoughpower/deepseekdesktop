import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/** Cordis plugin name. */
const name = "git";
/** The webserver service owns the HTTP route we serve the Git JSON API from. */
const inject = ["webServer"];

const MAX_BODY_BYTES = 1_000_000;
const MAX_BUFFER_BYTES = 32 * 1024 * 1024;

function ok(value) {
  return { ok: true, value };
}

function fail(code, message) {
  return { ok: false, error: { code, message } };
}

/** Run one git command; on non-zero exit resolve (not reject) with the output. */
async function git(cwd, args) {
  try {
    const { stdout, stderr } = await execFileAsync("git", args, {
      cwd,
      maxBuffer: MAX_BUFFER_BYTES,
      encoding: "utf8",
      timeout: 60_000,
      env: { ...process.env },
    });
    return { code: 0, stdout, stderr };
  } catch (error) {
    return {
      code: typeof error.code === "number" ? error.code : 1,
      stdout: typeof error.stdout === "string" ? error.stdout : "",
      stderr: typeof error.stderr === "string" ? error.stderr : String(error?.message ?? error),
    };
  }
}

function requirePath(payload) {
  if (typeof payload?.path !== "string" || payload.path.length === 0) {
    throw new Error("payload.path must be a non-empty string");
  }
  return payload.path;
}

/**
 * One porcelain line -> `{ code, path, staged }`. Handles rename/copy targets
 * (`R  old -> new`) and untracked entries (`??`).
 */
function parsePorcelainLine(line) {
  const code = line.slice(0, 2).replace(/ /g, "");
  let path = line.slice(3).trim();
  const arrow = path.indexOf(" -> ");
  if (arrow !== -1) path = path.slice(arrow + 4).trim();
  const staged = code.length > 0 && code !== "??";
  return { code, path, staged };
}

/**
 * Parse the `git status --porcelain=v1 -b` branch header line, e.g.
 * `## main...origin/main [ahead 1, behind 2]` or `## No commits yet on main`.
 */
function parseBranchHeader(header) {
  const h = header.startsWith("## ") ? header.slice(3) : header;
  if (h.startsWith("No commits yet on ")) {
    return { branch: h.slice("No commits yet on ".length), upstream: "", ahead: 0, behind: 0 };
  }
  let rest = h;
  let ahead = 0;
  let behind = 0;
  const track = h.match(/^(.*?)\s+\[(.*)\]$/);
  if (track) {
    rest = track[1];
    const am = track[2].match(/ahead (\d+)/);
    const bm = track[2].match(/behind (\d+)/);
    if (am) ahead = parseInt(am[1], 10);
    if (bm) behind = parseInt(bm[1], 10);
  }
  const parts = rest.split("...");
  return {
    branch: parts[0].trim(),
    upstream: parts.length > 1 ? parts[1].trim() : "",
    ahead,
    behind,
  };
}

const handlers = {
  async status(payload) {
    const path = requirePath(payload);
    const short = await git(path, ["status", "--porcelain=v1", "-b", "--untracked-files=all"]);
    if (short.code !== 0) {
      return fail("git-error", short.stderr || "git status failed");
    }
    const lines = short.stdout.split("\n");
    const header = lines[0] ?? "";
    const branch = parseBranchHeader(header);
    const changes = lines
      .slice(1)
      .filter(Boolean)
      .map(parsePorcelainLine);
    return ok({ ...branch, changes });
  },

  async branches(payload) {
    const path = requirePath(payload);
    const result = await git(path, [
      "for-each-ref",
      "--format=%(refname)%09%(HEAD)%09%(upstream:short)%09%(upstream:track)%09%(objectname:short)%09%(subject)",
      "refs/heads",
      "refs/remotes",
    ]);
    if (result.code !== 0) return fail("git-error", result.stderr || "git branch failed");
    const branches = result.stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [ref, head, upstream, track, hash, ...subjectParts] = line.split("\t");
        const subject = subjectParts.join("\t");
        const remote = ref.startsWith("refs/remotes/");
        const name = remote ? ref.slice("refs/remotes/".length) : ref.slice("refs/heads/".length);
        let ahead = 0;
        let behind = 0;
        const am = track.match(/ahead (\d+)/);
        const bm = track.match(/behind (\d+)/);
        if (am) ahead = parseInt(am[1], 10);
        if (bm) behind = parseInt(bm[1], 10);
        return { name, current: head === "*", remote, upstream, ahead, behind, hash, subject };
      })
      .filter((b) => !b.name.endsWith("/HEAD"))
      .sort((a, b) =>
        (a.current ? -1 : 0) - (b.current ? -1 : 0) ||
        (a.remote ? 1 : 0) - (b.remote ? 1 : 0) ||
        a.name.localeCompare(b.name),
      );
    return ok({ branches });
  },

  async switchBranch(payload) {
    const path = requirePath(payload);
    const branchName = typeof payload.name === "string" ? payload.name.trim() : "";
    if (branchName.length === 0) return fail("no-name", "branch name is required");
    let result = await git(path, ["switch", branchName]);
    // A remote branch (origin/x) fails when local x already exists; retry the
    // short name so we switch to the local tracking branch instead.
    if (result.code !== 0 && branchName.includes("/")) {
      const short = branchName.slice(branchName.indexOf("/") + 1);
      if (short.length > 0) result = await git(path, ["switch", short]);
    }
    if (result.code !== 0) return fail("git-error", result.stderr || "git switch failed");
    return ok({ stdout: result.stdout, stderr: result.stderr });
  },

  async diff(payload) {
    const path = requirePath(payload);
    const args = payload.staged ? ["diff", "--cached"] : ["diff"];
    if (typeof payload.file === "string" && payload.file.length > 0) {
      args.push("--", payload.file);
    }
    const result = await git(path, args);
    if (result.code !== 0) return fail("git-error", result.stderr || "git diff failed");
    return ok({ text: result.stdout });
  },

  async log(payload) {
    const path = requirePath(payload);
    const n = Number.isInteger(payload.n) && payload.n > 0 ? payload.n : 30;
    const result = await git(path, ["log", `-n${n}`, "--oneline"]);
    if (result.code !== 0) return fail("git-error", result.stderr || "git log failed");
    const commits = result.stdout
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const space = line.indexOf(" ");
        return {
          hash: space === -1 ? line : line.slice(0, space),
          subject: space === -1 ? "" : line.slice(space + 1),
        };
      });
    return ok({ commits });
  },

  async commit(payload) {
    const path = requirePath(payload);
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    if (message.length === 0) return fail("no-message", "commit message is required");
    const files = Array.isArray(payload.files)
      ? payload.files.filter((f) => typeof f === "string" && f.length > 0)
      : [];
    if (files.length > 0) {
      // Commit exactly the selected files: reset the index, stage only those,
      // then commit. Untracked and deleted paths are covered by `git add --`.
      const reset = await git(path, ["reset", "-q"]);
      if (reset.code !== 0) return fail("git-error", reset.stderr || "git reset failed");
      const add = await git(path, ["add", "--", ...files]);
      if (add.code !== 0) return fail("git-error", add.stderr || "git add failed");
      const commit = await git(path, ["commit", "-m", message]);
      if (commit.code !== 0) return fail("git-error", commit.stderr || "git commit failed");
      return ok({ stdout: commit.stdout, stderr: commit.stderr });
    }
    const add = await git(path, ["add", "-A"]);
    if (add.code !== 0) return fail("git-error", add.stderr || "git add failed");
    const commit = await git(path, ["commit", "-m", message]);
    if (commit.code !== 0) {
      return fail("git-error", commit.stderr || "git commit failed");
    }
    return ok({ stdout: commit.stdout, stderr: commit.stderr });
  },

  async show(payload) {
    const path = requirePath(payload);
    const hash = typeof payload.hash === "string" ? payload.hash.trim() : "";
    if (hash.length === 0) return fail("no-hash", "commit hash is required");
    const result = await git(path, ["show", "--format=fuller", "--patch", hash]);
    if (result.code !== 0) return fail("git-error", result.stderr || "git show failed");
    return ok({ text: result.stdout });
  },

  async push(payload) {
    const path = requirePath(payload);
    const result = await git(path, ["push"]);
    if (result.code !== 0) return fail("git-error", result.stderr || "git push failed");
    return ok({ stdout: result.stdout, stderr: result.stderr });
  },

  async pull(payload) {
    const path = requirePath(payload);
    const result = await git(path, ["pull", "--ff-only"]);
    if (result.code !== 0) return fail("git-error", result.stderr || "git pull failed");
    return ok({ stdout: result.stdout, stderr: result.stderr });
  },
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = "";
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("request body too large"));
        req.destroy();
        return;
      }
      body += chunk.toString();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function handler(req, res) {
  if (req.method !== "POST") {
    res.writeHead(405, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(fail("method", "POST required")));
    return;
  }
  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    res.writeHead(413, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(fail("body", error.message)));
    return;
  }
  let payload;
  try {
    payload = JSON.parse(body || "{}");
  } catch {
    res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(fail("bad-json", "invalid JSON body")));
    return;
  }
  const fn = typeof payload.op === "string" ? handlers[payload.op] : undefined;
  if (fn === undefined) {
    res.writeHead(400, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(fail("bad-op", `unknown op ${JSON.stringify(payload.op)}`)));
    return;
  }
  let result;
  try {
    result = await fn(payload);
  } catch (error) {
    result = fail("internal", error?.message ?? String(error));
  }
  res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(result));
}

function apply(ctx) {
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: "exact",
        path: "/git",
        handler,
      }),
    "dsh-git: /git route",
  );
}

export { apply, inject, name };
