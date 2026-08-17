import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { credentialRef } from "@deepseek-ai/dsh-credentials";
import { resolveDshHome } from "@deepseek-ai/dsh-home-paths";

/** Cordis plugin name (matches the cordis patch insert id). */
const name = "billing";
/** The webserver owns the HTTP route; sessions feed the hourly usage recorder. */
const inject = ["webServer", "sessions"];

const API_BASE_URL = "https://api.deepseek.com";
const PLATFORM_BASE_URL = "https://platform.deepseek.com";
const API_KEY_REF = "DEEPSEEK_API_KEY";
/** The platform console's localStorage `userToken`, used for the private usage API. */
const PLATFORM_TOKEN_REF = "DEEPSEEK_PLATFORM_TOKEN";
const RECHARGE_URL = "https://platform.deepseek.com/top_up";
const BALANCE_CACHE_MS = 30_000;
const RECORDER_INTERVAL_MS = 60_000;
const TIMEOUT_MS = 15_000;
const MAX_BODY_BYTES = 256_000;

/** deepseek-v4-flash official prices (CNY per 1M tokens) for the hourly estimate. */
const PRICES = {
  inputPerMillion: 1,
  cacheReadPerMillion: 0.02,
  cacheWritePerMillion: 0,
  outputPerMillion: 2,
  currency: "CNY",
};

function ok(value) {
  return { ok: true, value };
}

function fail(code, message) {
  return { ok: false, error: { code, message } };
}

function toFinite(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}

function costOfBucket(b) {
  return (
    (b.in / 1e6) * PRICES.inputPerMillion +
    (b.cacheRead / 1e6) * PRICES.cacheReadPerMillion +
    (b.cacheWrite / 1e6) * PRICES.cacheWritePerMillion +
    (b.out / 1e6) * PRICES.outputPerMillion
  );
}

function zeroBucket() {
  return { in: 0, out: 0, cacheRead: 0, cacheWrite: 0, cost: 0 };
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function localDateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function localHourKey(d = new Date()) {
  return `${localDateKey(d)}T${pad2(d.getHours())}`;
}

// ── hourly usage recorder (fallback for the "hour" granularity) ────────────
function usageStorePath() {
  return join(resolveDshHome(), "storages", "dsh-billing-usage.json");
}

let store = null;

function ensureStore() {
  if (store === null) {
    try {
      const parsed = JSON.parse(readFileSync(usageStorePath(), "utf8"));
      store = { hours: parsed.hours || {}, lastSeen: parsed.lastSeen || {} };
    } catch {
      store = { hours: {}, lastSeen: {} };
    }
  }
  return store;
}

function saveUsageStore() {
  try {
    const p = usageStorePath();
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, JSON.stringify(ensureStore()));
  } catch {
    /* non-fatal */
  }
}

function recordSessionDeltas(ctx) {
  const sessions = ctx.get("sessions");
  const registry = ctx.get("sessionProjections");
  if (!sessions || !registry) return;
  const s = ensureStore();
  const hourKey = localHourKey();
  let changed = false;
  for (const session of sessions.list()) {
    let usage;
    try {
      const value = registry.snapshot(session)?.values?.tokenUsage;
      if (value && typeof value === "object") usage = value;
    } catch {
      /* projection unavailable */
    }
    if (usage === undefined) continue;
    const cur = {
      in: usage.uncachedInputTokens ?? 0,
      out: usage.outputTokens ?? 0,
      cacheRead: usage.cacheReadTokens ?? 0,
      cacheWrite: usage.cacheWriteTokens ?? 0,
    };
    const id = session.header?.id ?? session.id;
    const prev = s.lastSeen[id];
    if (prev !== undefined) {
      const dIn = Math.max(0, cur.in - prev.in);
      const dOut = Math.max(0, cur.out - prev.out);
      const dCacheRead = Math.max(0, cur.cacheRead - prev.cacheRead);
      const dCacheWrite = Math.max(0, cur.cacheWrite - prev.cacheWrite);
      if (dIn + dOut + dCacheRead + dCacheWrite > 0) {
        const hour = s.hours[hourKey] || zeroBucket();
        hour.in += dIn;
        hour.out += dOut;
        hour.cacheRead += dCacheRead;
        hour.cacheWrite += dCacheWrite;
        hour.cost = costOfBucket(hour);
        s.hours[hourKey] = hour;
        changed = true;
      }
    }
    s.lastSeen[id] = cur;
  }
  if (changed) saveUsageStore();
}

