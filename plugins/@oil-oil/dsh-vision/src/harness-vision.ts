import {
  LlmError,
  createUserMessage,
  type LlmRuntime,
} from "@deepseek-ai/dsh-llm"
import type { ImageAttachmentRef } from "@deepseek-ai/dsh-attachment"

import type { VisionAnalysis } from "./vision.js"

export interface VisionSelection {
  readonly provider?: string
  readonly model?: string
}

interface VisionRoute {
  readonly provider: string
  readonly providerName: string
  readonly model: string
  readonly modelName: string
}

const SYSTEM_PROMPT =
  "直接观察图片并回答用户的问题。综合理解整个画面、对象、空间关系、界面状态和可见文字，" +
  "不要只做文字识别。不要编造；看不清或不确定时明确说明。根据用户的问题自然组织回答。"

function supportsImage(input: readonly string[] | undefined): boolean {
  return input?.includes("image") === true
}

function terminalError(reason: {
  readonly kind: string
  readonly failure?: { readonly message: string; readonly code: string }
}): LlmError {
  return new LlmError(
    reason.failure?.message ?? `视觉模型异常结束：${reason.kind}`,
    reason.failure?.code ?? "VISION_UNAVAILABLE"
  )
}

/**
 * Sends original Harness attachment references to configured image models.
 * The pinned route is primary. Other configured routes are failover only.
 */
export class HarnessVisionAnalyzer {
  readonly #llm: LlmRuntime
  readonly #selection: () => VisionSelection

  constructor(llm: LlmRuntime, selection: () => VisionSelection) {
    this.#llm = llm
    this.#selection = selection
  }

  async #routes(signal?: AbortSignal): Promise<VisionRoute[]> {
    const selection = this.#selection()
    const hasProvider = selection.provider !== undefined && selection.provider !== ""
    const hasModel = selection.model !== undefined && selection.model !== ""
    if (hasProvider !== hasModel) {
      throw new LlmError(
        "visionProvider 与 visionModel 必须同时配置",
        "INVALID_VISION_ROUTE"
      )
    }
    let pinned: VisionRoute | undefined
    if (hasProvider && hasModel) {
      const provider = selection.provider as string
      const model = selection.model as string
      if (provider === "deepseek-official") {
        throw new LlmError(
          "外部视觉模型不能使用 deepseek-official",
          "INVALID_VISION_ROUTE"
        )
      }
      const info = await this.#llm.resolveModelInfo(provider, model, signal)
      if (!supportsImage(info.inputModalities)) {
        throw new LlmError(
          `${provider}/${model} 没有声明图片输入能力`,
          "UNSUPPORTED_VISION_MODEL"
        )
      }
      const providerName =
        this.#llm.listProviders().find((entry) => entry.id === provider)?.name ??
        provider
      pinned = {
        provider,
        providerName,
        model,
        modelName: info.name,
      }
    }

    const routes: VisionRoute[] = []
    for (const provider of this.#llm.listProviders()) {
      if (provider.id === "deepseek-official") continue
      let models
      try {
        models = await this.#llm.listModels(provider.id)
      } catch {
        continue
      }
      const model = models.find((candidate) =>
        supportsImage(candidate.inputModalities)
      )
      if (model !== undefined) {
        routes.push({
          provider: provider.id,
          providerName: provider.name,
          model: model.id,
          modelName: model.name,
        })
      }
    }
    if (pinned === undefined) return routes
    return [
      pinned,
      ...routes.filter(
        (route) =>
          route.provider !== pinned.provider || route.model !== pinned.model
      ),
    ]
  }

  async #call(
    route: VisionRoute,
    images: readonly ImageAttachmentRef[],
    task: string,
    signal?: AbortSignal
  ): Promise<string> {
    const message = createUserMessage({
      source: { kind: "plugin", plugin: "dsh-vision" },
      content: [
        { type: "text", text: task },
        ...images.map((attachment) => ({ type: "image" as const, attachment })),
      ],
    })
    let output = ""
    for await (const chunk of this.#llm.stream({
      provider: route.provider,
      model: route.model,
      messages: [message],
      system: SYSTEM_PROMPT,
      ...(signal === undefined ? {} : { signal }),
    })) {
      if (chunk.type === "text-delta") output += chunk.text
      if (
        chunk.type === "finish" &&
        (chunk.reason.kind === "error" || chunk.reason.kind === "aborted")
      ) {
        throw terminalError(chunk.reason)
      }
    }
    if (output.trim() === "") {
      throw new LlmError("视觉模型返回了空结果", "EMPTY_VISION_RESPONSE")
    }
    return output.trim()
  }

  async analyze(
    images: readonly ImageAttachmentRef[],
    task: string,
    signal?: AbortSignal
  ): Promise<VisionAnalysis> {
    const routes = await this.#routes(signal)
    if (routes.length === 0) {
      throw new LlmError(
        "Harness 中没有已配置的视觉模型",
        "MISSING_VISION_MODEL"
      )
    }
    const failures: string[] = []
    for (const route of routes) {
      try {
        return {
          text: await this.#call(route, images, task, signal),
          provider: route.providerName,
          model: route.modelName,
        }
      } catch (error) {
        if (signal?.aborted) throw error
        const message = error instanceof Error ? error.message : String(error)
        failures.push(`${route.provider}/${route.model}: ${message}`)
      }
    }
    throw new LlmError(
      `Harness 视觉路由全部失败：${failures.join("；")}`,
      "VISION_UNAVAILABLE"
    )
  }
}
