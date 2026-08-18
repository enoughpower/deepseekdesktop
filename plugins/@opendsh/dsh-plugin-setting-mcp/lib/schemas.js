/**
 * Wire schemas shared by the host TYPERT face and the client remote face.
 * These zod schemas anchor both directions of the `mcp` typert namespace: the
 * host validates incoming arguments and outgoing results, the client validates
 * outgoing arguments and incoming results.
 *
 * The shape mirrors `@deepseek-ai/dsh-mcp-client`'s `Config` union (stdio vs
 * streamable-http) plus the two management fields this plugin owns: `id`
 * (stable loader-entry key) and `enabled` (the loader entry's effective
 * enablement).
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
import { z } from "zod";
/** The module specifier every managed entry loads. */
export const MCP_CLIENT_MODULE = "@deepseek-ai/dsh-mcp-client";
/** Valid MCP `serverName`, kept below the public tool-name budget (mirrors dsh-mcp-client). */
export const SERVER_NAME_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;
export const transportSchema = z.enum(["stdio", "streamable-http"]);
const commonInputFields = {
    serverName: z.string().regex(SERVER_NAME_PATTERN),
    toolCallTimeoutMs: z.number().int().positive().optional(),
    failOnStartupError: z.boolean().optional(),
};
/** One editable server, discriminated on transport (exactly one of command/url). */
export const mcpServerInputSchema = z.discriminatedUnion("transport", [
    z.object({
        ...commonInputFields,
        id: z.string().min(1),
        transport: z.literal("stdio"),
        command: z.string().min(1),
        args: z.array(z.string()).optional(),
        env: z.record(z.string(), z.string()).optional(),
        cwd: z.string().optional(),
        enabled: z.boolean(),
    }),
    z.object({
        ...commonInputFields,
        id: z.string().min(1),
        transport: z.literal("streamable-http"),
        url: z.string().min(1),
        headers: z.record(z.string(), z.string()).optional(),
        enabled: z.boolean(),
    }),
]);
/** `save` input: the full desired server set, reconciled against the loader. */
export const saveInputSchema = z.object({
    servers: z.array(mcpServerInputSchema),
});
/** JSON-safe projection of one managed MCP server (undefined fields stripped). */
export const mcpServerViewSchema = z.object({
    id: z.string(),
    serverName: z.string(),
    transport: transportSchema,
    command: z.string().optional(),
    args: z.array(z.string()).optional(),
    env: z.record(z.string(), z.string()).optional(),
    cwd: z.string().optional(),
    url: z.string().optional(),
    headers: z.record(z.string(), z.string()).optional(),
    toolCallTimeoutMs: z.number().optional(),
    failOnStartupError: z.boolean().optional(),
    enabled: z.boolean(),
    /** Live loader fiber phase (`pending|loading|active|failed|unloading`), or null. */
    phase: z.string().nullable(),
});
