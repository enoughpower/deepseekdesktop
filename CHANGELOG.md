# 改动记录（CHANGELOG）

> 本文件记录 DeepSeek Harness 桌面应用（`desktop/`）的每次修改（简短总结），
> 以及本项目的工作流程与经验教训。README 只描述当前状态，不写历史回顾；
> 所有历史改动统一归档在这里。

---

## 工作流程（每次修改后必须遵守）

1. **修改完成 → 自己验证**：跑起来确认不会崩溃、插件是否都正常显示（见下方「验证方法」）。
2. **全部正常 → 打 DMG**：`./build.sh --dmg`，然后**通知用户验收**。
3. **记录改动**：把每次修改点做简短总结，追加到本文件（方便回顾）。
4. **功能性修改 → 更新 README**：README 描述当前行为。
5. **README 不写历史回顾**：历史回顾整理后放本文件。
6. 大改动前先想清楚打包/运行机制，避免"活体手术"式的在运行实例上直接改文件。

## 验证方法

- **后端自测**（不起 GUI）：
  ```sh
  cd dist/DeepSeekHarness.app/Contents/Resources/backend
  ./node launcher.mjs        # 观察是否出现 DSH_READY=<url>，且进程保持存活
  ```
- **整应用启动自测**（模拟 Finder 双击，避免继承环境变量干扰）：
  ```sh
  env -u DSH_HOME dist/DeepSeekHarness.app/Contents/MacOS/DeepSeekHarness
  # 确认：后端进程出现且保持、监听端口可访问、日志里各插件（cost-meter 等）正常加载
  ```
- **客户端（浏览器半）改动**：刷新 / 重开应用窗口即可看到；后端文件改动会触发热重启（注意端口变化）。
- **检查插件是否都正常**：启动日志里应有 `[dsh-cost-meter] 已加载` 等字样；页面打开对应功能确认 UI 正常。

## DMG 打包注意事项

- 残留的 DMG 挂载卷会导致打包失败：`ERROR: Write Permissions Error on /Volumes/DeepSeek Harness/.background`。
  先 `hdiutil detach '/Volumes/DeepSeek Harness'`（注意挂载名可能带序号，如 `DeepSeek Harness 1`）再重跑。
- 产物：`dist/DeepSeekHarness-<version>-arm64.dmg`。

---

## 经验教训（踩坑记录）

### 环境变量 DSH_HOME 泄漏（严重）
桌面应用有专属 home（`~/Library/Application Support/DeepSeekHarness`），但 launcher 的
`resolveDesktopHome()` 优先读环境变量 `DSH_HOME`。若从带 `DSH_HOME=/Users/dale/.dsh` 的
终端/dsh 环境启动应用，继承的变量会把后端误导到 Web 的 home（`~/.dsh`）：
- `~/.dsh` profile 里 `dsh-cost-meter` 已在 bundles 注册，billing.patch.yml 又插一次
  → `duplicate loader entry id: cost-meter` → 后端启动失败 → 壳层弹「后端未能启动」模态框。
- `~/.dsh` 的凭证是 `version/refs` 格式（managed），桌面用 `dsh-credentials-local`
  （扁平）→ `version must be a string` 报错。
**修复**：`App/main.swift` 在拉起后端前 `env.removeValue(forKey: "DSH_HOME")`，让应用
永远用专属 home。诊断技巧：直接跑 launcher 正常但壳层拉起失败时，查壳层进程环境
（`ps eww`）是否带了不该有的变量；壳层 stderr 会打印后端完整错误。

### 凭证格式（桌面 vs Web 不同）
- 桌面 `dsh-credentials-local`：凭证文件为**扁平映射** `KEY: value`。
- Web `dsh-credentials`（managed）：`version: 1\nrefs:\n  KEY: value`。
- 两者混用会互相踩：桌面读到 managed 格式 → 启动崩溃。

### 打包后不要直接改应用包内文件
在 `dist/*.app` 里改文件（billing.patch、删包等）会破坏代码签名封条（Sealed Resources），
GUI 启动时 AMFI 可能校验失败。要改就改**源码**（`desktop/` 下的 `plugins/`、`*.patch.yml`、
`App/main.swift`）再重新 `build.sh`。

