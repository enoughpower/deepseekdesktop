# dsh-skill-manager

A skill manager for the DeepSeek Harness (dsh) Web GUI: browse every installed
skill right inside Settings — a top-level **Skills** entry in the sidebar that
you can move into the Plugins section with one click.

## Features

- **Settings → Skills** (top-level, default): a read-only catalog of every
  skill the session can load, scanned from your user skill roots
  (`$DSH_HOME/skills`, `~/.agents/skills`).
- Each card shows the skill name, an invocation badge (**Model + user** /
  **User-only** / **Model-only**), and its description; expand it to see the
  source root and file path.
- Search filters by name and description.
- **Move the entry with one button**: "Move to the Plugins tab" removes the
  Skills entry from the sidebar and re-creates it as a tab inside
  Settings → Plugins; "Move back to the sidebar" reverses it. The choice is
  persisted in `localStorage` — exactly one entry exists at any time.
- Read-only: this plugin never writes or modifies skill files.

## Installation

Pick **one** of the two ways below — never both.

### Option A — one command (recommended)

```bash
dsh plugin --profile web add dsh-skill-manager
```

This adds the package to the profile's `dsh.profile.bundles`; its bundle patch
(`cordis.patch.yml`) mounts the plugin automatically on boot. Do **not** also
add a manual insert row for it.

Or from a local checkout:

```bash
dsh plugin --profile web add /absolute/path/to/dsh-skill-manager
```

### Option B — manual patch only

Use this only when the package is already resolvable from the profile's
`node_modules` (e.g. it was installed as a dependency some other way) and is
**not** in `dsh.profile.bundles`. Add one insert row to
`~/.dsh/profiles/web/cordis.patch.yml` (the config watcher hot-reloads it, no
restart required):

```yaml
- insert:
    - id: ui-skill-manager
      name: dsh-skill-manager
```

> ⚠️ **Never combine the two options.** Keeping the same plugin both in
> `dsh.profile.bundles` **and** in a manual insert row mounts the same loader
> entry id twice — boot fails with
> `duplicate loader entry id: ui-skill-manager`.

## Troubleshooting

### `duplicate loader entry id: <id>` on startup

Boot fails when the **same plugin is mounted from two sources** — typically a
package that appears both in `dsh.profile.bundles` (from `dsh plugin add`)
and as a manual insert row in `cordis.patch.yml`. The reported id may be any
duplicated plugin, not necessarily the one you just installed.

**Fix**: remove one of the two sources — delete the manual insert row from
`~/.dsh/profiles/web/cordis.patch.yml`, or remove the package from bundles
(`dsh plugin --profile web remove <pkg>`).

The DSH loader treats a duplicate id as fatal. A local patch makes it
idempotent (keep the first occurrence, warn, ignore the duplicate) so this
can never lock you out of the harness again; see the
[upstream issue](https://github.com/deepseek-ai/deepseek-harness/issues) and
re-run this patch script after every DSH upgrade:

```powershell
# 升级 DSH 后重跑（自动定位最新 loader，已打过会跳过）
powershell -ExecutionPolicy Bypass -File patch-dsh-dedupe.ps1
```

## Structure

- `lib/index.js` — host half: scans skill roots, parses `SKILL.md`
  frontmatter, serves the catalog at `GET /api/skill-manager/list`
  (same-origin fenced).
- `lib/client.js` — browser half: registers the `settings.section` entry
  (sidebar, order 12) and the `settings.plugins.tab` entry, and moves between
  them at runtime through `ctx.slots.register` disposers.
- `cordis.patch.yml` — the bundle patch that inserts the `ui-skill-manager`
  row.

## License

MIT
