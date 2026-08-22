# 改动记录（CHANGELOG）

> 本文件按**天**记录 DeepSeek Harness 桌面应用（`desktop/`）的改动要点，方便回顾。
> 工作流程（自测 → 打 DMG → 通知验收 → 记录）、验证方法、项目关键知识与经验教训
> 统一维护在项目 skill：`.dsh/skills/desktop-app-dev/SKILL.md`（已应用）。
> README 只描述当前状态，不写历史回顾。

## 2026-08-22

- **Git 插件 UI 改造**（`plugins/dsh-client-ui-git/`）：分支弹窗改为纯切换（本地/远程
  列表、点击整行切换、纵向窄列表、行无边框）；提交详情工具栏「新建/合并」按钮统一
  样式（修复 `size:"xs"` 导致的样式错乱）；移除顶部仓库路径输入与「加载」按钮；
  提交说明改多行 textarea（Enter 换行，⌘/Ctrl+Enter 提交）。
- **用量插件**：`@frostgao/dsh-usage-cost` → `dsh-cost-meter`
  （`plugins/dsh-cost-meter/` + `billing.patch.yml` 注册，`name:` 必须带引号）。
- **清理**：删除 `dsh-usage-cost` 源码 / dist 产物 / profile 软链。
- **凭证格式**：桌面 `.credentials.yaml` 改扁平格式（适配 `dsh-credentials-local`，
  区别于 Web 端的 `version/refs`）。
- **修复启动崩溃**：`App/main.swift` 剥离环境继承的 `DSH_HOME`（避免误用 `~/.dsh`
  导致 duplicate loader entry / 凭证不匹配）。
- **升级**：`@deepseek-ai/dsh` 0.1.0-rc.8 → **0.1.1-rc.2**（npm install + 重建 + 验证）。
- **打包规范**：DMG 命名改为 `DeepSeekHarness-{版本}-{MMddHHmm}-{full|lite}.dmg`；
  验收前自动安装（挂载 → 覆盖安装 → 杀旧 → 启动新）。
- **文档 / 流程**：新增并应用项目 skill（`desktop-app-dev`）；本文件改为按天总结；
  README 清理历史回顾并同步功能变化；skill 文件加入 `.gitignore`（不上传远端）。
- **第三方插件升级到最新**（自己写的 git/updater 不动）：dsh-vision-router 1.7.3→1.7.6、
  dsh-cost-meter 1.5.36→1.5.38、@opendsh/dsh-plugin-setting-mcp 0.1.1→0.1.2；
  dsh-skills 已最新，@frostgao 主题不在 npm。重建验证安装完成。
- **Git 文件行「⋯」菜单点击区域放大**（dshGitMoreBtn：padding 6px 10px、min 34×30、居中）。
- **Git 文件行「⋯」改用 icon + 点击区域撑满行高**（SVG 三个圆点；按钮 align-self:stretch、
  宽 min 40px、撑满整行高度；中间容器 branchActions/menuWrap 同步 stretch）。
- **「⋯」下拉菜单危险项（移除文件）高亮改灰色**：背景从暗红 12% 混合改为与文件列表选中
  同款的 `--dsw-alias-interactive-bg-hover`（保留红色文字提示）。
