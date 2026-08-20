# 方案 C 落地设计：用户级插件安装（runtime pnpm + shim）

> 目标：让用户在 **编译好的 .app 里**（不重跑 build.sh）通过 `dsh plugin --profile web add <pkg>`
> 装/卸第三方插件，且升级/重建 .app 不丢失用户插件。
> 这是对已完成的 方案 A（add-plugin.sh）+ 方案 B（launcher/build 自动发现）的运行时补充。

---

## 1. 背景与依据（先说清"为什么可行"）

官方 dsh 原生就是 profile-bundle 模型（已从源码确认）：

- 每个 **profile** = `$DSH_HOME/profiles/<name>/` 下的 pnpm workspace（package.json + cordis.patch.yml + pnpm-workspace.yaml）。
- **bundle 插件** = 声明 `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }` 的 npm 包。
- Loader 的 `baseUrl` 指向 **profile 目录**，插件名通过 bare import 从 profile 的 `node_modules` 向上解析。
- **`dsh plugin --profile web add <pkg>`** 官方命令：在 profile 里跑 `pnpm add`，自动把声明了 `dsh.bundle` 的包追加进 `dsh.profile.bundles` 层栈；`remove` 同时删依赖和层。**装插件不需要手写 patch、不需要改代码。**

现状 / 缺口（已实测确认）：
- launcher 起 `dsh web`（= `--profile web`），`~/.dsh/profiles/web` 就是用户 profile。
- bundle 里 **没有 pnpm**，本机 **也没有系统 pnpm** → `dsh plugin ...` 会因找不到 pnpm 失败。
- 这正是参考实现 `dataelement/dsh-desktop` PR #61 解决的问题：**内置 pnpm + 生成 node/pnpm shim**。

## 2. 设计概览

```
┌────────────────────────────────────────────────────────────┐
│  DeepSeekHarness.app                                        │
│  └─ Contents/Resources/backend/                            │
│     ├─ node            (自带 runtime)                       │
│     ├─ launcher.mjs    (监督进程: 起 dsh web + 注入 shim)    │
│     ├─ node_modules/   (内置平台 + pnpm 运行时代码)          │
│     │   └─ .../@deepseek-ai/dsh/lib/bin.js                  │
│     └─ <app 自带 *.patch.yml>   (内置插件, 与用户插件无关)    │
└────────────────────────────────────────────────────────────┘
        │ 启动时 launcher: 
        │   - 生成 ~/.dsh/.desktop-bin/{node,pnpm} shim(指向自带 runtime)
        │   - 把 .desktop-bin + backend 加入 PATH
        │   - spawn dsh web (profile=web)
        ▼
  dsh web 运行时 ←→ 用户:  dsh plugin --profile web add <pkg>
        │                         │ (bin 里 node/pnpm shim 生效)
        ▼                        ▼
  ~/.dsh/profiles/web/     pnpm 写入 profile 依赖 + 自动 reconcile bundles
```

**关键链条**：`dsh plugin` 内部 `spawnSync pnpm ...`，要求 `pnpm` 在 PATH 上。我们用 app 自带 node 跑起 pnpm 的 JS 入口（shim），因此**打包后无需系统 pnpm / node**。

## 3. 分阶段实施

### 阶段 1 — 内置 pnpm + 运行时 shim（核心，最小闭环）
| 步骤 | 文件 | 改动 |
|---|---|---|
| 1.1 | `package.json` | `dependencies` 增加 `"pnpm": "^9.15.0"`（锁版本，体积小、纯 JS） |
| 1.2 | `build.sh` | 确认 pnpm 被打进 `backend/node_modules/pnpm`；在 `copy_plugin` 之后补一个 `copy_pnpm_runtime` 幂等步骤 |
| 1.3 | `add-plugin.sh` | 新增子命令 `--runtime add|remove <pkg>`，把 shim 生成 + 调 `dsh plugin` 封装成一行 |
| 1.4 | `launcher.mjs` | 启动时调用 `ensureDesktopBin()`：生成 `~/.dsh/.desktop-bin/{node,pnpm}` shim（POSIX 脚本，指向 app 自带 node/pnpm 入口），prepend 到 `buildEnv()` 的 PATH |

**Node shim**（POSIX，参考 dsh-desktop）：
```sh
#!/bin/sh
exec '<app>/backend/node' "$@"
```
**pnpm shim**：
```sh
#!/bin/sh
exec '<app>/backend/node' '<app>/backend/node_modules/pnpm/bin/pnpm.cjs' "$@"
```
（Windows 场景本项目暂无，但方案保留 `*.cmd` 分支思路。）

