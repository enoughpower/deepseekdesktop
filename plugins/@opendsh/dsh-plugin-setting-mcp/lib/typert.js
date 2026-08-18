/**
 * Host TYPERT face for the `mcp` namespace. The `dsh-typert-loader` scans
 * loader entries that export `./typert`, registers this manifest, and the
 * host gateway dispatches `mcp/*` endpoints to the `mcp` service.
 *
 * Hand-written in the same shape the `@deepseek-ai/dsh-typert-generator`
 * emits (see `@deepseek-ai/dsh-commands`' generated `typert.host.js`).
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
import { z } from "zod";
import { mcpServerViewSchema, saveInputSchema } from "./schemas.js";
const PKG = "@opendsh/dsh-plugin-setting-mcp";
const direct = { kind: "direct" };
function jsonCodec(typeSymbol, schema) {
    return { mode: "strict", typeSymbol: `${PKG}/types#${typeSymbol}`, schema };
}
function result(typeSymbol, schema) {
    return { mode: "strict", typeSymbol: `${PKG}/types#${typeSymbol}`, schema };
}
/** Strict host contribution: `mcp/*` endpoints dispatched to `ctx.mcp`. */
export const TYPERT = {
    package: PKG,
    face: "host",
    schemas: [],
    model: {
        services: [
            {
                tags: [],
                key: "mcp",
                exportName: "mcp",
                members: [
                    { name: "list", kind: "method", signature: "(): McpServerView[]" },
                    { name: "save", kind: "method", signature: "(input: SaveInput): Promise<McpServerView[]>" },
                ],
                types: [
                    {
                        name: "McpServerView",
                        declaration: "export interface McpServerView { id: string; serverName: string; transport: 'stdio' | 'streamable-http'; command?: string; args?: string[]; env?: Record<string, string>; cwd?: string; url?: string; headers?: Record<string, string>; toolCallTimeoutMs?: number; failOnStartupError?: boolean; enabled: boolean; phase: string | null; }",
                    },
                    {
                        name: "McpServerInput",
                        declaration: "export type McpServerInput = { id: string; serverName: string; transport: 'stdio'; command: string; args?: string[]; env?: Record<string, string>; cwd?: string; enabled: boolean; toolCallTimeoutMs?: number; failOnStartupError?: boolean; } | { id: string; serverName: string; transport: 'streamable-http'; url: string; headers?: Record<string, string>; enabled: boolean; toolCallTimeoutMs?: number; failOnStartupError?: boolean; };",
                    },
                    {
                        name: "SaveInput",
                        declaration: "export interface SaveInput { servers: McpServerInput[]; }",
                    },
                ],
            },
        ],
        events: [],
        objects: [],
    },
    invocations: [
        {
            id: `${PKG}#mcp/list`,
            service: "mcp",
            namespace: "mcp",
            method: "list",
            invocation: direct,
            parameters: [],
            result: result("McpServerView[]", z.array(mcpServerViewSchema)),
        },
        {
            id: `${PKG}#mcp/save`,
            service: "mcp",
            namespace: "mcp",
            method: "save",
            invocation: direct,
            parameters: [
                {
                    name: "input",
                    wire: "input",
                    source: "json",
                    codec: jsonCodec("SaveInput", saveInputSchema),
                },
            ],
            result: result("McpServerView[]", z.array(mcpServerViewSchema)),
        },
    ],
};
