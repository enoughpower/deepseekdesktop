/**
 * The `mcp` typert host service. Registered as `ctx.mcp` by the plugin body;
 * the gateway dispatches `mcp/*` endpoints here. `list` projects the current
 * loader tree, and `save` reconciles it — each `loader.create` / `update` /
 * `remove` restarts the affected `dsh-mcp-client` entry immediately, then the
 * reconciled set is persisted to the profile's `cordis.patch.yml`, the durable
 * patch layer that survives restart.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
import type { Context } from "@deepseek-ai/cordis";
import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { type McpServerView, type SaveInput } from "./schemas.js";
/** Host service backing the `mcp` typert namespace. */
export declare class McpRuntime extends TypertRemoteService {
    constructor(ctx: Context);
    /** All non-group loader entries that load the mcp-client bridge, in Loader order. */
    private managedEntries;
    /**
     * The root `cordis:include` entry whose subtree holds the profile's loader
     * rows and whose `config.path` locates the patch layer beside `cordis.yml`.
     */
    private rootInclude;
    /** List the currently managed MCP servers. */
    list(): McpServerView[];
    /** Reconcile the loader tree to `servers`, persist to the patch layer, and return the fresh list. */
    save(input: SaveInput): Promise<McpServerView[]>;
}
