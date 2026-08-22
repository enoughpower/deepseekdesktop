/**
 * Client-side remote surface for the `mcp` typert namespace. Installed by
 * `ctx.remote.$mount(TYPERT_REMOTE)`; every method returns the wire result
 * shape `{ ok: true, value } | { ok: false, error }`.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
import type { McpServerView, SaveInput } from "../schemas.js";
/** One settled wire result. */
export type RpcResult<T> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: {
        code: string;
        message: string;
    };
};
/** Typed projection of the installed `remote.mcp` namespace. */
export interface McpRemote {
    list(): Promise<RpcResult<McpServerView[]>>;
    save(input: SaveInput): Promise<RpcResult<McpServerView[]>>;
}
