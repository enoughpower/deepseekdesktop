/**
 * `setting-mcp` namespace dictionaries: the MCP settings page copy (nav label,
 * list, editor form, save/discard footer, status badges). Registered into the
 * locale service by the client plugin body and consumed through the
 * framework-injected `t` seat on the panel props.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
/** Simplified Chinese dictionary (the key-set source of truth). */
export declare const zh: {
    readonly nav: "MCP 服务";
    readonly title: "MCP 服务";
    readonly desc: "管理 MCP 服务连接。保存后会立即热更新：新增、修改、移除或开关都无需重启进程。";
    readonly contact: "联系开发者";
    readonly "list.add": "新增服务";
    readonly "list.empty": "还没有配置任何 MCP 服务";
    readonly "list.emptyHint": "点击「新增服务」添加一个 stdio 或 HTTP 类型的 MCP 服务器。";
    readonly "status.enabled": "已启用";
    readonly "status.disabled": "已停用";
    readonly "status.active": "运行中";
    readonly "status.failed": "失败";
    readonly "status.loading": "加载中";
    readonly "status.pending": "等待中";
    readonly "status.unloading": "卸载中";
    readonly "action.edit": "编辑";
    readonly "action.remove": "移除";
    readonly "action.enable": "启用";
    readonly "action.disable": "停用";
    readonly "confirm.remove": "确定移除 MCP 服务「{name}」吗？保存后生效。";
    readonly "form.new": "新增 MCP 服务";
    readonly "form.edit": "编辑「{name}」";
    readonly "form.serverName": "服务名（serverName）";
    readonly "form.serverNameHint": "模型看到的工具名为 mcp__<服务名>__<工具名>，须为字母/数字/下划线/连字符，1–32 字符。";
    readonly "form.transport": "连接方式";
    readonly "form.transport.stdio": "stdio（本地子进程）";
    readonly "form.transport.http": "Streamable HTTP";
    readonly "form.command": "启动命令";
    readonly "form.commandHint": "用于启动 MCP 服务的可执行文件，如 npx 或 /path/to/server。";
    readonly "form.args": "参数（每行一个）";
    readonly "form.cwd": "工作目录（可选）";
    readonly "form.env": "环境变量（每行 KEY=VALUE）";
    readonly "form.url": "服务地址（URL）";
    readonly "form.headers": "请求头（每行 KEY=VALUE）";
    readonly "form.timeout": "工具调用超时（毫秒，可选）";
    readonly "form.failOnStartup": "启动失败时拒绝激活";
    readonly "form.save": "确定";
    readonly "form.cancel": "取消";
    readonly "form.error.name": "请填写服务名。";
    readonly "form.error.nameInvalid": "服务名只能包含字母、数字、下划线或连字符，且不超过 32 个字符。";
    readonly "form.error.command": "stdio 方式需要填写启动命令。";
    readonly "form.error.url": "HTTP 方式需要填写服务地址。";
    readonly "form.error.timeout": "超时必须为正整数。";
    readonly "form.error.env": "环境变量格式应为 KEY=VALUE（每行一条）。";
    readonly "form.error.headers": "请求头格式应为 KEY=VALUE（每行一条）。";
    readonly "footer.saving": "保存中…";
    readonly "footer.save": "保存";
    readonly "footer.discard": "放弃修改";
    readonly "footer.dirty": "有未保存的修改";
    readonly "footer.saved": "已保存并热更新";
    readonly "error.load": "加载失败：{message}";
    readonly "error.save": "保存失败：{message}";
};
/** The `setting-mcp` namespace key union. */
export type SettingMcpKey = keyof typeof zh;
/** English dictionary, checked complete against the zh key set. */
export declare const en: Record<SettingMcpKey, string>;
