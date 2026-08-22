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
import type { Entry, EntryOptions } from "@deepseek-ai/cordis-plugin-loader";
import { type PatchEntry } from "./patch.js";
/**
 * Resolve the profile's patch-layer path from the root `cordis:include` entry:
 * the include's `config.path` points at `<profile>/cordis.yml`, and the patch
 * layer sits beside it as `cordis.patch.yml`.
 */
export declare function profilePatchPath(includeEntry: Entry): string;
/** Parse a patch file into its patch-entry list (empty when the file is empty). */
export declare function parsePatchEntries(content: string): PatchEntry[];
/**
 * Reconcile the profile patch layer so it holds exactly `rows` MCP rows and
 * write it back atomically (tmp + rename). The leading comment header is
 * preserved; any other patch entries are untouched.
 */
export declare function persistMcpPatch(includeEntry: Entry, rows: EntryOptions[]): Promise<void>;
