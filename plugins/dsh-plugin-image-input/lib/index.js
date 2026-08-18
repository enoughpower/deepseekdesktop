/**
 * dsh-plugin-image-input — host half（零外部依赖，仅 node 内置模块）
 * ==================================================================
 * 图片转文字输入插件：给无视觉能力的纯文本 LLM（DeepSeek 等）提供图片输入接管。
 *
 * - 视觉配置存于 ~/.config/mm-vision/config.json（与 mm-vision 生态同路径），
 *   设置页表单读写它；任何 OpenAI 兼容视觉 API 都可用。
 * - 本地路由（页面同源调用，Origin 校验防滥用）：
 *     GET  /plugins/mmv/capability  → 当前模型是否支持图片
 *     GET  /plugins/mmv/config      → 读取视觉配置（设置页回显）
 *     POST /plugins/mmv/config      → 保存视觉配置（写配置文件）
 *     POST /plugins/mmv/analyze     → base64 图片 → 结构化文字描述
 * - 视觉调用在 node 子进程中完成（shell 服务），配置优先级：
 *   配置文件 > 环境变量 > 内置默认。
 */
import { homedir } from 'node:os'
import path from 'node:path'
import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs'

export const name = 'image-input'
export const inject = ['webServer', 'shell']

const MAX_BODY = 12 * 1024 * 1024

/** 调试日志（定位 analyze 失败时用；可经 MMV_DEBUG_LOG 覆盖路径，空则关闭）。 */
const DEBUG_LOG = process.env.MMV_DEBUG_LOG || 'D:/dsh/mmv-debug.log'
function debugLog(msg) {
  if (!DEBUG_LOG) return
  try {
    appendFileSync(DEBUG_LOG, new Date().toISOString() + ' ' + msg + '\n')
  } catch (e) { /* 忽略 */ }
}

/** 兼容新旧 shell.run 输出：字符串直接返回，对象（{ text, truncated, spillPath? }）取 .text 字段。 */
function pickText(v) {
  if (typeof v === 'string') return v
  if (v && typeof v.text === 'string') return v.text
  return ''
}

const DEFAULTS = {
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  model: 'qwen-vl-max',
  apiKey: '',
  maxTokens: 2048,
}

function configPath() {
  return path.join(homedir(), '.config', 'mm-vision', 'config.json')
}

/** 读视觉配置：配置文件（缺字段用默认值）。 */
function loadConfig() {
  const cfg = { ...DEFAULTS }
  try {
    if (existsSync(configPath())) {
      Object.assign(cfg, JSON.parse(readFileSync(configPath(), 'utf8')))
    }
  } catch (e) { /* 忽略损坏配置 */ }
  return cfg
}

/** 写视觉配置（含目录创建）。apiKey 留空时保留原值（设置页"留空不变"语义）。 */
function saveConfig(next) {
  const prev = loadConfig()
  const clean = {
    baseUrl: typeof next.baseUrl === 'string' && next.baseUrl ? next.baseUrl : DEFAULTS.baseUrl,
    model: typeof next.model === 'string' && next.model ? next.model : DEFAULTS.model,
    apiKey: typeof next.apiKey === 'string' && next.apiKey ? next.apiKey : prev.apiKey,
    maxTokens: typeof next.maxTokens === 'number' && next.maxTokens > 0 ? next.maxTokens : DEFAULTS.maxTokens,
  }
  const file = configPath()
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(clean, null, 2), 'utf8')
  return clean
}

/**
 * 通用执行壳（STUB）：从 stdin 读 JSON { script, ... }，eval 脚本，
 * 脚本调用 finish() 输出 JSON 结果。进程保持到 finish（undici 的
 * 挂起请求不会阻止事件循环退出）。
 */
const STUB = [
  'const fs=require("fs")',
  'let raw=""',
  'process.stdin.on("data",(d)=>{raw+=d})',
  'process.stdin.on("end",()=>{',
  '  let j',
  '  try{j=JSON.parse(raw)}catch(e){finish({ok:false,error:"bad_input",text:String(e&&e.message||e)});return}',
  '  globalThis.__MMV__=j',
  '  try{eval(j.script)}catch(e){finish({ok:false,error:"script_error",text:String(e&&e.message||e)})}',
  '})',
  'function finish(out){try{clearInterval(keep)}catch(e){}try{process.stdout.write(JSON.stringify(out),function(){})}catch(e){}}',
  'const keep = setInterval(function(){}, 1000)',
].join('\n')

