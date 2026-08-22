import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { SERVER_NAME_PATTERN } from "../schemas.js";
import { C } from "./styles.js";
const layout = {
    row: { display: "flex", alignItems: "center", gap: 8 },
    spacer: { flex: 1 },
};
/** Page intro line: the `desc` copy followed by a "contact the developer" link. */
function SectionDesc({ t }) {
    return (_jsxs("p", { className: C.desc, children: [t("desc"), _jsx("a", { className: C.contact, href: "https://paiban.md/qrcode.png", target: "_blank", rel: "noreferrer", children: t("contact") })] }));
}
// ── helpers ────────────────────────────────────────────────────────────────
let tempIdCounter = 0;
function tempId() {
    tempIdCounter += 1;
    return `new-${Date.now().toString(36)}-${tempIdCounter}`;
}
function formatKV(record) {
    if (record === undefined)
        return "";
    return Object.entries(record)
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");
}
/** Parse `KEY=VALUE` lines; returns null on a malformed line. */
function parseKV(text) {
    const out = {};
    for (const rawLine of text.split("\n")) {
        const line = rawLine.trim();
        if (line === "")
            continue;
        const eq = line.indexOf("=");
        if (eq <= 0)
            return null;
        out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }
    return out;
}
function formatArgs(args) {
    return (args ?? []).join("\n");
}
function parseArgs(text) {
    return text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "");
}
function toEditorDraft(server) {
    if (server === undefined) {
        return {
            id: "",
            serverName: "",
            transport: "stdio",
            command: "",
            argsText: "",
            cwd: "",
            envText: "",
            url: "",
            headersText: "",
            timeoutText: "",
            failOnStartup: false,
            enabled: true,
        };
    }
    return {
        id: server.id,
        serverName: server.serverName,
        transport: server.transport,
        command: server.command ?? "",
        argsText: formatArgs(server.args),
        cwd: server.cwd ?? "",
        envText: formatKV(server.env),
        url: server.url ?? "",
        headersText: formatKV(server.headers),
        timeoutText: server.toolCallTimeoutMs === undefined ? "" : String(server.toolCallTimeoutMs),
        failOnStartup: server.failOnStartupError ?? false,
        enabled: server.enabled,
    };
}
/** Drop the live `phase` field and produce an editable input projection (no `undefined` keys). */
function viewToInput(server) {
    const input = { id: server.id, serverName: server.serverName, enabled: server.enabled };
    if (server.toolCallTimeoutMs !== undefined)
        input.toolCallTimeoutMs = server.toolCallTimeoutMs;
    if (server.failOnStartupError !== undefined)
        input.failOnStartupError = server.failOnStartupError;
    if (server.transport === "stdio") {
        input.transport = "stdio";
        input.command = server.command ?? "";
        if (server.args !== undefined)
            input.args = server.args;
        if (server.env !== undefined)
            input.env = server.env;
        if (server.cwd !== undefined)
            input.cwd = server.cwd;
    }
    else {
        input.transport = "streamable-http";
        input.url = server.url ?? "";
        if (server.headers !== undefined)
            input.headers = server.headers;
    }
    return input;
}
function parseTimeout(text) {
    if (text.trim() === "")
        return undefined;
    const value = Number(text);
    if (!Number.isInteger(value) || value <= 0)
        return null;
    return value;
}
function toInput(draft) {
    const base = {
        id: draft.id === "" ? tempId() : draft.id,
        serverName: draft.serverName.trim(),
        enabled: draft.enabled,
    };
    const timeout = parseTimeout(draft.timeoutText);
    if (timeout !== undefined && timeout !== null)
        base.toolCallTimeoutMs = timeout;
    if (draft.failOnStartup)
        base.failOnStartupError = true;
    if (draft.transport === "stdio") {
        base.transport = "stdio";
        base.command = draft.command.trim();
        base.args = parseArgs(draft.argsText);
        const env = parseKV(draft.envText);
        if (env !== null && Object.keys(env).length > 0)
            base.env = env;
        if (draft.cwd.trim() !== "")
            base.cwd = draft.cwd.trim();
    }
    else {
        base.transport = "streamable-http";
        base.url = draft.url.trim();
        const headers = parseKV(draft.headersText);
        if (headers !== null && Object.keys(headers).length > 0)
            base.headers = headers;
    }
    return base;
}
/** A user-facing commit error for the editor form. */
function validateEditor(t, draft) {
    if (draft.serverName.trim() === "")
        return t("form.error.name");
    if (!SERVER_NAME_PATTERN.test(draft.serverName.trim()))
        return t("form.error.nameInvalid");
    if (parseTimeout(draft.timeoutText) === null)
        return t("form.error.timeout");
    if (draft.transport === "stdio") {
        if (draft.command.trim() === "")
            return t("form.error.command");
        if (parseKV(draft.envText) === null)
            return t("form.error.env");
    }
    else {
        if (draft.url.trim() === "")
            return t("form.error.url");
        if (parseKV(draft.headersText) === null)
            return t("form.error.headers");
    }
    return undefined;
}
function transportLabel(t, transport) {
    return transport === "stdio" ? t("form.transport.stdio") : t("form.transport.http");
}
function phaseBadge(t, server) {
    if (!server.enabled)
        return { cls: C.badgeOff, text: t("status.disabled") };
    switch (server.phase) {
        case "active":
            return { cls: C.badgeOk, text: t("status.active") };
        case "failed":
            return { cls: C.badgeError, text: t("status.failed") };
        case "loading":
        case "pending":
        case "unloading":
            return { cls: C.badgeInfo, text: t("status.loading") };
        default:
            return { cls: C.badgeOk, text: t("status.enabled") };
    }
}
function ServerEditor({ draft, onDraft, onCancel, onCommit, t }) {
    const [error, setError] = useState();
    const set = (patch) => onDraft({ ...draft, ...patch });
    const commit = () => {
        const validation = validateEditor(t, draft);
        if (validation !== undefined) {
            setError(validation);
            return;
        }
        onCommit(draft);
    };
    return (_jsxs("div", { className: C.editor, children: [_jsx("div", { className: C.editorHeader, children: draft.id === "" ? t("form.new") : t("form.edit", { name: draft.serverName }) }), _jsxs("div", { className: C.editorBody, children: [_jsxs("div", { className: C.field, children: [_jsx("div", { className: C.label, children: t("form.serverName") }), _jsx("input", { className: C.input, value: draft.serverName, onChange: (event) => set({ serverName: event.target.value }), placeholder: "github" }), _jsx("span", { className: C.hint, children: t("form.serverNameHint") })] }), _jsxs("div", { className: C.field, children: [_jsx("div", { className: C.label, children: t("form.transport") }), _jsxs("select", { className: C.select, value: draft.transport, onChange: (event) => set({ transport: event.target.value }), children: [_jsx("option", { value: "stdio", children: t("form.transport.stdio") }), _jsx("option", { value: "streamable-http", children: t("form.transport.http") })] })] }), draft.transport === "stdio" ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: C.field, children: [_jsx("div", { className: C.label, children: t("form.command") }), _jsx("input", { className: C.input, value: draft.command, onChange: (event) => set({ command: event.target.value }), placeholder: "npx -y @modelcontextprotocol/server-github" }), _jsx("span", { className: C.hint, children: t("form.commandHint") })] }), _jsxs("div", { className: C.field, children: [_jsx("div", { className: C.label, children: t("form.args") }), _jsx("textarea", { className: C.textarea, value: draft.argsText, onChange: (event) => set({ argsText: event.target.value }) })] }), _jsxs("div", { className: C.field, children: [_jsx("div", { className: C.label, children: t("form.cwd") }), _jsx("input", { className: C.input, value: draft.cwd, onChange: (event) => set({ cwd: event.target.value }) })] }), _jsxs("div", { className: C.field, children: [_jsx("div", { className: C.label, children: t("form.env") }), _jsx("textarea", { className: C.textarea, value: draft.envText, onChange: (event) => set({ envText: event.target.value }), placeholder: "GITHUB_TOKEN=xxx" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: C.field, children: [_jsx("div", { className: C.label, children: t("form.url") }), _jsx("input", { className: C.input, value: draft.url, onChange: (event) => set({ url: event.target.value }), placeholder: "http://localhost:3000/mcp" })] }), _jsxs("div", { className: C.field, children: [_jsx("div", { className: C.label, children: t("form.headers") }), _jsx("textarea", { className: C.textarea, value: draft.headersText, onChange: (event) => set({ headersText: event.target.value }), placeholder: "Authorization=Bearer xxx" })] })] })), _jsxs("div", { className: C.field, children: [_jsx("div", { className: C.label, children: t("form.timeout") }), _jsx("input", { className: C.input, value: draft.timeoutText, onChange: (event) => set({ timeoutText: event.target.value }), placeholder: "60000" })] }), _jsxs("label", { className: C.checkbox, children: [_jsx("input", { type: "checkbox", checked: draft.failOnStartup, onChange: (event) => set({ failOnStartup: event.target.checked }) }), t("form.failOnStartup")] }), error !== undefined ? _jsx("div", { className: C.error, children: error }) : null] }), _jsxs("div", { className: C.editorFooter, children: [_jsx("button", { type: "button", className: C.btn, onClick: onCancel, children: t("form.cancel") }), _jsx("button", { type: "button", className: `${C.btn} ${C.btnPrimary}`, onClick: commit, children: t("form.save") })] })] }));
}
// ── page ───────────────────────────────────────────────────────────────────
export function McpSettingsSection({ mcp, t }) {
    const [servers, setServers] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [editor, setEditor] = useState(null);
    const [busy, setBusy] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [dirty, setDirty] = useState(false);
    const applyList = useCallback((list) => {
        setServers(list);
        setDrafts(list.map(viewToInput));
    }, []);
    const load = useCallback(async () => {
        setBusy(true);
        setError("");
        const result = await mcp.list();
        if (result.ok) {
            applyList(result.value);
        }
        else {
            setError(t("error.load", { message: result.error.message }));
        }
        setBusy(false);
    }, [mcp, applyList, t]);
    useEffect(() => {
        void load();
    }, [load]);
    const commitEditor = (draft) => {
        const input = toInput(draft);
        setDrafts((prev) => {
            const index = prev.findIndex((server) => server.id === input.id);
            return index === -1 ? [...prev, input] : prev.map((server) => (server.id === input.id ? input : server));
        });
        setEditor(null);
        setDirty(true);
        setNotice("");
    };
    const removeServer = (id) => {
        setDrafts((prev) => prev.filter((server) => server.id !== id));
        setDirty(true);
        setNotice("");
    };
    const toggleServer = (id) => {
        setDrafts((prev) => prev.map((server) => (server.id === id ? { ...server, enabled: !server.enabled } : server)));
        setDirty(true);
        setNotice("");
    };
    const save = async () => {
        setSaving(true);
        setError("");
        setNotice("");
        const result = await mcp.save({ servers: drafts });
        if (result.ok) {
            applyList(result.value);
            setDirty(false);
            setNotice(t("footer.saved"));
        }
        else {
            setError(t("error.save", { message: result.error.message }));
        }
        setSaving(false);
    };
    const discard = async () => {
        setError("");
        setNotice("");
        await load();
        setDirty(false);
        setEditor(null);
    };
    if (busy) {
        return (_jsxs("div", { className: C.wrap, children: [_jsx(SectionDesc, { t: t }), _jsx("div", { className: C.empty, children: t("status.loading") })] }));
    }
    return (_jsxs("div", { className: C.wrap, children: [_jsx(SectionDesc, { t: t }), error !== "" ? _jsx("div", { className: C.error, children: error }) : null, _jsxs("div", { style: layout.row, children: [_jsx("button", { type: "button", className: `${C.btn} ${C.btnPrimary}`, onClick: () => setEditor(toEditorDraft()), disabled: saving, children: t("list.add") }), _jsx("div", { style: layout.spacer }), dirty ? _jsx("span", { className: C.hint, children: t("footer.dirty") }) : null] }), drafts.length === 0 ? (_jsxs("div", { className: C.empty, children: [_jsx("span", { children: t("list.empty") }), _jsx("span", { children: t("list.emptyHint") })] })) : (drafts.map((server) => {
                const view = servers.find((entry) => entry.id === server.id);
                const badge = view === undefined ? { cls: C.badgeOff, text: "" } : phaseBadge(t, view);
                const target = server.transport === "stdio" ? server.command : server.url;
                return (_jsxs("div", { className: C.row, children: [_jsxs("div", { className: C.rowMain, children: [_jsx("div", { className: C.name, children: server.serverName }), _jsxs("div", { className: C.meta, children: [transportLabel(t, server.transport), " \u00B7 ", target ?? ""] })] }), _jsx("span", { className: `${C.badge} ${badge.cls}`, children: badge.text }), _jsxs("div", { className: C.rowActions, children: [_jsx("button", { type: "button", className: C.btn, onClick: () => toggleServer(server.id), disabled: saving, children: server.enabled ? t("action.disable") : t("action.enable") }), _jsx("button", { type: "button", className: C.btn, onClick: () => setEditor(toEditorDraft(view)), disabled: saving, children: t("action.edit") }), _jsx("button", { type: "button", className: `${C.btn} ${C.btnDanger}`, onClick: () => {
                                        if (window.confirm(t("confirm.remove", { name: server.serverName })))
                                            removeServer(server.id);
                                    }, disabled: saving, children: t("action.remove") })] })] }, server.id));
            })), editor !== null ? (_jsx(ServerEditor, { draft: editor, onDraft: setEditor, onCancel: () => setEditor(null), onCommit: commitEditor, t: t })) : null, _jsxs("div", { className: C.footer, children: [notice !== "" ? _jsx("span", { className: C.notice, children: notice }) : _jsx("div", { style: layout.spacer }), dirty ? (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: C.btn, onClick: discard, disabled: saving, children: t("footer.discard") }), _jsx("button", { type: "button", className: `${C.btn} ${C.btnPrimary}`, onClick: save, disabled: saving, children: saving ? t("footer.saving") : t("footer.save") })] })) : null] })] }));
}