### billing.patch.yml 的 name 必须带引号
`linkBundledPlugins`（dsh-home.mjs 的 `collectPatchPackageNames`）只用正则
`name:\s*['"]([^'"]+)['"]` 收集——不带引号的 `name: dsh-cost-meter` 不会被收集，
导致 profile 里没有软链、后端报 `Cannot find package`。写成 `name: 'dsh-cost-meter'`。

### 插件打包机制
`plugins/<pkg>/` 下每个目录按自身 package.json 的 `name` 字段，构建时拷入
`node_modules/<name>`（`build.sh` 的 copy_plugin）。scoped 包放 `plugins/@scope/<pkg>`。
依赖（如 zod、@deepseek-ai/dsh-credentials）从后端 node_modules 解析，构建时已包含。

### 客户端改动生效方式
客户端模块按页面加载拉取：改 `plugins/*/lib/client.js` 后**刷新/重开应用窗口**生效；
复制文件会触发后端热重启（端口会变，属正常）。按钮尺寸注意 `primitives.Button` 只有
`md`/`sm` 两种——写 `size: "xs"` 会退化成默认大胶囊。

### 模态弹窗 ≠ 崩溃
壳层 `BackendController.start()` 在「后端进程退出且 UI 未加载」时弹
「DeepSeek Harness 后端未能启动（退出码 N）」`NSAlert`（runModal 阻塞主线程、100% CPU）。
看到这个弹窗说明**后端启动失败**，去抓后端 stderr（壳层 stderr 会转发）。

---

## 修改记录

### 2026-08-22 · Git 插件 UI 改造（plugins/dsh-client-ui-git/lib/client.js）
- 分支弹窗改为**纯切换**：去掉「新建」输入框/按钮与「合并」下拉/按钮，按「本地/远程」
  分组列出全部分支，**点击整行切换**（远程分支自动建本地跟踪分支，本地重名回退本地）；
  当前分支高亮带圆点不可点。行内保留重命名 ✎ / 删除 ✕。
- 弹窗**纵向窄列表**（width 250→320px，纵向 column），行**无边框**、悬停背景高亮。
- 提交详情工具栏按钮：`fork`→「新建」、`merge`→「合并」，样式统一为
  `variant: "outline", size: "sm"`（修复 `size:"xs"` 无效导致的灰椭圆样式）。
- 移除顶部「仓库路径」输入框与「加载」按钮（只留「刷新」）。
- 提交说明改为**多行 textarea**：Enter 换行、自动增高（最高 96px）、⌘/Ctrl+Enter 提交，
  提交成功后高度复位（`msgRef`）。
- 顶部栏间距 10→8px；fork 输入框 150→128px、高度 26→28px 对齐按钮。

### 2026-08-22 · 用量插件替换：dsh-usage-cost → dsh-cost-meter
- 新增 `plugins/dsh-cost-meter/`（v1.5.36 打包源）；`billing.patch.yml` 注册
  `id: cost-meter / name: 'dsh-cost-meter'`（name 必须带引号，见经验教训）。
- 提供会话费用统计：本会话成本/当日费用/历史、官方余额/自定义 Provider 余额、Coding
  Plan 额度、峰谷计价提醒；配置在 设置 → 插件 → dsh-cost-meter。

### 2026-08-22 · 清理 @frostgao/dsh-usage-cost
- 删除源码 `plugins/@frostgao/dsh-usage-cost/`、dist 产物、profile 软链；
  `@frostgao/` 只剩 `dsh-theme-blackgold`（主题仍用）。README 保留一句替换说明。

### 2026-08-22 · 桌面凭证格式修复
- `~/Library/Application Support/DeepSeekHarness/.credentials.yaml` 改为**扁平格式**
  （`DEEPSEEK_API_KEY: sk-...`），适配 `dsh-credentials-local`；原 `version/refs`
  备份已删除（managed 格式不适用于桌面）。

