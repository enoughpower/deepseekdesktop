import { GenerateOptions, LlmAdapter, LlmModelInfo, LlmProviderInfo, LlmResolvedModelInfo, LlmRuntime, ResolvedRetryPolicy, StreamChunk } from "@deepseek-ai/dsh-llm";
import { Config as Config$1, DeepSeekAdapter } from "@deepseek-ai/dsh-llm-deepseek";
import z from "@deepseek-ai/schemastery";
import { Context } from "@deepseek-ai/cordis";
import { AttachmentStore, ImageAttachmentRef, StoredImageAttachment } from "@deepseek-ai/dsh-attachment";
//#region src/provider-catalog.d.ts
/** Provider defaults kept in sync with oil-oil/see-skill. */
declare const VISION_PROVIDERS: {
  readonly zenmux: {
    readonly displayName: "ZenMux";
    readonly baseURL: "https://zenmux.ai/api/v1";
    readonly model: "qwen/qwen3.7-plus";
    readonly credentialRefs: readonly ["ZENMUX_API_KEY"];
  };
  readonly bailian: {
    readonly displayName: "百炼";
    readonly baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1";
    readonly model: "qwen3.7-plus";
    readonly credentialRefs: readonly ["DASHSCOPE_API_KEY", "BAILIAN_API_KEY"];
  };
  readonly tokendance: {
    readonly displayName: "TokenDance";
    readonly baseURL: "https://tokendance.space/gateway/v1";
    readonly model: "qwen3.7-plus";
    readonly credentialRefs: readonly ["TOKENDANCE_API_KEY"];
  };
  readonly openrouter: {
    readonly displayName: "OpenRouter";
    readonly baseURL: "https://openrouter.ai/api/v1";
    readonly model: "qwen/qwen3.7-plus";
    readonly credentialRefs: readonly ["OPENROUTER_API_KEY"];
  };
};
type VisionProviderName = keyof typeof VISION_PROVIDERS;
//#endregion
//#region src/see-config.d.ts
type SeeProviderName = VisionProviderName;
interface SeeProvider {
  readonly name: SeeProviderName;
  readonly apiKey: string;
  readonly baseURL: string;
  readonly model: string;
}
declare function loadSeeProviders(configFile?: string): Promise<SeeProvider[]>;
//#endregion
//#region src/vision.d.ts
interface VisionAnalysis {
  readonly text: string;
  readonly provider: string;
  readonly model: string;
}
interface VisionAnalyzerOptions {
  readonly configFile?: string | (() => string | undefined);
  readonly timeoutMs: number | (() => number);
  readonly configuredProvider?: () => Promise<ConfiguredVisionProvider | undefined>;
}
interface ConfiguredVisionProvider {
  readonly name: SeeProviderName;
  readonly apiKey?: string;
  readonly baseURL: string;
  readonly model: string;
}
declare class SeeCompatibleVisionAnalyzer {
  #private;
  constructor(options: VisionAnalyzerOptions);
  /** Try only the provider explicitly selected in the plugin settings. */
  analyzeConfigured(images: readonly StoredImageAttachment[], task: string, signal?: AbortSignal): Promise<VisionAnalysis>;
  /** Try see-compatible providers not already selected, then local OCR. */
  analyze(images: readonly StoredImageAttachment[], task: string, signal?: AbortSignal): Promise<VisionAnalysis>;
}
//#endregion
//#region src/harness-vision.d.ts
interface VisionSelection {
  readonly provider?: string;
  readonly model?: string;
}
/**
 * Sends original Harness attachment references to configured image models.
 * The pinned route is primary. Other configured routes are failover only.
 */
declare class HarnessVisionAnalyzer {
  #private;
  constructor(llm: LlmRuntime, selection: () => VisionSelection);
  analyze(images: readonly ImageAttachmentRef[], task: string, signal?: AbortSignal): Promise<VisionAnalysis>;
}
//#endregion
//#region src/adapter.d.ts
interface VisionBridgeOptions {
  readonly maxImages: () => number;
  readonly cacheEntries: () => number;
  readonly routingKey: () => string;
}
declare class VisionBridgeAdapter extends LlmAdapter {
  #private;
  constructor(deepseek: DeepSeekAdapter, attachments: AttachmentStore, harnessVision: HarnessVisionAnalyzer, vision: SeeCompatibleVisionAnalyzer, options: VisionBridgeOptions);
  providerInfo(provider: string): LlmProviderInfo;
  providerRetryPolicy(provider: string): ResolvedRetryPolicy | undefined;
  listModels(provider: string): Promise<readonly LlmModelInfo[]>;
  resolveModel(provider: string, model: string, signal?: AbortSignal): Promise<LlmResolvedModelInfo>;
  stream(options: GenerateOptions): AsyncIterable<StreamChunk>;
}
//#endregion
//#region src/local-vision.d.ts
/** Image-only fallback modeled after see-skill's system Vision → Tesseract path. */
declare function analyzeLocally(images: readonly StoredImageAttachment[]): Promise<VisionAnalysis>;
//#endregion
//#region src/index.d.ts
declare const name = "dsh-vision";
declare const inject: string[];
interface VisionConfig {
  /** Provider managed by the Vision Recognition settings card. */
  visionBackend?: string;
  visionBackendModel?: string;
  visionBackendBaseURL?: string;
  /** Pin one Harness vision route. Omit both fields for automatic routing. */
  visionProvider?: string;
  visionModel?: string;
  /** Optional compatibility with ~/.config/see/config.env. */
  visionConfigFile?: string;
  visionTimeoutMs?: number;
  maxImages?: number;
  cacheEntries?: number;
}
interface Config extends Config$1, VisionConfig {}
declare const VisionConfig: z<VisionConfig>;
declare const Config: z<Config>;
declare function apply(ctx: Context, config: Config): void;
//#endregion
export { Config, HarnessVisionAnalyzer, SeeCompatibleVisionAnalyzer, VisionBridgeAdapter, VisionConfig, analyzeLocally, apply, inject, loadSeeProviders, name };