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
├── desktop-bin.mjs         # node/pnpm 运行时 shim 生成器（方案 C）
├── plugins.mjs             # 用户级插件 CLI：add/remove/list（方案 C）
├── add-plugin.sh           # 一键装内置插件 / --runtime 走用户级安装
├── prune.patch.yml         # 禁用被裁剪掉的插件行（llm-pi-ai、telemetry）
├── git.patch.yml           # 注册内置 Git 插件
├── billing.patch.yml       # 注册内置费用插件 dsh-cost-meter
├── updater.patch.yml       # 注册内置版本号/检查更新插件
├── skills-hub.patch.yml   # 注册内置全局技能库插件 dsh-skills
├── mcp-settings.patch.yml  # 注册内置 MCP 服务管理插件
├── vision.patch.yml        # 注册识图插件 dsh-vision-router v1.7.6（不接管 llm-deepseek）
├── theme-blackgold.patch.yml # 注册黑金主题插件（@frostgao/dsh-theme-blackgold）
├── prune.sh                # node_modules 精简脚本
├── build.sh                # 一键构建
├── plugins/                # 内置插件源码（构建时拷入后端 node_modules）
└── package.json            # 仅声明依赖 @deepseek-ai/dsh
```

## 构建

依赖：macOS + Xcode 命令行工具（`swiftc`/`codesign`）+ Node.js（用于打包运行时与装依赖）。

```bash
cd desktop
./build.sh                          # 默认：完整多供应商版（包含 Pi.ai / Mistral / Anthropic / Google / AWS Bedrock / OpenAI 等全部 SDK）
KEEP_EXTRA_PROVIDERS=0 ./build.sh   # 最小版：仅 DeepSeek，约小 110 MB
```

首次构建会 `npm install --omit=dev` 安装 `@deepseek-ai/dsh` 的生产依赖。

> `build.sh` 默认 `export KEEP_EXTRA_PROVIDERS=1`（保留多供应商 SDK 与 `llm-pi-ai` 行启用）。
> 设 `KEEP_EXTRA_PROVIDERS=0` 走精简路径：`prune.sh` 会删除 Pi.ai 相关 SDK，`prune.patch.yml` 把 `llm-pi-ai` 行置为 `disabled`。

## 体积是怎么省出来的（仅 KEEP_EXTRA_PROVIDERS=0 时）

1. **原生 WKWebView 壳**：复用系统 WebKit，不打包 Chromium（省 ~150 MB）。
2. **精简 node_modules**（`prune.sh`，仅最小构建时从 ~307 MB → ~94 MB）：
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

> 默认 `./build.sh` 产物约 290 MB，包含全部多供应商 SDK；构建后在 设置 → 模型 → **添加提供方**
> 里可启用 amazon-bedrock / anthropic / google / google-vertex / mistral / openai / openrouter /
> xai / groq / nvidia 等 30+ 提供方（llm-pi-ai 插件按需休眠加载，配置 provider 即可激活）。

## 工作原理

1. 应用启动后，Swift 壳用 `Process` 拉起 `Contents/Resources/backend/node launcher.mjs`。
2. `launcher.mjs` 先把应用的用户数据目录定为专用的 `DSH_HOME`
   （固定为 `~/Library/Application Support/DeepSeekHarness`；壳层在拉起后端时会**剥离
   环境里继承的 `DSH_HOME`**，确保应用始终使用专属 home，与命令行 `dsh` 的 `~/.dsh`
   完全隔离；直接运行 `launcher.mjs` 时仍可用 `DSH_HOME` 环境变量覆盖），
   并把内置插件在 `profiles/node_modules` 里建好软链，然后启动
   `dsh web --patch <各 overlay>.patch.yml --host 127.0.0.1 --port 0`，
   轮询确认前端可访问后，向 stdout 打一行 `DSH_READY=http://127.0.0.1:<port>`。
3. 壳读到 `DSH_READY` 后把该地址加载进 `WKWebView`。
4. 用户数据（配置、凭据、会话、profile、插件、技能）落在**独立的** `DSH_HOME`，
   与命令行 `dsh` 的 `~/.dsh` 完全隔离，互不干扰。
5. 退出应用时，壳向 launcher 发 `SIGTERM`，launcher 转发给 `dsh web` 完成优雅退出。

后端只监听 `127.0.0.1` 的随机端口，避免端口冲突与暴露到局域网。

## 版本号与检查更新

应用在**窗口右上角**常驻显示当前 DeepSeek Harness 版本号（`@deepseek-ai/dsh` 包版本，
如 `v0.1.1-rc.2`）。「设置 → 检查更新」里可以：

