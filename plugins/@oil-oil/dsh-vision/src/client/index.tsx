import type { ClientContext } from "@deepseek-ai/dsh-client-runtime/client"
import type { ConnectionHandle } from "@deepseek-ai/dsh-api-remotes/client"
import type {} from "@deepseek-ai/dsh-client-locale/client"
import type {} from "@deepseek-ai/dsh-client-ui-settings/client"
import type {} from "@deepseek-ai/dsh-client-ui-settings-plugins/client"

import { VisionSettingsCard } from "./VisionSettingsCard.js"
import { en, zh, type VisionLocaleKey } from "./locales.js"
import {
  decodeVisionSettings,
  VISION_SETTINGS_NAMESPACE,
  type VisionSettings,
} from "./settings.js"
import { SETTINGS_CSS, SETTINGS_STYLE_ID } from "./styles.js"

declare module "@deepseek-ai/dsh-client-ui-slots" {
  interface LocaleNamespaceMap {
    readonly "settings.dshVision": VisionLocaleKey
  }
}

const LOCALE_NAMESPACE = "settings.dshVision"

export const inject = ["slots", "locale", "connection", "settingsScope"]

export function apply(ctx: ClientContext): void {
  ctx.effect(
    () => ctx.locale.register(LOCALE_NAMESPACE, { zh, en }),
    "dsh-vision: settings dictionaries"
  )
  ctx.effect(() => {
    const existing = document.querySelector<HTMLStyleElement>(
      `style[data-plugin-css="${SETTINGS_STYLE_ID}"]`
    )
    if (existing !== null) return () => undefined
    const tag = document.createElement("style")
    tag.dataset.plugin = "@oil-oil/dsh-vision"
    tag.dataset.pluginCss = SETTINGS_STYLE_ID
    tag.textContent = SETTINGS_CSS
    document.head.append(tag)
    return () => { tag.remove() }
  }, "dsh-vision: settings styles")

  const connection = ctx.get("connection") as ConnectionHandle
  const scope = ctx.settingsScope.bind<VisionSettings>({
    namespace: VISION_SETTINGS_NAMESPACE,
    decode: decodeVisionSettings,
  })

  ctx.slots.inject("settings.plugin.item", () =>
    ctx.slots.register(
      {
        name: "settings.plugin.item",
        id: "dsh-vision",
        order: 30,
        locale: LOCALE_NAMESPACE,
        inject: () => ({ scope, api: connection.api }),
      },
      VisionSettingsCard
    )
  )
}
