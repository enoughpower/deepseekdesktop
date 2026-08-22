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
/** Strict host contribution: `mcp/*` endpoints dispatched to `ctx.mcp`. */
export declare const TYPERT: {
    package: string;
    face: string;
    schemas: never[];
    model: {
        services: {
            tags: never[];
            key: string;
            exportName: string;
            members: {
                name: string;
                kind: string;
                signature: string;
            }[];
            types: {
                name: string;
                declaration: string;
            }[];
        }[];
        events: never[];
        objects: never[];
    };
    invocations: {
        id: string;
        service: string;
        namespace: string;
        method: string;
        invocation: {
            kind: "direct";
        };
        parameters: {
            name: string;
            wire: string;
            source: string;
            codec: {
                mode: "strict";
                typeSymbol: string;
                schema: z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>;
            };
        }[];
        result: {
            mode: "strict";
            typeSymbol: string;
            schema: z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>;
        };
    }[];
};
