/**
 * MCP settings page UI. Mounted into the `settings.section` slot; lists the
 * managed MCP servers with live status, stages edits locally (add / edit /
 * remove / enable-disable), and commits them through `remote.mcp.save` —
 * the host reconciles the loader tree and each change hot-reloads the affected
 * `dsh-mcp-client` entry.
 *
 * Styling uses the DSH design tokens (`--dsw-alias-*`); the stylesheet is
 * injected once by the client plugin body.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
import type { TranslateNS } from "@deepseek-ai/dsh-client-ui-slots";
import type { McpRemote } from "./remote.js";
/** The translate seat of this plugin's `setting-mcp` locale namespace. */
export type PanelTranslate = TranslateNS<"setting-mcp">;
/** Owner + injected + framework standard props for the settings section entry. */
export interface McpSettingsSectionProps {
    /** Close the settings panel (shell-owned affordance). */
    close: () => void;
    /** Injected `remote.mcp` handle. */
    mcp: McpRemote;
    /** Framework-injected translate seat (namespace `setting-mcp`). */
    t: PanelTranslate;
}
export declare function McpSettingsSection({ mcp, t }: McpSettingsSectionProps): import("react").JSX.Element;
