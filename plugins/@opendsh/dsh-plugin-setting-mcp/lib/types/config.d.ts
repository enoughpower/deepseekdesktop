/**
 * Config conversion between the editable `McpServerInput` shape and the raw
 * loader config accepted by `@deepseek-ai/dsh-mcp-client`. Pure and
 * dependency-free so it is unit-testable.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
import type { EntryOptions } from "@deepseek-ai/cordis-plugin-loader";
import { type McpServerInput } from "./schemas.js";
/** Build a clean mcp-client config for one editable server (transport-selected fields only). */
export declare function toMcpConfig(server: McpServerInput): Record<string, unknown>;
/**
 * Build one loader entry row for a server. `existingConfig` (the current
 * entry's raw config) supplies a `reconnect` block the editor does not surface,
 * so a save that touches a different server does not silently drop a live
 * server's reconnect policy.
 */
export declare function toMcpEntryOptions(server: McpServerInput, existingConfig?: Record<string, unknown>): EntryOptions;
