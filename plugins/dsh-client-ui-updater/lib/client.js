window.__ModuleLoader__.load({
  id: "@deepseek-ai/dsh-client-ui-updater",
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
      ".dshUpdBadge{position:fixed;top:50px;right:16px;z-index:30;pointer-events:none;user-select:none;display:inline-flex;align-items:center;gap:4px;max-width:180px;height:20px;padding:0 8px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);font-family:ui-monospace,Menlo,monospace;font-size:10px;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 4px rgba(0,0,0,.06)}",
      ".dshUpdRoot{display:flex;flex-direction:column;gap:14px;width:100%;height:100%;min-height:0;font-size:13px;color:var(--dsw-alias-label-primary)}",
      ".dshUpdRow{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
      ".dshUpdLabel{font-size:12px;color:var(--dsw-alias-label-secondary)}",
      ".dshUpdVersion{font-family:ui-monospace,Menlo,monospace;font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}",
      ".dshUpdHint{color:var(--dsw-alias-label-tertiary);font-size:12px}",
      ".dshUpdGood{color:var(--dsw-alias-state-success-primary);font-size:12px}",
      ".dshUpdErr{color:var(--dsw-alias-state-error-primary);font-size:12px}",
      ".dshUpdProgress{display:flex;align-items:center;gap:8px;color:var(--dsw-alias-label-secondary);font-size:12px}",
      ".dshUpdBar{flex:1;min-width:120px;max-width:280px;height:4px;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover);overflow:hidden}",
      ".dshUpdBarFill{height:100%;border-radius:999px;background:var(--dsw-alias-state-business-primary);transition:width .3s var(--ds-ease-in-out)}",
      ".dshUpdSectionHead{display:flex;align-items:baseline;gap:8px}",
      ".dshUpdSectionHead h4{margin:0;font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary)}",
    ].join("\n");
    const cssTagId = "@deepseek-ai/dsh-client-ui-updater/styles.css";
    if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + cssTagId + '"]') === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-updater";
      tag.dataset.pluginCss = cssTagId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    // ── API calls ───────────────────────────────────────────────────────────
    async function updaterCall(op, payload) {
      try {
        const res = await fetch("/updater", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(Object.assign({ op }, payload || {})),
        });
        return await res.json();
      } catch (error) {
        return { ok: false, error: { code: "network", message: String(error?.message ?? error) } };
      }
    }

    // ── top-right version badge (always visible) ────────────────────────────
    function VersionBadge() {
      const [version, setVersion] = react.useState(null);
      react.useEffect(() => {
        let alive = true;
        const refresh = () => {
          updaterCall("version").then((r) => {
            if (!alive) return;
            if (r.ok) setVersion(r.value.version);
          });
        };
        refresh();
        const timer = setInterval(refresh, 60_000);
        return () => {
          alive = false;
          clearInterval(timer);
        };
      }, []);
      if (!version) return null;
      return jsx("div", {
        className: "dshUpdBadge",
        title: "DeepSeek Harness v" + version,
        children: "v" + version,
      });
    }

    // ── settings section: check + update ────────────────────────────────────
    function UpdaterSection() {
      const [version, setVersion] = react.useState(null);
      const [checking, setChecking] = react.useState(false);
      const [checked, setChecked] = react.useState(null); // {current, latest, hasUpdate}
      const [error, setError] = react.useState(null);
      const [updating, setUpdating] = react.useState(false);
      const [progress, setProgress] = react.useState(null); // {phase, done, total}
      const [result, setResult] = react.useState(null); // {updated, from, to}

      react.useEffect(() => {
        updaterCall("version").then((r) => {
          if (r.ok) setVersion(r.value.version);
        });
      }, []);

      const check = react.useCallback(async () => {
        setChecking(true);
        setError(null);
        setChecked(null);
        const r = await updaterCall("check");
        setChecking(false);
        if (!r.ok) {
          setError(r.error?.message || "检查更新失败");
          return;
        }
        setChecked(r.value);
      }, []);

      const startUpdate = react.useCallback(async () => {
        setUpdating(true);
        setError(null);
        const r = await updaterCall("update");
        if (!r.ok) {
          setUpdating(false);
          setError(r.error?.message || "启动更新失败");
          return;
        }
        if (r.value?.updated === false) {
          setUpdating(false);
          setResult({ updated: false, from: r.value.current, to: r.value.latest });
          return;
        }
        // background job started; poll progress until done/error
        const poll = async () => {
          const s = await updaterCall("status");
          if (!s.ok) return;
          const st = s.value || {};
          setProgress(st);
          if (st.running) {
            setTimeout(poll, 1000);
            return;
          }
          setUpdating(false);
          if (st.phase === "done") {
            setResult({ updated: true, from: version, to: checked?.latest });
          } else if (st.phase === "error") {
            setError(st.error || "更新失败");
          } else if (st.phase === "up-to-date") {
            setResult({ updated: false });
          }
        };
        setTimeout(poll, 1000);
      }, [version, checked]);

      return jsx("div", {
        className: "dshUpdRoot",
        children: jsxs(Fragment, {
          children: [
            jsxs("div", { className: "dshUpdRow", children: [
              jsx("span", { className: "dshUpdLabel", children: "当前版本" }),
              jsx("span", { className: "dshUpdVersion", children: version ? "v" + version : "…" }),
              jsx(primitives.Button, { variant: "outline", size: "sm", onClick: check, disabled: checking || updating, children: checking ? "检查中…" : "检查更新" }),
            ] }),

            error ? jsx("div", { className: "dshUpdErr", role: "alert", children: error }) : null,

            checked && !updating ? jsxs("div", { className: "dshUpdRow", children: [
              checked.hasUpdate
                ? jsx(Fragment, { children: [
                    jsx("span", { className: "dshUpdHint", children: "发现新版本 v" + checked.latest }),
                    jsx(primitives.Button, { variant: "primary", size: "sm", onClick: startUpdate, children: "立即更新" }),
                  ] })
                : jsx("span", { className: "dshUpdGood", children: "已是最新版本" }),
            ] }) : null,

            updating && progress ? jsxs("div", { className: "dshUpdProgress", children: [
              jsx("span", { children: progress.phase === "download" ? "正在下载更新…" : progress.phase === "resolve" ? "正在解析依赖…" : "正在安装…" }),
              progress.total > 0 ? jsx(Fragment, { children: [
                jsx("span", { className: "dshUpdBar", children: jsx("span", { className: "dshUpdBarFill", style: { width: Math.round((progress.done / progress.total) * 100) + "%" } }) }),
                jsx("span", { className: "dshUpdHint", children: progress.done + "/" + progress.total }),
              ] }) : null,
            ] }) : null,

            result ? jsxs("div", { className: "dshUpdRow", children: [
              result.updated === true
                ? jsx("span", { className: "dshUpdGood", children: "更新完成（v" + result.from + " → v" + result.to + "），应用正在重启…" })
                : jsx("span", { className: "dshUpdGood", children: "已是最新版本" }),
            ] }) : null,
          ],
        }),
      });
    }

    // ── plugin body ─────────────────────────────────────────────────────────
    const inject = ["slots"];

    function apply(ctx) {
      ctx.slots.inject("shell.overlay", () =>
        ctx.slots.register(
          {
            name: "shell.overlay",
            id: "updater-version-badge",
            order: 100,
            label: () => "版本号",
          },
          VersionBadge,
        ),
      );
      ctx.slots.inject("settings.section", () =>
        ctx.slots.register(
          {
            name: "settings.section",
            id: "updater",
            order: 110, // last in the sidebar: the official cordis runner registers my-entry at 100
            label: () => "检查更新",
          },
          UpdaterSection,
        ),
      );
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