/**
 * 视觉分析脚本（VISION）：读配置（stdin 的 j.cfg 覆盖优先，
 * 其次 ~/.config/mm-vision/config.json，其次环境变量）→ 调 OpenAI
 * 兼容 /chat/completions → finish({ ok, text, model, mode })。
 */
const VISION = [
  '(async () => {',
  '  const j = globalThis.__MMV__',
  '  const os = require("os")',
  '  const path = require("path")',
  '  const fs = require("fs")',
  '  const home = os.homedir()',
  '  const cfg = { model: "qwen-vl-max", baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", maxTokens: 2048, apiKey: "" }',
  '  const cands = [process.env.MM_VISION_CONFIG || "", path.join(home, ".config", "mm-vision", "config.json"), path.join(home, ".mm-vision.json")].filter(Boolean)',
  '  for (const p of cands) { try { if (fs.existsSync(p)) { Object.assign(cfg, JSON.parse(fs.readFileSync(p, "utf8"))); break } } catch (e) {} }',
  '  cfg.apiKey = cfg.apiKey || [process.env.MM_VISION_API_KEY, process.env.DASHSCOPE_API_KEY, process.env.QWEN_API_KEY, process.env.OPENAI_API_KEY, process.env.GEMINI_API_KEY].find((k) => k) || ""',
  '  if (j.cfg) {',
  '    if (typeof j.cfg.model === "string" && j.cfg.model) cfg.model = j.cfg.model',
  '    if (typeof j.cfg.baseUrl === "string" && j.cfg.baseUrl) cfg.baseUrl = j.cfg.baseUrl',
  '    if (typeof j.cfg.apiKey === "string" && j.cfg.apiKey) cfg.apiKey = j.cfg.apiKey',
  '    if (typeof j.cfg.maxTokens === "number" && j.cfg.maxTokens > 0) cfg.maxTokens = j.cfg.maxTokens',
  '  }',
  '  if (!cfg.apiKey) return finish({ ok: false, error: "missing_api_key", text: "未配置视觉 API：请在 设置 → 图片转文字 里填写 API Key（或配置 ~/.config/mm-vision/config.json / 环境变量 MM_VISION_API_KEY）" })',
  '  const userText = j.prompt || ""',
  '  const mode = /(像素|重建|还原|扫描|色块|pixel|render|reconstruct)/i.test(userText) ? "pixel" : /(k线|K线|走势|图表|盘面|坐标|点位|曲线|分时|蜡烛|指标|截图|chart|kline|graph|plot)/i.test(userText) ? "coords" : "full"',
  '  const tails = {',
  '    pixel: "本次为像素级重建模式：把整张图片均匀划分为 40 列 x 30 行的网格（共 1200 格），逐格输出该格的平均主色。输出格式（严格）：【色块网格】标记后，每行 40 个色块、共 30 行，每格格式 R,G,B（0-255 逗号分隔），格间空格分隔。要求：1) 每格颜色=该格覆盖区域的平均视觉主色；2) 相邻格颜色必须平滑过渡（同区域内相邻格 RGB 差 ≤30），只有物体边界才允许跳变；3) 全部 1200 格必须输出完整，不要省略；4) 这是最重要要求：颜色必须与真实图片一致。",',
  '    coords: "本次为坐标优先模式：所有关键元素(曲线转折/标注/按钮/文字块)必须给出精确 (x%,y%) 坐标，这是最重要要求。",',
  '    full: "本次为完整模式：输出全部可识别元素。"',
  '  }',
  '  const sys = "你是“图像通感编码器”：把图片翻译成紧凑的结构化文字，让一个看不见图片的文本模型能据此重建空间认知。\\n输出要求（用列表/结构化格式，避免散文）：\\n1. 【画布】宽高比(如 16:9)、主背景色/整体色调\\n2. 【元素】每个视觉元素一行：[类型 | 位置(百分比 x%,y% 原点左上) | 尺寸(宽x高%) | 颜色 | 关键文本/数值]\\n3. 【关系】元素间空间关系：上下/左右/重叠/交叉/包含，只说有信息量的\\n4. 【图表专用】坐标轴范围、每个关键转折点(峰/谷/交叉)的 (x%,y%) 和数值、曲线形状(上升/下降/平台)、标注位置\\n5. 【自然图专用】主体(位置+特征)、前景/背景、光线方向、构图\\n6. 不确定的标注 [不确定]，不要编造。\\n坐标精确到 1%，数值精确到图片可见的最小单位。输出控制在 800 字内。\\n\\n" + tails[mode] + (userText ? "\\n用户附加要求：" + userText : "")',
  '  const body = JSON.stringify({ model: cfg.model, messages: [{ role: "user", content: [{ type: "text", text: sys }, { type: "image_url", image_url: { url: "data:" + (j.mediaType || "image/png") + ";base64," + j.b64 } }] }], max_tokens: cfg.maxTokens || 2048 })',
  '  const r = await fetch((cfg.baseUrl || "").replace(/\\/+$/, "") + "/chat/completions", { method: "POST", headers: { Authorization: "Bearer " + cfg.apiKey, "Content-Type": "application/json" }, body, signal: AbortSignal.timeout(240000) })',
  '  if (!r.ok) { const t = await r.text(); return finish({ ok: false, error: "http_" + r.status, text: "视觉模型调用失败 (" + r.status + "): " + t.slice(0, 300) }) }',
  '  const d = await r.json()',
  '  const x = d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content',
  '  finish({ ok: true, text: typeof x === "string" && x ? x : "（无输出）", model: cfg.model, mode })',
  '})().catch((e) => finish({ ok: false, error: "fetch_failed", text: "请求失败: " + String(e && e.message || e) }))',
].join('\n')

