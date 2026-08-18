/**
 * File-backed persistence for the MCP server set: reads the profile's
 * `cordis.patch.yml`, reconciles its MCP rows through {@link syncMcpPatchEntries},
 * and writes the result back atomically.
 *
 * The profile's patch layer is the *durable* config file. The vendored Loader's
 * tree write-back targets the include root (`cordis.yml`), which the launcher
 * rewrites to an empty list on every boot (`prepareProfile`), so mutating
 * `ctx.loader` alone can never survive a restart. This module is the part that
 * actually persists.
 *
 * `js-yaml` round-trips the patch file with the same `!!js` dialect the
 * harness's own include uses, so any non-MCP patch entries are preserved
 * bit-for-bit in value (their leading comment header is kept too).
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
import { readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as yaml from "js-yaml";
import { syncMcpPatchEntries } from "./patch.js";
/** The user patch-layer filename inside a profile directory. */
const PROFILE_PATCH_FILENAME = "cordis.patch.yml";
/**
 * `!!js` expression scalar for the entry-list YAML dialect, mirroring
 * `@deepseek-ai/cordis-plugin-include`. Without it, a `!!js` scalar elsewhere in
 * the patch file would fail to parse or would dump as a plain object.
 */
const JsExpr = new yaml.Type("tag:yaml.org,2002:js", {
    kind: "scalar",
    resolve: (data) => typeof data === "string",
    construct: (data) => ({ __jsExpr: data }),
    predicate: (data) => typeof data === "object" && data !== null && "__jsExpr" in data,
    represent: (data) => data.__jsExpr,
});
const patchSchema = yaml.JSON_SCHEMA.extend(JsExpr);
/**
 * Resolve the profile's patch-layer path from the root `cordis:include` entry:
 * the include's `config.path` points at `<profile>/cordis.yml`, and the patch
 * layer sits beside it as `cordis.patch.yml`.
 */
export function profilePatchPath(includeEntry) {
    const path = includeEntry.options.config?.path;
    if (typeof path !== "string") {
        throw new Error("mcp: the root config include has no file path");
    }
    return join(dirname(fileURLToPath(path)), PROFILE_PATCH_FILENAME);
}
/** Split a patch file into its leading comment/blank header and the YAML body. */
function splitLeadingComments(content) {
    const lines = content.split("\n");
    let index = 0;
    while (index < lines.length) {
        const trimmed = lines[index]?.trim() ?? "";
        if (trimmed === "" || trimmed.startsWith("#"))
            index += 1;
        else
            break;
    }
    return {
        header: index > 0 ? `${lines.slice(0, index).join("\n")}\n` : "",
        body: lines.slice(index).join("\n"),
    };
}
/** Parse a patch file into its patch-entry list (empty when the file is empty). */
export function parsePatchEntries(content) {
    const { body } = splitLeadingComments(content);
    const data = yaml.load(body, { schema: patchSchema });
    if (data === undefined || data === null)
        return [];
    if (!Array.isArray(data)) {
        throw new Error("mcp: patch file must be a top-level array of patch entries");
    }
    return data;
}
/**
 * Reconcile the profile patch layer so it holds exactly `rows` MCP rows and
 * write it back atomically (tmp + rename). The leading comment header is
 * preserved; any other patch entries are untouched.
 */
export async function persistMcpPatch(includeEntry, rows) {
    const path = profilePatchPath(includeEntry);
    const content = await readFile(path, "utf8");
    const { header } = splitLeadingComments(content);
    const entries = parsePatchEntries(content);
    const synced = syncMcpPatchEntries(entries, rows);
    const next = `${header}${yaml.dump(synced, { schema: patchSchema, noRefs: true })}`;
    const tmp = `${path}.tmp`;
    await writeFile(tmp, next, "utf8");
    await rename(tmp, path);
}
