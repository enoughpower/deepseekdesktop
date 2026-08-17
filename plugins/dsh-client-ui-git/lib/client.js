window.__ModuleLoader__.load({
  id: "@deepseek-ai/dsh-client-ui-git",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    let react = require("react");
    let react_jsx_runtime = require("react/jsx-runtime");
    let primitives = require("@deepseek-ai/dsh-client-ui-primitives");
    const jsx = react_jsx_runtime.jsx;
    const jsxs = react_jsx_runtime.jsxs;
    const Fragment = react_jsx_runtime.Fragment;

    // ── styles (theme-variable driven, matching the settings panel) ─────────
    const css = [
      ".dshGitRoot{display:flex;flex-direction:column;gap:12px;width:100%;height:100%;min-height:0;font-size:13px;color:var(--dsw-alias-label-primary)}",
      ".dshGitMeta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}",
      ".dshGitBranch{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--dsw-alias-state-success-primary)}",
      ".dshGitUpstream{color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,Menlo,monospace;font-size:12px}",
      ".dshGitAhead{color:var(--dsw-alias-state-warn-primary);font-size:12px;font-weight:600}",
      ".dshGitBehind{color:var(--dsw-alias-state-error-primary);font-size:12px;font-weight:600}",
      ".dshGitPath{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,Menlo,monospace;font-size:12px}",
      ".dshGitBranchBox{margin-top:6px;padding:4px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-2);max-height:260px;overflow:auto}",
      ".dshGitBranchItem{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;padding:6px 8px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font-family:ui-monospace,Menlo,monospace;font-size:12px;cursor:pointer;text-align:left}",
      ".dshGitBranchItem:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGitBranchItemCurrent{color:var(--dsw-alias-state-success-primary)}",
      ".dshGitBranchItemRemote{color:var(--dsw-alias-label-secondary)}",
      ".dshGitBranchTrack{margin-left:auto;color:var(--dsw-alias-label-tertiary);font-size:11px;white-space:nowrap}",
      ".dshGitGrid{display:grid;grid-template-columns:1fr 1fr;gap:16px;min-height:0}",
      ".dshGitCol{display:flex;flex-direction:column;gap:14px;min-width:0;min-height:0}",
      ".dshGitSection{display:flex;flex-direction:column;gap:8px;min-height:0}",
      ".dshGitSection h4{margin:0;font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary)}",
      ".dshGitList{list-style:none;margin:0;padding:0;overflow:auto;max-height:220px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1)}",
      ".dshGitList li{display:flex;align-items:center;gap:8px;padding:5px 8px;border-bottom:1px solid var(--dsw-alias-border-l1)}",
      ".dshGitList li:last-child{border-bottom:none}",
      ".dshGitList li button{all:unset;cursor:pointer;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-family:ui-monospace,Menlo,monospace;font-size:12px}",
      ".dshGitList li button:hover{color:var(--dsw-alias-label-primary);text-decoration:underline}",
      ".dshGitList li.dshGitSelected{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGitCheck{flex:none;width:14px;height:14px;margin:0;accent-color:var(--dsw-alias-state-business-primary);cursor:pointer}",
      ".dshGitCode{display:inline-block;flex:none;min-width:26px;text-align:left;color:var(--dsw-alias-label-tertiary);font-size:11px;font-family:ui-monospace,Menlo,monospace}",
      ".dshGitStaged{color:var(--dsw-alias-state-success-primary)}",
      ".dshGitUnstaged{color:var(--dsw-alias-state-warn-primary)}",
      ".dshGitUntracked{color:var(--dsw-alias-state-error-primary)}",
      ".dshGitDiff{overflow:auto;max-height:340px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.6}",
      ".dshGitDiffLine{display:flex;align-items:flex-start;min-height:19px}",
      ".dshGitLn{flex:none;width:44px;box-sizing:border-box;padding:0 10px 0 6px;text-align:right;color:var(--dsw-alias-label-tertiary);opacity:.75;user-select:none}",
      ".dshGitContent{flex:1;min-width:0;white-space:pre-wrap;word-break:break-all;color:var(--dsw-alias-label-secondary)}",
      ".dshGitDiffAdd .dshGitContent{color:var(--dsw-alias-state-success-primary)}",
      ".dshGitDiffDel .dshGitContent{color:var(--dsw-alias-state-error-primary)}",
      ".dshGitDiffHunk .dshGitContent{color:var(--dsw-alias-state-business-primary)}",
      ".dshGitDiffMeta .dshGitContent{color:var(--dsw-alias-label-tertiary)}",
      ".dshGitEmpty{color:var(--dsw-alias-label-tertiary);font-size:12px;padding:12px;border:1px dashed var(--dsw-alias-border-l1);border-radius:8px;text-align:center}",
      ".dshGitCommitMeta{margin:0;padding:8px;background:var(--dsw-alias-bg-layer-1);border:1px dashed var(--dsw-alias-border-l1);border-radius:8px;font-family:ui-monospace,Menlo,monospace;font-size:12px;white-space:pre-wrap;word-break:break-all;color:var(--dsw-alias-label-secondary);max-height:150px;overflow:auto}",
      ".dshGitTextarea{width:100%;box-sizing:border-box;resize:vertical;min-height:64px;padding:8px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px}",
      ".dshGitTextarea:focus{outline:none;border-color:var(--dsw-alias-state-business-primary)}",
      ".dshGitRow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}",
      ".dshGitOut{margin:0;padding:8px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;font-family:ui-monospace,Menlo,monospace;font-size:12px;white-space:pre-wrap;word-break:break-all;color:var(--dsw-alias-label-secondary);max-height:120px;overflow:auto}",
      ".dshGitErr{color:var(--dsw-alias-state-error-primary);font-size:12px}",
    ].join("\n");
    const cssTagId = "@deepseek-ai/dsh-client-ui-git/styles.css";
    if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + cssTagId + '"]') === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-git";
      tag.dataset.pluginCss = cssTagId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    // ── host API ────────────────────────────────────────────────────────────
    async function gitCall(op, payload) {
      try {
        const res = await fetch("/git", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(Object.assign({ op }, payload || {})),
        });
        return await res.json();
      } catch (error) {
        return { ok: false, error: { code: "network", message: String(error?.message ?? error) } };
      }
    }

    function changeClass(code, staged) {
      if (code === "??") return "dshGitUntracked";
      if (staged) return "dshGitStaged";
      return "dshGitUnstaged";
    }

    // ── unified diff parser with line numbers ───────────────────────────────
    function parseDiff(text) {
      const lines = text.split("\n");
      const rows = [];
      let old = 0;
      let neu = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (i === lines.length - 1 && line === "") continue; // trailing newline
        if (line.startsWith("@@")) {
          const m = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
          if (m) {
            old = parseInt(m[1], 10) - 1;
            neu = parseInt(m[3], 10) - 1;
          }
          rows.push({ type: "hunk", old: "", neu: "", content: line });
        } else if (line.startsWith("+++") || line.startsWith("---")) {
          rows.push({ type: "meta", old: "", neu: "", content: line });
        } else if (line.startsWith("+")) {
          neu += 1;
          rows.push({ type: "add", old: "", neu: String(neu), content: line.slice(1) });
        } else if (line.startsWith("-")) {
          old += 1;
          rows.push({ type: "del", old: String(old), neu: "", content: line.slice(1) });
        } else if (
          line.startsWith("diff --git") || line.startsWith("index ") ||
          line.startsWith("new file") || line.startsWith("deleted file") ||
          line.startsWith("rename") || line.startsWith("similarity") ||
          line.startsWith("old mode") || line.startsWith("new mode") ||
          line.startsWith("Binary files") || line.startsWith("\\ No newline")
        ) {
          rows.push({ type: "meta", old: "", neu: "", content: line });
        } else {
          old += 1;
          neu += 1;
          rows.push({ type: "ctx", old: String(old), neu: String(neu), content: line.startsWith(" ") ? line.slice(1) : line });
        }
      }
      return rows;
    }

    // ── colorized diff with line-number gutter ──────────────────────────────
    function DiffView({ text }) {
      const rows = parseDiff(text);
      return jsx("div", {
        className: "dshGitDiff",
        children: rows.map((r, i) => {
          let cls = "dshGitDiffLine";
          if (r.type === "add") cls += " dshGitDiffAdd";
          else if (r.type === "del") cls += " dshGitDiffDel";
          else if (r.type === "hunk") cls += " dshGitDiffHunk";
          else if (r.type === "meta") cls += " dshGitDiffMeta";
          return jsxs("div", { key: i, className: cls, children: [
            jsx("span", { className: "dshGitLn", children: r.old }),
            jsx("span", { className: "dshGitLn", children: r.neu }),
            jsx("span", { className: "dshGitContent", children: r.content === "" ? "\u00A0" : r.content }),
          ] });
        }),
      });
    }

    // ── Git section (rendered inside the settings panel) ────────────────────
    function GitSection({ useSessions }) {
      const list = useSessions ? useSessions((s) => s) : null;
      const currentId = list?.current;
      const cwd = currentId !== undefined ? list?.byId?.[currentId]?.cwd : undefined;

      const [branch, setBranch] = react.useState("");
      const [upstream, setUpstream] = react.useState("");
      const [ahead, setAhead] = react.useState(0);
      const [behind, setBehind] = react.useState(0);
      const [changes, setChanges] = react.useState([]);
      const [commits, setCommits] = react.useState([]);
      const [branches, setBranches] = react.useState([]);
      const [diffText, setDiffText] = react.useState("");
      const [diffFile, setDiffFile] = react.useState(null);
      const [diffCommit, setDiffCommit] = react.useState(null);
      const [commitMeta, setCommitMeta] = react.useState("");
      const [loading, setLoading] = react.useState(false);
      const [error, setError] = react.useState(null);
      const [message, setMessage] = react.useState("");
      const [busy, setBusy] = react.useState(false);
      const [branchOpen, setBranchOpen] = react.useState(false);
      const [unchecked, setUnchecked] = react.useState({});
      const [output, setOutput] = react.useState("");

      const refresh = react.useCallback(async () => {
        if (!cwd) return;
        setLoading(true);
        setError(null);
        const [s, l] = await Promise.all([
          gitCall("status", { path: cwd }),
          gitCall("log", { path: cwd, n: 10 }),
        ]);
        if (s.ok) {
          setBranch(s.value.branch || "");
          setUpstream(s.value.upstream || "");
          setAhead(s.value.ahead || 0);
          setBehind(s.value.behind || 0);
          setChanges(s.value.changes || []);
        } else {
          setBranch("");
          setUpstream("");
          setAhead(0);
          setBehind(0);
          setChanges([]);
          setError(s.error?.message || "无法读取 Git 状态");
        }
        setCommits(l.ok ? l.value.commits : []);
        setLoading(false);
      }, [cwd]);

      react.useEffect(() => {
        refresh();
      }, [refresh]);

      const loadBranches = react.useCallback(async () => {
        if (!cwd) return;
        const b = await gitCall("branches", { path: cwd });
        setBranches(b.ok ? b.value.branches : []);
      }, [cwd]);

      const toggleBranches = react.useCallback(() => {
        setBranchOpen((v) => !v);
        if (!branchOpen) loadBranches();
      }, [branchOpen, loadBranches]);

      const switchTo = react.useCallback(async (name) => {
        setBusy(true);
        setBranchOpen(false);
        setOutput("");
        const r = await gitCall("switchBranch", { path: cwd, name });
        setOutput(r.ok ? r.value?.stdout || "已切换到 " + name : r.error?.message || "切换失败");
        setBusy(false);
        await refresh();
      }, [cwd, refresh]);

      const showDiff = react.useCallback(async (file) => {
        setDiffFile(file);
        setDiffCommit(null);
        setCommitMeta("");
        setDiffText("");
        const d = await gitCall("diff", { path: cwd, file });
        setDiffText(d.ok ? d.value.text : d.error?.message || "无法读取差异");
      }, [cwd]);

      const showCommit = react.useCallback(async (hash) => {
        setDiffFile(null);
        setDiffCommit(hash);
        setCommitMeta("");
        setDiffText("");
        const r = await gitCall("show", { path: cwd, hash });
        if (r.ok) {
          const full = r.value.text;
          const idx = full.indexOf("\ndiff --git");
          if (idx === -1) {
            setCommitMeta(full);
            setDiffText("");
          } else {
            setCommitMeta(full.slice(0, idx));
            setDiffText(full.slice(idx + 1));
          }
        } else {
          setCommitMeta("");
          setDiffText(r.error?.message || "无法读取提交差异");
        }
      }, [cwd]);

      const toggleCheck = react.useCallback((path) => {
        setUnchecked((prev) => {
          const next = { ...prev };
          if (next[path]) delete next[path];
          else next[path] = true;
          return next;
        });
      }, []);

      const runMutation = react.useCallback(async (op, extra) => {
        setBusy(true);
        setOutput("");
        const r = await gitCall(op, Object.assign({ path: cwd }, extra || {}));
        setOutput(r.ok ? r.value?.stdout || "完成" : r.error?.message || "操作失败");
        setBusy(false);
        await refresh();
      }, [cwd, refresh]);

      const checkedFiles = changes.filter((c) => !unchecked[c.path]).map((c) => c.path);
      const commitSelected = () => {
        if (checkedFiles.length === 0) return;
        runMutation("commit", { message, files: checkedFiles });
      };

      const diffTitle = diffFile
        ? "差异：" + diffFile
        : diffCommit
          ? "提交 " + diffCommit.slice(0, 7) + " 的差异"
          : "差异";

      return jsx("div", {
        className: "dshGitRoot",
        children: jsxs(Fragment, {
          children: [
            jsxs("div", {
              className: "dshGitMeta",
              children: [
                branch ? jsx("span", { className: "dshGitBranch", children: jsxs(Fragment, { children: [
                  jsx(primitives.IconBranchOutline16, { size: 14 }),
                  branch,
                ] }) }) : null,
                upstream ? jsx("span", { className: "dshGitUpstream", children: upstream }) : null,
                ahead > 0 ? jsx("span", { className: "dshGitAhead", children: "↑" + ahead }) : null,
                behind > 0 ? jsx("span", { className: "dshGitBehind", children: "↓" + behind }) : null,
                jsx(primitives.Button, { variant: "outline", size: "sm", onClick: toggleBranches, children: branchOpen ? "收起分支" : "分支" }),
                jsx("span", { className: "dshGitPath", title: cwd, children: cwd || "（无工作区）" }),
                jsx(primitives.Button, { variant: "outline", size: "sm", onClick: refresh, disabled: loading, children: loading ? "刷新中…" : "刷新" }),
              ],
            }),
            branchOpen ? jsx("div", {
              className: "dshGitBranchBox",
              children: branches.length === 0
                ? jsx("div", { className: "dshGitEmpty", children: "暂无分支" })
                : branches.map((b) =>
                    jsxs("button", {
                      key: b.name,
                      type: "button",
                      className: "dshGitBranchItem" + (b.current ? " dshGitBranchItemCurrent" : "") + (b.remote ? " dshGitBranchItemRemote" : ""),
                      onClick: () => switchTo(b.name),
                      children: [
                        b.current ? jsx(primitives.IconBranchOutline16, { size: 14 }) : null,
                        jsx("span", { children: b.name }),
                        b.ahead > 0 || b.behind > 0 ? jsx("span", { className: "dshGitBranchTrack", children: "↑" + b.ahead + " ↓" + b.behind }) : null,
                      ],
                    }),
                  ),
            }) : null,
            error ? jsx("div", { className: "dshGitErr", role: "alert", children: error }) : null,
            jsxs("div", {
              className: "dshGitGrid",
              children: [
                jsxs("div", {
                  className: "dshGitCol",
                  children: [
                    jsxs("div", {
                      className: "dshGitSection",
                      children: [
                        jsx("h4", { children: "变更（勾选要暂存的文件）" }),
                        changes.length === 0
                          ? jsx("div", { className: "dshGitEmpty", children: error ? error : "工作区干净" })
                          : jsx("ul", {
                              className: "dshGitList",
                              children: changes.map((c) =>
                                jsxs("li", { key: c.path + c.code, className: diffFile === c.path ? "dshGitSelected" : "", children: [
                                  jsx("input", { type: "checkbox", className: "dshGitCheck", checked: !unchecked[c.path], onChange: () => toggleCheck(c.path) }),
                                  jsx("span", { className: "dshGitCode " + changeClass(c.code, c.staged), children: c.code || "  " }),
                                  jsx("button", { type: "button", title: c.path, onClick: () => showDiff(c.path), children: c.path }),
                                ] }),
                              ),
                            }),
                      ],
                    }),
                    jsxs("div", {
                      className: "dshGitSection",
                      children: [
                        jsx("h4", { children: "提交" }),
                        jsx("textarea", {
                          className: "dshGitTextarea",
                          placeholder: "提交说明",
                          value: message,
                          onChange: (e) => setMessage(e.target.value),
                        }),
                        jsx("div", {
                          className: "dshGitRow",
                          children: [
                            jsx(primitives.Button, { variant: "primary", size: "sm", onClick: commitSelected, disabled: busy || !message.trim() || checkedFiles.length === 0, children: "提交所选 (" + checkedFiles.length + ")" }),
                            jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => runMutation("push", {}), disabled: busy, children: "推送" }),
                            jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => runMutation("pull", {}), disabled: busy, children: "拉取" }),
                          ],
                        }),
                        output ? jsx("pre", { className: "dshGitOut", children: output }) : null,
                      ],
                    }),
                  ],
                }),
                jsxs("div", {
                  className: "dshGitCol",
                  children: [
                    jsxs("div", {
                      className: "dshGitSection",
                      children: [
                        jsx("h4", { children: diffTitle }),
                        commitMeta ? jsx("pre", { className: "dshGitCommitMeta", children: commitMeta }) : null,
                        diffText === ""
                          ? jsx("div", { className: "dshGitEmpty", children: "点击左侧文件或下方提交查看差异" })
                          : jsx(DiffView, { text: diffText }),
                      ],
                    }),
                    jsxs("div", {
                      className: "dshGitSection",
                      children: [
                        jsx("h4", { children: "最近提交（点击查看完整差异）" }),
                        commits.length === 0
                          ? jsx("div", { className: "dshGitEmpty", children: "暂无提交" })
                          : jsx("ul", {
                              className: "dshGitList",
                              children: commits.map((c) =>
                                jsxs("li", { key: c.hash, children: [
                                  jsx("span", { className: "dshGitCode", children: c.hash.slice(0, 7) }),
                                  jsx("button", { type: "button", title: c.subject, onClick: () => showCommit(c.hash), children: c.subject }),
                                ] }),
                              ),
                            }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      });
    }

    // ── plugin body: a Git section inside the settings panel ────────────────
    const inject = ["slots"];

    function apply(ctx) {
      ctx.slots.inject("settings.section", () =>
        ctx.slots.register(
          {
            name: "settings.section",
            id: "git",
            order: 10,
            label: () => "Git",
          },
          GitSection,
        ),
      );
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
