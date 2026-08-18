import type { Context } from "@deepseek-ai/cordis"
import { getOrCreateAnonymousUserId } from "@deepseek-ai/dsh-anonymous-user-id"
import type {} from "@deepseek-ai/dsh-attachment"
import { credentialRef } from "@deepseek-ai/dsh-credentials"
import { launchEnvironmentOf } from "@deepseek-ai/dsh-launch-environment"
import { assertUsableApiKey, LlmError } from "@deepseek-ai/dsh-llm"
import {
  Config as DeepSeekConfigSchema,
  DeepSeekAdapter,
  resolveAdapterOptions,
  type Config as DeepSeekConfig,
  type DeepSeekConnectionOptions,
} from "@deepseek-ai/dsh-llm-deepseek"
import {
  deepEqualJson,
  settingsNamespace,
} from "@deepseek-ai/dsh-settings"
import z from "@deepseek-ai/schemastery"

import { VisionBridgeAdapter } from "./adapter.js"
import {
  HarnessVisionAnalyzer,
  type VisionSelection,
} from "./harness-vision.js"
import {
  VISION_PROVIDERS,
  isVisionProviderName,
} from "./provider-catalog.js"
import { SeeCompatibleVisionAnalyzer } from "./vision.js"

export const name = "dsh-vision"
export const inject = ["llm", "attachments"]

const PROVIDER = "deepseek-official"
const DEEPSEEK_NS = settingsNamespace("llm-deepseek")

export interface VisionConfig {
  /** Provider managed by the Vision Recognition settings card. */
  visionBackend?: string
  visionBackendModel?: string
  visionBackendBaseURL?: string
  /** Pin one Harness vision route. Omit both fields for automatic routing. */
  visionProvider?: string
  visionModel?: string
  /** Optional compatibility with ~/.config/see/config.env. */
  visionConfigFile?: string
  visionTimeoutMs?: number
  maxImages?: number
  cacheEntries?: number
}

export interface Config extends DeepSeekConfig, VisionConfig {}

export const VisionConfig: z<VisionConfig> = z.object({
  visionBackend: z.string(),
  visionBackendModel: z.string(),
  visionBackendBaseURL: z.string(),
  visionProvider: z.string(),
  visionModel: z.string(),
  visionConfigFile: z.string(),
  visionTimeoutMs: z.number().step(1).min(1).default(600000),
  maxImages: z.number().step(1).min(1).max(32).default(8),
  cacheEntries: z.number().step(1).min(1).max(1024).default(64),
})

export const Config = z.intersect([
  DeepSeekConfigSchema,
  VisionConfig,
]) as unknown as z<Config>

function deepseekPart(config: Config): DeepSeekConfig {
  const {
    visionBackend: _visionBackend,
    visionBackendModel: _visionBackendModel,
    visionBackendBaseURL: _visionBackendBaseURL,
    visionProvider: _visionProvider,
    visionModel: _visionModel,
    visionConfigFile: _visionConfigFile,
    visionTimeoutMs: _visionTimeoutMs,
    maxImages: _maxImages,
    cacheEntries: _cacheEntries,
    ...deepseek
  } = config
  return deepseek
}

function visionPart(config: Config): VisionConfig {
  return {
    ...(config.visionBackend === undefined
      ? {}
      : { visionBackend: config.visionBackend }),
    ...(config.visionBackendModel === undefined
      ? {}
      : { visionBackendModel: config.visionBackendModel }),
    ...(config.visionBackendBaseURL === undefined
      ? {}
      : { visionBackendBaseURL: config.visionBackendBaseURL }),
    ...(config.visionProvider === undefined
      ? {}
      : { visionProvider: config.visionProvider }),
    ...(config.visionModel === undefined
      ? {}
      : { visionModel: config.visionModel }),
    ...(config.visionConfigFile === undefined
      ? {}
      : { visionConfigFile: config.visionConfigFile }),
    ...(config.visionTimeoutMs === undefined
      ? {}
      : { visionTimeoutMs: config.visionTimeoutMs }),
    ...(config.maxImages === undefined ? {} : { maxImages: config.maxImages }),
    ...(config.cacheEntries === undefined
      ? {}
      : { cacheEntries: config.cacheEntries }),
  }
}

