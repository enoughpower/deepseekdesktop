/**
 * Stable user-facing failures surfaced through the `mcp` typert remote. The
 * typert gateway folds a thrown error carrying a `code` property into the
 * `{ ok: false, error: { code, message, details } }` result branch.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
/** Validation failure with a stable code, surfaced to the settings UI. */
export class McpInputError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.name = "McpInputError";
        this.code = code;
    }
}
