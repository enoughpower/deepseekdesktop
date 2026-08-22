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
export declare const MCP_CLIENT_MODULE = "@deepseek-ai/dsh-mcp-client";
/** Valid MCP `serverName`, kept below the public tool-name budget (mirrors dsh-mcp-client). */
export declare const SERVER_NAME_PATTERN: RegExp;
export declare const transportSchema: z.ZodEnum<{
    stdio: "stdio";
    "streamable-http": "streamable-http";
}>;
export type McpTransport = z.infer<typeof transportSchema>;
/** One editable server, discriminated on transport (exactly one of command/url). */
export declare const mcpServerInputSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    serverName: z.ZodString;
    toolCallTimeoutMs: z.ZodOptional<z.ZodNumber>;
    failOnStartupError: z.ZodOptional<z.ZodBoolean>;
    id: z.ZodString;
    transport: z.ZodLiteral<"stdio">;
    command: z.ZodString;
    args: z.ZodOptional<z.ZodArray<z.ZodString>>;
    env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    cwd: z.ZodOptional<z.ZodString>;
    enabled: z.ZodBoolean;
}, z.core.$strip>, z.ZodObject<{
    serverName: z.ZodString;
    toolCallTimeoutMs: z.ZodOptional<z.ZodNumber>;
    failOnStartupError: z.ZodOptional<z.ZodBoolean>;
    id: z.ZodString;
    transport: z.ZodLiteral<"streamable-http">;
    url: z.ZodString;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    enabled: z.ZodBoolean;
}, z.core.$strip>], "transport">;
export type McpServerInput = z.infer<typeof mcpServerInputSchema>;
/** `save` input: the full desired server set, reconciled against the loader. */
export declare const saveInputSchema: z.ZodObject<{
    servers: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
        serverName: z.ZodString;
        toolCallTimeoutMs: z.ZodOptional<z.ZodNumber>;
        failOnStartupError: z.ZodOptional<z.ZodBoolean>;
        id: z.ZodString;
        transport: z.ZodLiteral<"stdio">;
        command: z.ZodString;
        args: z.ZodOptional<z.ZodArray<z.ZodString>>;
        env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        cwd: z.ZodOptional<z.ZodString>;
        enabled: z.ZodBoolean;
    }, z.core.$strip>, z.ZodObject<{
        serverName: z.ZodString;
        toolCallTimeoutMs: z.ZodOptional<z.ZodNumber>;
        failOnStartupError: z.ZodOptional<z.ZodBoolean>;
        id: z.ZodString;
        transport: z.ZodLiteral<"streamable-http">;
        url: z.ZodString;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        enabled: z.ZodBoolean;
    }, z.core.$strip>], "transport">>;
}, z.core.$strip>;
export type SaveInput = z.infer<typeof saveInputSchema>;
/** JSON-safe projection of one managed MCP server (undefined fields stripped). */
export declare const mcpServerViewSchema: z.ZodObject<{
    id: z.ZodString;
    serverName: z.ZodString;
    transport: z.ZodEnum<{
        stdio: "stdio";
        "streamable-http": "streamable-http";
    }>;
    command: z.ZodOptional<z.ZodString>;
    args: z.ZodOptional<z.ZodArray<z.ZodString>>;
    env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    cwd: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    toolCallTimeoutMs: z.ZodOptional<z.ZodNumber>;
    failOnStartupError: z.ZodOptional<z.ZodBoolean>;
    enabled: z.ZodBoolean;
    phase: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type McpServerView = z.infer<typeof mcpServerViewSchema>;
