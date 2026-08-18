# DeepSeek Harness — macOS 桌面版

把 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`@deepseek-ai/dsh`）封装成原生 macOS 桌面应用。壳使用系统 **WKWebView**（不是 Electron），后端打包精简后的 **Node.js 运行时 + 精简 node_modules**，因此体积远小于 Electron 方案。

## 产物

`./build.sh` 会产出 `dist/DeepSeekHarness.app`，双击即可运行（本地临时签名）。

| 组成 | 大小 | 说明 |
|---|---|---|
| `node` 运行时 | ~85 MB | 本地 Node 用 `strip -x` 去掉调试/本地符号（保留原生 addon 需要的导出符号） |
| `node_modules` | ~94 MB | 生产依赖再精简（见下） |
| Swift 壳 | ~0.1 MB | AppKit + WKWebView 单文件 |
| **合计** | **~180 MB** | 对比：Electron 方案通常 200 MB 起，且不含后端依赖 |

## 目录结构

```
desktop/
├── App/
│   ├── main.swift          # 原生 WKWebView 壳：起后端、读 DSH_READY、加载页面、随退出清理
│   ├── Info.plist          # 应用清单（含 ATS 本地网络豁免）
│   ├── make_icon.swift     # 图标生成（可选）
│   └── icon.icns           # 已生成的图标
├── launcher.mjs            # 后端监督进程：spawn dsh web，确认就绪后输出 DSH_READY=<url>
├── prune.patch.yml         # 禁用被裁剪掉的插件行（llm-pi-ai、telemetry）
├── git.patch.yml           # 注册内置 Git 插件
├── billing.patch.yml       # 注册内置余额/消费插件
├── updater.patch.yml       # 注册内置版本号/检查更新插件
├── image-input.patch.yml   # 注册内置图片转文字插件
├── prune.sh                # node_modules 精简脚本
├── build.sh                # 一键构建
├── plugins/                # 内置插件源码（构建时拷入后端 node_modules）
└── package.json            # 仅声明依赖 @deepseek-ai/dsh
```

## 构建

依赖：macOS + Xcode 命令行工具（`swiftc`/`codesign`）+ Node.js（用于打包运行时与装依赖）。

```bash
cd desktop
./build.sh
# 或：保留 Pi.ai 多供应商 SDK（体积 +~110 MB）
KEEP_EXTRA_PROVIDERS=1 ./build.sh
```

首次构建会 `npm install --omit=dev` 安装 `@deepseek-ai/dsh` 的生产依赖。

## 体积是怎么省出来的

1. **原生 WKWebView 壳**：复用系统 WebKit，不打包 Chromium（省 ~150 MB）。
2. **精简 node_modules**（`prune.sh`，默认从 ~307 MB → ~94 MB）：
   - 去掉 Pi.ai 多供应商 SDK 栈（`@earendil-works/pi-ai` 及其拖入的
     `@mistralai`/`@google`/`@anthropic-ai`/`@aws-sdk`/`@opentelemetry`/`openai`，约 110 MB），
     通过 `prune.patch.yml` 把 `llm-pi-ai` 行置为 `disabled`；默认模型仍是
     `deepseek-official`（`deepseek-v4-flash`）。
   - 去掉 session 遥测（`@opentelemetry`，默认即关闭）。
   - 去掉非 darwin-arm64 原生二进制（node-pty 的 win32/linux/x64 预编译、sharp-wasm32）。
   - 去掉 `.ts`/`.d.ts`/`.map`/第三方 `.md`/LICENSE/test/examples/CI 目录等非运行文件。
3. **Node 运行时 `strip -x`**：去掉本地符号表（~21 MB），保留原生 addon（sharp、koffi、
   node-pty、better-sqlite3）链接所需的导出符号。注意不能用完整 `strip`，否则 addon
   dlopen 时找不到符号而段错误。

> 需要 Pi.ai / Mistral / Google / Anthropic / AWS Bedrock / OpenAI 等多供应商能力时，
> 用 `KEEP_EXTRA_PROVIDERS=1 ./build.sh` 构建全量版（约 290 MB）。

## 工作原理

1. 应用启动后，Swift 壳用 `Process` 拉起 `Contents/Resources/backend/node launcher.mjs`。
2. `launcher.mjs` 启动 `dsh web --patch prune.patch.yml --host 127.0.0.1 --port 0`，
   轮询确认前端可访问后，向 stdout 打一行 `DSH_READY=http://127.0.0.1:<port>`。
3. 壳读到 `DSH_READY` 后把该地址加载进 `WKWebView`。
4. 用户数据（配置、凭据、会话、profile）仍落在 `~/.dsh`，与命令行 `dsh` 共享。
5. 退出应用时，壳向 launcher 发 `SIGTERM`，launcher 转发给 `dsh web` 完成优雅退出。

后端只监听 `127.0.0.1` 的随机端口，避免端口冲突与暴露到局域网。

## 版本号与检查更新

应用在**窗口右上角**常驻显示当前 DeepSeek Harness 版本号（`@deepseek-ai/dsh` 包版本，
如 `v0.1.0-rc.6`）。「设置 → 检查更新」里可以：

- **检查更新**：对比 npm registry 上 `@deepseek-ai/dsh` 的最新版本；
- **立即更新**：后台下载最新闭包（dsh 及其全部 `@deepseek-ai/*` 依赖）并原子替换进
  应用包内的 `node_modules`，完成后自动重启应用（重启前会重新签名，保证 arm64
  上的 ad-hoc 签名仍然有效）。

实现是内置插件（与 git/billing 同模式）：

| 文件 | 作用 |
|---|---|
| `plugins/dsh-updater/` | 宿主半部：`/updater` JSON API（version / check / update / status） |
| `plugins/dsh-client-ui-updater/` | 浏览器半部：右上角版本徽标 + 设置里的「检查更新」区块 |
| `updater.patch.yml` | 注册这两个插件（launcher 启动时经 `--patch` 传入） |

## 图片转文字输入

内置了第三方插件 **dsh-plugin-image-input**（npm 包，见其
[GitHub 仓库](https://github.com/Elohia/dsh-plugin-image-input)），给纯文本 LLM
（DeepSeek 等无视觉模型）提供图片输入接管：

- 在输入框里照常**粘贴 / 拖拽图片**，按 Enter 或点发送时，插件会自动把图片转成
  结构化文字描述一起发出（当前模型**支持**图片时完全放行，走原生通道）。
- 也可先点输入框左侧的 **🖼️ 图片转文字** 按钮，只把描述插入输入框。
- 设置页新增「**图片转文字**」分节：填 `baseUrl` / `model` / `apiKey` / `maxTokens`
  （任意 OpenAI 兼容视觉端点，如 qwen-vl / gpt-4o / glm-4v），保存即生效，
  配置存于 `~/.config/mm-vision/config.json`。

| 文件 | 作用 |
|---|---|
| `plugins/dsh-plugin-image-input/` | 插件源码（宿主半：`/plugins/mmv/*` 路由；浏览器半：发送接管 + 按钮 + 设置表单） |
| `image-input.patch.yml` | 注册该插件（launcher 经 `--patch` 传入） |

launcher 还会把后端目录（含内置 `node` 二进制）放在 `PATH` 最前，确保插件跑视觉
子进程时用的是应用自带的 Node，而非可能损坏的系统 Node。
