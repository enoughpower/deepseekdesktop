import { execFile as execFileCallback } from "node:child_process"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"

import type { StoredImageAttachment } from "@deepseek-ai/dsh-attachment"

import type { VisionAnalysis } from "./vision.js"

const execFile = promisify(execFileCallback)

const MACOS_VISION = String.raw`
ObjC.import("CoreGraphics");
ObjC.import("Foundation");
ObjC.import("ImageIO");
ObjC.import("Vision");
function unwrap(value) { return ObjC.unwrap(value); }
function run(argv) {
  const path = argv[0];
  const url = $.NSURL.fileURLWithPath(path);
  const source = $.CGImageSourceCreateWithURL(url, null);
  if (!source) throw new Error("Cannot decode image: " + path);
  const image = $.CGImageSourceCreateImageAtIndex(source, 0, null);
  const request = $.VNRecognizeTextRequest.alloc.init;
  request.recognitionLevel = 0;
  request.usesLanguageCorrection = true;
  if (request.respondsToSelector("supportedRecognitionLanguagesAndReturnError:")) {
    const languageError = Ref();
    const supported = request.supportedRecognitionLanguagesAndReturnError(languageError);
    const preferred = ["zh-Hans", "zh-Hant", "en-US"];
    const selected = [];
    for (let index = 0; index < preferred.length; index += 1) {
      if (supported.containsObject($(preferred[index]))) selected.push(preferred[index]);
    }
    if (selected.length > 0) request.recognitionLanguages = $(selected);
  }
  const handler = $.VNImageRequestHandler.alloc.initWithURLOptions(url, $.NSDictionary.dictionary);
  const error = Ref();
  if (!handler.performRequestsError($.NSArray.arrayWithObject(request), error)) {
    const detail = error[0] ? unwrap(error[0].localizedDescription) : "unknown error";
    throw new Error("Vision OCR failed: " + detail);
  }
  const items = [];
  const results = request.results;
  for (let index = 0; index < Number(results.count); index += 1) {
    const candidates = results.objectAtIndex(index).topCandidates(1);
    if (Number(candidates.count) > 0) items.push(unwrap(candidates.objectAtIndex(0).string));
  }
  return JSON.stringify({
    backend: "macos-vision",
    width: Number($.CGImageGetWidth(image)),
    height: Number($.CGImageGetHeight(image)),
    items: items
  });
}`

interface LocalResult {
  readonly backend: string
  readonly width?: number
  readonly height?: number
  readonly items: readonly string[]
}

function extension(mediaType: string): string {
  const subtype = mediaType.split("/")[1]?.split("+")[0]
  if (subtype === "jpeg") return "jpg"
  return subtype === undefined || subtype === "" ? "png" : subtype
}

async function macos(path: string): Promise<LocalResult> {
  const { stdout } = await execFile(
    "osascript",
    ["-l", "JavaScript", "-e", MACOS_VISION, path],
    { timeout: 180000, maxBuffer: 16 * 1024 * 1024 }
  )
  return JSON.parse(stdout) as LocalResult
}

async function tesseractLanguages(): Promise<string> {
  const { stdout } = await execFile("tesseract", ["--list-langs"], {
    timeout: 30000,
  })
  const available = new Set(
    stdout
      .split(/\r?\n/u)
      .map((line) => line.trim())
      .filter((line) => line !== "" && !line.startsWith("List of available"))
  )
  const preferred = ["chi_sim", "chi_tra", "eng"].filter((language) =>
    available.has(language)
  )
  const first = available.values().next().value as string | undefined
  const languages = preferred.length > 0 ? preferred : first === undefined ? [] : [first]
  if (languages.length === 0) throw new Error("Tesseract 没有语言数据")
  return languages.join("+")
}

async function tesseract(path: string): Promise<LocalResult> {
  const languages = await tesseractLanguages()
  const { stdout } = await execFile(
    "tesseract",
    [path, "stdout", "-l", languages],
    { timeout: 180000, maxBuffer: 16 * 1024 * 1024 }
  )
  return {
    backend: `tesseract:${languages}`,
    items: stdout.trim() === "" ? [] : stdout.trim().split(/\r?\n/u),
  }
}

async function analyzeFile(path: string): Promise<LocalResult> {
  const failures: string[] = []
  if (process.platform === "darwin") {
    try {
      return await macos(path)
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error))
    }
  }
  try {
    return await tesseract(path)
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error))
  }
  const setup =
    process.platform === "darwin"
      ? "请使用 macOS 10.15 或更高版本"
      : "请安装 Tesseract 与所需语言包"
  throw new Error(`本地视觉不可用：${failures.join("；")}。${setup}`)
}

/** Image-only fallback modeled after see-skill's system Vision → Tesseract path. */
export async function analyzeLocally(
  images: readonly StoredImageAttachment[]
): Promise<VisionAnalysis> {
  const root = await mkdtemp(join(tmpdir(), "dsh-vision-"))
  try {
    const paths = await Promise.all(
      images.map(async (image, index) => {
        const path = join(root, `image-${index + 1}.${extension(image.ref.mediaType)}`)
        await writeFile(path, image.data)
        return path
      })
    )
    const results = await Promise.all(paths.map(analyzeFile))
    const text = results
      .map((result, index) => {
        const size =
          result.width === undefined || result.height === undefined
            ? ""
            : `（${result.width} × ${result.height}）`
        const body = result.items.join("\n").trim() || "未识别到文字"
        return [
          `图片 ${index + 1}${size}：`,
          "当前本地后端主要提供文字识别，不等同于完整语义理解。",
          body,
        ].join("\n")
      })
      .join("\n\n")
    return {
      text,
      provider: "local",
      model: [...new Set(results.map((result) => result.backend))].join(","),
    }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}
