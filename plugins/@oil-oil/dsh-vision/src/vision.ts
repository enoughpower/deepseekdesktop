import type { StoredImageAttachment } from "@deepseek-ai/dsh-attachment"

import {
  loadSeeProviders,
  type SeeProvider,
  type SeeProviderName,
} from "./see-config.js"
import { analyzeLocally } from "./local-vision.js"

interface VisionResponse {
  readonly choices?: readonly {
    readonly message?: {
      readonly content?:
        | string
        | readonly {
            readonly type?: string
            readonly text?: string
          }[]
    }
  }[]
}

export interface VisionAnalysis {
  readonly text: string
  readonly provider: string
  readonly model: string
}

export interface VisionAnalyzerOptions {
  readonly configFile?: string | (() => string | undefined)
  readonly timeoutMs: number | (() => number)
  readonly configuredProvider?: () => Promise<ConfiguredVisionProvider | undefined>
}

export interface ConfiguredVisionProvider {
  readonly name: SeeProviderName
  readonly apiKey?: string
  readonly baseURL: string
  readonly model: string
}

function responseText(response: VisionResponse): string {
  const content = response.choices?.[0]?.message?.content
  if (typeof content === "string") return content.trim()
  if (!Array.isArray(content)) return ""
  return content
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("\n")
    .trim()
}

function dataURL(image: StoredImageAttachment): string {
  const encoded = Buffer.from(image.data).toString("base64")
  return `data:${image.ref.mediaType};base64,${encoded}`
}

async function callProvider(
  provider: SeeProvider,
  images: readonly StoredImageAttachment[],
  task: string,
  timeoutMs: number,
  requestSignal?: AbortSignal
): Promise<string> {
  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const signal =
    requestSignal === undefined
      ? timeoutSignal
      : AbortSignal.any([requestSignal, timeoutSignal])
  const content = [
    { type: "text", text: task.trim() },
    ...images.map((image) => ({
      type: "image_url",
      image_url: { url: dataURL(image) },
    })),
  ]
  const headers: Record<string, string> = {
    Authorization: `Bearer ${provider.apiKey}`,
    "Content-Type": "application/json",
  }
  if (provider.name === "openrouter") {
    headers["HTTP-Referer"] = "https://github.com/oil-oil/dsh-vision"
    headers["X-Title"] = "dsh-vision"
  }
  const response = await fetch(
    `${provider.baseURL.replace(/\/$/u, "")}/chat/completions`,
    {
      method: "POST",
      headers,
      signal,
      body: JSON.stringify({
        model: provider.model,
        messages: [
          {
            role: "system",
            content:
              "直接观察图片并回答用户的问题。综合理解整个画面、对象、空间关系、界面状态和可见文字，不要只做文字识别。不要编造；看不清或不确定时明确说明。根据用户的问题自然组织回答。",
          },
          { role: "user", content },
        ],
      }),
    }
  )
  if (!response.ok) {
    throw new Error(`${provider.name} HTTP ${response.status}`)
  }
  const text = responseText((await response.json()) as VisionResponse)
  if (text === "") throw new Error(`${provider.name} 返回了空的视觉结果`)
  return text
}

export class SeeCompatibleVisionAnalyzer {
  readonly #configFile: string | (() => string | undefined) | undefined
  readonly #timeoutMs: number | (() => number)
  readonly #configuredProvider:
    | (() => Promise<ConfiguredVisionProvider | undefined>)
    | undefined

  constructor(options: VisionAnalyzerOptions) {
    this.#configFile = options.configFile
    this.#timeoutMs = options.timeoutMs
    this.#configuredProvider = options.configuredProvider
  }

  #configFileValue(): string | undefined {
    return typeof this.#configFile === "function"
      ? this.#configFile()
      : this.#configFile
  }

  #timeoutValue(): number {
    return typeof this.#timeoutMs === "function"
      ? this.#timeoutMs()
      : this.#timeoutMs
  }

  async #analyzeProviders(
    providers: readonly SeeProvider[],
    images: readonly StoredImageAttachment[],
    task: string,
    signal?: AbortSignal,
    includeLocal = false
  ): Promise<VisionAnalysis> {
    const failures: string[] = []
    for (const provider of providers) {
      try {
        const text = await callProvider(
          provider,
          images,
          task,
          this.#timeoutValue(),
          signal
        )
        return { text, provider: provider.name, model: provider.model }
      } catch (error) {
        if (signal?.aborted) throw signal.reason
        failures.push(error instanceof Error ? error.message : String(error))
      }
    }
    if (includeLocal) {
      try {
        return await analyzeLocally(images)
      } catch (localError) {
        failures.push(
          localError instanceof Error ? localError.message : String(localError)
        )
      }
    }
    throw new Error(`所有视觉服务均失败：${failures.join("；")}`)
  }

  /** Try only the provider explicitly selected in the plugin settings. */
  async analyzeConfigured(
    images: readonly StoredImageAttachment[],
    task: string,
    signal?: AbortSignal
  ): Promise<VisionAnalysis> {
    const configured = await this.#configuredProvider?.()
    if (configured === undefined) {
      throw new Error("视觉识别插件未指定外部平台")
    }
    const stored = await loadSeeProviders(this.#configFileValue())
    const matching = stored.find((provider) => provider.name === configured.name)
    const apiKey = configured.apiKey?.trim() || matching?.apiKey
    if (apiKey === undefined || apiKey === "") {
      throw new Error(`${configured.name} 尚未配置 API Key`)
    }
    return this.#analyzeProviders(
      [{ ...configured, apiKey }],
      images,
      task,
      signal
    )
  }

  /** Try see-compatible providers not already selected, then local OCR. */
  async analyze(
    images: readonly StoredImageAttachment[],
    task: string,
    signal?: AbortSignal
  ): Promise<VisionAnalysis> {
    const configured = await this.#configuredProvider?.()
    const providers = await loadSeeProviders(this.#configFileValue())
    return this.#analyzeProviders(
      configured === undefined
        ? providers
        : providers.filter((provider) => provider.name !== configured.name),
      images,
      task,
      signal,
      true
    )
  }
}
