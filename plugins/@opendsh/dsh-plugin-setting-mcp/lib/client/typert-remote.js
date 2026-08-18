/**
 * Client TYPERT_REMOTE face: installs the `mcp` namespace on the client
 * through `ctx.remote.$mount(...)`, mirroring the host TYPERT manifest
 * one-to-one so both directions validate with the same strict codecs.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
import { z } from "zod";
import { mcpServerViewSchema, saveInputSchema } from "../schemas.js";
const PKG = "@opendsh/dsh-plugin-setting-mcp";
const direct = { kind: "direct" };
function jsonCodec(typeSymbol, schema) {
    return { mode: "strict", typeSymbol: `${PKG}/types#${typeSymbol}`, schema };
}
function result(typeSymbol, schema) {
    return { mode: "strict", typeSymbol: `${PKG}/types#${typeSymbol}`, schema };
}
/** Remote contribution consumed by `ctx.remote.$mount(...)`. */
export const TYPERT_REMOTE = {
    package: PKG,
    descriptors: [
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
