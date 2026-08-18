import { readFile } from "node:fs/promises"
import { homedir } from "node:os"
import { resolve } from "node:path"

import {
  VISION_PROVIDERS,
  type VisionProviderName,
} from "./provider-catalog.js"

interface ProviderEnvironment {
  readonly baseEnv: string
  readonly modelEnv: string
}

const PROVIDER_ENVIRONMENT = {
  zenmux: {
    baseEnv: "ZENMUX_BASE_URL",
    modelEnv: "ZENMUX_MODEL",
  },
  bailian: {
    baseEnv: "BAILIAN_BASE_URL",
    modelEnv: "BAILIAN_MODEL",
  },
  tokendance: {
    baseEnv: "TOKENDANCE_BASE_URL",
    modelEnv: "TOKENDANCE_MODEL",
  },
  openrouter: {
    baseEnv: "OPENROUTER_BASE_URL",
    modelEnv: "OPENROUTER_MODEL",
  },
} satisfies Record<VisionProviderName, ProviderEnvironment>

export type SeeProviderName = VisionProviderName

export interface SeeProvider {
  readonly name: SeeProviderName
  readonly apiKey: string
  readonly baseURL: string
  readonly model: string
}

const DEFAULT_ORDER: readonly SeeProviderName[] = [
  "zenmux",
  "bailian",
  "tokendance",
  "openrouter",
]

function parseEnv(text: string): Map<string, string> {
  const values = new Map<string, string>()
  for (const line of text.split(/\r?\n/u)) {
    const trimmed = line.trim()
    if (trimmed === "" || trimmed.startsWith("#")) continue
    const separator = trimmed.indexOf("=")
    if (separator <= 0) continue
    const key = trimmed.slice(0, separator).trim()
    const raw = trimmed.slice(separator + 1).trim()
    const value = raw.replace(/^(?:"(.*)"|'(.*)')$/u, "$1$2")
    if (key !== "" && value !== "") values.set(key, value)
  }
  return values
}

function value(
  name: string,
  values: ReadonlyMap<string, string>,
  fallback = ""
): string {
  return process.env[name]?.trim() || values.get(name)?.trim() || fallback
}

function providerOrder(values: ReadonlyMap<string, string>): SeeProviderName[] {
  const preferred = value("SEE_PROVIDER", values).toLowerCase()
  const configured = value("SEE_PROVIDER_ORDER", values)
  const source = configured === "" ? DEFAULT_ORDER : configured.split(",")
  const order = source
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is SeeProviderName => item in VISION_PROVIDERS)
  if (preferred in VISION_PROVIDERS) {
    const first = preferred as SeeProviderName
    return [first, ...order.filter((item) => item !== first)]
  }
  return order
}

export async function loadSeeProviders(
  configFile?: string
): Promise<SeeProvider[]> {
  const path = resolve(
    configFile ??
      process.env.SEE_CONFIG_FILE ??
      `${homedir()}/.config/see/config.env`
  )
  let stored = ""
  try {
    stored = await readFile(path, "utf8")
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code !== "ENOENT") throw error
  }
  const values = parseEnv(stored)
  const preferred = value("SEE_PROVIDER", values).toLowerCase()
  const providers: SeeProvider[] = []
  for (const name of providerOrder(values)) {
    const spec = VISION_PROVIDERS[name]
    const environment = PROVIDER_ENVIRONMENT[name]
    const providerKey = spec.credentialRefs
      .map((keyName) => value(keyName, values))
      .find((candidate) => candidate !== "")
    const apiKey =
      providerKey ?? (preferred === name ? value("SEE_API_KEY", values) : "")
    if (apiKey === "") continue
    const useCommon = preferred === name
    providers.push({
      name,
      apiKey,
      baseURL: useCommon
        ? value(
            "SEE_BASE_URL",
            values,
            value(environment.baseEnv, values, spec.baseURL)
          )
        : value(environment.baseEnv, values, spec.baseURL),
      model: useCommon
        ? value(
            "SEE_MODEL",
            values,
            value(environment.modelEnv, values, spec.model)
          )
        : value(environment.modelEnv, values, spec.model),
    })
  }
  return providers
}
