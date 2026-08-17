window.__ModuleLoader__.load({
  id: "@deepseek-ai/dsh-client-ui-billing",
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

    const css = [
      ".dshBillRoot{display:flex;flex-direction:column;gap:16px;width:100%;height:100%;min-height:0;font-size:13px;color:var(--dsw-alias-label-primary)}",
      ".dshBillRow{display:flex;gap:12px;flex-wrap:wrap;align-items:stretch}",
      ".dshBillCard{flex:1;min-width:140px;display:flex;flex-direction:column;gap:6px;padding:14px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1)}",
      ".dshBillCardLabel{font-size:12px;color:var(--dsw-alias-label-secondary)}",
      ".dshBillCardValue{font-size:20px;font-weight:600;font-variant-numeric:tabular-nums}",
      ".dshBillCardUnit{font-size:12px;color:var(--dsw-alias-label-tertiary);margin-left:4px;font-weight:400}",
      ".dshBillCardTotal .dshBillCardValue{color:var(--dsw-alias-state-business-primary)}",
      ".dshBillCardTopup .dshBillCardValue{color:var(--dsw-alias-state-success-primary)}",
      ".dshBillCardGrant .dshBillCardValue{color:var(--dsw-alias-state-warn-primary)}",
      ".dshBillMeta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}",
      ".dshBillMeta h4{margin:0;font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary)}",
      ".dshBillStats{display:flex;gap:24px;flex-wrap:wrap}",
      ".dshBillStat{display:flex;flex-direction:column;gap:2px}",
      ".dshBillStatValue{font-size:16px;font-weight:600;font-variant-numeric:tabular-nums}",
      ".dshBillStatLabel{font-size:12px;color:var(--dsw-alias-label-tertiary)}",
      ".dshBillChartWrap{display:flex;gap:8px;align-items:stretch}",
      ".dshBillPlotCol{flex:1;min-width:0;display:flex;flex-direction:column}",
      ".dshBillYAxis{display:flex;flex-direction:column;justify-content:space-between;padding:12px 2px;font-size:10px;color:var(--dsw-alias-label-tertiary);text-align:left;min-width:44px;height:160px;box-sizing:border-box;font-variant-numeric:tabular-nums}",
      ".dshBillPlot{position:relative;min-width:0;height:160px}",
      ".dshBillSvg{display:block;width:100%;height:100%}",
      ".dshBillArea{fill:var(--dsw-alias-state-business-primary);opacity:.12}",
      ".dshBillLine{fill:none;stroke:var(--dsw-alias-state-business-primary);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}",
      ".dshBillDot{fill:var(--dsw-alias-state-business-primary)}",
      ".dshBillGuide{stroke:var(--dsw-alias-border-l1);stroke-dasharray:3 3}",
      ".dshBillTip{position:absolute;z-index:5;pointer-events:none;transform:translate(-50%,-110%);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:6px 10px;font-size:11px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.35)}",
      ".dshBillTipRow{display:flex;justify-content:space-between;gap:12px}",
      ".dshBillTipLabel{color:var(--dsw-alias-label-secondary)}",
      ".dshBillTipValue{font-variant-numeric:tabular-nums}",
      ".dshBillLabels{display:flex;padding:4px 2px 0}",
      ".dshBillLabel{flex:1;min-width:0;text-align:center;font-size:10px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".dshBillEmpty{color:var(--dsw-alias-label-tertiary);font-size:12px;padding:12px;border:1px dashed var(--dsw-alias-border-l1);border-radius:8px;text-align:center}",
      ".dshBillErr{color:var(--dsw-alias-state-error-primary);font-size:12px}",
      ".dshBillHint{color:var(--dsw-alias-label-tertiary);font-size:11px}",
      ".dshBillLink{color:var(--dsw-alias-state-business-primary);text-decoration:none;font-size:12px}",
      ".dshBillLink:hover{text-decoration:underline}",
      ".dshBillHead{display:flex;justify-content:flex-end;align-items:center;gap:8px}",
      ".dshBillSection{display:flex;flex-direction:column;gap:8px}",
      ".dshBillSection h4{margin:0;font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary)}",
      ".dshBillInput{flex:1;min-width:200px;box-sizing:border-box;height:32px;padding:0 10px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px}",
      ".dshBillInput:focus{outline:none;border-color:var(--dsw-alias-state-business-primary)}",
    ].join("\n");
    const cssTagId = "@deepseek-ai/dsh-client-ui-billing/styles.css";
    if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="' + cssTagId + '"]') === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-billing";
      tag.dataset.pluginCss = cssTagId;
      tag.textContent = css;
      document.head.appendChild(tag);
    }

    async function billingCall(op, payload) {
      try {
        const res = await fetch("/billing", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(Object.assign({ op }, payload || {})),
        });
        return await res.json();
      } catch (error) {
        return { ok: false, error: { code: "network", message: String(error?.message ?? error) } };
      }
    }

    function fmtMoney(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return "--";
      return n.toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function fmtCost(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return "0";
      if (n === 0) return "0";
      return n < 0.01 ? n.toFixed(4) : n.toFixed(2);
    }

    function fmtAxis(value) {
      const n = Number(value);
      if (!Number.isFinite(n)) return "0";
      if (n === 0) return "0";
      if (n >= 1) return n.toFixed(1);
      return n < 0.01 ? n.toFixed(4) : n.toFixed(2);
    }

    function localDateKey(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    /** The most recent 7 days as chart buckets, oldest → newest. */
    function last7Days(days) {
      const byDate = new Map(days.map((d) => [d.date, d]));
      const out = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = localDateKey(d);
        const entry = byDate.get(key);
        out.push({
          date: key,
          label: `${d.getMonth() + 1}/${d.getDate()}`,
          cost: entry?.cost ?? 0,
          tokens: entry?.tokens ?? 0,
        });
      }
      return out;
    }

    function LineChart({ buckets }) {
      const wrapRef = react.useRef(null);
      const [width, setWidth] = react.useState(0);
      const [hover, setHover] = react.useState(null);

      react.useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const measure = () => setWidth(el.clientWidth);
        measure();
        if (typeof ResizeObserver !== "undefined") {
          const ro = new ResizeObserver(measure);
          ro.observe(el);
          return () => ro.disconnect();
        }
      }, []);

      const H = 160;
      const padY = 12;
      const max = Math.max(0.0001, ...buckets.map((b) => b.cost));
      const n = buckets.length;
      // Points sit at each column's center so they line up with the flex-centered labels below.
      const x = (i) => (n <= 1 ? width / 2 : ((i + 0.5) * width) / n);
      const y = (cost) => H - padY - (cost / max) * (H - padY * 2);

      const ticks = [max, max / 2, 0];
      const line = buckets.map((b, i) => x(i).toFixed(1) + "," + y(b.cost).toFixed(1)).join(" ");
      const area = x(0).toFixed(1) + "," + H + " " + line + " " + x(n - 1).toFixed(1) + "," + H;

      const onMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const i = Math.floor((px / Math.max(1, rect.width)) * n);
        setHover(Math.max(0, Math.min(n - 1, i)));
      };

      const hov = hover !== null ? buckets[hover] : null;

      return jsx("div", {
        className: "dshBillChartWrap",
        children: [
          jsxs("div", {
            className: "dshBillPlotCol",
            children: [
              jsx("div", {
                ref: wrapRef,
                className: "dshBillPlot",
                onMouseMove: onMove,
                onMouseLeave: () => setHover(null),
                children: width > 0
                  ? jsxs(Fragment, {
                      children: [
                        jsx("svg", {
                          width: width,
                          height: H,
                          className: "dshBillSvg",
                          children: [
                            jsx("polygon", { points: area, className: "dshBillArea" }),
                            jsx("polyline", { points: line, className: "dshBillLine" }),
                            ...buckets.map((b, i) => jsx("circle", { key: i, cx: x(i).toFixed(1), cy: y(b.cost).toFixed(1), r: 2.5, className: "dshBillDot" })),
                            hov ? jsx("line", { x1: x(hover).toFixed(1), y1: 0, x2: x(hover).toFixed(1), y2: H, className: "dshBillGuide" }) : null,
                            hov ? jsx("circle", { cx: x(hover).toFixed(1), cy: y(hov.cost).toFixed(1), r: 4, className: "dshBillDot" }) : null,
                          ],
                        }),
                        hov
                          ? jsx("div", {
                              className: "dshBillTip",
                              style: { left: Math.max(56, Math.min(width - 56, x(hover))) + "px", top: y(hov.cost) + "px" },
                              children: jsxs(Fragment, { children: [
                                jsxs("div", { className: "dshBillTipRow", children: [
                                  jsx("span", { className: "dshBillTipLabel", children: "日期" }),
                                  jsx("span", { className: "dshBillTipValue", children: hov.label }),
                                ] }),
                                jsxs("div", { className: "dshBillTipRow", children: [
                                  jsx("span", { className: "dshBillTipLabel", children: "消费" }),
                                  jsx("span", { className: "dshBillTipValue", children: "¥" + fmtCost(hov.cost) }),
                                ] }),
                                hov.tokens > 0 ? jsxs("div", { className: "dshBillTipRow", children: [
                                  jsx("span", { className: "dshBillTipLabel", children: "Tokens" }),
                                  jsx("span", { className: "dshBillTipValue", children: String(hov.tokens) }),
                                ] }) : null,
                              ] }),
                            })
                          : null,
                      ],
                    })
                  : null,
              }),
              jsx("div", {
                className: "dshBillLabels",
                children: buckets.map((b, i) => jsx("span", { key: i, className: "dshBillLabel", children: b.label })),
              }),
            ],
          }),
          jsx("div", {
            className: "dshBillYAxis",
            children: ticks.map((t, i) => jsx("span", { key: i, children: fmtAxis(t) })),
          }),
        ],
      });
    }

    function BillingSection() {
      const [balance, setBalance] = react.useState(null);
      const [usage, setUsage] = react.useState(null);
      const [loading, setLoading] = react.useState(false);
      const [showCredentials, setShowCredentials] = react.useState(false);
      const [tokenStatus, setTokenStatus] = react.useState(null);
      const [tokenInput, setTokenInput] = react.useState("");
      const [savingToken, setSavingToken] = react.useState(false);

      const refresh = react.useCallback(async () => {
        setLoading(true);
        const [b, u] = await Promise.all([
          billingCall("balance"),
          billingCall("usage", { granularity: "day" }),
        ]);
        setBalance(b.ok ? b.value : { error: b.error?.message || "无法获取余额" });
        setUsage(u.ok ? u.value : { error: u.error?.message || "无法获取用量" });
        setLoading(false);
      }, []);

      const refreshTokenStatus = react.useCallback(async () => {
        const s = await billingCall("platformTokenStatus");
        setTokenStatus(s.ok ? s.value : { configured: false });
      }, []);

      const saveToken = react.useCallback(async () => {
        setSavingToken(true);
        const r = await billingCall("setPlatformToken", { token: tokenInput });
        if (r.ok) {
          setTokenStatus({ configured: r.value.configured });
          setTokenInput("");
          await refresh();
        }
        setSavingToken(false);
      }, [tokenInput, refresh]);

      react.useEffect(() => {
        refresh();
        refreshTokenStatus();
        const timer = setInterval(refresh, 60_000);
        return () => clearInterval(timer);
      }, [refresh, refreshTokenStatus]);

      const bal = balance && !balance.error ? balance : null;
      const first = bal?.balances?.[0];

      const buckets = usage && !usage.error ? last7Days(usage.days || []) : [];

      return jsx("div", {
        className: "dshBillRoot",
        children: jsxs(Fragment, {
          children: [
            // ── header (top-right: status + credentials toggle) ──
            jsx("div", {
              className: "dshBillHead",
              children: [
                jsx("span", { className: tokenStatus?.configured ? "dshBillHint" : "dshBillErr", children: tokenStatus?.configured ? "已配置" : "未配置" }),
                jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => setShowCredentials((v) => !v), children: showCredentials ? "收起凭据" : "凭据" }),
              ],
            }),
            // ── platform token (hidden by default) ──
            showCredentials
              ? jsxs("div", {
                  className: "dshBillSection",
                  children: [
                    jsx("h4", { children: "平台 Token（消费统计用）" }),
                    jsx("div", {
                      className: "dshBillRow",
                      children: [
                        jsx("input", {
                          type: "password",
                          className: "dshBillInput",
                          placeholder: "粘贴 platform.deepseek.com 的 userToken",
                          value: tokenInput,
                          onChange: (e) => setTokenInput(e.target.value),
                        }),
                        jsx(primitives.Button, { variant: "primary", size: "sm", onClick: saveToken, disabled: savingToken, children: savingToken ? "保存中…" : "保存" }),
                      ],
                    }),
                    jsx("div", { className: "dshBillHint", children: "登录 platform.deepseek.com 后在控制台执行 localStorage.getItem('userToken') 复制。" }),
                  ],
                })
              : null,
            // ── balance cards ──
            jsxs("div", {
              className: "dshBillRow",
              children: [
                jsxs("div", { className: "dshBillCard dshBillCardTotal", children: [
                  jsx("span", { className: "dshBillCardLabel", children: "总余额" }),
                  jsx("span", { className: "dshBillCardValue", children: jsxs(Fragment, { children: [
                    first ? fmtMoney(first.total_balance) : (balance?.error ?? "--"),
                    first ? jsx("span", { className: "dshBillCardUnit", children: first.currency }) : null,
                  ] }) }),
                ] }),
                jsxs("div", { className: "dshBillCard dshBillCardTopup", children: [
                  jsx("span", { className: "dshBillCardLabel", children: "充值余额" }),
                  jsx("span", { className: "dshBillCardValue", children: jsxs(Fragment, { children: [
                    first ? fmtMoney(first.topped_up_balance) : "--",
                    first ? jsx("span", { className: "dshBillCardUnit", children: first.currency }) : null,
                  ] }) }),
                ] }),
                jsxs("div", { className: "dshBillCard dshBillCardGrant", children: [
                  jsx("span", { className: "dshBillCardLabel", children: "赠送余额" }),
                  jsx("span", { className: "dshBillCardValue", children: jsxs(Fragment, { children: [
                    first ? fmtMoney(first.granted_balance) : "--",
                    first ? jsx("span", { className: "dshBillCardUnit", children: first.currency }) : null,
                  ] }) }),
                ] }),
                jsxs("div", { className: "dshBillCard", children: [
                  jsx("span", { className: "dshBillCardLabel", children: "账户" }),
                  bal?.rechargeUrl
                    ? jsx(primitives.Button, { variant: "outline", size: "sm", onClick: () => { billingCall("openRecharge"); }, children: "在线充值" })
                    : null,
                  bal?.available === false ? jsx("span", { className: "dshBillErr", children: "账户不可用" }) : null,
                ] }),
              ],
            }),
            balance?.error && !bal ? jsx("div", { className: "dshBillErr", role: "alert", children: balance.error }) : null,
            // ── consumption stats ──
            jsxs("div", {
              children: [
                jsxs("div", {
                  className: "dshBillMeta",
                  children: [
                    jsx("h4", { children: "消费统计（最近 7 天）" }),
                    loading ? jsx("span", { className: "dshBillHint", children: "加载中…" }) : null,
                  ],
                }),
                jsx("div", {
                  className: "dshBillStats",
                  children: [
                    jsxs("div", { className: "dshBillStat", children: [
                      jsx("span", { className: "dshBillStatValue", children: usage && !usage.error ? "¥" + fmtCost(usage.todayCost) : "--" }),
                      jsx("span", { className: "dshBillStatLabel", children: "今日消费" }),
                    ] }),
                    jsxs("div", { className: "dshBillStat", children: [
                      jsx("span", { className: "dshBillStatValue", children: usage && !usage.error ? "¥" + fmtCost(usage.monthCost) : "--" }),
                      jsx("span", { className: "dshBillStatLabel", children: "本月消费" }),
                    ] }),
                  ],
                }),
                usage?.error
                  ? jsx("div", { className: "dshBillEmpty", children: usage.error })
                  : jsx(LineChart, { buckets }),
                !usage?.error ? jsx("div", { className: "dshBillHint", children: "数据来自 DeepSeek 开放平台（platform.deepseek.com）" }) : null,
              ],
            }),
          ],
        }),
      });
    }

    // ── plugin body: a billing section inside the settings panel ─────────────
    const inject = ["slots"];

    function apply(ctx) {
      ctx.slots.inject("settings.section", () =>
        ctx.slots.register(
          {
            name: "settings.section",
            id: "billing",
            order: 20,
            label: () => "余额与消费",
          },
          BillingSection,
        ),
      );
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