export function apply(ctx: Context, config: Config): void {
  let currentDeepSeek: () => DeepSeekConfig = () => deepseekPart(config)
  let currentVision: () => VisionConfig = () => visionPart(config)
  let lastRaw: DeepSeekConfig | undefined
  let lastGood: DeepSeekConnectionOptions | undefined
  const options = (): DeepSeekConnectionOptions => {
    const raw = currentDeepSeek()
    if (raw === lastRaw && lastGood !== undefined) return lastGood
    try {
      const next = resolveAdapterOptions(raw, launchEnvironmentOf(ctx))
      lastRaw = raw
      lastGood = next
      return next
    } catch (error) {
      if (lastGood === undefined) throw error
      lastRaw = raw
      ctx.logger.error(
        "dsh-vision: keeping the last good DeepSeek configuration"
      )
      ctx.logger.error(error)
      return lastGood
    }
  }
  options()

  const resolveApiKey = async (
    connection: DeepSeekConnectionOptions
  ): Promise<string> => {
    const ref = connection.apiKeyEnv
    const credentials = ctx.get("credentials")
    if (credentials !== undefined) {
      const hit = await credentials.resolve(ref)
      if (hit !== undefined) return assertUsableApiKey(hit.value, name, ref)
    } else {
      const ambient = launchEnvironmentOf(ctx).get(ref)
      if (ambient !== undefined && ambient.value !== "") {
        return assertUsableApiKey(ambient.value, name, ref)
      }
    }
    throw new LlmError(
      `dsh-vision: 没有找到 ${ref}，请在设置 → 模型中保存 DeepSeek API Key`,
      "MISSING_CREDENTIAL"
    )
  }

  const deepseek = new DeepSeekAdapter({
    options,
    resolveApiKey,
    resolveUserId: () => getOrCreateAnonymousUserId(),
  })
  const selection = (): VisionSelection => {
    const current = currentVision()
    return {
      ...(current.visionProvider === undefined
        ? {}
        : { provider: current.visionProvider }),
      ...(current.visionModel === undefined
        ? {}
        : { model: current.visionModel }),
    }
  }
  const harnessVision = new HarnessVisionAnalyzer(ctx.llm, selection)
  const seeVision = new SeeCompatibleVisionAnalyzer({
    configFile: () => currentVision().visionConfigFile,
    timeoutMs: () => currentVision().visionTimeoutMs ?? 600000,
    configuredProvider: async () => {
      const current = currentVision()
      if (!isVisionProviderName(current.visionBackend)) return undefined
      const spec = VISION_PROVIDERS[current.visionBackend]
      let apiKey: string | undefined
      const credentials = ctx.get("credentials")
      if (credentials !== undefined) {
        for (const ref of spec.credentialRefs) {
          const hit = await credentials.resolve(credentialRef(ref))
          const value = hit?.value.trim()
          if (value !== undefined && value !== "") {
            apiKey = value
            break
          }
        }
      }
      return {
        name: current.visionBackend,
        ...(apiKey === undefined ? {} : { apiKey }),
        baseURL: current.visionBackendBaseURL?.trim() || spec.baseURL,
        model: current.visionBackendModel?.trim() || spec.model,
      }
    },
  })
  const bridge = new VisionBridgeAdapter(
    deepseek,
    ctx.attachments,
    harnessVision,
    seeVision,
    {
      maxImages: () => currentVision().maxImages ?? 8,
      cacheEntries: () => currentVision().cacheEntries ?? 64,
      routingKey: () => {
        const current = currentVision()
        return JSON.stringify([
          current.visionBackend,
          current.visionBackendModel,
          current.visionBackendBaseURL,
          current.visionProvider,
          current.visionModel,
          current.visionConfigFile,
        ])
      },
    }
  )

  ctx.llm.registerConfigurableProviders([
    {
      provider: PROVIDER,
      displayName: "DeepSeek",
      settingsNs: DEEPSEEK_NS,
      settingsPath: [],
    },
  ])
  const registration = ctx.llm.registerAdapter([PROVIDER], bridge)
  let registeredPolicy = options().retryPolicy
  const ensureRegistrationFacts = (): void => {
    const policy = options().retryPolicy
    if (deepEqualJson(policy, registeredPolicy)) return
    registration.replace([PROVIDER])
    registeredPolicy = policy
  }

  const deepseekEntry = deepseekPart(config)
  ctx.inject(["settings"], (settingsCtx) => {
    const scope = settingsCtx.settings.register(
      DEEPSEEK_NS,
      Config,
      { base: config }
    )
    currentDeepSeek = () => deepseekPart(scope.get())
    currentVision = () => visionPart(scope.get())
    ensureRegistrationFacts()
    scope.watch(ensureRegistrationFacts)
    settingsCtx.effect(() => () => {
      // Cordis state 5/6 means the owner itself is unloading; route effects
      // are already being released and must not be refreshed from teardown.
      if (ctx.fiber.state >= 5) return
      currentDeepSeek = () => deepseekEntry
      currentVision = () => visionPart(config)
      ensureRegistrationFacts()
    })
  })
}

export { VisionBridgeAdapter } from "./adapter.js"
export { HarnessVisionAnalyzer } from "./harness-vision.js"
export { analyzeLocally } from "./local-vision.js"
export { SeeCompatibleVisionAnalyzer } from "./vision.js"
export { loadSeeProviders } from "./see-config.js"
