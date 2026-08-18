// dsh-skill-manager — host half.
//
// Scans the user skill roots ($DSH_HOME/skills, ~/.agents/skills — the same
// roots dsh-skill-filesystem discovers at rank 400/500) and serves the catalog
// to the browser half through a same-origin JSON route. Read-only: this plugin
// never writes skill files.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

/** Stable cordis plugin name (matches cordis.patch.yml insert id). */
export const name = 'ui-skill-manager'
/** Services required before the skill-manager can mount its routes. */
export const inject = ['webServer']

/** Browser-facing base path of the skill-manager API. */
const API_PREFIX = '/api/skill-manager'

/** Roots the filesystem skill provider owns, in discovery rank order. */
function skillRoots() {
  const home = homedir()
  const dshHome = process.env.DSH_HOME || join(home, '.dsh')
  return [
    { id: 'user-dsh', path: join(dshHome, 'skills') },
    { id: 'user-agents', path: join(home, '.agents', 'skills') },
  ]
}

/** YAML-ish boolean forms the provider accepts (see dsh-skill-filesystem). */
const BOOLEAN_TRUE = new Set(['true', 'yes', 'on', '1'])
const BOOLEAN_FALSE = new Set(['false', 'no', 'off', '0'])
function parseBool(raw) {
  const v = String(raw).trim().toLowerCase()
  if (BOOLEAN_TRUE.has(v)) return true
  if (BOOLEAN_FALSE.has(v)) return false
  return undefined
}

/**
 * Parse the frontmatter of one SKILL.md. Returns null when the file has no
 * readable `---` block or carries no kebab-case name (same skip semantics as
 * discovery). description supports single-line and | / > folded blocks.
 */
function parseFrontmatter(text) {
  const m = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return null
  const fm = m[1]
  const nameMatch = fm.match(/^name:\s*(.+?)\s*$/m)
  if (!nameMatch) return null
  const name = nameMatch[1].replace(/^["']|["']$/g, '')
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) return null

  let description = ''
  const descLine = fm.match(/^description:\s*(.*?)\s*$/m)
  if (descLine) {
    const inline = descLine[1]
    if (inline && inline !== '|' && inline !== '>') {
      description = inline.replace(/^["']|["']$/g, '')
    } else {
      // Folded / literal block: collect the following indented lines.
      const after = fm.slice(descLine.index + descLine[0].length)
      const lines = []
      for (const line of after.split(/\r?\n/)) {
        if (/^\s*[-#]/.test(line) || !/^\s+/.test(line)) break
        lines.push(line.trim())
      }
      description = lines.join(' ')
    }
  }

  const dmLine = fm.match(/^disable-model-invocation:\s*(.+?)\s*$/m)
  const uiLine = fm.match(/^user-invocable:\s*(.+?)\s*$/m)
  const disableModel = dmLine ? parseBool(dmLine[1]) : undefined
  const userInvocable = uiLine ? parseBool(uiLine[1]) : undefined
  return {
    name,
    description: description.trim(),
    // Both positive values are always emitted (provider semantics).
    disableModelInvocation: disableModel === true,
    modelInvocable: disableModel !== true,
    userInvocable: userInvocable !== false,
  }
}

/** Scan one root directory for skill bundles (`<name>/SKILL.md`) and flat `.md`. */
function scanRoot(root) {
  const out = []
  let entries
  try {
    entries = readdirSync(root.path, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    if (entry.name === '.system') continue
    const full = join(root.path, entry.name)
    if (entry.isDirectory()) {
      const skillFile = join(full, 'SKILL.md')
      try {
        if (!statSync(skillFile).isFile()) continue
      } catch {
        continue
      }
      out.push(readSkill(skillFile, root))
    } else if (entry.name.endsWith('.md')) {
      out.push(readSkill(full, root))
    }
  }
  return out
}

/** Parse one skill file into a catalog entry (null when unreadable/invalid). */
function readSkill(file, root) {
  let text
  try {
    text = readFileSync(file, 'utf8')
  } catch {
    return null
  }
  const fm = parseFrontmatter(text)
  if (!fm) return null
  return {
    name: fm.name,
    description: fm.description,
    modelInvocable: fm.modelInvocable,
    userInvocable: fm.userInvocable,
    invocation: !fm.modelInvocable ? 'user-only' : fm.userInvocable ? 'model-and-user' : 'model-only',
    source: root.id,
    root: root.path,
    path: file,
  }
}

/** Build the full catalog: every root, sorted by name. */
export function listSkills() {
  const skills = []
  for (const root of skillRoots()) {
    for (const entry of scanRoot(root)) {
      if (entry !== null) skills.push(entry)
    }
  }
  skills.sort((a, b) => a.name.localeCompare(b.name))
  return skills
}

// ── same-origin JSON routes (fence copied from the skin-center pattern) ────

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

function isSameOriginRequest(req) {
  const site = req.headers['sec-fetch-site']
  if (typeof site === 'string' && site === 'cross-site') return false
  const origin = req.headers.origin
  if (typeof origin === 'string' && origin !== '' && origin !== 'null') {
    const host = req.headers.host
    if (typeof host !== 'string' || host === '') return false
    try {
      if (new URL(origin).host !== host) return false
    } catch {
      return false
    }
  }
  return true
}

function requireSameOrigin(req, res) {
  if (isSameOriginRequest(req)) return true
  json(res, 403, { ok: false, error: 'cross-site-request-rejected' })
  return false
}

/** Register the skill-manager API routes. Failures log, never throw. */
export function apply(ctx) {
  const routes = [
    {
      kind: 'exact',
      path: `${API_PREFIX}/list`,
      handler: (req, res) => {
        if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method-not-allowed' })
        if (!requireSameOrigin(req, res)) return
        try {
          json(res, 200, { ok: true, skills: listSkills() })
        } catch (error) {
          json(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) })
        }
      },
    },
  ]
  try {
    ctx.effect(() => {
      const disposers = []
      try {
        for (const route of routes) disposers.push(ctx.webServer.register(route))
      } catch (error) {
        for (const dispose of disposers) dispose()
        throw error
      }
      return () => {
        for (const dispose of disposers) dispose()
      }
    }, 'ui-skill-manager: routes')
  } catch (error) {
    console.error('[ui-skill-manager] route registration failed:', error)
  }
}