- **检查更新**：对比 npm registry 上 `@deepseek-ai/dsh` 的最新版本；
- **立即更新**：后台下载最新闭包（dsh 及其全部 `@deepseek-ai/*` 依赖）并原子替换进
  应用包内的 `node_modules`，完成后自动重启应用（重启前会重新签名，保证 arm64
  上的 ad-hoc 签名仍然有效）。

实现是内置插件（与 git 同模式）：

| 文件 | 作用 |
|---|---|
| `plugins/dsh-updater/` | 宿主半部：`/updater` JSON API（version / check / update / status） |
| `plugins/dsh-client-ui-updater/` | 浏览器半部：右上角版本徽标 + 设置里的「检查更新」区块 |
| `updater.patch.yml` | 注册这两个插件（launcher 启动时经 `--patch` 传入） |

### 如何真正升级 Harness

运行时「**检查更新**」只替换**当前应用包内**那份 `node_modules`，**不会写回桌面源码依赖**。
因此**只要重新运行 `./build.sh`，版本就会回到源码锁定的版本**（`build.sh` 每次都从
`desktop/node_modules` 重新拷贝）。

要**永久升级**（让 `./build.sh` 稳定产出新版本）：

```bash
cd desktop
# 1) 把 package.json 里 @deepseek-ai/dsh 的版本号改成目标版本（如 0.1.1-rc.2）
# 2) 用可用的 node/npm 重装依赖（系统 node 可能因 icu4c 损坏，用 nvm 的 node）
$HOME/.nvm/versions/node/v22.19.0/bin/npm install --omit=dev --no-audit --no-fund
# 3) 重建
./build.sh
```

`./build.sh` 产出应用包的 `@deepseek-ai/dsh` 版本 = `desktop/node_modules` 里的版本，
所以以 `package.json` 声明的版本为准。

## Git 源码管理

内置的 Git 插件提供**全屏 Git 面板**：入口是**对话（轨迹）视图右侧页签栏的「Git」页签**
（点击后用面板替换聊天/轨迹区域），Esc / 关闭按钮退出。
打开时**自动关联当前会话的工作目录**（`useSessions` 读取当前会话 cwd）；
顶部栏有「刷新」按钮。

功能：

- **状态分区**：暂存区 / 未暂存区 / 未跟踪文件分栏列出；**checkbox 即暂存开关**——
  勾选未暂存文件即暂存，取消已暂存文件的勾选即取消暂存；「未暂存」标题旁有全选框，
  一键全部暂存 / 全部取消暂存。
- **丢弃改动**：每行右侧 `⋯` 菜单 →「丢弃改动」恢复工作区改动（未跟踪文件不提供）；
  「移除文件」从工作区删除该文件（含未跟踪文件，二次确认后不可恢复）。
- **提交**：**只提交已暂存（勾选）的文件**（`提交已暂存 (N)`），未暂存的不受影响；
  支持 amend 上次提交；**提交说明为多行输入**（Enter 换行、随内容自动增高，⌘/Ctrl+Enter
  或「提交」按钮提交），下方输出回显。
- **分支切换**：顶部分支按钮弹出分支菜单，按「本地 / 远程」分组**列出全部本地与远程
  分支，点击整行即切换**（远程分支点选后自动创建同名本地跟踪分支，本地同名存在时回退切
  本地）；当前分支高亮带圆点、不可点。菜单为纵向窄列表、行无边框；行内保留重命名 ✎ /
  删除 ✕（二次确认）。「新建」（从选中提交建分支）与「合并」（合并选中提交到当前分支）
  在**提交详情工具栏**，样式与「刷新」一致。
- **远程操作**：推送（-u 设上游）、拉取（--ff-only）、Fetch --prune。
- **历史**：图形化提交图（Git Graph 风格：主线靠左、分支向右分叉后竖直向下，
  每条分支按列着色；HEAD 为空心圆，其余为实心圆点），点击提交看完整 diff；支持
  文件级历史（`git log -- <file>`）与 blame。
- **文件对比**：点击文件查看「工作区 vs HEAD」内容对照（含文件历史）。
- **面板布局**：第 2 列上方为提交历史（占满剩余高度），最下方为提交表单。
- **差异视图**：diff 按文件分类展示（文件头 + 新增/删除/重命名/二进制徽标），修改位置
  用绿色/红色色块标出，每行标注新旧行号，hunk 头显示 `@@ -旧行 +新行 @@`。

| 文件 | 作用 |
|---|---|
| `plugins/dsh-git/` | 宿主半部：`/git` JSON API（status/stage/diff/commit/branch/merge/log/blame/cat 等 28 个操作） |
| `plugins/dsh-client-ui-git/` | 浏览器半部：侧边栏 Git 入口 + 全屏面板 UI |
| `git.patch.yml` | 注册这两个插件（launcher 经 `--patch` 传入） |

