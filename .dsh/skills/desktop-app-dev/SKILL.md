---
name: desktop-app-dev
description: Use when modifying, building, testing, packaging (DMG), or documenting the DeepSeek Harness macOS desktop app at /Users/dale/Desktop/workspace/desktop — including the git plugin UI, bundled plugins (dsh-cost-meter / dsh-vision-router / themes), billing.patch.yml overlays, credentials format, App/main.swift shell, build.sh packaging, and README/CHANGELOG maintenance. Follows a mandatory verify → DMG → record workflow after every change.
---

# DeepSeek Harness 桌面应用 开发 / 维护流程

本 skill 适用于项目根 `/Users/dale/Desktop/workspace/desktop`（macOS 桌面版，
WKWebView 壳 + 精简 Node 后端）。**每次修改后必须按下面的流程走**，不要跳步。

## 强制工作流（每次修改后）

1. **改完先自测**：自己跑一下，确认①不会崩溃、②插件都正常显示（见「验证方法」）。
2. **全部正常 → 打 DMG**：`./build.sh --dmg`（命名规范见下），然后**先装好再通知
   验收**：
   - **DMG 命名**：`DeepSeekHarness-{版本号}-{构建日期MMddHHmm}-{full|lite}.dmg`
     （`full`=完整多供应商，`lite`=KEEP_EXTRA_PROVIDERS=0 精简版；build.sh 已自动生成）。
   - **验收前安装流程**：① `hdiutil attach` 挂载 DMG → ② `cp -R` 覆盖安装到
     `/Applications/DeepSeekHarness.app` → ③ **kill 掉旧应用进程**（`pkill -f
     DeepSeekHarness`，含正在运行的后端）→ ④ `open` 启动新版 → ⑤ 确认能正常启动
     （后端进程出现、无弹窗）→ ⑥ 然后**通知用户验收**（附新 DMG 路径与本次改了什么）。
3. **记录改动**：把每次修改点做**简短总结**，追加到 `CHANGELOG.md`（方便回顾）。
4. **功能性修改 → 更新 README**：README 只描述**当前行为**。
5. **README 不写历史回顾**：历史回顾（"改前是 X / 已移除 / 取代"之类）统一整理放进
   `CHANGELOG.md`。
6. 大改动前先想清楚打包/运行机制；**不要在运行中的应用/已打包的 dist 上直接改文件**，
   要改就改源码（`plugins/`、`*.patch.yml`、`App/main.swift`）再重新 build。

## 验证方法

- **后端自测**（不起 GUI，最快）：
  ```sh
  cd dist/DeepSeekHarness.app/Contents/Resources/backend
  ./node launcher.mjs    # 期望出现 DSH_READY=<url>，进程保持存活，日志无 error
  ```
  注意：直接跑前先 `export DSH_HOME='/Users/dale/Library/Application Support/DeepSeekHarness'`
  或确认环境里没有多余的 `DSH_HOME`（见经验教训）。
- **整应用自测**（模拟 Finder 双击）：
  ```sh
  env -u DSH_HOME dist/DeepSeekHarness.app/Contents/MacOS/DeepSeekHarness
  # 检查：后端进程出现且保持（ps 里 backend/node ... bin.js web）、监听端口可访问、
  #        日志中插件正常加载（如 [dsh-cost-meter] 已加载）
  ```
- **插件是否正常显示**：启动日志应出现各插件加载行；对应功能页面打开后 UI 正常
  （如 Git 页签、设置 → 插件 里 dsh-cost-meter 卡片）。
- **客户端（浏览器半）改动**：刷新 / 重开应用窗口生效；复制文件会触发后端热重启
  （端口会变，属正常，不是崩溃）。
- **「启动就崩」排查**：壳层弹「后端未能启动（退出码 N）」= 后端启动失败，抓后端
  stderr（壳层 stderr 会转发）看真实报错；壳层进程 `ps eww` 可查是否带了不该有的
  环境变量（如 `DSH_HOME=/Users/dale/.dsh`）。

## 项目关键知识

- **构建**：`./build.sh`（默认全量）/ `KEEP_EXTRA_PROVIDERS=0 ./build.sh`（最小）；
  `--dmg` 打安装包。产物命名：
  `dist/DeepSeekHarness-<版本>-<MMddHHmm>-<full|lite>.dmg`（如
  `DeepSeekHarness-0.1.0-08221030-full.dmg`）。
  若 DMG 报 `Write Permissions Error on /Volumes/DeepSeek Harness/.background`，
  先 `hdiutil detach` 掉残留挂载卷（注意名称可能带序号，如 `DeepSeek Harness 1`）再重跑。
- **插件打包**：`plugins/<pkg>/` 下每个目录按 package.json 的 `name` 构建时拷入
  `node_modules/<name>`（scoped 放 `plugins/@scope/<pkg>`）；依赖从后端 node_modules
  解析（zod / @deepseek-ai/dsh-credentials 等已内置）。
- **overlay 补丁**：`*.patch.yml` 由 launcher 启动时经 `--patch` 传入；`- insert:` 块里
  `name:` **必须带引号**（`name: 'dsh-cost-meter'`），否则 `linkBundledPlugins`
  不会在 profile 里建软链、后端报 `Cannot find package`。
- **凭证格式**：桌面应用用 `dsh-credentials-local`，`~/.dsh` 桌面 home 的
  `.credentials.yaml` 必须是**扁平** `KEY: value`；`version/refs` 是 Web（managed）格式，
  混用会导致 `version must be a string` 启动失败。
- **DSH_HOME 泄漏**：`App/main.swift` 已剥离环境继承的 `DSH_HOME`，桌面应用固定使用
  专属 home；诊断时不要被外部 `DSH_HOME` 误导。
- **客户端按钮**：`primitives.Button` 只有 `md`/`sm`，写 `size:"xs"` 会退化成默认大胶囊。
- **文档**：`CHANGELOG.md` = 改动记录 + 经验教训（README 不写历史）；功能变化更新
  `README.md`。

## 相关文件速查

| 路径 | 说明 |
|---|---|
| `App/main.swift` | 壳层（后端拉起、DSH_HOME 剥离、DSH_READY 解析、错误弹窗） |
| `build.sh` / `prune.sh` | 构建 / node_modules 精简 |
| `launcher.mjs` / `dsh-home.mjs` | 后端监督 / home 解析与插件软链 |
| `plugins/dsh-client-ui-git/` | Git 面板（分支切换弹窗、提交、diff 等） |
| `plugins/dsh-git/` | Git 宿主 API（/git，28 个操作） |
| `plugins/dsh-cost-meter/` | 会话费用统计 |
| `billing.patch.yml` | 注册 dsh-cost-meter |
| `CHANGELOG.md` | 改动记录与经验教训（本 skill 的配套文档） |
