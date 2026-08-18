export interface VisionProviderSpec {
  readonly displayName: string
  readonly baseURL: string
  readonly model: string
  readonly credentialRefs: readonly string[]
}

/** Provider defaults kept in sync with oil-oil/see-skill. */
export const VISION_PROVIDERS = {
  zenmux: {
    displayName: "ZenMux",
    baseURL: "https://zenmux.ai/api/v1",
    model: "qwen/qwen3.7-plus",
    credentialRefs: ["ZENMUX_API_KEY"],
  },
  bailian: {
    displayName: "百炼",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: "qwen3.7-plus",
    credentialRefs: ["DASHSCOPE_API_KEY", "BAILIAN_API_KEY"],
  },
  tokendance: {
    displayName: "TokenDance",
    baseURL: "https://tokendance.space/gateway/v1",
    model: "qwen3.7-plus",
    credentialRefs: ["TOKENDANCE_API_KEY"],
  },
  openrouter: {
    displayName: "OpenRouter",
    baseURL: "https://openrouter.ai/api/v1",
    model: "qwen/qwen3.7-plus",
    credentialRefs: ["OPENROUTER_API_KEY"],
  },
} as const satisfies Record<string, VisionProviderSpec>

export type VisionProviderName = keyof typeof VISION_PROVIDERS

export function isVisionProviderName(value: unknown): value is VisionProviderName {
  return typeof value === "string" && value in VISION_PROVIDERS
}

export function allVisionCredentialRefs(): string[] {
  return [...new Set(
    Object.values(VISION_PROVIDERS).flatMap((provider) => provider.credentialRefs)
  )]
}
