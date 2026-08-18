/**
 * Config conversion between the editable `McpServerInput` shape and the raw
 * loader config accepted by `@deepseek-ai/dsh-mcp-client`. Pure and
 * dependency-free so it is unit-testable.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
import { MCP_CLIENT_MODULE } from "./schemas.js";
/** Build a clean mcp-client config for one editable server (transport-selected fields only). */
export function toMcpConfig(server) {
    const base = { serverName: server.serverName };
    if (server.toolCallTimeoutMs !== undefined)
        base.toolCallTimeoutMs = server.toolCallTimeoutMs;
    if (server.failOnStartupError !== undefined)
        base.failOnStartupError = server.failOnStartupError;
    if (server.transport === "stdio") {
        return {
            ...base,
            transport: "stdio",
            command: server.command,
            args: server.args ?? [],
            env: server.env ?? {},
            cwd: server.cwd ?? "",
        };
    }
    return {
        ...base,
        transport: "streamable-http",
        url: server.url,
        headers: server.headers ?? {},
    };
}
/**
 * Build one loader entry row for a server. `existingConfig` (the current
 * entry's raw config) supplies a `reconnect` block the editor does not surface,
 * so a save that touches a different server does not silently drop a live
 * server's reconnect policy.
 */
export function toMcpEntryOptions(server, existingConfig) {
    const config = toMcpConfig(server);
    const reconnect = existingConfig?.reconnect;
    if (reconnect !== undefined)
        config.reconnect = reconnect;
    const options = { id: server.id, name: MCP_CLIENT_MODULE, config };
    if (!server.enabled)
        options.disabled = true;
    return options;
}
