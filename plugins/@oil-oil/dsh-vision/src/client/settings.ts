import {
  VISION_PROVIDERS,
  isVisionProviderName,
  type VisionProviderName,
} from "../provider-catalog.js"

export const VISION_SETTINGS_NAMESPACE = "llm-deepseek"
export const DEFAULT_MAX_IMAGES = 8

export interface VisionSettings {
  readonly visionBackend?: string
  readonly visionBackendModel?: string
  readonly visionBackendBaseURL?: string
  readonly maxImages?: number
}

export interface VisionDraft {
  readonly provider: VisionProviderName | undefined
  readonly model: string
  readonly baseURL: string
  readonly maxImages: number
}

export type VisionSettingsOp =
  | { readonly op: "set"; readonly path: readonly string[]; readonly value: unknown }
  | { readonly op: "unset"; readonly path: readonly string[] }

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== ""
    ? value.trim()
    : undefined
}

export function decodeVisionSettings(section: unknown): VisionSettings | undefined {
  if (typeof section !== "object" || section === null || Array.isArray(section)) {
    return undefined
  }
  const source = section as Record<string, unknown>
  const provider = source["visionBackend"]
  const model = source["visionBackendModel"]
  const baseURL = source["visionBackendBaseURL"]
  const maxImages = source["maxImages"]
  if (provider !== undefined && !isVisionProviderName(provider)) return undefined
  if (model !== undefined && typeof model !== "string") return undefined
  if (baseURL !== undefined && typeof baseURL !== "string") return undefined
  if (maxImages !== undefined && typeof maxImages !== "number") return undefined
  return {
    ...(provider === undefined ? {} : { visionBackend: provider }),
    ...(model === undefined ? {} : { visionBackendModel: model }),
    ...(baseURL === undefined ? {} : { visionBackendBaseURL: baseURL }),
    ...(maxImages === undefined ? {} : { maxImages }),
  }
}

export function draftOf(settings: VisionSettings | undefined): VisionDraft {
  const provider = isVisionProviderName(settings?.visionBackend)
    ? settings.visionBackend
    : undefined
  const spec = provider === undefined ? undefined : VISION_PROVIDERS[provider]
  return {
    provider,
    model: nonEmptyString(settings?.visionBackendModel) ?? spec?.model ?? "",
    baseURL: nonEmptyString(settings?.visionBackendBaseURL) ?? spec?.baseURL ?? "",
    maxImages: settings?.maxImages ?? DEFAULT_MAX_IMAGES,
  }
}

export function draftForProvider(
  current: VisionDraft,
  provider: VisionProviderName | undefined
): VisionDraft {
  const spec = provider === undefined ? undefined : VISION_PROVIDERS[provider]
  return {
    ...current,
    provider,
    model: spec?.model ?? "",
    baseURL: spec?.baseURL ?? "",
  }
}

export function sameDraft(left: VisionDraft, right: VisionDraft): boolean {
  return (
    left.provider === right.provider &&
    left.model === right.model &&
    left.baseURL === right.baseURL &&
    left.maxImages === right.maxImages
  )
}

export function validMaxImages(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 32
}

export function validProviderDraft(draft: VisionDraft): boolean {
  if (draft.provider === undefined) return true
  if (draft.model.trim() === "" || draft.baseURL.trim() === "") return false
  try {
    const url = new URL(draft.baseURL)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

export function settingsOps(
  before: VisionDraft,
  after: VisionDraft
): VisionSettingsOp[] {
  const ops: VisionSettingsOp[] = []
  if (before.provider !== after.provider) {
    if (after.provider === undefined) {
      ops.push(
        { op: "unset", path: ["visionBackend"] },
        { op: "unset", path: ["visionBackendModel"] },
        { op: "unset", path: ["visionBackendBaseURL"] }
      )
    } else {
      ops.push({ op: "set", path: ["visionBackend"], value: after.provider })
    }
  }
  if (after.provider !== undefined) {
    if (before.provider !== after.provider || before.model !== after.model) {
      ops.push({
        op: "set",
        path: ["visionBackendModel"],
        value: after.model.trim(),
      })
    }
    if (before.provider !== after.provider || before.baseURL !== after.baseURL) {
      ops.push({
        op: "set",
        path: ["visionBackendBaseURL"],
        value: after.baseURL.trim(),
      })
    }
  }
  if (before.maxImages !== after.maxImages) {
    ops.push({ op: "set", path: ["maxImages"], value: after.maxImages })
  }
  return ops
}
