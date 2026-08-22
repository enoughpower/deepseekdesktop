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
      ".dshGitOverlay{position:fixed;inset:0;z-index:1200;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}",
      ".dshGitTop{flex:none;display:flex;align-items:center;gap:8px;height:48px;padding:0 16px;border-bottom:1px solid var(--dsw-alias-border-l2)}",
      ".dshGitTopWrap{position:relative}",
      ".dshGitBranchBtn{cursor:pointer;user-select:none;display:inline-flex;align-items:center;gap:5px}",
      ".dshGitBranchBtn:hover{border-color:var(--dsw-alias-state-business-primary)}",
      ".dshGitBranchActive{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}",
      ".dshGitBranchCaret{font-size:10px;opacity:.7}",
      ".dshGitCommitOps{display:flex;align-items:center;gap:6px;flex:none}",
      ".dshGitForkInput{width:128px;height:28px;font-size:12px}",
      ".dshGitTopMenu{left:auto;right:10px;top:calc(100% - 1px);width:320px;min-width:0;max-width:340px}",
      ".dshGitTopTitle{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;color:var(--dsw-alias-label-primary);min-width:0}",
      ".dshGitBranch{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);font-family:ui-monospace,Menlo,monospace;font-size:12px;color:var(--dsw-alias-state-success-primary);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".dshGitUpstream{color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,Menlo,monospace;font-size:12px}",
      ".dshGitAhead{color:var(--dsw-alias-state-warn-primary);font-size:12px;font-weight:600}",
      ".dshGitBehind{color:var(--dsw-alias-state-error-primary);font-size:12px;font-weight:600}",
      ".dshGitPath{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,Menlo,monospace;font-size:12px;text-align:right}",
      ".dshGitBody{flex:1;min-height:0;display:flex;flex-direction:column;gap:0;overflow:hidden;min-width:0}",
      ".dshGitCol{display:flex;flex-direction:column;min-width:0;min-height:0;border-right:1px solid var(--dsw-alias-border-l2)}",
      ".dshGitHistoryBand{flex:0 0 auto;max-height:42%;min-height:96px;display:flex;flex-direction:column;border-bottom:1px solid var(--dsw-alias-border-l2);overflow:hidden}",
      ".dshGitLowerSplit{flex:1;min-height:0;display:flex;flex-direction:row;min-width:0}",
      ".dshGitCommitBar{flex:none;display:flex;flex-direction:row;align-items:center;gap:8px;padding:8px 12px;border-top:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:0}",
      ".dshGitCommitBar .dshGitInput{flex:1;min-width:0;font-size:12px}",
      ".dshGitCommitBar .dshGitMsgInput{height:auto;min-height:30px;max-height:96px;resize:vertical;line-height:18px;padding:6px 8px;overflow-y:auto;box-sizing:border-box;font-family:inherit}",
      ".dshGitIconBtn{width:30px;height:30px;flex:none;display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);cursor:pointer;padding:0}",
      ".dshGitIconBtn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      ".dshGitIconBtn:disabled{opacity:.4;cursor:not-allowed}",
      ".dshGitIconBtnPrimary{color:var(--dsw-alias-state-business-primary);border-color:var(--dsw-alias-state-business-primary)}",
      ".dshGitCommitMsg{display:flex;flex-direction:column;gap:2px;min-width:0;max-width:40%;max-height:80px;overflow:auto}",
      ".dshGitCommitMsg .dshGitOut,.dshGitCommitMsg .dshGitErr{margin:0;font-size:11px;max-height:none}",
      ".dshGitResizeHandle{flex:none;height:6px;cursor:ns-resize;position:relative}",
      ".dshGitResizeHandle::after{content:\"\";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:36px;height:3px;border-radius:2px;background:var(--dsw-alias-border-l2)}",
      ".dshGitResizeHandle:hover::after{background:var(--dsw-alias-state-business-primary)}",
      ".dshGitBranchWrap{position:relative;flex:none;min-width:0}",
      ".dshGitBranchEmpty{flex:none;color:var(--dsw-alias-label-tertiary);font-size:12px;padding:0 4px}",
      ".dshGitMoreChip{flex:none;display:inline-flex;align-items:center;gap:3px;height:24px;padding:0 9px;border:1px dashed var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:12px;cursor:pointer;white-space:nowrap}",
      ".dshGitMoreChip:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-state-business-primary)}",
      ".dshGitBranchMenu{position:absolute;top:calc(100% - 1px);left:10px;right:10px;z-index:60;display:flex;flex-direction:column;gap:8px;padding:10px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:var(--dsw-shadow-lv3);max-height:280px;overflow:auto}",
      ".dshGitBranchMenuList{display:flex;flex-direction:column;gap:4px;align-items:stretch}",
      ".dshGitBranchMenuActions{display:flex;gap:6px;align-items:center;flex-wrap:wrap;border-top:1px solid var(--dsw-alias-border-l1);padding-top:8px}",
      ".dshGitBranchMenuActions .dshGitInput{width:140px;height:26px;font-size:12px}",
      ".dshGitBranchGroupLabel{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);margin:0 2px 0 8px;text-transform:uppercase;letter-spacing:.4px}",
      ".dshGitBranchChip{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-family:ui-monospace,Menlo,monospace;font-size:12px;white-space:nowrap;flex:none}",
      ".dshGitBranchChipCurrent{color:var(--dsw-alias-state-business-primary);border-color:var(--dsw-alias-state-business-primary)}",
      ".dshGitBranchChipRemote{opacity:.75}",
      ".dshGitBranchChipSwitch{cursor:pointer}",
      ".dshGitBranchChipSwitch:hover{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary)}",
      ".dshGitBranchMenuList .dshGitBranchChip{border:none;background:transparent;width:100%;justify-content:flex-start}",
      ".dshGitBranchMenuList .dshGitBranchChipSwitch:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      ".dshGitBranchMenuList .dshGitBranchGroupLabel{margin:2px 2px 0 8px}",
      ".dshGitBranchChipDot{font-size:8px;color:var(--dsw-alias-state-business-primary)}",
      ".dshGitBranchChipName{max-width:180px;overflow:hidden;text-overflow:ellipsis}",
      ".dshGitBranchChip .dshGitMiniBtn{background:0 0;border:none;color:inherit;cursor:pointer;font-size:11px;padding:0 2px;line-height:1}",
      ".dshGitBranchChip .dshGitMiniBtnDanger:hover{color:var(--dsw-alias-state-error-primary)}",
      ".dshGitCol{display:flex;flex-direction:column;min-width:0;min-height:0;border-right:1px solid var(--dsw-alias-border-l2)}",
      ".dshGitCol:last-child{border-right:none}",
      ".dshGitSection{display:flex;flex-direction:column;gap:8px;min-height:0;padding:12px 12px 8px;border-bottom:1px solid var(--dsw-alias-border-l2)}",
      ".dshGitSection:last-child{border-bottom:none;flex:1}",
      ".dshGitSectionFlex{flex:1;min-height:0}",
      ".dshGitSection h4{margin:0;font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary);display:flex;align-items:center;gap:6px;flex:none}",
      ".dshGitHistoryOps{display:flex;align-items:center;gap:6px;flex:none}",
      ".dshGitBranchFrom{display:flex;gap:6px;align-items:center;flex:none}",
      ".dshGitBranchFrom .dshGitInput{width:230px;height:26px;font-size:12px}",
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
      ".dshGitCommitBar .dshGitTextarea{min-height:34px;max-height:90px}",
      ".dshGitCommitBar .dshGitRow{gap:8px}",
      ".dshGitCommitBar .dshGitOut{margin:0;max-height:80px}",
      ".dshGitCommitBar .dshGitErr{margin:0;max-height:80px}",
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
      ".dshGitDiffLoading{position:sticky;top:0;z-index:5;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;padding:4px 10px;border-bottom:1px solid var(--dsw-alias-border-l1);font-family:ui-monospace,Menlo,monospace}",
      // Virtual-scroll diff: fixed-height rows, single-line content with
      // ellipsis so long lines and 30k-row diffs scroll smoothly.
      // Virtual-scroll diff: fixed-height rows pinned to the container width.
      // Virtual-scroll diff: the row width is driven by its content
      // (max-content) so long lines stay readable and the add/delete color
      // block stretches across the FULL row width; the container scrolls
      // horizontally when a line is wider than the pane. `flex:none` on the
      // content keeps the width computation exact (flex:1 inside a
      // max-content flex row would compress the text and clip line numbers).
      ".dshGitDiffVirtual .dshGitDiffRow{align-items:stretch;width:100%}",
      ".dshGitDiffVirtual .dshGitContent{flex:none;white-space:pre;overflow:visible;line-height:19px}",
      ".dshGitDiffVirtual .dshGitGutter{line-height:19px}",
      ".dshGitDiffVirtual .dshGitDiffRowHunk .dshGitContent{line-height:19px}",
      ".dshGitDiffVFile{background:var(--dsw-alias-bg-layer-2);border-bottom:1px solid var(--dsw-alias-border-l1);align-items:center;gap:6px;padding:0 8px;flex:none}",
      ".dshGitDiffVFile .dshGitDiffFileDot{line-height:19px}",
      ".dshGitDiffVFile .dshGitDiffFileName{color:var(--dsw-alias-label-primary);font-weight:600;line-height:19px}",
      ".dshGitDiffVFile .dshGitDiffFileBadge{line-height:14px}",
      // branch manager
      ".dshGitBranchItem{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;padding:6px 8px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font-family:ui-monospace,Menlo,monospace;font-size:12px;cursor:pointer;text-align:left}",
      ".dshGitBranchItem:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGitBranchItemCurrent{color:var(--dsw-alias-state-success-primary);font-weight:600}",
      ".dshGitBranchItemRemote{color:var(--dsw-alias-label-secondary)}",
      ".dshGitBranchTrack{margin-left:auto;color:var(--dsw-alias-label-tertiary);font-size:11px;white-space:nowrap}",
      ".dshGitBranchActions{display:flex;gap:4px;margin-left:auto;flex:none;align-self:stretch;align-items:stretch}",
      ".dshGitMiniBtn{border:1px solid var(--dsw-alias-border-l1);border-radius:6px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:11px;padding:2px 6px;font-family:inherit}",
      ".dshGitMiniBtn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      ".dshGitMiniBtn:disabled{opacity:.45;cursor:default}",
      ".dshGitMiniBtnDanger:hover:not(:disabled){color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}",
      // 文件行 "⋯" 菜单
      ".dshGitMenuWrap{position:relative;display:inline-flex;align-self:stretch;align-items:stretch}",
      ".dshGitMoreBtn{flex:none;align-self:stretch;height:100%;width:100%;border:none;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;min-width:40px;padding:0 10px;border-radius:6px;font-family:inherit}",
      ".dshGitMoreBtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
      ".dshGitMenu{position:absolute;right:0;top:calc(100% + 4px);z-index:50;min-width:140px;padding:6px;display:flex;flex-direction:column;gap:2px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.18)}",
      ".dshGitMenuItem{display:flex;align-items:center;width:100%;box-sizing:border-box;text-align:left;padding:8px 12px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-primary);cursor:pointer;font-size:13px;line-height:1.5;font-family:inherit;white-space:nowrap}",
      ".dshGitMenuItem:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGitMenuItemDanger{color:var(--dsw-alias-state-error-primary)}",
      ".dshGitMenuItemDanger:hover{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGitBranchBox{margin-top:6px;padding:4px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-2);max-height:240px;overflow:auto}",
      ".dshGitToolbar{display:flex;gap:6px;flex-wrap:wrap;align-items:center}",
      // graph
      ".dshGitGraph{overflow:auto;flex:1;min-height:0;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);font-family:ui-monospace,Menlo,monospace;font-size:12px;line-height:1.7}",
      ".dshGitGraphInner{position:relative;min-width:max-content}",
      ".dshGitGraphSvg{position:absolute;top:0;left:0;z-index:2;pointer-events:none}",
      ".dshGitGraphRow{display:flex;align-items:center;gap:8px;min-height:24px;cursor:pointer;white-space:nowrap;padding:0 8px 0 4px;position:relative;z-index:1}",
      ".dshGitGraphRow:hover{background:var(--dsw-alias-interactive-bg-hover)}",
      ".dshGitGraphRowSelected{background:var(--dsw-alias-interactive-bg-hover)}",
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
      // The official active-phase rule styles the view area as
      // `flex:1 0 auto; min-height:auto` — flex-basis:auto resolves to the
      // CONTENT height, so a tall Git page stretches the whole conversation
      // (window scrolls endlessly). When the Git view is active, force the
      // view-area wrapper to flex-basis 0 with a zero min-height so GitView
      // fills the fixed area and only its inner columns scroll. Scoped via
      // :has() + structure to git sessions only; chat/trajectory are untouched.
      "[data-slot=\"conversation.session\"]:has([data-git-view]) > div{flex:1 1 0% !important;min-height:0 !important}",
      ".dshGitView{width:100%;flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column}",
      // While the Git view is the active conversation view, hide the composer
      // (input bar) below it — Git replaces the chat/trajectory area entirely.
      // `:has()` works in the WKWebView (Safari 15.4+); on older systems the
      // composer simply stays visible.
      "[data-slot=\"conversation.session\"]:has([data-git-view]) ~ [data-composer-seat]{display:none}",
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

    const DIFF_ROW_H = 19;
    const DIFF_OVERSCAN = 24;

    function DiffView({ text }) {
      if (!text) return jsx("div", { className: "dshGitEmpty", children: "无差异" });
      const files = react.useMemo(() => parseDiffText(text), [text]);
      if (files.length === 0) return jsx("div", { className: "dshGitEmpty", children: "无差异" });
      // Flatten into fixed-height render units (file header / hunk header /
      // diff line). A virtual window then renders ONLY the visible rows, so a
      // 100-file / 30k-line diff scrolls smoothly instead of mounting every
      // row (SourceTree-style: one file's diff at a time, virtualized rows).
      const units = react.useMemo(() => {
        const out = [];
        // Track the widest row (in display columns; wide CJK chars count as 2)
        // so every row box stretches to the SAME width as the longest line —
        // the whole diff reads as one uniform code block with scrolling.
        let maxW = 0;
        const note = (s) => {
          let w = 0;
          for (const ch of s) w += /[\u4e00-\u9fff\uff00-\uffef\u3000-\u303f]/.test(ch) ? 2 : 1;
          if (w > maxW) maxW = w;
        };
        for (const f of files) {
          const binary = f.meta.some((l) => l.startsWith("Binary files"));
          const renamed = f.oldName !== f.newName && f.oldName !== "/dev/null" && f.newName !== "/dev/null";
          out.push({ kind: "file", f, binary, renamed });
          note(f.newName || f.oldName);
          if (!binary && f.hunks.length > 0) {
            for (const h of f.hunks) {
              out.push({ kind: "hunk", h });
              note(h.ok && h.lines[0].content ? h.lines[0].content : "");
              for (const l of h.lines.slice(1)) { out.push({ kind: "line", l }); note(l.content); }
            }
          } else if (!binary) {
            out.push({ kind: "meta" });
          }
        }
        return { units: out, maxW };
      }, [files]);
      const { units: rows, maxW } = units;
      // Monospace (12px) char width ~0.6em ≈ 7.2px; 2 gutters (34px each) +
      // widest row + small pad. Row boxes stretch to this width so the green/
      // red change block is one uniform code-block column, scrolling past it.
      const diffWidth = 68 + maxW * 7.2 + 16;
      const boxRef = react.useRef(null);
      const [scrollTop, setScrollTop] = react.useState(0);
      const [viewportH, setViewportH] = react.useState(0);
      react.useLayoutEffect(() => {
        const el = boxRef.current;
        if (!el) return;
        const update = () => setViewportH(el.clientHeight);
        update();
        if (typeof ResizeObserver !== "undefined") {
          const ro = new ResizeObserver(update);
          ro.observe(el);
          return () => ro.disconnect();
        }
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
      }, []);
      const fmtCount = (n) => (n === 1 ? "" : "," + n);
      const totalH = rows.length * DIFF_ROW_H;
      const start = Math.max(0, Math.floor(scrollTop / DIFF_ROW_H) - DIFF_OVERSCAN);
      const end = Math.min(rows.length, Math.ceil((scrollTop + viewportH) / DIFF_ROW_H) + DIFF_OVERSCAN);
      const visible = rows.slice(start, end);
      const rowClass = (u) => {
        if (u.kind === "file") return "dshGitDiffRow dshGitDiffVFile";
        if (u.kind === "hunk") return "dshGitDiffRow dshGitDiffRowHunk";
        if (u.kind === "meta") return "dshGitDiffRow dshGitDiffMeta";
        if (u.l.t === "add") return "dshGitDiffRow dshGitDiffRowAdd";
        if (u.l.t === "del") return "dshGitDiffRow dshGitDiffRowDel";
        return "dshGitDiffRow";
      };
      const rowContent = (u) => {
        if (u.kind === "file") {
          const f = u.f;
          return [
            jsx("span", { className: "dshGitDiffFileDot", children: "\u25CF" }),
            jsx("span", { className: "dshGitDiffFileName", title: f.newName || f.oldName, children: (f.newName && f.newName !== "/dev/null" ? f.newName : f.oldName) }),
            u.renamed ? jsx("span", { className: "dshGitDiffFileBadge", children: "重命名" }) : null,
            f.oldName === "/dev/null" ? jsx("span", { className: "dshGitDiffFileBadge dshGitDiffFileBadgeNew", children: "新增" }) : null,
            f.newName === "/dev/null" ? jsx("span", { className: "dshGitDiffFileBadge dshGitDiffFileBadgeDel", children: "删除" }) : null,
            u.binary ? jsx("span", { className: "dshGitDiffFileBadge", children: "二进制" }) : null,
          ];
        }
        if (u.kind === "hunk") {
          const h = u.h;
          const section = h.ok && h.lines[0].content ? " " + h.lines[0].content : "";
          return jsx("span", { className: "dshGitContent", children: h.ok ? "@@ -" + h.oldStart + fmtCount(h.oldCount) + " +" + h.newStart + fmtCount(h.newCount) + " @@" + section : h.lines[0].content });
        }
        if (u.kind === "meta") {
          return jsx("span", { className: "dshGitContent", children: "（无内容变更）" });
        }
        const l = u.l;
        return [
          jsx("span", { className: "dshGitGutter", children: l.oldLn ?? "" }),
          jsx("span", { className: "dshGitGutter", children: l.newLn ?? "" }),
          jsx("span", { className: "dshGitContent", children: l.content === "" ? " " : l.content }),
        ];
      };
      return jsx("div", {
        ref: boxRef,
        className: "dshGitDiff dshGitDiffVirtual",
        onScroll: (e) => setScrollTop(e.currentTarget.scrollTop),
        children: jsx("div", {
          style: { height: totalH, position: "relative", width: Math.max(diffWidth, 100), minWidth: "100%" },
          children: visible.map((u, i) => {
            const top = (start + i) * DIFF_ROW_H;
            return jsx("div", {
              key: "v" + (start + i),
              className: rowClass(u),
              style: { position: "absolute", top, left: 0, right: 0, height: DIFF_ROW_H },
              children: rowContent(u),
            });
          }),
        }),
      });
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
    // The mask must CONTAIN the dialog: it is a positioned (z-index:130)
    // full-overlay element, so a sibling dialog (static position) would be
    // painted underneath it and all clicks would hit the mask (closing the
    // dialog without running the action).
    function Modal({ title, children, onClose }) {
      return jsx("div", {
        className: "dshGitModalMask",
        onClick: onClose,
        children: jsx("div", {
          className: "dshGitModal",
          role: "dialog",
          "aria-modal": "true",
          onClick: (e) => e.stopPropagation(),
          children: jsxs(Fragment, { children: [
            jsx("h4", { children: title }),
            children,
          ] }),
        }),
      });
    }

    // ── full-screen Git panel ───────────────────────────────────────────────
    function GitView(props) {
      // Conversation view standard kit guarantees useSessions — call it
      // UNCONDITIONALLY (a conditional call would make React's hook count flip
      // between renders and crash the whole view ring). Resolve the current
      // session's workspace cwd so Git auto-enters that repository.
      const sessionCwd = props.useSessions((s) => {
        const cur = s.current;
        if (!cur) return "";
        const entry = s.byId ? s.byId[cur] : undefined;
        return entry && typeof entry.cwd === "string" ? entry.cwd : "";
      });
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
      const msgRef = react.useRef(null);
      const [diffFile, setDiffFile] = react.useState(null);
      const diffFileRef = react.useRef(null);
      const [diffText, setDiffText] = react.useState("");
      const [diffTruncated, setDiffTruncated] = react.useState(false);
      const [diffStaged, setDiffStaged] = react.useState(false);
      const [selectedCommit, setSelectedCommit] = react.useState(null);
      const [commitFiles, setCommitFiles] = react.useState(null); // null = working-tree mode
      const [commitFile, setCommitFile] = react.useState(null);
      const [selectedCommitText, setSelectedCommitText] = react.useState("");
      const [commitDiffTruncated, setCommitDiffTruncated] = react.useState(false);
      const [rightTab, setRightTab] = react.useState("diff"); // diff | file | blame
      // History band height (drag-resizable; leave room for the diff).
      const [historyH, setHistoryH] = react.useState(140);
      const historyDragRef = react.useRef(null);
      const startHistoryDrag = (e) => {
        e.preventDefault();
        historyDragRef.current = { startY: e.clientY, startH: historyH };
        const move = (ev) => {
          if (!historyDragRef.current) return;
          const h = historyDragRef.current.startH + (ev.clientY - historyDragRef.current.startY);
          setHistoryH(Math.max(90, Math.min(Math.round(window.innerHeight * 0.55), h)));
        };
        const up = () => {
          historyDragRef.current = null;
          window.removeEventListener("mousemove", move);
          window.removeEventListener("mouseup", up);
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
      };
      const [fileViewText, setFileViewText] = react.useState("");
      const [fileViewHeadText, setFileViewHeadText] = react.useState("");
      const [fileLog, setFileLog] = react.useState([]);
      const [blameLines, setBlameLines] = react.useState([]);
      const [branchMenu, setBranchMenu] = react.useState(null); // null | "local" | "remote"
      const [branchFromOpen, setBranchFromOpen] = react.useState(false);
      const LOCAL_SHOW = 6;
      const REMOTE_SHOW = 4;
      const [busy, setBusy] = react.useState(false);
      const [newBranchName, setNewBranchName] = react.useState("");
      const [mergeTarget, setMergeTarget] = react.useState("");
      const [confirmDelete, setConfirmDelete] = react.useState(null);
      const [modal, setModal] = react.useState(null); // {title, body, action}
      const [conflicts, setConflicts] = react.useState([]);
      const [pathInput, setPathInput] = react.useState("");
      const [menuFor, setMenuFor] = react.useState(null); // 文件行 "⋯" 菜单打开的行 path

      // 点击页面任意处关闭文件行菜单。注意：必须用冒泡阶段并忽略菜单内部的点击，
      // 若用捕获阶段，document 捕获监听会在菜单项自己的 onClick 之前触发
      // setMenuFor(null)，React 重渲染会把菜单从 DOM 移除，导致菜单项的点击被吞掉、
      // 弹窗无法打开（已在真实浏览器中复现）。
      react.useEffect(() => {
        const onDocClick = (e) => {
          const t = e.target;
          if (t && t.closest && t.closest(".dshGitMenuWrap")) return; // 点击菜单/⋯ 时不自动关闭
          setMenuFor(null);
        };
        document.addEventListener("click", onDocClick, false);
        return () => document.removeEventListener("click", onDocClick, false);
      }, []);

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
          gitCall("graphLog", { path: p, n: 500 }),
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
          // SourceTree-style: auto-select the first changed file so the diff
          // pane shows one file immediately (untracked → show its content).
          // Keeps the current selection when it is still in the list.
          const allPaths = [...st.value.staged, ...st.value.unstaged, ...st.value.untracked].map((f) => f.path);
          const keep = diffFileRef.current !== null && allPaths.includes(diffFileRef.current);
          if (!keep) {
            const staged0 = st.value.staged[0];
            const unstaged0 = st.value.unstaged[0];
            const untracked0 = st.value.untracked[0];
            if (staged0) showDiff(staged0.path, true);
            else if (unstaged0) showDiff(unstaged0.path, false);
            else if (untracked0) showFile(untracked0.path);
          }
        } else setError(st.error?.message || "git status failed");
        if (br.ok) setBranches(br.value.branches);
        if (gr.ok) setGraph(gr.value.rows);
        if (cf.ok) setConflicts(cf.value.files);
      }, [activePath]);

      react.useEffect(() => {
        if (activePath) refresh(activePath);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [activePath]);

      // load workspace from the conversation context if available
      const showDiff = async (file, isStaged) => {
        setSelectedCommit(null); // 离开提交详情，回到文件 diff
        setCommitFiles(null);
        setCommitFile(null);
        setDiffFile(file);
        diffFileRef.current = file;
        setDiffStaged(isStaged);
        setRightTab("diff");
        const r = await gitCall("diff", { path: activePath, file, staged: isStaged });
        if (r.ok) { setDiffText(r.value.text); setDiffTruncated(r.value.truncated === true); setError(null); }
        else { setDiffText(""); setDiffTruncated(false); setError(r.error?.message); }
      };

      const showFile = async (file) => {
        setSelectedCommit(null); // 离开提交详情，回到文件对比
        setCommitFiles(null);
        setCommitFile(null);
        setDiffFile(file);
        diffFileRef.current = file;
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
        setCommitFile(null);
        setSelectedCommitText("");
        const r = await gitCall("showFiles", { path: activePath, hash });
        if (r.ok) {
          setCommitFiles(r.value.files);
          const first = r.value.files[0];
          if (first) showCommitFile(hash, first.path);
        } else {
          setCommitFiles([]);
          setError(r.error?.message);
        }
      };

      const showCommitFile = async (hash, file) => {
        setCommitFile(file);
        setRightTab("diff");
        const r = await gitCall("showFileDiff", { path: activePath, hash, file });
        if (r.ok) { setSelectedCommitText(r.value.text); setCommitDiffTruncated(r.value.truncated === true); setError(null); }
        else { setSelectedCommitText(""); setCommitDiffTruncated(false); setError(r.error?.message); }
      };

      const exitCommitView = () => {
        setSelectedCommit(null);
        setCommitFiles(null);
        setCommitFile(null);
        setSelectedCommitText("");
        setRightTab("diff");
        diffFileRef.current = diffFile;
      };

      const commitFileRow = (f) => jsxs("li", {
        key: f.path,
        className: commitFile === f.path ? "dshGitSelected" : "",
        children: [
          jsx("span", { className: "dshGitCode " + changeClass(f.status, false), children: f.status }),
          jsx("button", { type: "button", title: f.path + (f.original ? " \u2190 " + f.original : ""), onClick: () => showCommitFile(selectedCommit, f.path), children: f.path }),
        ],
      });

      const branchChip = (b, isRemote) => {
        const switchable = !b.current;
        return jsxs("span", {
          key: b.name,
          className: "dshGitBranchChip" + (b.current ? " dshGitBranchChipCurrent" : "") + (isRemote ? " dshGitBranchChipRemote" : "") + (switchable ? " dshGitBranchChipSwitch" : ""),
          title: (b.subject ? b.subject + "\n" : "") + b.hash + (switchable ? "\n点击切换" : "\n当前分支"),
          onClick: switchable ? () => runMutation("switchBranch", { name: b.name }) : undefined,
          children: [
            b.current ? jsx("span", { className: "dshGitBranchChipDot", children: "\u25CF" }) : null,
            jsx("span", { className: "dshGitBranchChipName", children: b.name }),
            b.ahead > 0 || b.behind > 0 ? jsx("span", { className: "dshGitBranchTrack", children: "\u2191" + b.ahead + " \u2193" + b.behind }) : null,
            !isRemote ? jsx("button", { className: "dshGitMiniBtn", title: "重命名", onClick: (e) => { e.stopPropagation(); renameBranch(b.name); }, children: "\u270E" }) : null,
            !isRemote && !b.current ? jsx("button", { className: "dshGitMiniBtn dshGitMiniBtnDanger", title: "删除", onClick: (e) => { e.stopPropagation(); setConfirmDelete(b.name); }, children: "\u2715" }) : null,
          ],
        });
      };

      const GIT_ICONS = {
        check: '<path d="M4 8.5l2.5 2.5L12 6" />',
        edit: '<path d="M5 11.2l.8-2.2L11 3.6 12.4 5 7 10.4l-2.2.8z" />',
        up: '<path d="M8 3l4 4h-2.5v5h-3V7H4z" />',
        down: '<path d="M8 13l-4-4h2.5V4h3v5H12z" />',
        refresh: '<path d="M13 8a5 5 0 1 1-1.5-3.6M13 3v2.5H10.5" />',
      };
      const gitIconBtn = (onClick, title, icon, disabled, primary) => jsx("button", {
        type: "button",
        className: "dshGitIconBtn" + (primary ? " dshGitIconBtnPrimary" : ""),
        title,
        disabled,
        onClick,
        children: jsx("svg", { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", dangerouslySetInnerHTML: { __html: GIT_ICONS[icon] } }),
      });

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
        if (r.ok) { setMessage(""); if (msgRef.current) msgRef.current.style.height = "auto"; }
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
      const createBranch = async (baseRef) => {
        const name = newBranchName.trim();
        if (!name) return;
        // Fork from the selected history commit when requested (SourceTree
        // "branch from this commit"): create without switching. Otherwise the
        // plain "new branch" flow creates AND switches to the new branch.
        await runMutation("newBranch", { name, base: baseRef || undefined, switch: baseRef ? false : true });
        setNewBranchName("");
        setBranchFromOpen(false);
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
        const menuOpen = menuFor === f.path;
        return jsxs("li", {
          key: (isStaged ? "s" : "u") + f.path + f.status,
          className: diffFile === f.path && diffStaged === isStaged ? "dshGitSelected" : "",
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
            jsxs("span", { className: "dshGitBranchActions", children: [
              jsxs("span", { className: "dshGitMenuWrap", children: [
                jsx("button", {
                  className: "dshGitMoreBtn",
                  type: "button",
                  title: "更多操作",
                  onClick: (e) => { e.stopPropagation(); setMenuFor(menuOpen ? null : f.path); },
                  children: jsx("svg", { width: 16, height: 16, viewBox: "0 0 16 16", fill: "currentColor", children: [
                    jsx("circle", { cx: 2.5, cy: 8, r: 1.4 }),
                    jsx("circle", { cx: 8, cy: 8, r: 1.4 }),
                    jsx("circle", { cx: 13.5, cy: 8, r: 1.4 }),
                  ] }),
                }),
                menuOpen
                  ? jsxs("div", { className: "dshGitMenu", children: [
                      !isStaged && f.status !== "??"
                        ? jsx("button", { className: "dshGitMenuItem", type: "button", onClick: () => { setMenuFor(null); setModal({ title: "丢弃改动", body: "确定丢弃 " + f.path + " 的工作区改动？此操作不可恢复。", action: () => runMutation("discard", { files: [f.path] }) }); }, children: "丢弃改动" })
                        : null,
                      jsx("button", { className: "dshGitMenuItem dshGitMenuItemDanger", type: "button", onClick: () => { setMenuFor(null); setModal({ title: "移除文件", body: "确定从工作区删除 " + f.path + "？此操作不可恢复。", action: () => runMutation("remove", { files: [f.path] }) }); }, children: "移除文件" }),
                    ] })
                  : null,
              ] }),
            ] }),
          ],
        });
      };

      // Git Graph 风格：主线固定左列，新分支向右占新列后竖直向下；
      // 分叉/合并用直线斜接，中间行只画穿过的竖线（无提交则无圆点）。
      const GRAPH_W = 10;
      const GRAPH_H = 24;
      const GRAPH_COLORS = ["#3b82f6", "#c4a054", "#f59e0b", "#22c55e", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"];
      const sameHash = (a, b) => !!a && !!b && (a === b || a.startsWith(b) || b.startsWith(a));
      const commits = graph.filter((r) => r.hash);
      const reserved = [];
      const lanes = commits.map((c) => {
        let col = reserved.findIndex((h) => sameHash(h, c.hash));
        if (col < 0) {
          col = reserved.findIndex((h) => h == null);
          if (col < 0) {
            col = reserved.length;
            reserved.push(c.hash);
          } else {
            reserved[col] = c.hash;
          }
        }
        for (let k = 0; k < reserved.length; k++) {
          if (sameHash(reserved[k], c.hash)) reserved[k] = null;
        }
        const parents = c.parents || [];
        if (parents[0] && reserved.findIndex((h) => sameHash(h, parents[0])) < 0) {
          reserved[col] = parents[0];
        }
        for (let p = 1; p < parents.length; p++) {
          if (reserved.findIndex((h) => sameHash(h, parents[p])) >= 0) continue;
          let empty = reserved.findIndex((h) => h == null);
          if (empty < 0) reserved.push(parents[p]);
          else reserved[empty] = parents[p];
        }
        while (reserved.length > 1 && reserved[reserved.length - 1] == null) reserved.pop();
        return col;
      });
      const maxCols = Math.max(1, ...lanes.map((c) => c + 1), 1);
      const gx = (c) => c * GRAPH_W + GRAPH_W / 2;
      const gy = (i) => i * GRAPH_H + GRAPH_H / 2;
      const colColor = (c) => GRAPH_COLORS[((c % GRAPH_COLORS.length) + GRAPH_COLORS.length) % GRAPH_COLORS.length];
      const rowByHash = (h) => commits.findIndex((r) => sameHash(r.hash, h));
      const graphLinks = [];
      commits.forEach((r, i) => {
        const childLane = lanes[i];
        (r.parents || []).forEach((ph) => {
          const pi = rowByHash(ph);
          if (pi < 0) return;
          const parentLane = lanes[pi];
          const xC = gx(childLane), yC = gy(i);
          const xP = gx(parentLane), yP = gy(pi);
          const side = Math.max(childLane, parentLane);
          const xS = gx(side);
          const color = colColor(side);
          let d;
          if (childLane === parentLane) {
            d = "M " + xC + " " + yC + " L " + xP + " " + yP;
          } else {
            d = "M " + xC + " " + yC;
            if (childLane !== side) d += " L " + xS + " " + (yC + GRAPH_H);
            const yBot = parentLane === side ? yP : yP - GRAPH_H;
            d += " L " + xS + " " + yBot;
            if (parentLane !== side) d += " L " + xP + " " + yP;
          }
          graphLinks.push({ d, color, key: r.hash + "-" + ph });
        });
      });

      const graphSvg = commits.length > 0
        ? jsx("svg", {
            className: "dshGitGraphSvg",
            width: maxCols * GRAPH_W,
            height: commits.length * GRAPH_H,
            style: { pointerEvents: "none" },
            children: [
              ...graphLinks.map((l) => jsx("path", { key: l.key, d: l.d, stroke: l.color, strokeWidth: 2, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" })),
              ...commits.map((r, i) => {
                const c = lanes[i];
                const isHead = /\bHEAD\b/.test(r.refs || "");
                return jsx("circle", {
                  key: "node" + r.hash,
                  cx: gx(c),
                  cy: gy(i),
                  r: isHead ? 4.5 : 3.5,
                  fill: isHead ? "var(--dsw-alias-bg-layer-1)" : colColor(c),
                  stroke: colColor(c),
                  strokeWidth: isHead ? 2 : 1.5,
                });
              }),
            ],
          })
        : null;

      const graphRows = commits.map((row, i) => {
        const selected = selectedCommit === row.hash;
        return jsx("div", {
          key: row.hash + i,
          className: "dshGitGraphRow" + (selected ? " dshGitGraphRowSelected" : ""),
          style: { paddingLeft: maxCols * GRAPH_W + 6 },
          onClick: () => showCommit(row.hash),
          children: [
            row.refs ? jsx("span", { className: "dshGitGraphRefs", children: row.refs }) : null,
            jsx("span", { className: "dshGitGraphSubject", children: row.subject }),
            jsx("span", { className: "dshGitGraphMeta", children: row.hash.slice(0, 7) + (row.author ? " · " + row.author : "") + (row.date ? " · " + row.date : "") }),
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
            jsx("div", { className: "dshGitToolbar", children: [
              jsx("span", { className: "dshGitUpstream", children: "提交 " + selectedCommit.slice(0, 7) }),
              commitFile ? jsx("span", { className: "dshGitUpstream", children: commitFile }) : null,
            ] }),
            commitDiffTruncated ? jsx("div", { className: "dshGitDiffLoading", children: "差异过大，已显示截断内容（前 2 MB）" }) : null,
            jsx("div", { className: "dshGitDiffOuter", children: selectedCommitText ? jsx(DiffView, { text: selectedCommitText }) : jsx("div", { className: "dshGitEmpty", children: commitFiles && commitFiles.length === 0 ? "该提交无文件变更" : "加载中…" }) }),
          ] });
        }
        return jsxs(Fragment, { children: [
          diffFile ? jsx("div", { className: "dshGitToolbar", children: [
            jsx("span", { className: "dshGitUpstream", children: diffFile }),
            jsx("span", { className: "dshGitUpstream", children: diffStaged ? "（已暂存）" : "（未暂存）" }),
          ] }) : null,
          diffText === "" && !diffFile
            ? jsx("div", { className: "dshGitEmpty", children: "点击左侧文件查看差异，或点击历史中的提交查看详情" })
            : jsxs(Fragment, { children: [
                diffTruncated ? jsx("div", { className: "dshGitDiffLoading", children: "差异过大，已显示截断内容（前 2 MB）" }) : null,
                jsx(DiffView, { text: diffText }),
              ] }),
        ] });
      };

      return jsxs("div", { className: "dshGitRoot dshGitView", "data-git-view": true, children: [
        jsxs("div", { className: "dshGitTop dshGitTopWrap", children: [
          jsx("span", { className: "dshGitTopTitle", children: [
            jsx(primitives.IconBranchOutline16, { size: 18 }),
            "Git",
          ] }),
          branch
            ? jsx("span", { className: "dshGitBranch dshGitBranchBtn" + (branchMenu === "top" ? " dshGitBranchActive" : ""), onClick: () => setBranchMenu(branchMenu === "top" ? null : "top"), title: "分支切换", children: [
                jsx(primitives.IconBranchOutline16, { size: 14 }),
                branch,
                jsx("span", { className: "dshGitBranchCaret", children: "\u25BE" }),
              ] })
            : null,
          upstream ? jsx("span", { className: "dshGitUpstream", children: upstream }) : null,
          ahead > 0 ? jsx("span", { className: "dshGitAhead", children: "\u2191" + ahead }) : null,
          behind > 0 ? jsx("span", { className: "dshGitBehind", children: "\u2193" + behind }) : null,
          conflicts.length > 0 ? jsx("span", { className: "dshGitErr", children: "\u26A0 " + conflicts.length + " 个冲突文件" }) : null,
          selectedCommit
            ? jsxs("span", { className: "dshGitCommitOps", children: [
                jsx("span", { className: "dshGitUpstream", children: selectedCommit.slice(0, 7) }),
                jsx(primitives.Button, { variant: "outline", size: "sm", style: { whiteSpace: "nowrap" }, onClick: () => setBranchFromOpen((v) => !v), children: branchFromOpen ? "收起" : "新建" }),
                branchFromOpen
                  ? jsxs(Fragment, { children: [
                      jsx("input", { className: "dshGitInput dshGitForkInput", placeholder: "新分支名", value: newBranchName, onChange: (e) => setNewBranchName(e.target.value), onKeyDown: (e) => { if (e.key === "Enter") createBranch(selectedCommit); } }),
                      jsx(primitives.Button, { variant: "primary", size: "sm", style: { whiteSpace: "nowrap" }, onClick: () => createBranch(selectedCommit), disabled: !newBranchName.trim() || busy, children: "创建" }),
                    ] })
                  : null,
                jsx(primitives.Button, { variant: "outline", size: "sm", style: { whiteSpace: "nowrap" }, onClick: () => doMerge(selectedCommit), disabled: busy, title: "把选中的提交合并到当前分支", children: "合并" }),
              ] })
            : null,
          jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => refresh(), disabled: loading, children: loading ? "刷新中…" : "刷新" }),
          branchMenu === "top"
            ? jsx("div", { className: "dshGitBranchMenu dshGitTopMenu", children: [
                jsxs("div", { className: "dshGitBranchMenuList", children: [
                  jsx("span", { className: "dshGitBranchGroupLabel", children: "本地" }),
                  branches.filter((b) => !b.remote).map((b) => branchChip(b, false)),
                  jsx("span", { className: "dshGitBranchGroupLabel", children: "远程" }),
                  branches.filter((b) => b.remote).map((b) => branchChip(b, true)),
                ] }),
              ] })
            : null,
        ] }),        jsxs("div", { className: "dshGitBody", children: [
          // ── history band: full width ──
          jsxs("div", { className: "dshGitHistoryBand", style: { height: historyH }, children: [
            jsxs("div", { className: "dshGitSection dshGitSectionFlex", style: { flex: 1, minHeight: 0 }, children: [
              jsx("h4", { children: "历史（点击提交查看详情）" }),
              graph.length === 0
                ? jsx("div", { className: "dshGitEmpty", children: "暂无提交" })
                : jsx("div", { className: "dshGitGraph", children: jsxs("div", { className: "dshGitGraphInner", children: [
                    graphSvg,
                    ...graphRows,
                  ] }) }),
            ] }),
            jsx("div", { className: "dshGitResizeHandle", title: "拖动调整历史区高度", onMouseDown: startHistoryDrag }),
          ] }),
          // ── branch strip: local / remote, right below history ──
          // ── lower split: file changes (left) + diff (right) ──          // ── lower split: file changes (left) + diff (right) ──
          jsxs("div", { className: "dshGitLowerSplit", children: [
jsxs("div", { className: "dshGitCol", style: { width: 300, flex: "0 0 300px" }, children: [
            commitFiles !== null
              ? jsxs(Fragment, { children: [
                  jsx("div", { className: "dshGitSection", children: [
                    jsx("h4", { children: [jsx(primitives.IconBranchOutline16, { size: 14 }), " 提交 " + (selectedCommit || "").slice(0, 7)] }),
                    jsx("div", { className: "dshGitRow", children: [
                      jsx(primitives.Button, { variant: "outline", size: "sm", onClick: exitCommitView, children: "返回工作区" }),
                    ] }),
                  ] }),
                  jsxs("div", { className: "dshGitSection dshGitSectionFlex", children: [
                    jsx("h4", { children: "变更文件（" + (commitFiles ? commitFiles.length : 0) + "）" }),
                    commitFiles === null || commitFiles.length === 0
                      ? jsx("div", { className: "dshGitEmpty", children: "该提交无文件变更" })
                      : jsx("ul", { className: "dshGitList", children: commitFiles.map((f) => commitFileRow(f)) }),
                  ] }),
                ] })
              : jsxs(Fragment, { children: [
            jsxs("div", { className: "dshGitSection dshGitSectionFlex", children: [
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

              ] }),
jsxs("div", { className: "dshGitCol", style: { flex: 1, borderRight: "none" }, children: [
            jsx("div", { className: "dshGitTabs", children: [
              jsx("button", { className: "dshGitTab" + (rightTab === "diff" ? " dshGitTabActive" : ""), onClick: () => setRightTab("diff"), children: "差异" }),
              jsx("button", { className: "dshGitTab" + (rightTab === "file" ? " dshGitTabActive" : ""), onClick: () => { if (diffFile) showFile(diffFile); setRightTab("file"); }, children: "文件对比" }),
              jsx("button", { className: "dshGitTab" + (rightTab === "blame" ? " dshGitTabActive" : ""), onClick: () => { if (diffFile) showFile(diffFile); setRightTab("blame"); }, children: "Blame" }),
            ] }),
            jsx("div", { className: "dshGitSection", style: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }, children: rightContent() }),
          ] }),
          ] }),
          // ── commit bar: full width at the bottom ──
          jsxs("div", { className: "dshGitCommitBar", children: [
jsx("textarea", {
              ref: msgRef,
              className: "dshGitInput dshGitMsgInput",
              rows: 1,
              placeholder: "提交说明（Enter 换行，⌘/Ctrl+Enter 提交）",
              value: message,
              onChange: (e) => { setMessage(e.target.value); if (msgRef.current) { msgRef.current.style.height = "auto"; msgRef.current.style.height = Math.min(msgRef.current.scrollHeight, 96) + "px"; } },
              onKeyDown: (e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commitStaged(); } },
            }),
            gitIconBtn(commitStaged, "提交（已暂存 " + staged.length + "）", "check", busy || !message.trim() || staged.length === 0, true),
            gitIconBtn(() => runMutation("amend", { message: message.trim() || undefined }), "Amend 修改上一次提交", "edit", busy),
            gitIconBtn(() => runMutation("push", { branch: branch, setUpstream: true }), "推送", "up", busy),
            gitIconBtn(() => runMutation("pull", {}), "拉取", "down", busy),
            gitIconBtn(() => runMutation("fetch", { prune: true }), "Fetch", "refresh", busy),
            output || error ? jsxs("span", { className: "dshGitCommitMsg", children: [
              output ? jsx("pre", { className: "dshGitOut", children: output }) : null,
              error ? jsx("div", { className: "dshGitErr", role: "alert", children: error }) : null,
            ] }) : null,
          
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
      ] });
    }

    // ── plugin body ─────────────────────────────────────────────────────────
    const inject = ["slots"];

    function apply(ctx) {
      // Git becomes a conversation view tab ("对话轨迹" right side): clicking
      // it replaces the chat/trajectory area with the Git page. The old
      // sidebar-footer entry has been removed.
      ctx.slots.inject("conversation.view", () =>
        ctx.slots.register(
          { name: "conversation.view", id: "git", order: 20, label: () => "Git", inject: () => ({}) },
          GitView,
        ),
      );
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
