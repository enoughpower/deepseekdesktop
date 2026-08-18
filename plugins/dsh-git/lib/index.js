import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/** Cordis plugin name. */
const name = "git";
/** The webserver service owns the HTTP route we serve the Git JSON API from. */
const inject = ["webServer"];

const MAX_BODY_BYTES = 1_000_000;
const MAX_BUFFER_BYTES = 64 * 1024 * 1024;

function ok(value) {
  return { ok: true, value };
}

function fail(code, message, extra) {
  return { ok: false, error: { code, message, ...(extra ?? {}) } };
}

/** Run one git command; on non-zero exit resolve (not reject) with the output. */
async function git(cwd, args, opts = {}) {
  try {
    const { stdout, stderr } = await execFileAsync("git", args, {
      cwd,
      maxBuffer: MAX_BUFFER_BYTES,
      encoding: "utf8",
      timeout: opts.timeoutMs ?? 60_000,
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

function requireString(payload, key) {
  const v = typeof payload?.[key] === "string" ? payload[key].trim() : "";
  if (v.length === 0) throw new Error(`payload.${key} must be a non-empty string`);
  return v;
}

/**
 * Parse a porcelain line keeping the two status columns distinct:
 * `XY path` where X = index (staged) status, Y = worktree status.
 * Returns `{ code, staged, worktree, path, original }`.
 */
function parsePorcelainLine(line) {
  const xy = line.slice(0, 2);
  const x = xy[0] === " " ? "" : xy[0];
  const y = xy[1] === " " ? "" : xy[1];
  let path = line.slice(3).trim();
  let original = "";
  const arrow = path.indexOf(" -> ");
  if (arrow !== -1) {
    original = path.slice(0, arrow).trim();
    path = path.slice(arrow + 4).trim();
  }
  const code = x + y;
  const staged = x !== "" && x !== "?";
  return { code, staged, worktree: y, path, original };
}

/** Parse a rename line with quotes (`R  "a b" -> "c d"`). */
function unquoteGitPath(p) {
  return p.startsWith('"') && p.endsWith('"') ? p.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\") : p;
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

/** Parse a porcelain rename with quoted paths (`XY old -> new`). */
function parsePorcelainRename(line) {
  const xy = line.slice(0, 2);
  const x = xy[0] === " " ? "" : xy[0];
  const y = xy[1] === " " ? "" : xy[1];
  const rest = line.slice(3).trim();
  const m = rest.match(/^(.*?) -> (.*)$/);
  if (!m) return { code: x + y, path: rest, original: "", staged: x !== "" && x !== "?" };
  return {
    code: x + y,
    original: unquoteGitPath(m[1].trim()),
    path: unquoteGitPath(m[2].trim()),
    staged: x !== "" && x !== "?",
  };
}

/** Split a porcelain list into staged vs unstaged vs untracked, with rename handling. */
function splitPorcelain(stdout) {
  const staged = [];
  const unstaged = [];
  const untracked = [];
  for (const line of stdout.split("\n")) {
    if (!line) continue;
    if (line.startsWith("## ")) continue;
    if (line.includes(" -> ")) {
      const r = parsePorcelainRename(line);
      if (r.code === "R" || r.code === "C") {
        if (r.staged) staged.push({ ...r, status: r.code });
        else unstaged.push({ ...r, status: r.code });
        continue;
      }
    }
    const p = parsePorcelainLine(line);
    if (p.code === "??") untracked.push({ path: p.path, status: p.code, staged: false, original: p.original });
    else if (p.staged) staged.push({ path: p.path, status: p.code, staged: true, original: p.original });
    else unstaged.push({ path: p.path, status: p.code, staged: false, original: p.original });
  }
  return { staged, unstaged, untracked };
}

const handlers = {
  /** Combined status: branch info + staged/unstaged/untracked split. */
  async status(payload) {
    const path = requirePath(payload);
    const short = await git(path, ["status", "--porcelain=v1", "-b", "--untracked-files=all"]);
    if (short.code !== 0) {
      return fail("git-error", short.stderr || "git status failed");
    }
    const lines = short.stdout.split("\n");
    const header = lines[0] ?? "";
    const branch = parseBranchHeader(header);
    const { staged, unstaged, untracked } = splitPorcelain(lines.slice(1).join("\n"));
    return ok({ ...branch, staged, unstaged, untracked });
  },

  /** Staged-only status (index vs HEAD). */
  async staged(payload) {
    const path = requirePath(payload);
    const r = await git(path, ["diff", "--cached", "--name-status"]);
    if (r.code !== 0) return fail("git-error", r.stderr || "git diff --cached failed");
    const files = r.stdout.split("\n").filter(Boolean).map((line) => {
      const [status, ...rest] = line.split("\t");
      const name = rest.join("\t");
      const arrow = name.indexOf(" -> ");
      return arrow === -1
        ? { status, path: name, original: "" }
        : { status, path: name.slice(arrow + 4), original: name.slice(0, arrow) };
    });
    return ok({ files });
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
    const branchName = requireString(payload, "name");
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

  /** Create a new branch (optionally from a base ref, optionally switch to it). */
  async newBranch(payload) {
    const path = requirePath(payload);
    const branchName = requireString(payload, "name");
    const base = typeof payload.base === "string" && payload.base.trim() ? payload.base.trim() : null;
    if (payload.switch === true) {
      // git branch lacks --switch on some versions; use git switch -c.
      const args = ["switch", "-c", branchName];
      if (base) args.push(base);
      const result = await git(path, args);
      if (result.code !== 0) return fail("git-error", result.stderr || "git switch -c failed");
      return ok({ stdout: result.stdout, stderr: result.stderr });
    }
    const args = ["branch", branchName];
    if (base) args.push(base);
    const result = await git(path, args);
    if (result.code !== 0) return fail("git-error", result.stderr || "git branch failed");
    return ok({ stdout: result.stdout, stderr: result.stderr });
  },

  /** Delete a branch (-d; pass force:true for -D). */
  async deleteBranch(payload) {
    const path = requirePath(payload);
    const branchName = requireString(payload, "name");
    if (branchName.includes("/")) return fail("no-remote", "不能删除远程分支；请用远端操作（push origin --delete）");
    const args = ["branch", payload.force === true ? "-D" : "-d", branchName];
    const result = await git(path, args);
    if (result.code !== 0) return fail("git-error", result.stderr || "git branch -d failed");
    return ok({ stdout: result.stdout, stderr: result.stderr });
  },

  /** Rename the current branch (or a named branch). */
  async renameBranch(payload) {
    const path = requirePath(payload);
    const newName = requireString(payload, "name");
    const oldName = typeof payload.oldName === "string" && payload.oldName.trim() ? payload.oldName.trim() : null;
    const args = ["branch", "-m"];
    if (oldName) args.push(oldName);
    args.push(newName);
    const result = await git(path, args);
    if (result.code !== 0) return fail("git-error", result.stderr || "git branch -m failed");
    return ok({ stdout: result.stdout, stderr: result.stderr });
  },

  /** Merge a branch into the current branch (optionally --no-ff). */
  async merge(payload) {
    const path = requirePath(payload);
    const branchName = requireString(payload, "name");
    const args = ["merge"];
    if (payload.noFf === true) args.push("--no-ff");
    args.push(branchName);
    const result = await git(path, args, { timeoutMs: 120_000 });
    if (result.code !== 0) return fail("git-error", result.stderr || "git merge failed", { conflicts: /conflict/i.test(result.stderr) });
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

  /** Stage files (git add). Accepts one file or a list; "." stages all. */
  async stage(payload) {
    const path = requirePath(payload);
    const files = Array.isArray(payload.files) ? payload.files.filter((f) => typeof f === "string" && f.length > 0) : [];
    if (files.length === 0) return fail("no-files", "no files to stage");
    const result = await git(path, ["add", "--", ...files]);
    if (result.code !== 0) return fail("git-error", result.stderr || "git add failed");
    return ok({ stdout: result.stdout, stderr: result.stderr });
  },

  /** Unstage files (git restore --staged). Accepts one file or a list. */
  async unstage(payload) {
    const path = requirePath(payload);
    const files = Array.isArray(payload.files) ? payload.files.filter((f) => typeof f === "string" && f.length > 0) : [];
    if (files.length === 0) return fail("no-files", "no files to unstage");
    const result = await git(path, ["restore", "--staged", "--", ...files]);
    if (result.code !== 0) return fail("git-error", result.stderr || "git restore --staged failed");
    return ok({ stdout: result.stdout, stderr: result.stderr });
  },

  /** Discard working-tree changes for files (git restore). */
  async discard(payload) {
    const path = requirePath(payload);
    const files = Array.isArray(payload.files) ? payload.files.filter((f) => typeof f === "string" && f.length > 0) : [];
    if (files.length === 0) return fail("no-files", "no files to discard");
    const result = await git(path, ["restore", "--", ...files]);
    if (result.code !== 0) return fail("git-error", result.stderr || "git restore failed");
    return ok({ stdout: result.stdout, stderr: result.stderr });
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

  /** Graphical history (commit graph with branch lines). */
  async graphLog(payload) {
    const path = requirePath(payload);
    const n = Number.isInteger(payload.n) && payload.n > 0 ? payload.n : 100;
    const result = await git(path, [
      "log",
      `-n${n}`,
      "--graph",
      "--date=format:%Y-%m-%d %H:%M",
      "--pretty=format:%h%x09%d%x09%an%x09%ad%x09%s",
    ]);
    if (result.code !== 0) return fail("git-error", result.stderr || "git log --graph failed");
    const rows = result.stdout.split("\n").filter(Boolean).map((line) => {
      // graph prefix: chars like `*`, `|`, `\`, `/`, `_`, spaces up to the hash.
      const m = line.match(/^([*|\\/_.\s-]*)([0-9a-f]{7,40})(?:\t(.*))?$/);
      const graph = m ? m[1] : line.split("\t")[0] ?? "";
      const hash = m ? m[2] : "";
      const rest = m && m[3] !== undefined ? m[3] : line.split("\t").slice(1).join("\t");
      const [refs, author, date, ...subjectParts] = rest.split("\t");
      return {
        graph,
        hash,
        refs: (refs ?? "").trim(),
        author: author ?? "",
        date: date ?? "",
        subject: subjectParts.join("\t"),
      };
    });
    return ok({ rows });
  },

  /** Per-file history (git log -- <file>). */
  async fileLog(payload) {
    const path = requirePath(payload);
    const file = requireString(payload, "file");
    const n = Number.isInteger(payload.n) && payload.n > 0 ? payload.n : 30;
    const result = await git(path, [
      "log",
      `-n${n}`,
      "--date=format:%Y-%m-%d %H:%M",
      "--pretty=format:%h%x09%an%x09%ad%x09%s",
      "--",
      file,
    ]);
    if (result.code !== 0) return fail("git-error", result.stderr || "git log -- <file> failed");
    const commits = result.stdout.split("\n").filter(Boolean).map((line) => {
      const [hash, author, date, ...subjectParts] = line.split("\t");
      return { hash, author, date, subject: subjectParts.join("\t") };
    });
    return ok({ commits });
  },

  /** Blame for a file (git blame --line-porcelain). */
  async blame(payload) {
    const path = requirePath(payload);
    const file = requireString(payload, "file");
    const result = await git(path, ["blame", "--line-porcelain", "--", file]);
    if (result.code !== 0) return fail("git-error", result.stderr || "git blame failed");
    // --line-porcelain groups: header `<hash> <orig> <final>` then metadata
    // lines (author/summary/filename/...), then the content line(s) which
    // start with a tab. Collect the tab lines for each header group.
    const lines = [];
    const raw = result.stdout.split("\n");
    for (let i = 0; i < raw.length; i++) {
      const m = raw[i].match(/^([0-9a-f]{40})\s+(\d+)\s+(\d+)/);
      if (!m) continue;
      // skip metadata lines (non-tab) until we hit the content line(s)
      let j = i + 1;
      while (j < raw.length && !raw[j].startsWith("\t")) j++;
      const content = [];
      while (j < raw.length && raw[j].startsWith("\t")) {
        content.push(raw[j].slice(1));
        j++;
      }
      lines.push({ hash: m[1].slice(0, 8), originalLine: m[2], content: content.join("\n") });
      i = j - 1;
    }
    return ok({ file, lines });
  },

  /** Read file content at a ref (HEAD by default) or in the working tree. */
  async catFile(payload) {
    const path = requirePath(payload);
    const file = requireString(payload, "file");
    const ref = typeof payload.ref === "string" && payload.ref.trim() ? payload.ref.trim() : "HEAD";
    const inWorkingTree = payload.workingTree === true;
    if (inWorkingTree) {
      const { readFile } = await import("node:fs/promises");
      const full = await import("node:path").then((p) => p.join(path, file));
      try {
        const buf = await readFile(full);
        return ok({ file, ref: "working-tree", text: buf.toString("utf8") });
      } catch (error) {
        return fail("git-error", `无法读取工作区文件：${error?.message ?? String(error)}`);
      }
    }
    const result = await git(path, ["--no-pager", "show", `${ref}:${file}`]);
    if (result.code !== 0) return fail("git-error", result.stderr || "git show <ref>:<file> failed");
    return ok({ file, ref, text: result.stdout });
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

  /** Amend the last commit (keeps staged files staged; message optional). */
  async amend(payload) {
    const path = requirePath(payload);
    const args = ["commit", "--amend", "--no-edit"];
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    if (message.length > 0) args.push("-m", message);
    const result = await git(path, args);
    if (result.code !== 0) return fail("git-error", result.stderr || "git commit --amend failed");
    return ok({ stdout: result.stdout, stderr: result.stderr });
  },

  async show(payload) {
    const path = requirePath(payload);
    const hash = typeof payload.hash === "string" ? payload.hash.trim() : "";
    if (hash.length === 0) return fail("no-hash", "commit hash is required");
    const result = await git(path, ["show", "--format=fuller", "--patch", hash]);
    if (result.code !== 0) return fail("git-error", result.stderr || "git show failed");
    return ok({ text: result.stdout });
  },

  /** Show commit metadata + stat (for the history graph detail pane). */
  async showStat(payload) {
    const path = requirePath(payload);
    const hash = requireString(payload, "hash");
    const result = await git(path, [
      "show",
      "--format=commit %H%nAuthor: %an <%ae>%nDate:   %ad%n%n%s%n%n%b",
      "--date=iso",
      "--stat",
      "--patch",
      hash,
    ]);
    if (result.code !== 0) return fail("git-error", result.stderr || "git show failed");
    return ok({ text: result.stdout });
  },

  async push(payload) {
    const path = requirePath(payload);
    const args = ["push"];
    const branch = typeof payload.branch === "string" && payload.branch.trim() ? payload.branch.trim() : null;
    if (payload.setUpstream === true && branch) args.push("-u");
    if (branch) args.push("origin", branch);
    const result = await git(path, args, { timeoutMs: 120_000 });
    if (result.code !== 0) return fail("git-error", result.stderr || "git push failed");
    return ok({ stdout: result.stdout, stderr: result.stderr });
  },

  async pull(payload) {
    const path = requirePath(payload);
    const args = ["pull", "--ff-only"];
    if (payload.rebase === true) args.splice(1, 0, "--rebase");
    const result = await git(path, args, { timeoutMs: 120_000 });
    if (result.code !== 0) return fail("git-error", result.stderr || "git pull failed");
    return ok({ stdout: result.stdout, stderr: result.stderr });
  },

  /** Fetch all remotes (optionally prune). */
  async fetch(payload) {
    const path = requirePath(payload);
    const args = ["fetch"];
    if (payload.prune === true) args.push("--prune");
    const result = await git(path, args, { timeoutMs: 120_000 });
    if (result.code !== 0) return fail("git-error", result.stderr || "git fetch failed");
    return ok({ stdout: result.stdout, stderr: result.stderr });
  },

  /** List remotes (name, fetch/push url, HEAD branch). */
  async remotes(payload) {
    const path = requirePath(payload);
    const r = await git(path, ["remote", "-v"]);
    if (r.code !== 0) return fail("git-error", r.stderr || "git remote failed");
    const seen = new Map();
    for (const line of r.stdout.split("\n").filter(Boolean)) {
      const m = line.match(/^(\S+)\s+(\S+)\s+\((fetch|push)\)$/);
      if (!m) continue;
      const [name, url, dir] = [m[1], m[2], m[3]];
      const entry = seen.get(name) ?? { name, fetchUrl: "", pushUrl: "" };
      if (dir === "fetch") entry.fetchUrl = url;
      else entry.pushUrl = url;
      seen.set(name, entry);
    }
    return ok({ remotes: [...seen.values()] });
  },

  /** List tags (name + short hash + subject). */
  async tags(payload) {
    const path = requirePath(payload);
    const r = await git(path, ["tag", "-n", "--format=%(refname:short)%09%(objectname:short)"]);
    if (r.code !== 0) return fail("git-error", r.stderr || "git tag failed");
    const tags = r.stdout.split("\n").filter(Boolean).map((line) => {
      const [name, hash] = line.split("\t");
      return { name, hash };
    });
    return ok({ tags });
  },

  /** Merge conflicts present? Returns conflicting file paths (git diff --name-only --diff-filter=U). */
  async conflicts(payload) {
    const path = requirePath(payload);
    const r = await git(path, ["diff", "--name-only", "--diff-filter=U"]);
    if (r.code !== 0) return fail("git-error", r.stderr || "git diff --name-only failed");
    const files = r.stdout.split("\n").filter(Boolean);
    return ok({ files });
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
