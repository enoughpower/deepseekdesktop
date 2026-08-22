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
export declare const C: {
    readonly wrap: "dshmcp-wrap";
    readonly desc: "dshmcp-desc";
    readonly contact: "dshmcp-contact";
    readonly row: "dshmcp-row";
    readonly rowMain: "dshmcp-row-main";
    readonly name: "dshmcp-name";
    readonly meta: "dshmcp-meta";
    readonly badge: "dshmcp-badge";
    readonly badgeOk: "dshmcp-badge-ok";
    readonly badgeOff: "dshmcp-badge-off";
    readonly badgeError: "dshmcp-badge-error";
    readonly badgeInfo: "dshmcp-badge-info";
    readonly btn: "dshmcp-btn";
    readonly btnPrimary: "dshmcp-btn-primary";
    readonly btnDanger: "dshmcp-btn-danger";
    readonly rowActions: "dshmcp-row-actions";
    readonly field: "dshmcp-field";
    readonly label: "dshmcp-label";
    readonly hint: "dshmcp-hint";
    readonly input: "dshmcp-input";
    readonly select: "dshmcp-select";
    readonly textarea: "dshmcp-textarea";
    readonly checkbox: "dshmcp-checkbox";
    readonly error: "dshmcp-error";
    readonly empty: "dshmcp-empty";
    readonly editor: "dshmcp-editor";
    readonly editorHeader: "dshmcp-editor-header";
    readonly editorBody: "dshmcp-editor-body";
    readonly editorFooter: "dshmcp-editor-footer";
    readonly footer: "dshmcp-footer";
    readonly notice: "dshmcp-notice";
};
/** Inject the stylesheet once (idempotent), mirroring the official CSS-module mechanism. */
export declare function injectStyles(): void;
