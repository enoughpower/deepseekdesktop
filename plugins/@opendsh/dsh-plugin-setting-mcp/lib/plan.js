/**
 * Pure reconcile planning: given the currently managed MCP loader entries and
 * the desired server set, compute the create / update / remove operations that
 * bring the loader tree in line. Pure and dependency-free so it is trivially
 * unit-testable; the runtime applies the plan through `ctx.loader`.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
import { McpInputError } from "./errors.js";
/**
 * Compute the reconcile plan. `desired` must not contain duplicate
 * `serverName`s; `id`s are matched against `current` to decide update vs
 * create, and any current id absent from `desired` is removed.
 */
export function planReconcile(current, desired) {
    const seen = new Set();
    for (const server of desired) {
        if (seen.has(server.serverName)) {
            throw new McpInputError("duplicate_name", `serverName "${server.serverName}" appears more than once.`);
        }
        seen.add(server.serverName);
    }
    const currentIds = new Set(current.map((entry) => entry.id));
    const desiredIds = new Set(desired.map((server) => server.id));
    return {
        remove: current.filter((entry) => !desiredIds.has(entry.id)).map((entry) => entry.id),
        update: desired.filter((server) => currentIds.has(server.id)).map((server) => ({ id: server.id, server })),
        create: desired.filter((server) => !currentIds.has(server.id)),
    };
}
