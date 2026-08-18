/**
 * Pure patch-layer reconciliation for the profile's `cordis.patch.yml`.
 *
 * The plugin manages MCP servers as `@deepseek-ai/dsh-mcp-client` rows inside
 * the profile's patch layer. This module turns the desired server set into the
 * patch-file rows and reconciles them against an existing patch list, without
 * touching any other patch entries (bundle inserts, hand-written overrides,
 * `!!js` expressions). It is pure and dependency-free so it is unit-testable.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
import { MCP_CLIENT_MODULE } from "./schemas.js";
/**
 * Reconcile a patch list so its `insert` blocks hold exactly `rows` MCP rows.
 *
 * Every `dsh-mcp-client` row is removed from every `insert` block first (so a
 * removed or renamed server cannot linger), emptied `insert` blocks are
 * dropped, then a single fresh `insert` block carrying `rows` is appended. All
 * non-insert patches and any non-MCP rows inside surviving inserts are kept
 * verbatim.
 *
 * @param entries - the parsed patch list.
 * @param rows - the desired MCP loader rows, in order.
 * @returns a new patch list (the input is never mutated).
 */
export function syncMcpPatchEntries(entries, rows) {
    const kept = [];
    for (const patch of entries) {
        if (Array.isArray(patch.insert)) {
            const rest = patch.insert.filter((row) => row.name !== MCP_CLIENT_MODULE);
            if (rest.length > 0) {
                kept.push({ ...patch, insert: rest });
            }
            // An anonymous insert that is now empty, or a group insert whose only
            // rows were MCP rows, is dropped entirely.
            continue;
        }
        kept.push(patch);
    }
    if (rows.length > 0)
        kept.push({ insert: rows });
    return kept;
}
/**
 * A stable, collision-free loader entry id for a new server: `mcp-<serverName>`
 * (the same convention the profile's hand-written rows use), suffixed when the
 * base id is already taken.
 *
 * @param serverName - the server's validated `serverName`.
 * @param taken - ids that must not be reused (existing entries plus already-assigned new ids).
 */
export function stableServerId(serverName, taken) {
    const base = `mcp-${serverName}`;
    let id = base;
    let index = 2;
    while (taken.has(id))
        id = `${base}-${index++}`;
    return id;
}
