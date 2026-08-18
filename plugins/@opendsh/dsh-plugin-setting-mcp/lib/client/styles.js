/**
 * Theme-aware stylesheet for the MCP settings page.
 *
 * Uses the same `--dsw-alias-*` design tokens as the shipped settings panels
 * so the page follows the active light/dark theme. The CSS is injected once by
 * the client plugin body (`injectStyles`) using the same `data-plugin-css`
 * mechanism the official client bundles use.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
/** Scoped class names referenced by the page components. */
export const C = {
    wrap: "dshmcp-wrap",
    desc: "dshmcp-desc",
    row: "dshmcp-row",
    rowMain: "dshmcp-row-main",
    name: "dshmcp-name",
    meta: "dshmcp-meta",
    badge: "dshmcp-badge",
    badgeOk: "dshmcp-badge-ok",
    badgeOff: "dshmcp-badge-off",
    badgeError: "dshmcp-badge-error",
    badgeInfo: "dshmcp-badge-info",
    btn: "dshmcp-btn",
    btnPrimary: "dshmcp-btn-primary",
    btnDanger: "dshmcp-btn-danger",
    rowActions: "dshmcp-row-actions",
    field: "dshmcp-field",
    label: "dshmcp-label",
    hint: "dshmcp-hint",
    input: "dshmcp-input",
    select: "dshmcp-select",
    textarea: "dshmcp-textarea",
    checkbox: "dshmcp-checkbox",
    error: "dshmcp-error",
    empty: "dshmcp-empty",
    editor: "dshmcp-editor",
    editorHeader: "dshmcp-editor-header",
    editorBody: "dshmcp-editor-body",
    editorFooter: "dshmcp-editor-footer",
    footer: "dshmcp-footer",
    notice: "dshmcp-notice",
};
const css = `
.dshmcp-wrap{display:flex;flex-direction:column;gap:10px;padding:4px 0}
.dshmcp-desc{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin:0}
.dshmcp-row{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:10px}
.dshmcp-row-main{min-width:0;display:flex;flex-direction:column;gap:2px;flex:1}
.dshmcp-name{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshmcp-meta{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dshmcp-badge{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption);height:20px;border-radius:10px;flex:none;align-items:center;padding:0 6px;font-size:11px;line-height:20px;display:inline-flex}
.dshmcp-badge-ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.dshmcp-badge-off{background:var(--dsw-alias-button-ghost-active-fill);color:var(--dsw-alias-label-caption)}
.dshmcp-badge-error{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}
.dshmcp-badge-info{background:var(--dsw-alias-state-info-tertiary,var(--dsw-alias-button-ghost-active-fill));color:var(--dsw-alias-state-info-primary,var(--dsw-alias-label-caption))}
.dshmcp-btn{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font-family:inherit;font-size:11px;line-height:22px;cursor:pointer;background:0 0;border-radius:999px;flex:none;padding:0 10px}
.dshmcp-btn:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.dshmcp-btn:disabled{opacity:.4;cursor:default}
.dshmcp-btn-primary{border-color:transparent;background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-button-primary-dimmed)}
.dshmcp-btn-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover)}
.dshmcp-btn-danger{color:var(--dsw-alias-state-error-primary)}
.dshmcp-row-actions{display:flex;align-items:center;gap:6px;flex:none}
.dshmcp-field{display:flex;flex-direction:column;gap:4px}
.dshmcp-label{color:var(--dsw-alias-label-caption);font-size:11px;line-height:16px}
.dshmcp-hint{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
.dshmcp-input,.dshmcp-select,.dshmcp-textarea{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-secondary);font:inherit;border-radius:7px;padding:5px 8px;width:100%;font-size:12px;line-height:18px}
.dshmcp-textarea{min-height:64px;resize:vertical;font-family:var(--dsh-font-mono,monospace)}
.dshmcp-checkbox{display:flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.dshmcp-checkbox input{accent-color:var(--dsw-alias-button-primary-fill)}
.dshmcp-error{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover-danger);border-radius:8px;padding:6px 10px;font-size:11px;line-height:16px}
.dshmcp-empty{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px;text-align:center;padding:28px 12px;display:flex;flex-direction:column;gap:4px;align-items:center}
.dshmcp-editor{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);border-radius:12px;overflow:hidden}
.dshmcp-editor-header{border-bottom:1px solid var(--dsw-alias-border-l2);padding:10px 12px;color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500;line-height:20px}
.dshmcp-editor-body{display:flex;flex-direction:column;gap:10px;padding:12px}
.dshmcp-editor-footer{border-top:1px solid var(--dsw-alias-border-l1);padding:8px 12px;display:flex;justify-content:flex-end;gap:8px}
.dshmcp-footer{display:flex;align-items:center;gap:8px;padding-top:4px}
.dshmcp-notice{color:var(--dsw-alias-state-success-primary);font-size:11px;line-height:16px;flex:1}
`;
/** Inject the stylesheet once (idempotent), mirroring the official CSS-module mechanism. */
export function injectStyles() {
    if (typeof document === "undefined")
        return;
    const tagId = "@opendsh/dsh-plugin-setting-mcp/panel.css";
    if (document.querySelector(`style[data-plugin-css=${JSON.stringify(tagId)}]`) !== null)
        return;
    const tag = document.createElement("style");
    tag.dataset.plugin = "@opendsh/dsh-plugin-setting-mcp";
    tag.dataset.pluginCss = tagId;
    tag.textContent = css;
    document.head.appendChild(tag);
}
