# @opendsh/dsh-plugin-setting-mcp

[English](README.md) | 中文

DSH Web 插件：**在设置面板中管理 MCP 服务**。可以查看、修改、移除、启用/停用 MCP
服务，点击 **保存** 后立即热更新生效（无需重启进程）——因为每个服务都是
`@deepseek-ai/dsh-mcp-client` 的一个活跃 loader 条目。

## 功能

- **查看** — 列出所有已配置的 MCP 服务，展示 `serverName`、连接方式
  （stdio / Streamable HTTP）、启动命令或 URL，以及实时状态（启用/停用，加上
  连接阶段：`active`、`failed`、`loading` 等）。
- **新增 / 修改** — 完整的服务编辑器：`serverName`、连接方式、`command` +
  `args` + `cwd` + `env`（stdio），或 `url` + `headers`（HTTP），以及单次调用
  超时和 `failOnStartupError` 开关。
- **移除** — 删除该服务的 loader 条目（带二次确认）。
- **启用 / 停用** — 只切换条目的 `disabled` 标记，不触碰配置，停用后完整配置仍
  被保留。
- **保存 → 热更新** — 所有修改先在本地暂存，**保存** 时对 loader 树做
  reconcile（`create` / `update` / `remove`），并把服务集合写回 profile 的
  `cordis.patch.yml`（持久化的 patch 层）。每个操作只重启受影响的
  `dsh-mcp-client` 实例，与 harness HMR 的热切换行为一致。

## 架构

一个安装到 `web` profile 的双端 npm 包：

| 端     | 入口             | 职责                                                                                                       |
| ------ | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| 服务端 | `lib/index.js`   | Cordis 插件（`inject: ["loader"]`）：挂载 `ctx.mcp` typert 服务，投影并 reconcile loader 中的 MCP 条目。   |
| 协议   | `lib/typert.js`  | 服务端 TYPERT 接口（`mcp/list`、`mcp/save`），由 `dsh-typert-loader` 自动注册。                            |
| 浏览器 | `lib/client.js`  | 挂载到 `settings.section` 插槽的 React 页面，通过 `remote.mcp` 命名空间调用服务端。                        |

客户端与服务端之间走 DSH typert 协议：严格 zod 编解码在两侧校验所有参数与结果。

## 安装

```sh
dsh plugin --profile web add @opendsh/dsh-plugin-setting-mcp
```

## 与 `cordis.patch.yml` 的对应关系

插件管理 profile 的 `cordis.patch.yml`（用户 patch 层——**不是** `cordis.yml`，
后者在每次启动时都会被启动器重置为空列表）中的 `dsh-mcp-client` 条目。一个
stdio 服务等价于：

```yaml
# cordis.patch.yml
- insert:
    - id: mcp-github
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: github
        transport: stdio
        command: npx
        args: ['-y', '@modelcontextprotocol/server-github']
        env:
          GITHUB_TOKEN: ...
```

一个 Streamable HTTP 服务等价于：

```yaml
# cordis.patch.yml
- insert:
    - id: mcp-web
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: web
        transport: streamable-http
        url: http://localhost:3000/mcp
        headers:
          Authorization: ...
```

模型看到的工具名保持服务命名空间前缀（`mcp__<服务名>__<工具名>`），与手写条目
完全一致。

## 开发

```sh
pnpm install
pnpm --filter @opendsh/dsh-plugin-setting-mcp build
pnpm --filter @opendsh/dsh-plugin-setting-mcp test
```

## 已知限制

- **编辑器不暴露 `reconnect`。** 启用/停用切换以及修改其他服务都会保留已存储的
  `reconnect` 配置；但编辑器本身无法查看或修改它。
- **高级 `reconnect` 字段以及未来的 MCP 能力**（resources、prompts）不在本面板
  范围内，仍可直接在 `cordis.patch.yml` 中配置。
- **保存是 reconcile 而非事务。** 操作按顺序应用；若后面的条目失败（例如服务进程
  无法启动），前面的操作已生效，失败信息会在面板中提示。