## 识图（dsh-vision-router）

内置第三方插件 **dsh-vision-router**（见其
[GitHub 仓库](https://github.com/ysr666/dsh-vision-router)，内置 **v1.7.6**），
给纯文本模型（DeepSeek 等）提供**像素保真的图片理解**：

- **原图直看**：图片轮交给视觉模型看原图，DeepSeek 始终负责思考；图片轮就像普通
  **工具调用**（`vision_ground` → `vision_crop` → `vision_describe` → `vision_pixel_diff`
  … 可连续多步迭代定位/裁剪/比对/修复），可定位、可验证。
- **默认免费**：视觉工具兜底 5 个 OVHcloud 匿名视觉模型，免注册免 Key（每 IP、
  每模型 2 次/分钟）；用户自备视觉模型（智谱/百炼/OpenRouter 等）优先调用。
- **14 个深看工具**：Q&A / 定位 / 裁剪 / 像素比对 / 取色 / OCR / SVG 矢量化 / 抠图 /
  HTML 截图 / 长截图识读等；无 Python，基于 sharp / potrace / tesseract / 系统 Chrome。
- **设置**：设置 → 插件 → 插件配置 → **「Vision Router」**卡片；接管官方路由与否由
  「隐身模式」开关决定（默认关，官方 `llm-deepseek` 行保持启用）。
- **不写日志**：指向视觉工具的改写只发生在模型输入层，会话日志里仍是原图。

| 文件 | 作用 |
|---|---|
| `plugins/dsh-vision-router/` | 插件源码（v1.7.6：宿主路由 + 14 个视觉工具 + 浏览器半设置卡） |
| `vision.patch.yml` | 注册该插件 + 附件准入放宽（20 MiB / 100 MP / 单边 10000 px）；不接管 llm-deepseek） |

## 全局技能库（dsh-skills）

内置第三方插件 **dsh-skills**（[CocoSgt/dsh-skills](https://github.com/CocoSgt/dsh-skills)）。
把散落的技能汇成全局库：Claude Code 的
`~/.claude/skills`、项目目录、`.skill` 包等统一入库到 `$DSH_HOME/skills`（官方
skill-filesystem 默认扫描根，watcher 实时），入库即出现在输入框的「/」斜杠菜单；
设置页侧栏有「技能」导航页。

功能：

- **两种入库身份**：引用（符号链接，编辑即编辑来源）/ 副本（整树拷贝，独立演化）。
- **全局技能页签**：＋ 新建技能、上传 `.skill`、可视化筛选；每张卡带身份徽标、
  资源文件数、非默认调用策略；「编辑 SKILL.md」内联编辑、导出 `.skill` 整树打包、
  打开目录、删除（引用只删链接，两步确认）。
- **发现页签**：扫描目录 chips 就地管理，结果可「引用 / 复制」，支持「全部引用」批量。
- 全部文案经官方 locale 服务中英渲染；同系列搭配 `dsh-attachments` / `dsh-inspector`。

| 文件 | 作用 |
|---|---|
| `plugins/dsh-skills/` | 插件源码（宿主半：`skillHub` Typert 网关：状态 / import（引用|复制）/ edit / export；浏览器半：设置页技能中枢） |
| `skills-hub.patch.yml` | 注册该插件（launcher 经 `--patch` 传入） |


## MCP 服务管理

内置了第三方插件 **@opendsh/dsh-plugin-setting-mcp**（npm 包），在设置页加一个
「**MCP 服务**」入口，可**查看、新增、修改、移除、启用/停用** MCP 服务（stdio /
Streamable HTTP），点「保存」即热更新生效（无需重启进程）。它管理的是
`@deepseek-ai/dsh-mcp-client` 的 loader 条目，并把服务集合持久化写回 profile 的
`cordis.patch.yml`。

| 文件 | 作用 |
|---|---|
| `plugins/@opendsh/dsh-plugin-setting-mcp/` | 插件源码（宿主半：typert `ctx.mcp` 服务；浏览器半：设置页 MCP 服务管理） |
| `mcp-settings.patch.yml` | 注册该插件（launcher 经 `--patch` 传入） |


## 用户插件（方案 C：运行时安装，不重编译）

内核的 `dsh` 原生支持用户级插件：把应用装进 **profile**（`$DSH_HOME/profiles/web`）里的
`node_modules`，通过声明 `dsh.bundle` 自动加入 layer 栈（`$DSH_HOME` 是应用自己的用户目录，
默认 `~/Library/Application Support/DeepSeekHarness`，可设 `DSH_HOME` 覆盖）。本应用已内置该机制：

- **运行时自带的 node/pnpm**：`launcher.mjs` 启动时用 `desktop-bin.mjs` 生成
  `$DSH_HOME/.desktop-bin/{node,pnpm}` shim 并前置 PATH，`dsh plugin` 因此能在
  打包后的应用里跑通，无需系统 Node / pnpm。
- **一键 CLI**（`add-plugin.sh`）：
  ```sh
  ./add-plugin.sh --runtime add <npm包名或本地目录>   # 装
  ./add-plugin.sh --runtime list                      # 列出已装的 bundle
  ./add-plugin.sh --runtime remove <包名>             # 卸
  ```
- **不重编译**：用户插件存在 `$DSH_HOME`,`./build.sh` 重建/升级只重写应用包内的
  node_modules，不会清掉用户已装插件。要装的是声明了 `dsh.bundle` 的 bundle 插件
  （`package.json` 带 `dsh.bundle.patch` + `cordis.patch.yml`）。

> `--runtime add` 会传 `-w`（profile 是 pnpm workspace 根，pnpm 需要该标志）。
> `remove`/`list` 用包全名（如 `@scope/name`），以 `list` 输出为准。
>
> **两类插件都支持**：声明 `dsh.bundle` 的插件（如 git/updater）装完自动加入 bundle 层；
> 只声明 `dsh.client` 的纯前端插件（如 `@frostgao` 的主题插件）`dsh plugin add` 不会自动激活，
> `plugins.mjs` 会在 profile 的用户层 `cordis.patch.yml` 里自动补一条激活 row，移除时一并清理。

## 黑金主题（@frostgao/dsh-theme-blackgold）

内置 `@frostgao/dsh-theme-blackgold`（@frostgao 出品的配搭主题），作为**应用内插件**打包
（源码在 `plugins/@frostgao/dsh-theme-blackgold`），把 Web 界面重绘成**黑金配色**
（黑白底 + 金色强调，浅色 / 深色两套）：

- **品牌标**：鲸鱼 logo 金色描边 + 悬停微动；`HARNESS` 徽标黑底金字 + 周期性高光扫过。
- **页面强调色**：发送键、激活的会话/轨迹/工作区标签、光标、高亮等金色化。
- **细节**：侧栏运行点金色跑动、新会话光环淡金、ContextMeter 等。
- 纯演示层覆盖（走 `dsh-client-ui-theme` 的 token 覆盖），尊重 `prefers-reduced-motion`。

该插件是**客户端专属**（`immediately: true`，无需在设置里开开关），随插件清单在启动时
自动加载生效。纯 ESM、无原生二进制，依赖的 `@deepseek-ai/dsh-client-ui-theme` 为 0.1.1-rc.2 自带。

| 文件 | 作用 |
|---|---|
| `plugins/@frostgao/dsh-theme-blackgold/` | 插件源码（宿主半为空占位；浏览器半：黑金 token 覆盖） |
| `theme-blackgold.patch.yml` | 注册该插件（launcher 经 `--patch` 传入） |

## 会话费用统计（dsh-cost-meter）

内置 **dsh-cost-meter**（[Han-1413141/dsh-cost-meter](https://github.com/Han-1413141/dsh-cost-meter)，
v1.5.38），提供会话级费用统计：

- **费用**：本会话成本、当日费用、历史记录；内置 90+ 模型价格目录自动匹配，与官方价格一键同步。
- **余额 / 额度**：官方余额、可配自定义 Provider 余额（任意 HTTP 端点）与余额进度条；主流
  Coding Plan 订阅额度查询与显示（7 家，含 SCNet Token Plan 本地 Credits 计量）。
- **峰谷计价**：峰谷时段显示，切换前弹窗 / 系统通知提醒（位置 / 提前量 / 类型可配）。
- 界面中英双语；配置在 设置 → 插件 → dsh-cost-meter。

| 文件 | 作用 |
|---|---|
| `plugins/dsh-cost-meter/` | 插件源码（宿主：costMeter 服务 + ledger；浏览器半：费用展示与设置） |
| `billing.patch.yml` | 注册该插件（launcher 经 `--patch` 传入；`name:` 必须带引号，linkBundledPlugins 只收集带引号的 name） |


launcher 还会把后端目录（含内置 `node` 二进制）放在 `PATH` 最前，确保插件跑视觉
子进程时用的是应用自带的 Node，而非可能损坏的系统 Node。

## 许可证

本项目（`desktop/`）采用 **MIT License**（见 [LICENSE](LICENSE)）。
内置的各第三方插件与上游 `@deepseek-ai/dsh` 均为 MIT（各自保留其版权声明与 LICENSE）。
