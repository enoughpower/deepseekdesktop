window.__ModuleLoader__.load({
  id: "@deepseek-ai/dsh-client-ui-git",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    let react = require("react");
    let react_jsx_runtime = require("react/jsx-runtime");
    let react_dom = require("react-dom");
    let primitives = require("@deepseek-ai/dsh-client-ui-primitives");
    const jsx = react_jsx_runtime.jsx;
    const jsxs = react_jsx_runtime.jsxs;
    const Fragment = react_jsx_runtime.Fragment;

    // ── styles (theme-variable driven, matching the app) ────────────────────
    const css = [
      // full-screen overlay panel
      ".dshGitOverlay{position:fixed;inset:0;z-index:120;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}",
      ".dshGitTop{flex:none;display:flex;align-items:center;gap:10px;height:48px;padding:0 16px;border-bottom:1px solid var(--dsw-alias-border-l2)}",
      ".dshGitTopTitle{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:var(--dsw-alias-label-primary);min-width:0}",
      ".dshGitBranch{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--dsw-alias-state-success-primary);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".dshGitUpstream{color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,Menlo,monospace;font-size:12px}",
      ".dshGitAhead{color:var(--dsw-alias-state-warn-primary);font-size:12px;font-weight:600}",
      ".dshGitBehind{color:var(--dsw-alias-state-error-primary);font-size:12px;font-weight:600}",
      ".dshGitPath{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,Menlo,monospace;font-size:12px;text-align:right}",
      ".dshGitBody{flex:1;min-height:0;display:grid;grid-template-columns:300px minmax(320px,1fr) minmax(380px,1.3fr);gap:0}",
      ".dshGitCol{display:flex;flex-direction:column;min-width:0;min-height:0;border-right:1px solid var(--dsw-alias-border-l2)}",
      ".dshGitCol:last-child{border-right:none}",
      ".dshGitSection{display:flex;flex-direction:column;gap:8px;min-height:0;padding:12px 12px 8px;border-bottom:1px solid var(--dsw-alias-border-l2)}",
      ".dshGitSection:last-child{border-bottom:none;flex:1}",
      ".dshGitSectionFlex{flex:1;min-height:0}",
      ".dshGitSection h4{margin:0;font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary);display:flex;align-items:center;gap:6px;flex:none}",
      ".dshGitList{list-style:none;margin:0;padding:0;overflow:auto;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);flex:1;min-height:0}",
      ".dshGitList li{display:flex;align-items:center;gap:8px;padding:5px 8px;border-bottom:1px solid var(--dsw-alias-border-l1)}",
      ".dshGitList li:last-child{border-bottom:none}",
      ".dshGitList li button{all:unset;cursor:pointer;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary);font-family:ui-monospace,Menlo,monospace;font-size:12px}",
      ".dshGitList li button:hover{color:var(--dsw-alias-label-primary);text-decoration:underline}",
      ".dshGitList li.dshGitSelected{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGitSelected{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGitCheck{flex:none;width:14px;height:14px;margin:0;accent-color:var(--dsw-alias-state-business-primary);cursor:pointer}",
      ".dshGitCode{display:inline-block;flex:none;min-width:26px;text-align:left;color:var(--dsw-alias-label-tertiary);font-size:11px;font-family:ui-monospace,Menlo,monospace}",
      ".dshGitStaged{color:var(--dsw-alias-state-success-primary)}",
      ".dshGitUnstaged{color:var(--dsw-alias-state-warn-primary)}",
      ".dshGitUntracked{color:var(--dsw-alias-state-error-primary)}",
      ".dshGitEmpty{color:var(--dsw-alias-label-tertiary);font-size:12px;padding:12px;border:1px dashed var(--dsw-alias-border-l1);border-radius:8px;text-align:center}",
      ".dshGitHint{color:var(--dsw-alias-label-tertiary);font-size:11px}",
      ".dshGitOut{margin:0;padding:8px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;font-family:ui-monospace,Menlo,monospace;font-size:12px;white-space:pre-wrap;word-break:break-all;color:var(--dsw-alias-label-secondary);max-height:120px;overflow:auto}",
      ".dshGitRoot{display:flex;flex-direction:column;gap:12px;width:100%;height:100%;min-height:0;font-size:13px;color:var(--dsw-alias-label-primary)}",
      ".dshGitErr{color:var(--dsw-alias-state-error-primary);font-size:12px;white-space:pre-wrap;word-break:break-all;max-height:120px;overflow:auto}",
      ".dshGitRow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}",
      ".dshGitTextarea{width:100%;box-sizing:border-box;resize:vertical;min-height:64px;padding:8px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px}",
      ".dshGitTextarea:focus{outline:none;border-color:var(--dsw-alias-state-business-primary)}",
      ".dshGitInput{box-sizing:border-box;width:100%;height:30px;padding:0 8px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12px}",
      ".dshGitInput:focus{outline:none;border-color:var(--dsw-alias-state-business-primary)}",
      ".dshGitDiff{overflow:auto;flex:1;min-height:0;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.6}",
      ".dshGitDiffOuter{display:flex;flex-direction:column;flex:1;min-height:0}",
      ".dshGitDiffLine{display:flex;align-items:flex-start;min-height:19px}",
      ".dshGitLn{flex:none;width:44px;box-sizing:border-box;padding:0 10px 0 6px;text-align:right;color:var(--dsw-alias-label-tertiary);opacity:.75;user-select:none}",
      ".dshGitContent{flex:1;min-width:0;white-space:pre-wrap;word-break:break-all;color:var(--dsw-alias-label-secondary)}",
      ".dshGitDiffMeta .dshGitContent{color:var(--dsw-alias-label-tertiary)}",
      // diff: per-file color blocks with line numbers
      ".dshGitDiffFile{border-bottom:1px solid var(--dsw-alias-border-l1)}",
      ".dshGitDiffFile:last-child{border-bottom:none}",
      ".dshGitDiffFileHead{display:flex;align-items:center;gap:6px;padding:5px 8px;background:var(--dsw-alias-bg-layer-2);border-bottom:1px solid var(--dsw-alias-border-l1);position:sticky;top:0;z-index:1}",
      ".dshGitDiffFileDot{flex:none;font-size:8px;color:var(--dsw-alias-state-business-primary)}",
      ".dshGitDiffFileName{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,Menlo,monospace;font-size:12px;font-weight:600;color:var(--dsw-alias-label-primary)}",
      ".dshGitDiffFileBadge{flex:none;font-size:10px;line-height:1;padding:2px 5px;border-radius:4px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGitDiffFileBadgeNew{color:color-mix(in srgb,var(--dsw-alias-state-success-primary,#16a34a) 62%,var(--dsw-alias-label-primary,#111827));background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#16a34a) 14%,transparent)}",
      ".dshGitDiffFileBadgeDel{color:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 62%,var(--dsw-alias-label-primary,#111827));background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 14%,transparent)}",
      ".dshGitDiffRow{display:flex;align-items:flex-start;min-height:19px}",
      ".dshGitGutter{flex:none;width:34px;box-sizing:border-box;padding:0 8px 0 2px;text-align:right;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:19px;opacity:.8;user-select:none}",
      ".dshGitDiffRowAdd{background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#16a34a) 14%,transparent)}",
      ".dshGitDiffRowDel{background:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 14%,transparent)}",
      ".dshGitDiffRowAdd .dshGitContent{color:color-mix(in srgb,var(--dsw-alias-state-success-primary,#16a34a) 65%,var(--dsw-alias-label-primary,#111827))}",
      ".dshGitDiffRowDel .dshGitContent{color:color-mix(in srgb,var(--dsw-alias-state-error-primary,#e5484d) 65%,var(--dsw-alias-label-primary,#111827))}",
      ".dshGitDiffRowHunk{background:var(--dsw-alias-bg-layer-2);border-top:1px solid var(--dsw-alias-border-l1);border-bottom:1px solid var(--dsw-alias-border-l1)}",
      ".dshGitDiffRowHunk .dshGitContent{color:var(--dsw-alias-state-business-primary);font-weight:600;padding-left:8px}",
      // branch manager
      ".dshGitBranchItem{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;padding:6px 8px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font-family:ui-monospace,Menlo,monospace;font-size:12px;cursor:pointer;text-align:left}",
      ".dshGitBranchItem:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGitBranchItemCurrent{color:var(--dsw-alias-state-success-primary);font-weight:600}",
      ".dshGitBranchItemRemote{color:var(--dsw-alias-label-secondary)}",
      ".dshGitBranchTrack{margin-left:auto;color:var(--dsw-alias-label-tertiary);font-size:11px;white-space:nowrap}",
      ".dshGitBranchActions{display:flex;gap:4px;margin-left:auto;flex:none}",
      ".dshGitMiniBtn{border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:11px;padding:2px 6px;font-family:inherit}",
      ".dshGitMiniBtn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      ".dshGitMiniBtn:disabled{opacity:.45;cursor:default}",
      ".dshGitMiniBtnDanger:hover:not(:disabled){color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}",
      ".dshGitBranchBox{margin-top:6px;padding:4px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-2);max-height:240px;overflow:auto}",
      ".dshGitToolbar{display:flex;gap:6px;flex-wrap:wrap;align-items:center}",
      // graph
      ".dshGitGraph{overflow:auto;flex:1;min-height:0;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.7}",
      ".dshGitGraphRow{display:flex;align-items:center;gap:0;min-height:22px;cursor:pointer;white-space:pre;padding:0 4px}",
      ".dshGitGraphRow:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGitGraphRowSelected{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGitGraphGlyph{color:var(--dsw-alias-state-business-primary);flex:none}",
      ".dshGitGraphRefs{color:var(--dsw-alias-state-warn-primary);flex:none;font-size:11px}",
      ".dshGitGraphSubject{color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".dshGitGraphMeta{color:var(--dsw-alias-label-tertiary);font-size:11px;margin-left:auto;flex:none;padding-left:8px}",
      // tabs
      ".dshGitTabs{display:flex;gap:4px;flex:none}",
      ".dshGitTab{border:1px solid transparent;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:12px;padding:4px 10px;font-family:inherit}",
      ".dshGitTab:hover{color:var(--dsw-alias-label-primary)}",
      ".dshGitTabActive{border-color:var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}",
      ".dshGitBlame{overflow:auto;flex:1;min-height:0;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.6}",
      ".dshGitBlameLine{display:flex;align-items:flex-start;min-height:19px}",
      ".dshGitBlameHash{flex:none;width:70px;padding:0 6px 0 6px;color:var(--dsw-alias-state-business-primary);user-select:none}",
      ".dshGitBlameCode{flex:1;min-width:0;white-space:pre-wrap;word-break:break-all;color:var(--dsw-alias-label-secondary)}",
      ".dshGitFileView{overflow:auto;flex:1;min-height:0;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.6}",
      ".dshGitFileViewLine{display:flex;align-items:flex-start;min-height:19px}",
      ".dshGitFileViewLn{flex:none;width:44px;box-sizing:border-box;padding:0 10px 0 6px;text-align:right;color:var(--dsw-alias-label-tertiary);opacity:.75;user-select:none}",
      ".dshGitFileViewContent{flex:1;min-width:0;white-space:pre-wrap;word-break:break-all;color:var(--dsw-alias-label-secondary)}",
      ".dshGitModalMask{position:absolute;inset:0;background:var(--dsw-alias-bg-mask-1);display:flex;align-items:center;justify-content:center;z-index:130}",
      // sidebar footer trigger — same look as the Settings trigger
      ".dshGitFooterTrigger{box-sizing:border-box;cursor:pointer;width:calc(100% + 4px);height:42px;color:var(--dsw-alias-label-primary);background:0 0;border:none;border-radius:12px;flex:none;align-items:center;gap:8px;margin:4px -2px;padding:0 10px 0 8px;font-family:inherit;font-size:14px;line-height:22px;display:flex;overflow:hidden}",
      ".dshGitFooterTrigger:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGitFooterTrigger.dshGitFooterTriggerRail{border-radius:50%;justify-content:center;gap:0;width:36px;height:36px;margin:8px 0 10px;padding:0}",
      ".dshGitFooterTriggerLabel{white-space:nowrap;overflow:hidden;flex:1;min-width:0;text-align:left}",
      ".dshGitModal{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:16px;min-width:360px;max-width:480px;box-shadow:var(--dsw-shadow-lv3)}",
      ".dshGitModal h4{margin:0 0 10px;font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}",
      ".dshGitModal .dshGitRow{margin-top:10px;justify-content:flex-end}",
    ].join("\n");
    const cssTagId = "@deepseek-ai/dsh-client-ui-git/styles.css";
    if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + cssTagId + '"]') === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-git";
      tag.dataset.pluginCss = cssTagId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    // ── API ─────────────────────────────────────────────────────────────────
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

    // ── diff / file viewer ──────────────────────────────────────────────────
    // Parse a unified-diff blob into per-file groups so the diff renders
    // grouped by file, with hunk-aware line numbers and color blocks.
    function parseDiffText(text) {
      const files = [];
      let cur = null;
      for (const line of text.split("\n")) {
        if (line.startsWith("diff --git")) {
          if (cur) files.push(cur);
          const m = line.match(/^diff --git a\/(.*?) b\/(.*)$/);
          cur = { oldName: m ? m[1] : line.slice("diff --git ".length), newName: m ? m[2] : "", meta: [], hunks: [] };
          continue;
        }
        if (!cur) continue; // preamble before the first diff (commit header / stat)
        if (line.startsWith("@@")) {
          const m = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/);
          const h = m
            ? { ok: true, oldStart: Number(m[1]), oldCount: Number(m[2] ?? 1), newStart: Number(m[3]), newCount: Number(m[4] ?? 1), old: Number(m[1]), new: Number(m[3]), lines: [] }
            : { ok: false, oldStart: 0, oldCount: 0, newStart: 0, newCount: 0, old: 0, new: 0, lines: [] };
          cur.hunks.push(h);
          h.lines.push({ t: "hunk", oldLn: null, newLn: null, content: m ? (m[5] || "").replace(/^\s/, "") : line });
          continue;
        }
        if (cur.hunks.length === 0) {
          if (line !== "") cur.meta.push(line);
          continue;
        }
        if (line === "") continue; // trailing blank line, not part of a hunk
        const h = cur.hunks[cur.hunks.length - 1];
        if (line.startsWith("+") && !line.startsWith("+++")) {
          h.lines.push({ t: "add", oldLn: null, newLn: h.new, content: line });
          h.new += 1;
        } else if (line.startsWith("-") && !line.startsWith("---")) {
          h.lines.push({ t: "del", oldLn: h.old, newLn: null, content: line });
          h.old += 1;
        } else {
          h.lines.push({ t: "ctx", oldLn: h.old, newLn: h.new, content: line.slice(1) });
          h.old += 1;
          h.new += 1;
        }
      }
      if (cur) files.push(cur);
      return files;
    }

    function DiffView({ text }) {
      if (!text) return jsx("div", { className: "dshGitEmpty", children: "无差异" });
      const files = parseDiffText(text);
      if (files.length === 0) return jsx("div", { className: "dshGitEmpty", children: "无差异" });
      const fmtCount = (n) => (n === 1 ? "" : "," + n);
      return jsx("div", { className: "dshGitDiff", children: files.map((f, fi) => {
        const binary = f.meta.some((l) => l.startsWith("Binary files"));
        const renamed = f.oldName !== f.newName && f.oldName !== "/dev/null" && f.newName !== "/dev/null";
        return jsxs("div", { key: "f" + fi, className: "dshGitDiffFile", children: [
          jsxs("div", { className: "dshGitDiffFileHead", children: [
            jsx("span", { className: "dshGitDiffFileDot", children: "\u25CF" }),
            jsx("span", { className: "dshGitDiffFileName", title: f.newName || f.oldName, children: (f.newName && f.newName !== "/dev/null" ? f.newName : f.oldName) }),
            renamed ? jsx("span", { className: "dshGitDiffFileBadge", children: "重命名" }) : null,
            f.oldName === "/dev/null" ? jsx("span", { className: "dshGitDiffFileBadge dshGitDiffFileBadgeNew", children: "新增" }) : null,
            f.newName === "/dev/null" ? jsx("span", { className: "dshGitDiffFileBadge dshGitDiffFileBadgeDel", children: "删除" }) : null,
            binary ? jsx("span", { className: "dshGitDiffFileBadge", children: "二进制" }) : null,
          ] }),
          binary
            ? jsx("div", { className: "dshGitDiffLine dshGitDiffMeta", children: [jsx("span", { className: "dshGitContent", children: f.meta.find((l) => l.startsWith("Binary files")) || "二进制文件" }) ] })
            : f.hunks.length === 0
              ? jsx("div", { className: "dshGitDiffLine dshGitDiffMeta", children: [jsx("span", { className: "dshGitContent", children: "（无内容变更）" }) ] })
              : f.hunks.map((h, hi) => {
                  const section = h.ok && h.lines[0].content ? " " + h.lines[0].content : "";
                  return jsxs(Fragment, { key: "h" + hi, children: [
                    jsx("div", { className: "dshGitDiffRow dshGitDiffRowHunk", children: [
                      jsx("span", { className: "dshGitContent", children: h.ok ? "@@ -" + h.oldStart + fmtCount(h.oldCount) + " +" + h.newStart + fmtCount(h.newCount) + " @@" + section : h.lines[0].content }),
                    ] }),
                    ...h.lines.slice(1).map((l, li) => {
                      let cls = "dshGitDiffRow";
                      if (l.t === "add") cls += " dshGitDiffRowAdd";
                      else if (l.t === "del") cls += " dshGitDiffRowDel";
                      return jsxs("div", { key: "l" + li, className: cls, children: [
                        jsx("span", { className: "dshGitGutter", children: l.oldLn ?? "" }),
                        jsx("span", { className: "dshGitGutter", children: l.newLn ?? "" }),
                        jsx("span", { className: "dshGitContent", children: l.content === "" ? " " : l.content }),
                      ] });
                    }),
                  ] });
                }),
        ] });
      }) });
    }

    function FileView({ text }) {
      if (!text) return jsx("div", { className: "dshGitEmpty", children: "（空文件）" });
      return jsx("div", { className: "dshGitFileView", children: text.split("\n").map((line, i) =>
        jsx("div", { className: "dshGitFileViewLine", children: [
          jsx("span", { className: "dshGitFileViewLn", children: String(i + 1) }),
          jsx("span", { className: "dshGitFileViewContent", children: line === "" ? " " : line }),
        ] }, i),
      ) });
    }

    function BlameView({ lines }) {
      if (!lines || lines.length === 0) return jsx("div", { className: "dshGitEmpty", children: "无 blame 数据" });
      return jsx("div", { className: "dshGitBlame", children: lines.map((l, i) =>
        jsx("div", { className: "dshGitBlameLine", children: [
          jsx("span", { className: "dshGitBlameHash", title: "orig line " + l.originalLine, children: l.hash }),
          jsx("span", { className: "dshGitBlameCode", children: l.content === "" ? " " : l.content }),
        ] }, i),
      ) });
    }

    // ── status helpers ──────────────────────────────────────────────────────
    function changeClass(code, staged) {
      if (code === "??") return "dshGitUntracked";
      return staged ? "dshGitStaged" : "dshGitUnstaged";
    }

    function statusLetter(code) {
      return code && code !== "??" ? code : "?";
    }

    // ── modal helper ────────────────────────────────────────────────────────
    function Modal({ title, children, onClose }) {
      return jsxs(Fragment, { children: [
        jsx("div", { className: "dshGitModalMask", onClick: onClose }),
        jsx("div", { className: "dshGitModal", role: "dialog", "aria-modal": "true", children: jsxs(Fragment, { children: [
          jsx("h4", { children: title }),
          children,
        ] }) }),
      ] });
    }

    // ── full-screen Git panel ───────────────────────────────────────────────
    function GitPanel({ onClose, sessionCwd }) {
      const [cwd, setCwd] = react.useState("");
      const [branch, setBranch] = react.useState("");
      const [upstream, setUpstream] = react.useState("");
      const [ahead, setAhead] = react.useState(0);
      const [behind, setBehind] = react.useState(0);
      const [staged, setStaged] = react.useState([]); // [{path, status, original}]
      const [unstaged, setUnstaged] = react.useState([]);
      const [untracked, setUntracked] = react.useState([]);
      const [branches, setBranches] = react.useState([]);
      const [graph, setGraph] = react.useState([]);
      const [loading, setLoading] = react.useState(false);
      const [error, setError] = react.useState(null);
      const [output, setOutput] = react.useState("");
      const [message, setMessage] = react.useState("");
      const [diffFile, setDiffFile] = react.useState(null);
      const [diffText, setDiffText] = react.useState("");
      const [diffStaged, setDiffStaged] = react.useState(false);
      const [selectedCommit, setSelectedCommit] = react.useState(null);
      const [selectedCommitText, setSelectedCommitText] = react.useState("");
      const [rightTab, setRightTab] = react.useState("diff"); // diff | file | blame
      const [fileViewText, setFileViewText] = react.useState("");
      const [fileViewHeadText, setFileViewHeadText] = react.useState("");
      const [fileLog, setFileLog] = react.useState([]);
      const [blameLines, setBlameLines] = react.useState([]);
      const [showBranchManager, setShowBranchManager] = react.useState(false);
      const [busy, setBusy] = react.useState(false);
      const [newBranchName, setNewBranchName] = react.useState("");
      const [mergeTarget, setMergeTarget] = react.useState("");
      const [confirmDelete, setConfirmDelete] = react.useState(null);
      const [modal, setModal] = react.useState(null); // {title, body, action}
      const [conflicts, setConflicts] = react.useState([]);
      const [pathInput, setPathInput] = react.useState("");

      // initialize from the current session's workspace cwd (computed at the
      // sidebar entry level via useSessions), falling back to manual path input.
      react.useEffect(() => {
        if (sessionCwd) setCwd(sessionCwd);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [sessionCwd]);
      const activePath = cwd;

      const refresh = react.useCallback(async (pathArg) => {
        const p = pathArg ?? activePath;
        if (!p) return;
        setLoading(true);
        setError(null);
        const [st, br, gr, cf] = await Promise.all([
          gitCall("status", { path: p }),
          gitCall("branches", { path: p }),
          gitCall("graphLog", { path: p, n: 100 }),
          gitCall("conflicts", { path: p }),
        ]);
        setLoading(false);
        if (st.ok) {
          setBranch(st.value.branch);
          setUpstream(st.value.upstream);
          setAhead(st.value.ahead);
          setBehind(st.value.behind);
          setStaged(st.value.staged);
          setUnstaged(st.value.unstaged);
          setUntracked(st.value.untracked);
        } else setError(st.error?.message || "git status failed");
        if (br.ok) setBranches(br.value.branches);
        if (gr.ok) setGraph(gr.value.rows);
        if (cf.ok) setConflicts(cf.value.files);
      }, [activePath]);

      react.useEffect(() => {
        if (activePath) refresh(activePath);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [activePath]);

      // Esc closes
      react.useEffect(() => {
        const onKey = (e) => {
          if (e.key === "Escape" && !modal) onClose();
        };
        document.addEventListener("keydown", onKey, true);
        return () => document.removeEventListener("keydown", onKey, true);
      }, [onClose, modal]);

      // load workspace from the conversation context if available
      const showDiff = async (file, isStaged) => {
        setSelectedCommit(null); // 离开提交详情，回到文件 diff
        setDiffFile(file);
        setDiffStaged(isStaged);
        setRightTab("diff");
        const r = await gitCall("diff", { path: activePath, file, staged: isStaged });
        if (r.ok) setDiffText(r.value.text);
        else { setDiffText(""); setError(r.error?.message); }
      };

      const showFile = async (file) => {
        setSelectedCommit(null); // 离开提交详情，回到文件对比
        setDiffFile(file);
        setRightTab("file");
        const [work, head, flog, bl] = await Promise.all([
          gitCall("catFile", { path: activePath, file, workingTree: true }),
          gitCall("catFile", { path: activePath, file, ref: "HEAD" }),
          gitCall("fileLog", { path: activePath, file, n: 20 }),
          gitCall("blame", { path: activePath, file }),
        ]);
        setFileViewText(work.ok ? work.value.text : "");
        setFileViewHeadText(head.ok ? head.value.text : "");
        setFileLog(flog.ok ? flog.value.commits : []);
        setBlameLines(bl.ok ? bl.value.lines : []);
      };

      const showCommit = async (hash) => {
        setSelectedCommit(hash);
        setRightTab("diff");
        const r = await gitCall("showStat", { path: activePath, hash });
        if (r.ok) setSelectedCommitText(r.value.text);
        else setSelectedCommitText("");
      };

      const runMutation = async (op, payload, thenRefresh = true) => {
        setBusy(true);
        setError(null);
        const r = await gitCall(op, { path: activePath, ...payload });
        setBusy(false);
        if (!r.ok) {
          setError(r.error?.message || (op + " failed"));
          setOutput("");
          return { ok: false, error: r.error };
        }
        setOutput(r.value?.stdout || r.value?.stderr || "");
        if (thenRefresh) refresh();
        return { ok: true };
      };

      // 提交只针对已暂存（勾选）的文件：把全部已暂存路径交给 host 的
      // commit(files)，host 会 reset 后仅 add 这些文件再提交，未暂存的不动。
      const commitStaged = async () => {
        if (!message.trim()) return;
        if (staged.length === 0) {
          setError("没有已暂存的文件，请先勾选要提交的文件");
          return;
        }
        const r = await runMutation("commit", { message, files: staged.map((f) => f.path) });
        if (r.ok) setMessage("");
      };

      const doMerge = async (target) => {
        if (!target) return;
        const r = await runMutation("merge", { name: target });
        if (!r.ok && /conflict/i.test(r.error?.message || "")) {
          const cf = await gitCall("conflicts", { path: activePath });
          setConflicts(cf.ok ? cf.value.files : []);
        }
      };

      // branch actions
      const createBranch = async () => {
        const name = newBranchName.trim();
        if (!name) return;
        await runMutation("newBranch", { name, switch: true });
        setNewBranchName("");
        setShowBranchManager(false);
      };
      const deleteBranch = async (name) => {
        setConfirmDelete(null);
        await runMutation("deleteBranch", { name });
      };
      const renameBranch = async (oldName) => {
        const newName = window.prompt("重命名分支为：", oldName);
        if (newName && newName.trim()) {
          await runMutation("renameBranch", { oldName, name: newName.trim() });
        }
      };

      const fileRow = (f, isStaged) => {
        // checkbox 即暂存开关：未暂存行勾选 → 暂存；已暂存行默认勾选，取消 → 取消暂存
        const toggleStage = (e) => {
          if (isStaged) {
            if (!e.target.checked) runMutation("unstage", { files: [f.path] });
          } else if (e.target.checked) {
            runMutation("stage", { files: [f.path] });
          }
        };
        return jsxs("li", {
          key: (isStaged ? "s" : "u") + f.path + f.status,
          className: diffFile === f.path && rightTab === "diff" && diffStaged === isStaged ? "dshGitSelected" : "",
          children: [
            jsx("input", {
              type: "checkbox",
              className: "dshGitCheck",
              checked: isStaged,
              title: isStaged ? "取消暂存" : "暂存",
              onChange: toggleStage,
            }),
            jsx("span", { className: "dshGitCode " + changeClass(f.status, isStaged), children: statusLetter(f.status) }),
            jsx("button", { type: "button", title: f.path + (f.original ? " ← " + f.original : ""), onClick: () => showDiff(f.path, isStaged), children: f.path }),
            jsx("span", { className: "dshGitBranchActions", children: [
              !isStaged && f.status !== "??" ? jsx("button", { className: "dshGitMiniBtn dshGitMiniBtnDanger", type: "button", title: "丢弃改动", onClick: (e) => { e.stopPropagation(); setModal({ title: "丢弃改动", body: "确定丢弃 " + f.path + " 的工作区改动？此操作不可恢复。", action: () => runMutation("discard", { files: [f.path] }) }); }, children: "丢弃" }) : null,
            ] }),
          ],
        });
      };

      const graphRows = graph.map((row, i) => {
        const selected = selectedCommit === row.hash;
        return jsx("div", {
          key: row.hash + i,
          className: "dshGitGraphRow" + (selected ? " dshGitGraphRowSelected" : ""),
          onClick: () => showCommit(row.hash),
          children: [
            jsx("span", { className: "dshGitGraphGlyph", children: row.graph }),
            row.refs ? jsx("span", { className: "dshGitGraphRefs", children: row.refs }) : null,
            jsx("span", { className: "dshGitGraphSubject", children: row.subject }),
            jsx("span", { className: "dshGitGraphMeta", children: row.hash + (row.author ? " · " + row.author : "") + (row.date ? " · " + row.date : "") }),
          ],
        });
      });

      const rightContent = () => {
        if (rightTab === "file") {
          return jsxs(Fragment, { children: [
            diffFile ? jsxs("div", { className: "dshGitToolbar", children: [
              jsx("span", { className: "dshGitUpstream", children: diffFile }),
              fileLog.length > 0 ? jsx("span", { className: "dshGitHint", children: "（" + fileLog.length + " 次提交）" }) : null,
            ] }) : null,
            diffFile ? jsxs("div", { className: "dshGitRow", children: [
              jsx("span", { className: "dshGitUpstream", children: "工作区" }),
              jsx("span", { className: "dshGitUpstream", children: "HEAD" }),
            ] }) : null,
            jsxs("div", { className: "dshGitDiff", children: [
              jsx("div", { className: "dshGitDiffLine dshGitDiffMeta", children: [jsx("span", { className: "dshGitContent", children: "===== 工作区 (working tree) =====" })] }),
              ...(fileViewText ? fileViewText.split("\n").map((line, i) => jsx("div", { className: "dshGitDiffLine", children: [jsx("span", { className: "dshGitLn", children: String(i + 1) }), jsx("span", { className: "dshGitContent", children: line === "" ? " " : line }) ] }, "w" + i)) : [jsx("div", { className: "dshGitEmpty", children: "（空/新文件）" }, "wempty")]),
              jsx("div", { className: "dshGitDiffLine dshGitDiffMeta", children: [jsx("span", { className: "dshGitContent", children: "===== HEAD =====" })] }),
              ...(fileViewHeadText ? fileViewHeadText.split("\n").map((line, i) => jsx("div", { className: "dshGitDiffLine", children: [jsx("span", { className: "dshGitLn", children: String(i + 1) }), jsx("span", { className: "dshGitContent", children: line === "" ? " " : line }) ] }, "h" + i)) : [jsx("div", { className: "dshGitEmpty", children: "（HEAD 无此文件）" }, "hempty")]),
            ] }),
            jsxs("div", { className: "dshGitSection", children: [
              jsx("h4", { children: "该文件的历史" }),
              fileLog.length === 0 ? jsx("div", { className: "dshGitEmpty", children: "暂无历史" }) : jsx("ul", { className: "dshGitList", children: fileLog.map((c) =>
                jsxs("li", { key: c.hash, children: [
                  jsx("span", { className: "dshGitCode", children: c.hash.slice(0, 7) }),
                  jsx("button", { type: "button", title: c.subject, onClick: () => showCommit(c.hash), children: c.subject }),
                  jsx("span", { className: "dshGitBranchTrack", children: c.date }),
                ] }),
              ) }),
            ] }),
          ] });
        }
        if (rightTab === "blame") {
          return jsxs(Fragment, { children: [
            diffFile ? jsx("div", { className: "dshGitToolbar", children: [jsx("span", { className: "dshGitUpstream", children: "blame: " + diffFile }) ] }) : null,
            jsx(BlameView, { lines: blameLines }),
          ] });
        }
        // diff tab
        if (selectedCommit) {
          return jsxs(Fragment, { children: [
            jsx("div", { className: "dshGitToolbar", children: [jsx("span", { className: "dshGitUpstream", children: "提交 " + selectedCommit.slice(0, 7) }) ] }),
            jsx("div", { className: "dshGitDiffOuter", children: selectedCommitText ? jsx(DiffView, { text: selectedCommitText }) : jsx("div", { className: "dshGitEmpty", children: "加载中…" }) }),
          ] });
        }
        return jsxs(Fragment, { children: [
          diffFile ? jsx("div", { className: "dshGitToolbar", children: [
            jsx("span", { className: "dshGitUpstream", children: diffFile }),
            jsx("span", { className: "dshGitUpstream", children: diffStaged ? "（已暂存）" : "（未暂存）" }),
          ] }) : null,
          diffText === "" && !diffFile
            ? jsx("div", { className: "dshGitEmpty", children: "点击左侧文件查看差异，或点击历史中的提交查看详情" })
            : jsx(DiffView, { text: diffText }),
        ] });
      };

      return react_dom.createPortal(jsxs("div", { className: "dshGitOverlay", "data-git-panel": true, children: [
        jsxs("div", { className: "dshGitTop", children: [
          jsx("span", { className: "dshGitTopTitle", children: [
            jsx(primitives.IconBranchOutline16, { size: 18 }),
            "Git",
          ] }),
          branch ? jsx("span", { className: "dshGitBranch", children: [jsx(primitives.IconBranchOutline16, { size: 14 }), branch] }) : null,
          upstream ? jsx("span", { className: "dshGitUpstream", children: upstream }) : null,
          ahead > 0 ? jsx("span", { className: "dshGitAhead", children: "↑" + ahead }) : null,
          behind > 0 ? jsx("span", { className: "dshGitBehind", children: "↓" + behind }) : null,
          conflicts.length > 0 ? jsx("span", { className: "dshGitErr", children: "⚠ " + conflicts.length + " 个冲突文件" }) : null,
          jsx("input", {
            className: "dshGitInput",
            style: { width: "220px", flex: "none", fontSize: "11px" },
            placeholder: "仓库路径（如 ~/projects/foo）",
            value: pathInput || activePath || "",
            title: activePath || "输入 Git 仓库路径",
            onChange: (e) => setPathInput(e.target.value),
            onKeyDown: (e) => { if (e.key === "Enter" && pathInput.trim()) { setCwd(pathInput.trim()); refresh(pathInput.trim()); } },
          }),
          jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => { if (pathInput.trim()) { setCwd(pathInput.trim()); refresh(pathInput.trim()); } }, disabled: !pathInput.trim() || loading, children: "加载" }),
          jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => setShowBranchManager((v) => !v), children: showBranchManager ? "收起分支" : "分支管理" }),
          jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => refresh(), disabled: loading, children: loading ? "刷新中…" : "刷新" }),
          jsx(primitives.Button, { variant: "primary", size: "sm", onClick: onClose, children: "关闭" }),
        ] }),
        jsxs("div", { className: "dshGitBody", children: [
          // ── left column: branches + file changes ──
          jsxs("div", { className: "dshGitCol", children: [
            showBranchManager ? jsx("div", { className: "dshGitSection", children: [
              jsx("h4", { children: "分支管理" }),
              jsx("div", { className: "dshGitRow", children: [
                jsx("input", { className: "dshGitInput", placeholder: "新分支名", value: newBranchName, onChange: (e) => setNewBranchName(e.target.value), onKeyDown: (e) => { if (e.key === "Enter") createBranch(); } }),
                jsx(primitives.Button, { variant: "primary", size: "sm", onClick: createBranch, disabled: !newBranchName.trim() || busy, children: "新建" }),
              ] }),
              jsx("div", { className: "dshGitRow", children: [
                jsx("select", { className: "dshGitInput", value: mergeTarget, onChange: (e) => setMergeTarget(e.target.value), children: [
                  jsx("option", { value: "", children: "选择要合并的分支…" }),
                  ...branches.filter((b) => !b.remote && !b.current).map((b) => jsx("option", { key: b.name, value: b.name, children: b.name })),
                ] }),
                jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => doMerge(mergeTarget), disabled: !mergeTarget || busy, children: "合并" }),
              ] }),
              jsx("div", { className: "dshGitBranchBox", children: branches.length === 0
                ? jsx("div", { className: "dshGitEmpty", children: "暂无分支" })
                : branches.map((b) => jsxs("div", {
                    key: b.name,
                    className: "dshGitBranchItem" + (b.current ? " dshGitBranchItemCurrent" : "") + (b.remote ? " dshGitBranchItemRemote" : ""),
                    children: [
                      jsx("button", { type: "button", style: { flex: 1, textAlign: "left", border: "none", background: "transparent", color: "inherit", cursor: "pointer", font: "inherit" }, onClick: () => b.current ? null : runMutation("switchBranch", { name: b.name }), children: b.name }),
                      b.ahead > 0 || b.behind > 0 ? jsx("span", { className: "dshGitBranchTrack", children: "↑" + b.ahead + " ↓" + b.behind }) : null,
                      !b.remote ? jsx("span", { className: "dshGitBranchActions", children: [
                        jsx("button", { className: "dshGitMiniBtn", type: "button", title: "重命名", onClick: () => renameBranch(b.name), children: "改名" }),
                        b.current ? null : jsx("button", { className: "dshGitMiniBtn dshGitMiniBtnDanger", type: "button", title: "删除", onClick: () => setConfirmDelete(b.name), children: "删除" }),
                      ] }) : null,
                    ],
                  })),
                }),
              ] }) : null,
            jsxs("div", { className: "dshGitSection", children: [
              jsx("h4", { children: "已暂存（" + staged.length + "）" }),
              staged.length === 0
                ? jsx("div", { className: "dshGitEmpty", children: "无已暂存文件" })
                : jsx("ul", { className: "dshGitList", children: staged.map((f) => fileRow(f, true)) }),
            ] }),
            jsxs("div", { className: "dshGitSection", children: [
              jsx("h4", { children: [
                jsx("input", {
                  type: "checkbox",
                  className: "dshGitCheck",
                  checked: staged.length > 0 && unstaged.length + untracked.length === 0,
                  disabled: staged.length + unstaged.length + untracked.length === 0,
                  title: "全部暂存 / 全部取消暂存",
                  onChange: (e) => {
                    if (e.target.checked) {
                      const files = [...unstaged.map((f) => f.path), ...untracked.map((f) => f.path)];
                      if (files.length > 0) runMutation("stage", { files });
                    } else {
                      const files = staged.map((f) => f.path);
                      if (files.length > 0) runMutation("unstage", { files });
                    }
                  },
                }),
                "未暂存（" + (unstaged.length + untracked.length) + "）",
              ] }),
              unstaged.length + untracked.length === 0
                ? jsx("div", { className: "dshGitEmpty", children: "工作区干净" })
                : jsx("ul", { className: "dshGitList", children: [
                    ...unstaged.map((f) => fileRow(f, false)),
                    ...untracked.map((f) => fileRow({ ...f, status: "??" }, false)),
                  ] }),
            ] }),
          ] }),
          // ── center column: history (top, fills) + commit (bottom) ──
          jsxs("div", { className: "dshGitCol", children: [
            jsxs("div", { className: "dshGitSection dshGitSectionFlex", children: [
              jsx("h4", { children: "历史（点击提交查看详情）" }),
              graph.length === 0
                ? jsx("div", { className: "dshGitEmpty", children: "暂无提交" })
                : jsx("div", { className: "dshGitGraph", children: graphRows }),
            ] }),
            jsxs("div", { className: "dshGitSection", style: { flex: "0 0 auto" }, children: [
              jsx("h4", { children: "提交" }),
              jsx("textarea", { className: "dshGitTextarea", placeholder: "提交说明", value: message, onChange: (e) => setMessage(e.target.value) }),
              jsx("div", { className: "dshGitRow", children: [
                jsx(primitives.Button, { variant: "primary", size: "sm", onClick: commitStaged, disabled: busy || !message.trim() || staged.length === 0, children: "提交已暂存 (" + staged.length + ")" }),
                jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => runMutation("amend", { message: message.trim() || undefined }), disabled: busy, title: "修改上一次提交", children: "Amend" }),
              ] }),
              jsx("div", { className: "dshGitRow", children: [
                jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => runMutation("push", { branch: branch, setUpstream: true }), disabled: busy, children: "推送" }),
                jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => runMutation("pull", {}), disabled: busy, children: "拉取" }),
                jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => runMutation("fetch", { prune: true }), disabled: busy, children: "Fetch" }),
              ] }),
              output ? jsx("pre", { className: "dshGitOut", children: output }) : null,
              error ? jsx("div", { className: "dshGitErr", role: "alert", children: error }) : null,
            ] }),
          ] }),
          // ── right column: tabs ──
          jsxs("div", { className: "dshGitCol", children: [
            jsx("div", { className: "dshGitTabs", children: [
              jsx("button", { className: "dshGitTab" + (rightTab === "diff" ? " dshGitTabActive" : ""), onClick: () => setRightTab("diff"), children: "差异" }),
              jsx("button", { className: "dshGitTab" + (rightTab === "file" ? " dshGitTabActive" : ""), onClick: () => { if (diffFile) showFile(diffFile); setRightTab("file"); }, children: "文件对比" }),
              jsx("button", { className: "dshGitTab" + (rightTab === "blame" ? " dshGitTabActive" : ""), onClick: () => { if (diffFile) showFile(diffFile); setRightTab("blame"); }, children: "Blame" }),
            ] }),
            jsx("div", { className: "dshGitSection", style: { flex: 1, display: "flex", flexDirection: "column" }, children: rightContent() }),
          ] }),
        ] }),
        modal ? jsx(Modal, { title: modal.title, onClose: () => setModal(null), children: jsxs(Fragment, { children: [
          jsx("div", { children: modal.body }),
          jsx("div", { className: "dshGitRow", children: [
            jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => setModal(null), children: "取消" }),
            jsx(primitives.Button, { variant: "primary", size: "sm", onClick: () => { modal.action(); setModal(null); }, children: "确定" }),
          ] }),
        ] }) }) : null,
        confirmDelete ? jsx(Modal, { title: "删除分支", onClose: () => setConfirmDelete(null), children: jsxs(Fragment, { children: [
          jsx("div", { children: "确定删除分支 " + confirmDelete + "？" }),
          jsx("div", { className: "dshGitRow", children: [
            jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => setConfirmDelete(null), children: "取消" }),
            jsx(primitives.Button, { variant: "primary", size: "sm", onClick: () => deleteBranch(confirmDelete), children: "删除" }),
          ] }),
        ] }) }) : null,
      ] }), document.body);
    }

    // ── sidebar footer entry (opens the full-screen panel) ─────────────────
    function GitFooterButton(props) {
      const [open, setOpen] = react.useState(false);
      const { useSessions, wide } = props;
      // compute the current session's workspace cwd at render time (hook rules:
      // useSessions must be called at the top level of the component).
      // The session list snapshot shape is `{ current, byId, ... }` (the shell
      // itself reads `state.byId[id].title`), so resolve cwd via byId.
      let sessionCwd = "";
      if (useSessions) {
        try {
          const v = useSessions((s) => {
            const cur = s.current;
            if (!cur) return "";
            const entry = s.byId ? s.byId[cur] : undefined;
            return entry && typeof entry.cwd === "string" ? entry.cwd : "";
          });
          if (typeof v === "string") sessionCwd = v;
        } catch (e) { /* session store unavailable */ }
      }
      const openPanel = react.useCallback(() => {
        setOpen(true);
      }, []);
      return jsxs(Fragment, { children: [
        jsx("button", {
          type: "button",
          className: "dshGitFooterTrigger" + (wide ? "" : " dshGitFooterTriggerRail"),
          title: "打开 Git 面板" + (sessionCwd ? "（" + sessionCwd + "）" : ""),
          "aria-label": "Git",
          onClick: openPanel,
          children: jsxs(Fragment, { children: [
            jsx(primitives.IconBranchOutline16, { size: wide ? 16 : 18 }),
            wide ? jsx("span", { className: "dshGitFooterTriggerLabel", children: "Git" }) : null,
          ] }),
        }),
        open ? jsx(GitPanel, { onClose: () => setOpen(false), sessionCwd }) : null,
      ] });
    }

    // ── plugin body ─────────────────────────────────────────────────────────
    const inject = ["slots"];

    function apply(ctx) {
      ctx.slots.inject("sidebar.footer.action", () =>
        ctx.slots.register(
          { name: "sidebar.footer.action", id: "git-open", order: 10, label: () => "Git" },
          GitFooterButton,
        ),
      );
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