function hourlySeries() {
  const s = ensureStore();
  const now = new Date();
  const out = [];
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - i);
    const key = localHourKey(d);
    const b = s.hours[key];
    out.push({
      key,
      label: `${pad2(d.getHours())}:00`,
      cost: b?.cost ?? 0,
      tokens: (b?.in ?? 0) + (b?.out ?? 0) + (b?.cacheRead ?? 0) + (b?.cacheWrite ?? 0),
    });
  }
  return out;
}

// ── credential resolution ───────────────────────────────────────────────────
async function resolveCredential(ctx, ref) {
  const credentials = ctx.get("credentials");
  if (credentials !== undefined) {
    const hit = await credentials.resolve(credentialRef(ref));
    if (hit !== undefined && hit.value.length > 0) return hit.value;
  }
  const env = ctx.get("launchEnvironment")?.get(ref);
  if (env !== undefined && env.value.length > 0) return env.value;
  const fallback = process.env[ref];
  if (typeof fallback === "string" && fallback.length > 0) return fallback;
  return undefined;
}

// ── balance (public API, API key) ──────────────────────────────────────────
let balanceCache = null;
let balanceCacheAt = 0;

async function fetchBalance(ctx) {
  const now = Date.now();
  if (balanceCache !== null && now - balanceCacheAt < BALANCE_CACHE_MS) return balanceCache;
  const key = await resolveCredential(ctx, API_KEY_REF);
  if (key === undefined) {
    return fail("no-key", "未配置 DeepSeek API Key（请在「模型」设置里填写 DEEPSEEK_API_KEY）");
  }
  let result;
  try {
    const response = await fetch(`${API_BASE_URL}/user/balance`, {
      method: "GET",
      headers: { authorization: `Bearer ${key}`, accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      result = fail("http", `查询余额失败：HTTP ${response.status}${body ? " — " + body.slice(0, 200) : ""}`);
    } else {
      const payload = await response.json();
      const balances = (Array.isArray(payload.balance_infos) ? payload.balance_infos : [])
        .map((b) => ({
          currency: String(b.currency ?? ""),
          total_balance: String(b.total_balance ?? "0"),
          granted_balance: String(b.granted_balance ?? "0"),
          topped_up_balance: String(b.topped_up_balance ?? "0"),
        }))
        .filter((b) => b.currency !== "");
      result = ok({ available: payload.is_available !== false, balances, rechargeUrl: RECHARGE_URL });
    }
  } catch (error) {
    result = fail("network", error?.message ?? String(error));
  }
  balanceCache = result;
  balanceCacheAt = now;
  return result;
}

// ── usage (private platform API, userToken) ────────────────────────────────
async function fetchPlatformCostMonth(token, month, year) {
  const url = `${PLATFORM_BASE_URL}/api/v0/usage/cost?month=${month}&year=${year}`;
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/json",
      "x-app-version": "1.0.0",
      origin: PLATFORM_BASE_URL,
      referer: `${PLATFORM_BASE_URL}/usage`,
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`用量接口 HTTP ${response.status}`);
  const body = await response.json();
  const biz = body && typeof body === "object" ? body.data : undefined;
  if (body?.code !== 0 || biz === undefined || biz.biz_code !== 0) {
    const code = body?.code ?? biz?.biz_code;
    if (code === 40002 || code === 40003) throw new Error("DEEPSEEK_PLATFORM_TOKEN 已过期，请重新登录 platform.deepseek.com 并更新 userToken");
    throw new Error(`用量接口错误 (code ${code ?? "unknown"})`);
  }
  const bizData = Array.isArray(biz.biz_data) ? biz.biz_data[0] : biz.biz_data;
  const days = bizData && typeof bizData === "object" ? bizData.days : undefined;
  if (!Array.isArray(days)) return [];
  return days
    .map((d) => {
      if (!d || typeof d !== "object" || !Array.isArray(d.data)) return null;
      let cost = 0;
      let tokens = 0;
      for (const modelEntry of d.data) {
        if (!modelEntry || !Array.isArray(modelEntry.usage)) continue;
        for (const u of modelEntry.usage) {
          const c = toFinite(u?.cost ?? u?.amount);
          if (Number.isFinite(c)) cost += c;
          const t = toFinite(u?.total_tokens ?? u?.tokens ?? u?.token_amount);
          if (Number.isFinite(t)) tokens += t;
        }
      }
      return { date: String(d.date ?? ""), cost, tokens };
    })
    .filter((d) => d !== null && d.date.length > 0);
}

function monthKeys(count) {
  const now = new Date();
  const keys = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }
  return keys;
}

