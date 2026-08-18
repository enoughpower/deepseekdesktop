window.__ModuleLoader__.load({
	id: "dsh-skill-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");

		// ── locale ──────────────────────────────────────────────────────────
		const en = {
			nav: "Skills",
			tab: "Skills",
			loading: "Reading skills…",
			error: "Skills are temporarily unavailable.",
			retry: "Retry",
			search: "Search skills",
			catalog: "Installed skills",
			empty: "No skills are installed.",
			emptySearch: "No matching skills.",
			modelAndUser: "Model + user",
			userOnly: "User-only",
			modelOnly: "Model-only",
			source: "Source",
			path: "Path",
			intro: "Every skill the session catalog can load, scanned from your skill roots. Model-invocable skills auto-trigger; user-only skills are invoked with /name.",
			moveToPluginTab: "Move to the Plugins tab",
			moveToPluginTabHint: "The Skills entry will disappear from the sidebar and appear inside Settings → Plugins.",
			moveToSection: "Move back to the sidebar",
			moveToSectionHint: "The Skills entry will disappear from the Plugins section and appear in the sidebar again."
		};
		const zh = {
			nav: "技能",
			tab: "技能",
			loading: "正在读取技能…",
			error: "暂时无法读取技能。",
			retry: "重试",
			search: "搜索技能",
			catalog: "已安装技能",
			empty: "暂无已安装技能。",
			emptySearch: "没有匹配的技能。",
			modelAndUser: "模型 + 用户",
			userOnly: "仅用户",
			modelOnly: "仅模型",
			source: "来源",
			path: "路径",
			intro: "会话目录可加载的全部技能，扫描自你的技能根目录。模型可调用技能按描述自动触发；仅用户技能通过 /名称 调用。",
			moveToPluginTab: "移到插件分区",
			moveToPluginTabHint: "技能入口将从左侧导航消失，改到 设置 → 插件 → 技能。",
			moveToSection: "移回左侧导航",
			moveToSectionHint: "技能入口将从插件分区消失，回到左侧导航（一级）。"
		};

		// ── styling (inline, self-contained) ───────────────────────────────
		const s = {
			section: { width: "100%", maxWidth: "760px", display: "flex", flexDirection: "column", gap: "14px" },
			intro: { margin: 0, color: "var(--dsw-alias-label-tertiary)", fontSize: "13px", lineHeight: "20px" },
			status: { margin: 0, color: "var(--dsw-alias-label-tertiary)", fontSize: "13px", lineHeight: "20px" },
			failure: { display: "flex", alignItems: "center", gap: "10px", color: "var(--dsw-alias-state-error-primary)", fontSize: "13px" },
			failureBtn: { border: "1px solid var(--dsw-alias-border-l2)", color: "var(--dsw-alias-label-primary)", font: "inherit", cursor: "pointer", background: "transparent", borderRadius: "6px", padding: "4px 10px" },
			search: { position: "relative", display: "flex", alignItems: "center" },
			searchInput: { width: "100%", height: "36px", boxSizing: "border-box", border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-1)", color: "var(--dsw-alias-label-primary)", font: "inherit", borderRadius: "8px", outline: "none", padding: "0 12px", fontSize: "13px" },
			catalogHeading: { display: "flex", alignItems: "baseline", gap: "7px", padding: "0 2px" },
			catalogH3: { margin: 0, fontSize: "13px", fontWeight: 600, lineHeight: "20px" },
			catalogCount: { color: "var(--dsw-alias-label-tertiary)", fontVariantNumeric: "tabular-nums", fontSize: "12px", lineHeight: "18px" },
			cards: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", alignItems: "start", gap: "10px", margin: 0, padding: 0, listStyle: "none" },
			card: { border: "1px solid var(--dsw-alias-border-l2)", background: "var(--dsw-alias-bg-layer-3)", borderRadius: "10px", minWidth: 0, overflow: "hidden" },
			cardHeader: { width: "100%", display: "flex", alignItems: "center", gap: "8px", textAlign: "left", color: "inherit", font: "inherit", background: "transparent", border: 0, cursor: "pointer", padding: "11px 12px" },
			cardTitle: { flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "13.5px", fontWeight: 600 },
			badge: { flex: "none", fontSize: "11px", lineHeight: "16px", padding: "0 6px", borderRadius: "999px", whiteSpace: "nowrap" },
			badgeModel: { background: "color-mix(in srgb, var(--dsw-alias-state-success-primary, #16a34a) 14%, transparent)", color: "var(--dsw-alias-state-success-primary, #16a34a)" },
			badgeUser: { background: "color-mix(in srgb, var(--dsw-alias-state-warning-primary, #d97706) 14%, transparent)", color: "var(--dsw-alias-state-warning-primary, #d97706)" },
			chevron: { flex: "none", color: "var(--dsw-alias-label-secondary)", fontSize: "12px", transition: "transform .12s" },
			cardBody: { borderTop: "1px solid var(--dsw-alias-border-l1)", display: "flex", flexDirection: "column", gap: "10px", padding: "10px 12px 12px" },
			description: { margin: 0, color: "var(--dsw-alias-label-secondary)", fontSize: "12px", lineHeight: "1.5", wordBreak: "break-word" },
			meta: { margin: 0, color: "var(--dsw-alias-label-tertiary)", fontSize: "11.5px", lineHeight: "1.5", wordBreak: "break-all" },
			moveRow: { borderTop: "1px solid var(--dsw-alias-border-l1)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "6px" },
			moveHint: { margin: 0, color: "var(--dsw-alias-label-tertiary)", fontSize: "12px", lineHeight: "1.5" },
			moveBtn: { alignSelf: "flex-start", border: "1px solid var(--dsw-alias-border-l2)", color: "var(--dsw-alias-label-primary)", font: "inherit", cursor: "pointer", background: "var(--dsw-alias-bg-layer-1)", borderRadius: "8px", padding: "7px 14px", fontSize: "12.5px" }
		};

		const ENTRY_KEY = "dsh-skill-manager:entry";
		const ENTRY_SECTION = "section";
		const ENTRY_PLUGIN_TAB = "plugin-tab";
		function readEntry() {
			try {
				return window.localStorage.getItem(ENTRY_KEY) === ENTRY_PLUGIN_TAB ? ENTRY_PLUGIN_TAB : ENTRY_SECTION;
			} catch {
				return ENTRY_SECTION;
			}
		}
		function writeEntry(value) {
			try {
				window.localStorage.setItem(ENTRY_KEY, value);
			} catch {
				/* localStorage unavailable: keep in-memory only */
			}
		}

		function badgeFor(skill, t) {
			const label = skill.invocation === "user-only" ? t("userOnly") : skill.invocation === "model-only" ? t("modelOnly") : t("modelAndUser");
			const style = skill.invocation === "user-only" ? s.badgeUser : s.badgeModel;
			return react.createElement("span", { style: Object.assign({}, s.badge, style) }, label);
		}

		function ListView({ t }) {
			const [request, setRequest] = react.useState(0);
			const [query, setQuery] = react.useState("");
			const [expanded, setExpanded] = react.useState(null);
			const [state, setState] = react.useState({ status: "loading" });
			react.useEffect(() => {
				let current = true;
				fetch("/api/skill-manager/list").then((response) => response.json()).then((payload) => {
					if (!current) return;
					if (payload && payload.ok === true && Array.isArray(payload.skills)) setState({ status: "ready", skills: payload.skills });
					else setState({ status: "error" });
				}).catch(() => {
					if (current) setState({ status: "error" });
				});
				return () => { current = false; };
			}, [request]);
			const normalized = query.trim().toLocaleLowerCase();
			const filtered = state.status === "ready"
				? state.skills.filter((skill) => normalized.length === 0 || skill.name.toLocaleLowerCase().includes(normalized) || (skill.description || "").toLocaleLowerCase().includes(normalized))
				: [];
			const retry = () => { setState({ status: "loading" }); setRequest((value) => value + 1); };
			const children = [
				react.createElement("p", { style: s.intro }, t("intro")),
				state.status === "loading" ? react.createElement("p", { style: s.status }, t("loading")) : null,
				state.status === "error" ? react.createElement("div", { style: s.failure }, react.createElement("p", { role: "alert", style: { margin: 0 } }, t("error")), react.createElement("button", { type: "button", style: s.failureBtn, onClick: retry }, t("retry"))) : null
			];
			if (state.status === "ready") {
				children.push(
					react.createElement("label", { style: s.search },
						react.createElement("input", { type: "search", value: query, placeholder: t("search"), "aria-label": t("search"), style: s.searchInput, onChange: (event) => setQuery(event.currentTarget.value) })
					),
					react.createElement("div", { style: s.catalogHeading },
						react.createElement("h3", { style: s.catalogH3 }, t("catalog")),
						react.createElement("span", { style: s.catalogCount }, filtered.length)
					),
					state.skills.length === 0 ? react.createElement("p", { style: s.status }, t("empty")) : null,
					state.skills.length > 0 && filtered.length === 0 ? react.createElement("p", { style: s.status }, t("emptySearch")) : null,
					filtered.length > 0 ? react.createElement("ul", { style: s.cards }, filtered.map((skill) => {
						const open = expanded === skill.name;
						const toggle = () => setExpanded(open ? null : skill.name);
						return react.createElement("li", { key: skill.name, style: s.card, "data-skill": skill.name },
							react.createElement("button", { type: "button", style: s.cardHeader, "aria-expanded": open, onClick: toggle },
								react.createElement("strong", { style: s.cardTitle, title: skill.name }, skill.name),
								badgeFor(skill, t),
								react.createElement("span", { style: s.chevron }, open ? "▴" : "▾")
							),
							open ? react.createElement("div", { style: s.cardBody },
								skill.description ? react.createElement("p", { style: s.description }, skill.description) : null,
								react.createElement("p", { style: s.meta }, `${t("source")}: ${skill.source}`),
								react.createElement("p", { style: s.meta }, `${t("path")}: ${skill.path}`)
							) : null
						);
					})) : null
				);
			}
			return react.createElement("div", { "aria-busy": state.status === "loading" }, ...children);
		}

		/** The list plus a single move button, shared by both entry points. */
		function SkillsView({ t, moveLabel, moveHint, onMove }) {
			return react.createElement("div", { style: s.section },
				react.createElement(ListView, { t }),
				react.createElement("div", { style: s.moveRow },
					react.createElement("p", { style: s.moveHint }, moveHint),
					react.createElement("button", { type: "button", style: s.moveBtn, onClick: onMove }, moveLabel)
				)
			);
		}

		// ── client entry ────────────────────────────────────────────────────
		const NS = "skillManager";
		const inject = ["slots", "locale"];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "ui-skill-manager: dictionaries");
			const t = ctx.locale.bind(NS);

			// Exactly ONE entry exists at any time. The initial one is registered
			// through slots.inject (waits for the slot declaration); switching
			// disposes it and registers the other through the runtime
			// ctx.slots.register, whose returned disposer removes it again.
			let injectedDisposer = null;
			let runtimeDisposer = null;
			let currentKind = null;

			const registerInto = (kind) => {
				if (kind === ENTRY_SECTION) {
					return ctx.slots.register({
						name: "settings.section",
						id: "skills",
						order: 12,
						label: () => t("nav"),
						locale: NS,
						inject: () => ({})
					}, (props) => react.createElement(SkillsView, Object.assign({}, props, {
						moveLabel: t("moveToPluginTab"),
						moveHint: t("moveToPluginTabHint"),
						onMove: () => moveTo(ENTRY_PLUGIN_TAB)
					})));
				}
				return ctx.slots.register({
					name: "settings.plugins.tab",
					id: "skills",
					order: 20,
					label: () => t("tab"),
					locale: NS,
					inject: () => ({})
				}, (props) => react.createElement(SkillsView, Object.assign({}, props, {
					moveLabel: t("moveToSection"),
					moveHint: t("moveToSectionHint"),
					onMove: () => moveTo(ENTRY_SECTION)
				})));
			};

			const moveTo = (kind) => {
				if (kind === currentKind) return;
				if (injectedDisposer !== null) { injectedDisposer(); injectedDisposer = null; }
				if (runtimeDisposer !== null) { runtimeDisposer(); runtimeDisposer = null; }
				writeEntry(kind);
				try {
					runtimeDisposer = registerInto(kind);
					currentKind = kind;
				} catch (error) {
					// Registration failed (slot not declared yet): fall back to inject.
					injectedDisposer = ctx.slots.inject(kind === ENTRY_SECTION ? "settings.section" : "settings.plugins.tab", () => registerInto(kind));
					currentKind = kind;
					console.error("[ui-skill-manager] runtime register failed, fell back to inject:", error);
				}
			};

			// Initial entry from the persisted preference (default: sidebar).
			const initial = readEntry();
			currentKind = initial;
			if (initial === ENTRY_PLUGIN_TAB) {
				injectedDisposer = ctx.slots.inject("settings.plugins.tab", () => registerInto(ENTRY_PLUGIN_TAB));
			} else {
				injectedDisposer = ctx.slots.inject("settings.section", () => registerInto(ENTRY_SECTION));
			}

			ctx.effect(() => () => {
				if (injectedDisposer !== null) injectedDisposer();
				if (runtimeDisposer !== null) runtimeDisposer();
			}, "ui-skill-manager: entry lifecycle");
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
