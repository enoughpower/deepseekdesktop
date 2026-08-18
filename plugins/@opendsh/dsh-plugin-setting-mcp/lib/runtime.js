/**
 * The `mcp` typert host service. Registered as `ctx.mcp` by the plugin body;
 * the gateway dispatches `mcp/*` endpoints here. `list` projects the current
 * loader tree, and `save` reconciles it — each `loader.create` / `update` /
 * `remove` restarts the affected `dsh-mcp-client` entry immediately, then the
 * reconciled set is persisted to the profile's `cordis.patch.yml`, the durable
 * patch layer that survives restart.
 *
 * @module @opendsh/dsh-plugin-setting-mcp
 */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { toMcpEntryOptions } from "./config.js";
import { persistMcpPatch } from "./persist.js";
import { planReconcile } from "./plan.js";
import { stableServerId } from "./patch.js";
import { MCP_CLIENT_MODULE } from "./schemas.js";
/** Numeric Cordis `FiberState` → human phase string (mirrors dsh-host-plugin-inventory). */
const FIBER_PHASE = {
    0: "pending",
    1: "loading",
    2: "active",
    3: "failed",
    4: null,
    5: "unloading",
};
/** True for a plain object (used to narrow `unknown` config values). */
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
/**
 * Strip every `undefined` value recursively. The typert gateway's strict
 * result codec re-checks JSON-safety after schema parsing, and an explicit
 * `undefined` property (even on an optional field) is not JSON-safe — so the
 * view must never carry one.
 */
function jsonSafe(value) {
    if (Array.isArray(value))
        return value.map((entry) => jsonSafe(entry));
    if (typeof value === "object" && value !== null) {
        const out = {};
        for (const [key, entry] of Object.entries(value)) {
            if (entry !== undefined)
                out[key] = jsonSafe(entry);
        }
        return out;
    }
    return value;
}
/** Project one managed loader entry into its JSON-safe view. */
function toView(entry) {
    const config = (entry.options.config ?? {});
    const phase = entry.fiber === undefined ? null : (FIBER_PHASE[entry.fiber.state] ?? null);
    return jsonSafe({
        // The *local* config id (e.g. `mcp-github`), not the runtime path
        // (`include:mcp-github`): this is the id that lives in `cordis.patch.yml`.
        id: entry.options.id,
        serverName: typeof config.serverName === "string" ? config.serverName : entry.options.id,
        transport: config.transport === "streamable-http" ? "streamable-http" : "stdio",
        command: typeof config.command === "string" ? config.command : undefined,
        args: Array.isArray(config.args) ? config.args : undefined,
        env: isRecord(config.env) ? config.env : undefined,
        cwd: typeof config.cwd === "string" ? config.cwd : undefined,
        url: typeof config.url === "string" ? config.url : undefined,
        headers: isRecord(config.headers) ? config.headers : undefined,
        toolCallTimeoutMs: typeof config.toolCallTimeoutMs === "number" ? config.toolCallTimeoutMs : undefined,
        failOnStartupError: typeof config.failOnStartupError === "boolean" ? config.failOnStartupError : undefined,
        enabled: !entry.disabled,
        phase,
    });
}
/** Host service backing the `mcp` typert namespace. */
let McpRuntime = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _list_decorators;
    let _save_decorators;
    return class McpRuntime extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _list_decorators = [Remote];
            _save_decorators = [Remote];
            __esDecorate(this, null, _list_decorators, { kind: "method", name: "list", static: false, private: false, access: { has: obj => "list" in obj, get: obj => obj.list }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _save_decorators, { kind: "method", name: "save", static: false, private: false, access: { has: obj => "save" in obj, get: obj => obj.save }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        constructor(ctx) {
            super(ctx, "mcp");
            __runInitializers(this, _instanceExtraInitializers);
        }
        /** All non-group loader entries that load the mcp-client bridge, in Loader order. */
        managedEntries() {
            const entries = [];
            for (const entry of this.ctx.loader.entries()) {
                if (entry.options.group)
                    continue;
                if (entry.options.name !== MCP_CLIENT_MODULE)
                    continue;
                entries.push(entry);
            }
            return entries;
        }
        /**
         * The root `cordis:include` entry whose subtree holds the profile's loader
         * rows and whose `config.path` locates the patch layer beside `cordis.yml`.
         */
        rootInclude() {
            for (const entry of this.ctx.loader.entries()) {
                if (entry.options.name === "cordis:include" && entry.subtree !== undefined)
                    return entry;
            }
            throw new Error("mcp: the profile config include is not mounted");
        }
        /** List the currently managed MCP servers. */
        list() {
            return this.managedEntries().map(toView);
        }
        /** Reconcile the loader tree to `servers`, persist to the patch layer, and return the fresh list. */
        async save(input) {
            const current = this.managedEntries();
            const byLocalId = new Map(current.map((entry) => [entry.options.id, entry]));
            const tree = this.rootInclude().subtree;
            if (tree === undefined)
                throw new Error("mcp: the profile config tree is not mounted");
            // Assign stable local ids to new servers; existing entries keep theirs.
            const taken = new Set(current.map((entry) => entry.options.id));
            const desired = input.servers.map((server) => {
                if (taken.has(server.id))
                    return server;
                const id = stableServerId(server.serverName, taken);
                taken.add(id);
                return { ...server, id };
            });
            const plan = planReconcile(current.map((entry) => ({
                id: entry.options.id,
                serverName: String(entry.options.config?.serverName ?? entry.options.id),
            })), desired);
            // Remove first so a `serverName` freed here can be reused by a later create.
            for (const id of plan.remove) {
                await tree.remove(id);
            }
            for (const { id, server } of plan.update) {
                const existing = byLocalId.get(id)?.options.config;
                const options = toMcpEntryOptions(server, existing);
                await tree.update(id, { config: options.config, disabled: options.disabled ?? false });
            }
            for (const server of plan.create) {
                // `toMcpEntryOptions` already carries the stable local id; pass the
                // whole row so the loader stores it under that id (not a random one).
                await tree.create(toMcpEntryOptions(server));
            }
            // Persist the reconciled set to the profile's patch layer. This is the
            // durable write: the loader's own write-back targets `cordis.yml`, which
            // the launcher resets to `[]` on every boot, so only this survives restart.
            const rows = desired.map((server) => toMcpEntryOptions(server, byLocalId.get(server.id)?.options.config));
            await persistMcpPatch(this.rootInclude(), rows);
            return this.list();
        }
    };
})();
export { McpRuntime };