/** 只接受本机页面（127.0.0.1 / localhost）的请求，避免被任意网页滥用。 */
function allowedOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return true
  return /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(origin)
}

function json(res, status, data) {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  })
  res.end(body)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY) {
        reject(new Error('请求体过大'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

/** 当前模型是否支持图片输入。 */
async function modelCapability(ctx) {
  const adm = ctx.get('agentDefaultModel')
  const llm = ctx.get('llm')
  let provider = ''
  let model = ''
  let multimodal = false
  if (adm) {
    try {
      const sel = adm.currentSelection()
      if (sel) {
        provider = sel.provider || ''
        model = sel.model || ''
      }
    } catch (e) { /* 忽略 */ }
  }
  if (llm && provider && model) {
    try {
      const info = await llm.resolveModelInfo(provider, model)
      if (info && Array.isArray(info.inputModalities)) multimodal = info.inputModalities.includes('image')
    } catch (e) { /* 忽略 */ }
  }
  return { multimodal, provider, model }
}

/** base64 图片 → 视觉模型 → 结构化文字描述（node 子进程）。 */
async function analyzeImage(ctx, payload) {
  try {
    return await analyzeImageInner(ctx, payload)
  } catch (e) {
    debugLog('analyze: UNCAUGHT ' + String(e && e.stack || e))
    return { ok: false, error: 'uncaught', text: String(e && e.message || e) }
  }
}

async function analyzeImageInner(ctx, payload) {
  const shell = ctx.get('shell')
  if (!shell) return { ok: false, error: 'no_shell', text: 'shell 服务不可用，无法调用视觉模型' }
  // 以 danger-full-access 运行固定内容的 node 子进程：不依赖本机沙箱后端
  // （Windows ACL runner / Linux bubblewrap / macOS sandbox-exec），保证可移植。
  let policy
  try {
    const sp = ctx.get('sandboxPolicy')
    if (sp) policy = sp.resolve({ mode: 'danger-full-access' })
  } catch (e) {
    debugLog('analyze: policy resolve failed ' + String(e && e.message || e))
  }
  if (!policy) policy = { mode: 'danger-full-access', workspaceRoot: process.cwd() }
  const cfg = payload.cfg || {}
  const stdin = JSON.stringify({
    script: VISION,
    b64: String(payload.b64 || ''),
    mediaType: String(payload.mediaType || 'image/png'),
    prompt: String(payload.prompt || ''),
    cfg: {
      baseUrl: typeof cfg.baseUrl === 'string' ? cfg.baseUrl : '',
      model: typeof cfg.model === 'string' ? cfg.model : '',
      apiKey: typeof cfg.apiKey === 'string' ? cfg.apiKey : '',
      maxTokens: typeof cfg.maxTokens === 'number' ? cfg.maxTokens : 0,
    },
  })
  let spec
  try {
    spec = shell.resolve({
      command: "node -e '" + 'eval(Buffer.from(process.argv[1],"base64").toString())' + "' " + Buffer.from(STUB, 'utf8').toString('base64'),
      stdin,
      timeoutMs: 250000,
      stdoutMaxBytes: 8 * 1024 * 1024,
      sandboxPolicy: policy,
    })
  } catch (e) {
    debugLog('analyze: resolve_failed ' + String(e && e.stack || e))
    return { ok: false, error: 'resolve_failed', text: String(e && e.message || e) }
  }
  let result
  try {
    result = await shell.run(spec)
  } catch (e) {
    debugLog('analyze: run_failed ' + String(e && e.stack || e))
    return { ok: false, error: 'run_failed', text: String(e && e.message || e) }
  }
  const stdout = pickText(result && result.stdout).trim()
  debugLog('analyze: run exit=' + String(result && result.exitCode) + ' stdout=' + stdout.length + ' stderr=' + String(pickText(result && result.stderr).length))
  if (result && result.exitCode !== 0 && !stdout) {
    const stderr = pickText(result && result.stderr).trim().slice(0, 500)
    return { ok: false, error: 'exit_' + String(result.exitCode), text: stderr || '子进程退出码 ' + String(result.exitCode) }
  }
  try {
    const parsed = JSON.parse(stdout)
    debugLog('analyze: parsed ok=' + String(parsed.ok) + ' error=' + String(parsed.error))
    return parsed
  } catch (e) {
    debugLog('analyze: bad_output ' + stdout.slice(0, 300))
    return { ok: false, error: 'bad_output', text: stdout.slice(0, 500) || '无输出' }
  }
}

export function apply(ctx) {
  const webServer = ctx.get('webServer')
  if (webServer === undefined) return

  webServer.register({
    kind: 'exact',
    path: '/plugins/mmv/capability',
    handler: async (req, res) => {
      if (!allowedOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      try {
        json(res, 200, { ok: true, ...(await modelCapability(ctx)) })
      } catch (e) {
        json(res, 500, { ok: false, error: String(e && e.message || e) })
      }
    },
  })

  webServer.register({
    kind: 'exact',
    path: '/plugins/mmv/config',
    handler: async (req, res) => {
      if (!allowedOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method === 'GET') {
        const cfg = loadConfig()
        json(res, 200, { ok: true, config: { baseUrl: cfg.baseUrl, model: cfg.model, maxTokens: cfg.maxTokens, apiKeySet: !!cfg.apiKey } })
        return
      }
      if (req.method === 'POST') {
        let payload
        try {
          payload = JSON.parse(await readBody(req))
        } catch (e) {
          return json(res, 400, { ok: false, error: 'bad request: ' + String(e && e.message || e) })
        }
        const saved = saveConfig(payload || {})
        json(res, 200, { ok: true, config: { baseUrl: saved.baseUrl, model: saved.model, maxTokens: saved.maxTokens, apiKeySet: !!saved.apiKey }, file: configPath() })
        return
      }
      json(res, 405, { ok: false, error: 'method not allowed' })
    },
  })

  webServer.register({
    kind: 'exact',
    path: '/plugins/mmv/analyze',
    handler: async (req, res) => {
      if (!allowedOrigin(req)) return json(res, 403, { ok: false, error: 'forbidden' })
      if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method not allowed' })
      let payload
      try {
        payload = JSON.parse(await readBody(req))
      } catch (e) {
        debugLog('analyze: bad request ' + String(e && e.message || e))
        return json(res, 400, { ok: false, error: 'bad request: ' + String(e && e.message || e) })
      }
      const b64 = String(payload.b64 || '')
      if (!b64) return json(res, 400, { ok: false, error: 'missing image data' })
      try {
        const result = await analyzeImage(ctx, { ...payload, cfg: loadConfig() })
        json(res, 200, result)
      } catch (e) {
        debugLog('analyze: handler error ' + String(e && e.stack || e))
        json(res, 500, { ok: false, error: String(e && e.message || e) })
      }
    },
  })
}
