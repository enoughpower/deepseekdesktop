# 改动记录（CHANGELOG）

> 按天记录本项目的改动要点。使用说明与当前状态见 [README](README.md)。

## 2026-08-22

- **Git 面板 UI 优化**：
  - 分支弹窗改为纯切换（本地/远程列表、点击整行切换、纵向窄列表、行无边框）；
    「新建/合并」移到提交详情工具栏并统一样式；移除顶部仓库路径输入；提交说明改多行
    输入（Enter 换行，⌘/Ctrl+Enter 提交）。
  - 文件行「⋯」菜单改为图标、点击区域撑满整行高度；下拉菜单危险项（移除文件）高亮改灰色。
- **费用插件**：改用 dsh-cost-meter（会话费用统计：本会话/当日费用、余额、Coding Plan
  额度、峰谷计价提醒）。
- **升级**：`@deepseek-ai/dsh` 0.1.0-rc.8 → 0.1.1-rc.2；第三方插件升级（dsh-vision-router
  1.7.6、dsh-cost-meter 1.5.38、@opendsh/dsh-plugin-setting-mcp 0.1.2）。
- **修复**：桌面端启动崩溃（因环境变量 `DSH_HOME` 泄漏导致后端误用外部 home）；
  桌面凭证文件格式适配 `dsh-credentials-local`。
- **打包**：DMG 命名规范 `DeepSeekHarness-<版本>-<MMddHHmm>-<full|lite>.dmg`；
  README 新增构建教程与体积对比表、Git 面板截图。
- **许可证**：采用 MIT。
