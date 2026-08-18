/**
 * MCP-settings plugin entry: mounts the `mcp` typert service (`ctx.mcp`),
 * which projects and reconciles the loader's `dsh-mcp-client` entries. The
 * host TYPERT face lives in `./typert` (auto-registered by `dsh-typert-loader`);
 * the browser half lives in `./client`.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
import { McpRuntime } from "./runtime.js";
/** Stable cordis plugin name. */
export const name = "setting-mcp";
/** The loader service is required to enumerate and mutate plugin entries. */
export const inject = ["loader"];
/** Mount the plugin. */
export async function apply(ctx) {
    // The McpRuntime constructor registers `ctx.mcp` and unregisters it when
    // this plugin's fiber unloads.
    void new McpRuntime(ctx);
}
