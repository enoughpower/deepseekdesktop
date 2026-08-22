/**
 * Client plugin body: mounts the `mcp` remote namespace, registers the
 * `setting-mcp` locale dictionaries, then registers the MCP settings page into
 * the `settings.section` slot.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
import type { ClientContext } from "@deepseek-ai/dsh-client-runtime/client";
import { type SettingMcpKey } from "./locales.js";
declare module "@deepseek-ai/dsh-client-ui-slots" {
    interface LocaleNamespaceMap {
        /** MCP settings page copy. */
        "setting-mcp": SettingMcpKey;
    }
}
/** Services required before this plugin mounts. */
export declare const inject: string[];
/** Mount the browser half. */
export declare function apply(ctx: ClientContext): Promise<void>;
