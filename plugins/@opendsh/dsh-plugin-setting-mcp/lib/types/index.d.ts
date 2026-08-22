/**
 * MCP-settings plugin entry: mounts the `mcp` typert service (`ctx.mcp`),
 * which projects and reconciles the loader's `dsh-mcp-client` entries. The
 * host TYPERT face lives in `./typert` (auto-registered by `dsh-typert-loader`);
 * the browser half lives in `./client`.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
import type { Context } from "@deepseek-ai/cordis";
/** Stable cordis plugin name. */
export declare const name = "setting-mcp";
/** The loader service is required to enumerate and mutate plugin entries. */
export declare const inject: string[];
/** Mount the plugin. */
export declare function apply(ctx: Context): Promise<void>;
