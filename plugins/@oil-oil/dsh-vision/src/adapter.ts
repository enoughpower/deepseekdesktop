import type { AttachmentStore } from "@deepseek-ai/dsh-attachment"
import {
  LlmAdapter,
  LlmError,
  type GenerateOptions,
  type LlmModelInfo,
  type LlmProviderInfo,
  type LlmResolvedModelInfo,
  type ResolvedRetryPolicy,
  type StreamChunk,
} from "@deepseek-ai/dsh-llm"
import type { DeepSeekAdapter } from "@deepseek-ai/dsh-llm-deepseek"

import {
  appendVisionContext,
  collectImageRefs,
  latestUserTask,
  withoutImages,
} from "./content.js"
import type { HarnessVisionAnalyzer } from "./harness-vision.js"
import type { SeeCompatibleVisionAnalyzer, VisionAnalysis } from "./vision.js"

export interface VisionBridgeOptions {
  readonly maxImages: () => number
  readonly cacheEntries: () => number
  readonly routingKey: () => string
}

const IMAGE_INPUT = ["text", "image"] as const

function withImageInput(model: LlmModelInfo): LlmModelInfo {
  return {
    ...model,
    inputModalities: IMAGE_INPUT,
  }
}

export class VisionBridgeAdapter extends LlmAdapter {
  readonly #deepseek: DeepSeekAdapter
  readonly #attachments: AttachmentStore
  readonly #harnessVision: HarnessVisionAnalyzer
  readonly #vision: SeeCompatibleVisionAnalyzer
  readonly #maxImages: () => number
  readonly #cacheEntries: () => number
  readonly #routingKey: () => string
  readonly #cache = new Map<string, Promise<VisionAnalysis>>()

  constructor(
    deepseek: DeepSeekAdapter,
    attachments: AttachmentStore,
    harnessVision: HarnessVisionAnalyzer,
    vision: SeeCompatibleVisionAnalyzer,
    options: VisionBridgeOptions
  ) {
    super()
    this.#deepseek = deepseek
    this.#attachments = attachments
    this.#harnessVision = harnessVision
    this.#vision = vision
    this.#maxImages = options.maxImages
    this.#cacheEntries = options.cacheEntries
    this.#routingKey = options.routingKey
  }

  providerInfo(provider: string): LlmProviderInfo {
    return this.#deepseek.providerInfo(provider)
  }

  providerRetryPolicy(provider: string): ResolvedRetryPolicy | undefined {
    return this.#deepseek.providerRetryPolicy(provider)
  }

  async listModels(provider: string): Promise<readonly LlmModelInfo[]> {
    return (await this.#deepseek.listModels(provider)).map(withImageInput)
  }

  async resolveModel(
    provider: string,
    model: string,
    signal?: AbortSignal
  ): Promise<LlmResolvedModelInfo> {
    const resolved = await this.#deepseek.resolveModel(provider, model, signal)
    return { ...resolved, inputModalities: IMAGE_INPUT }
  }

  async *stream(options: GenerateOptions): AsyncIterable<StreamChunk> {
    const refs = collectImageRefs(options.messages)
    if (refs.length === 0) {
      yield* this.#deepseek.stream(options)
      return
    }
    const native = await this.#deepseek.resolveModel(
      options.provider,
      options.model,
      options.signal
    )
    if (native.inputModalities?.includes("image") === true) {
      yield* this.#deepseek.stream(options)
      return
    }
    const maxImages = this.#maxImages()
    if (refs.length > maxImages) {
      throw new LlmError(
        `本次请求包含 ${refs.length} 张图片，视觉桥接上限为 ${maxImages} 张`,
        "VISION_IMAGE_LIMIT"
      )
    }

    const task = latestUserTask(options.messages, refs.length)
    const key = [
      this.#routingKey(),
      refs.map((ref) => String(ref.attachmentId)).join(","),
      task,
    ].join("\u0000")
    let pending = this.#cache.get(key)
    if (pending === undefined) {
      pending = Promise.all(
        refs.map((ref) => this.#attachments.readImage(ref, options.signal))
      ).then(async (images) => {
        try {
          return await this.#vision.analyzeConfigured(
            images,
            task,
            options.signal
          )
        } catch (configuredError) {
          try {
            return await this.#harnessVision.analyze(refs, task, options.signal)
          } catch (harnessError) {
            try {
              return await this.#vision.analyze(images, task, options.signal)
            } catch (fallbackError) {
              const message = (error: unknown): string =>
                error instanceof Error ? error.message : String(error)
              throw new LlmError(
                [
                  "没有可用的视觉后端。",
                  `插件平台：${message(configuredError)}`,
                  `Harness 模型：${message(harnessError)}`,
                  `see 与本地降级：${message(fallbackError)}`,
                  "请在设置 → 插件 → 视觉识别中选择平台并保存 API Key。",
                ].join(" "),
                "MISSING_VISION_MODEL",
                { cause: fallbackError }
              )
            }
          }
        }
      })
      this.#cache.set(key, pending)
      if (this.#cache.size > this.#cacheEntries()) {
        const oldest = this.#cache.keys().next().value
        if (oldest !== undefined) this.#cache.delete(oldest)
      }
    }

    let analysis: VisionAnalysis
    try {
      analysis = await pending
    } catch (error) {
      this.#cache.delete(key)
      if (options.signal?.aborted) {
        throw new LlmError("视觉识别已取消", "ABORTED", { cause: error })
      }
      throw new LlmError(
        "图片已接收，但视觉识别服务暂时不可用",
        "VISION_UNAVAILABLE",
        {
          cause: error,
        }
      )
    }

    const delegated: GenerateOptions = {
      ...options,
      messages: withoutImages(options.messages, refs),
      system: appendVisionContext(
        options.system,
        analysis.text,
        task,
        refs.length
      ),
    }
    yield* this.#deepseek.stream(delegated)
  }
}