### 阶段 2 — 把 "dsh plugin" 的能力暴露给用户（两种入口）
| 入口 | 形态 | 说明 |
|---|---|---|
| 2a CLI | `./add-plugin.sh --runtime add @scope/pkg` | 在 repo 内调试用；实际是 `node bin.js plugin --profile web add` |
| 2b 宿主插件 | 新增 `plugins/dsh-plugin-manager/`（宿主半 + 浏览器半） | 暴露回环 `/plugins/...` JSON API（list/install/remove/status），借鉴 `dsh-desktop-market-installer` 的 `INSTALL/UNINSTALL/STATUS` 路由与 `isTrustedRequest` 校验；浏览器半做一个「插件管理」设置页 |
| 2c 市场 | 可选 | 接入 `dsh-market` / `dsh-plugins-store` 这类市场做「搜索 + 一键装」 |

> 阶段 2 的 2b 是**可选增强**；阶段 1 完成后，用户已经能通过官方 `dsh plugin` 命令装插件（在 .app 里用 shim 跑通）。是否做 2b/2c 取决于「要不要图形化」。

### 阶段 3 — 持久化 & 防回归
| 步骤 | 说明 |
|---|---|
| 3.1 | 明确「用户插件存 `~/.dsh/profiles/web`；`./build.sh` 只重写 app 内 node_modules，**不碰** `~/.dsh`」→ 升级不丢用户插件（已由 profile 机制天然保证，需文档固化） |
| 3.2 | README 增加「用户插件安装」章节（CLI 用法 + 可选 GUI） |
| 3.3 | CI/冒烟脚本：`node --check launcher.mjs`、`bash -n build.sh add-plugin.sh`、shim 生成后跑 `dsh plugin --profile web` 自检 |

## 4. 测试验证矩阵

**阶段 1（shim + dsh plugin 连通）**
- T1.1 单元：手工跑 shim 生成函数，验证 `~/.dsh/.desktop-bin/pnpm --version` 输出 app 自带 node 版本。
- T1.2 单元：`pnpm --version` 在 PATH 里时，`dsh plugin --profile web` 不再报 "pnpm not found"。
- T1.3 e2e：`./add-plugin.sh --runtime add ./sample-bundle`（本地一个声明 dsh.bundle 的临时插件）→ 断言 `~/.dsh/profiles/web/package.json` 出现该依赖、`dsh.profile.bundles` 追加该包、`~/.dsh/profiles/web/node_modules/<pkg>` 可解析。
- T1.4 e2e：`dsh --profile web --dump-config`（或启动后 dump）→ 输出含该 bundle 的 layer。
- T1.5 回滚：`--runtime remove <pkg>` → 依赖与 bundles 层都移除。
- T1.6 幂等：重复 add/remove 不产生重复层/坏依赖。

**阶段 2（CLI 确定；GUI 视落地）**
- T2.1：`add-plugin.sh --runtime add/@scope @` 从 npm 注册表装机；离线/无网络时给出清晰报错。
- T2.2（若做 GUI）：回环 API 仅接受 loopback + mutation 校验来源（isTrustedRequest 模式）；安装中断/超时能回滚 manifest（atomicWrite）。

**阶段 3（回归）**
- T3.1：装用户插件后跑 `./build.sh` → 用户插件仍在 `~/.dsh`（不被 app 重建清掉）。
- T3.2：`prune.sh` 不误删 `pnpm`（只删第三方 md/license/二进制，pnpm 是纯 JS 且 .d.ts 可删）。
- T3.3：内置 9 插件不受影响（launcher 自动发现回归）。

## 5. 依赖体积 / 风险
- pnpm ~10–15 MB（纯 JS + 少量 shim），对当前 ~220MB 的 app **可接受**。
- 风险：pnpm 首次运行要下载 store（在线）；离线装机需先 `pnpm store` 预置或走本地 dir 安装。
- 风险：`dsh plugin` 依赖 `pnpm` 可执行；若某系统 PATH 污染，shim 幂等确保走自带 runtime（与现有 buildEnv PATH 前置策略一致）。

## 6. 验收标准（DoD）
- [ ] 打包后的 app 内，用户能用 `dsh plugin --profile web add <pkg>` 装入第三方插件且无需重编译。
- [ ] `~/.dsh` 存储用户插件，`./build.sh` 重建不丢失。
- [ ] 方案 A/B 的产物（add-plugin.sh、launcher/build 自动发现）不受影响、回归通过。
- [ ] README 记录 CLI 用法；冒烟脚本 CI 通过。