function granularityMonthCount(granularity) {
  if (granularity === "month") return 12;
  if (granularity === "week") return 3;
  return 2; // day
}

async function fetchPlatformUsage(ctx, granularity) {
  const token = await resolveCredential(ctx, PLATFORM_TOKEN_REF);
  if (token === undefined) {
    return fail(
      "no-token",
      "未配置 DEEPSEEK_PLATFORM_TOKEN：请登录 platform.deepseek.com，在浏览器开发者工具里复制 localStorage 的 userToken，填到「模型」设置的凭据中",
    );
  }
  const count = granularityMonthCount(granularity);
  const results = await Promise.all(monthKeys(count).map((k) => fetchPlatformCostMonth(token, k.month, k.year)));
  const byDate = new Map();
  for (const list of results) for (const d of list) byDate.set(d.date, d);
  const days = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  let totalCost = 0;
  for (const d of days) totalCost += d.cost;
  const today = days.find((d) => d.date === localDateKey());
  const monthPrefix = localDateKey().slice(0, 7);
  let monthCost = 0;
  for (const d of days) if (d.date.startsWith(monthPrefix)) monthCost += d.cost;
  return ok({ granularity, days, totalCost, todayCost: today?.cost ?? 0, monthCost });
}

const handlers = {
  async balance(payload, ctx) {
    return await fetchBalance(ctx);
  },
  async usage(payload, ctx) {
    const granularity = typeof payload.granularity === "string" ? payload.granularity : "day";
    if (granularity === "hour") {
      return ok({ granularity: "hour", hours: hourlySeries() });
    }
    return await fetchPlatformUsage(ctx, granularity);
  },
  async prices() {
    return ok(PRICES);
  },

  async platformTokenStatus(payload, ctx) {
    const token = await resolveCredential(ctx, PLATFORM_TOKEN_REF);
    return ok({ configured: token !== undefined });
  },

  async openRecharge() {
    try {
      // `/usr/bin/open` hands the URL to the system default browser (e.g. Chrome).
      const child = spawn("/usr/bin/open", [RECHARGE_URL], { stdio: "ignore", detached: true });
      child.unref();
      return ok({ opened: true });
    } catch (error) {
      return fail("open-failed", error?.message ?? String(error));
    }
  },

  async setPlatformToken(payload, ctx) {
    const credentials = ctx.get("credentials");
    if (credentials === undefined) return fail("no-credentials", "凭据服务不可用");
    const token = typeof payload.token === "string" ? payload.token.trim() : "";
    if (token.length === 0) {
      await credentials.unset(credentialRef(PLATFORM_TOKEN_REF));
      return ok({ configured: false });
    }
    await credentials.set(credentialRef(PLATFORM_TOKEN_REF), token);
    return ok({ configured: true });
  },
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = "";
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("request body too large"));
        req.destroy();
        return;
      }
      body += chunk.toString();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function json(res, status, value) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(value));
}

async function handleRequest(ctx, req, res) {
  if (req.method !== "POST") {
    json(res, 405, fail("method", "POST required"));
    return;
  }
  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    json(res, 413, fail("body", error.message));
    return;
  }
  let payload;
  try {
    payload = JSON.parse(body || "{}");
  } catch {
    json(res, 400, fail("bad-json", "invalid JSON body"));
    return;
  }
  const fn = typeof payload.op === "string" ? handlers[payload.op] : undefined;
  if (fn === undefined) {
    json(res, 400, fail("bad-op", `unknown op ${JSON.stringify(payload.op)}`));
    return;
  }
  try {
    json(res, 200, await fn(payload, ctx));
  } catch (error) {
    json(res, 200, fail("internal", error?.message ?? String(error)));
  }
}

function apply(ctx) {
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: "exact",
        path: "/billing",
        handler: (req, res) => handleRequest(ctx, req, res),
      }),
    "dsh-billing: /billing route",
  );
  const timer = setInterval(() => recordSessionDeltas(ctx), RECORDER_INTERVAL_MS);
  timer.unref?.();
  ctx.effect(() => () => clearInterval(timer), "dsh-billing: usage recorder");
}

export { apply, inject, name, PRICES };