### 2026-08-22 · DSH_HOME 泄漏修复（App/main.swift）
- 壳层拉起后端前剥离环境继承的 `DSH_HOME`，杜绝桌面应用误用外部 home（~/.dsh）
  导致的 duplicate loader entry / 凭证格式不匹配。详见「经验教训」。

### 2026-08-22 · README / 文档
- README：Git 小节（入口为对话视图「Git」页签、分支切换、多行提交、顶部栏）、
  dsh-cost-meter 小节、DSH_HOME 说明、billing.patch 说明；清理历史回顾（移至本文件）。
- 新增本文件 CHANGELOG.md（改动记录 + 经验教训）。

### 2026-08-22 · 打包
- `./build.sh --dmg` 产出 `dist/DeepSeekHarness-0.1.0-arm64.dmg`；
  中途 DMG 打包失败一次（残留挂载卷），`hdiutil detach` 后重跑成功。

### 2026-08-22 · 工作流 / 文档体系落地
- 新增 **项目 skill**：`.dsh/skills/desktop-app-dev/SKILL.md`（修改后自测 → 打 DMG →
  通知验收 → 记录 CHANGELOG → 功能改动更新 README → README 不写历史回顾，六条规则 +
  验证方法 + 项目关键知识），已应用（会话可加载）。
- 新增 **CHANGELOG.md**（本文件）：改动记录 + 经验教训（会话总结）。
- **README 清理历史回顾**：删除「已移除 / 取代 / 旧版」等历史描述（Git 入口、顶部栏、
  分支新建合并、cost-meter 取代说明、DSH_HOME 泄漏说明、dsh-skills 取代说明），
  全部改为描述当前状态；历史细节归档到本文件。

### 2026-08-22 · 升级 @deepseek-ai/dsh → 0.1.1-rc.2
- `package.json` 版本 `0.1.0-rc.8` → `0.1.1-rc.2`，`npm install --omit=dev`
  （added 1, changed 205 packages），全部 `@deepseek-ai/*` 核心包同步到 0.1.1-rc.2。
- 重建 `./build.sh --dmg`：App 构建成功；DMG 打包因残留挂载卷（`/Volumes/DeepSeek
  Harness 1`）失败一次，`hdiutil detach` 后单独重跑 build_dmg 逻辑成功产出
  `dist/DeepSeekHarness-0.1.0-arm64.dmg`（80M）。
- **验证通过**：内置 dsh 版本 0.1.1-rc.2；后端自测 DSH_READY 正常、cost-meter 加载、
  无报错；整应用启动（干净环境）后端进程保持、壳层空闲。
- README 版本引用同步更新（v0.1.1-rc.2、dsh-client-ui-theme 0.1.1-rc.2）。
- 注：内置 vision-router 仍为 v1.7.3（未升级），本轮验证无冲突；若后续需要 0.1.1 特性
  可考虑同步升级到 v1.7.6（与 Web 端一致）。

### 2026-08-22 · DMG 命名规范 + 验收流程（build.sh + skill）
- **DMG 命名规范**（build.sh build_dmg）：改为
  `DeepSeekHarness-{版本}-{构建日期MMddHHmm}-{full|lite}.dmg`（如
  `DeepSeekHarness-0.1.0-08221030-full.dmg`）；`full`=完整版，
  `lite`=KEEP_EXTRA_PROVIDERS=0 精简版。
- **验收流程**（写进 skill）：通知用户验收前，先 `hdiutil attach` 挂载 DMG →
  `cp -R` 覆盖安装到 /Applications → `pkill -f DeepSeekHarness` 杀旧应用 →
  `open` 启动新版 → 确认正常后再通知验收。
- skill（desktop-app-dev）已同步这两条规则。

### 2026-08-22 · 项目 skill 文件加入 .gitignore
- `.gitignore` 增加 `.dsh/skills/`（项目 skill 仅本地使用，不上传远端）。
- `git rm --cached` 解除 `.dsh/skills/desktop-app-dev/SKILL.md` 的跟踪（本地文件保留，
  skill 仍可正常加载）。
