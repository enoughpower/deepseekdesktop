import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import type {
  CredentialView,
  IApiClient,
} from "@deepseek-ai/dsh-api-remotes/client"
import type { SettingsScope } from "@deepseek-ai/dsh-client-runtime/client"
import {
  IconChevronDownOutline14,
  Input,
} from "@deepseek-ai/dsh-client-ui-primitives"

import {
  VISION_PROVIDERS,
  isVisionProviderName,
  type VisionProviderName,
} from "../provider-catalog.js"
import type { VisionLocaleKey } from "./locales.js"
import {
  VISION_SETTINGS_NAMESPACE,
  draftForProvider,
  draftOf,
  sameDraft,
  settingsOps,
  validMaxImages,
  validProviderDraft,
  type VisionDraft,
  type VisionSettings,
} from "./settings.js"

export interface VisionSettingsCardInjected {
  readonly scope: SettingsScope<VisionSettings>
  readonly api: Pick<IApiClient, "settings" | "credentials">
}

export interface VisionSettingsCardProps
  extends Partial<VisionSettingsCardInjected> {
  readonly t?: (key: VisionLocaleKey) => string
}

type CredentialState =
  | { readonly kind: "idle" | "loading" }
  | {
      readonly kind: "ready"
      readonly credentials: Readonly<Record<string, CredentialView>>
    }
  | { readonly kind: "error" }

function credentialFacts(
  provider: VisionProviderName | undefined,
  state: CredentialState
): {
  readonly configured: boolean
  readonly writable: boolean
  readonly primaryRef: string | undefined
} {
  if (provider === undefined) {
    return { configured: false, writable: false, primaryRef: undefined }
  }
  const refs = VISION_PROVIDERS[provider].credentialRefs
  const primaryRef = refs[0]
  if (primaryRef === undefined || state.kind !== "ready") {
    return { configured: false, writable: true, primaryRef }
  }
  return {
    configured: refs.some((ref) => state.credentials[ref]?.configured === true),
    writable: state.credentials[primaryRef]?.writable !== false,
    primaryRef,
  }
}

export function VisionSettingsCard(props: VisionSettingsCardProps): ReactNode {
  const { scope, api, t } = props
  if (scope === undefined || api === undefined || t === undefined) return null
  return <Loaded scope={scope} api={api} t={t} />
}

function Loaded({ scope, api, t }: VisionSettingsCardInjected & {
  readonly t: (key: VisionLocaleKey) => string
}): ReactNode {
  const snapshot = useSyncExternalStore(
    (listener) => scope.subscribe(listener),
    () => scope.getSnapshot(),
    () => scope.getSnapshot()
  )
  const initial = draftOf(snapshot.value)
  const [open, setOpen] = useState(false)
  const [baseline, setBaseline] = useState<VisionDraft>(initial)
  const [draft, setDraft] = useState<VisionDraft>(initial)
  const [revision, setRevision] = useState<number | undefined>(snapshot.revision)
  const [credential, setCredential] = useState<CredentialState>({ kind: "idle" })
  const [keyDraft, setKeyDraft] = useState("")
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<string | undefined>(undefined)
  const [saved, setSaved] = useState(false)
  const [externalChange, setExternalChange] = useState(false)

  const settingsDirty = !sameDraft(baseline, draft)
  const keyDirty = keyDraft.trim() !== ""
  const dirty = settingsDirty || keyDirty
  const maxImagesValid = validMaxImages(draft.maxImages)
  const providerValid = validProviderDraft(draft)
  const writable = snapshot.status === "ready" && snapshot.writable
  const facts = credentialFacts(draft.provider, credential)
  const credentialPending =
    draft.provider !== undefined &&
    (credential.kind === "idle" || credential.kind === "loading")
  const keyRequired =
    draft.provider !== undefined && !credentialPending &&
    !facts.configured && !keyDirty
  const disabled = !writable || saving

  useEffect(() => {
    if (snapshot.status !== "ready" || snapshot.revision === revision) return
    if (settingsDirty) {
      setExternalChange(true)
      return
    }
    const next = draftOf(snapshot.value)
    setBaseline(next)
    setDraft(next)
    setRevision(snapshot.revision)
    setFailure(undefined)
    setExternalChange(false)
  }, [revision, settingsDirty, snapshot.revision, snapshot.status, snapshot.value])

  useEffect(() => {
    const provider = draft.provider
    if (!open || provider === undefined) {
      setCredential({ kind: "idle" })
      return
    }
    let active = true
    setCredential({ kind: "loading" })
    void api.credentials.describe({
      refs: [...VISION_PROVIDERS[provider].credentialRefs],
    }).then(
      (response) => {
        if (!active) return
        setCredential(
          response.result.ok
            ? { kind: "ready", credentials: response.result.value.credentials }
            : { kind: "error" }
        )
      },
      () => {
        if (active) setCredential({ kind: "error" })
      }
    )
    return () => { active = false }
  }, [api.credentials, draft.provider, open])

  const clearMessages = (): void => {
    setSaved(false)
    setFailure(undefined)
  }

  const discard = (): void => {
    const next = draftOf(snapshot.status === "ready" ? snapshot.value : undefined)
    setBaseline(next)
    setDraft(next)
    setRevision(snapshot.revision)
    setKeyDraft("")
    setFailure(undefined)
    setSaved(false)
    setExternalChange(false)
  }

  const save = (): void => {
    if (
      !dirty || !maxImagesValid || !providerValid || keyRequired ||
      credentialPending || saving ||
      !writable || externalChange
    ) return
    setSaving(true)
    setFailure(undefined)
    setSaved(false)
    void (async () => {
      if (keyDirty && facts.primaryRef !== undefined) {
        const stored = await api.credentials.set({
          ref: facts.primaryRef,
          value: keyDraft.trim(),
        })
        if (!stored.result.ok) {
          setFailure(t("keySaveFailed"))
          return
        }
        setCredential({
          kind: "ready",
          credentials: {
            [facts.primaryRef]: {
              configured: true,
              writable: true,
              source: "file",
            },
          },
        })
        setKeyDraft("")
      }

      const ops = settingsOps(baseline, draft)
      if (ops.length > 0) {
        const response = await api.settings.mutate({
          ns: VISION_SETTINGS_NAMESPACE,
          ops: ops.map((op) => ({ ...op, path: [...op.path] })),
          ...(revision === undefined ? {} : { expectedRevision: revision }),
        })
        if (!response.result.ok) {
          if (response.result.error.code === "settings-conflict") {
            setExternalChange(true)
            setFailure(t("conflict"))
          } else {
            setFailure(t("saveFailed"))
          }
          return
        }
        const next = draftOf(response.result.value.value as VisionSettings)
        setBaseline(next)
        setDraft(next)
        setRevision(response.result.value.revision)
        setExternalChange(false)
      }
      setSaved(true)
    })().catch(() => {
      setFailure(t("saveFailed"))
    }).finally(() => {
      setSaving(false)
    })
  }

  if (snapshot.status === "unavailable") return null

  const credentialLabel = credential.kind === "loading"
    ? t("keyLoading")
    : facts.configured
      ? t("keyConfigured")
      : t("keyMissing")
  const keyHint = credential.kind === "error"
    ? t("keyLoadFailed")
    : credentialPending
      ? t("keyLoading")
    : facts.configured && !facts.writable
      ? t("keyReadOnly")
      : keyRequired
        ? t("keyRequired")
        : t("keyPlaceholder")

  return (
    <li className="dsh-vision-settings-card" data-open={open ? "true" : "false"}>
      <button
        type="button"
        className="dsh-vision-settings-header"
        aria-expanded={open}
        aria-label={`${t(open ? "collapse" : "expand")}: ${t("title")}`}
        onClick={() => { setOpen((current) => !current) }}
      >
        <span className="dsh-vision-settings-head-text">
          <span className="dsh-vision-settings-name">{t("title")}</span>
          <span className="dsh-vision-settings-description">{t("description")}</span>
        </span>
        {dirty ? <span className="dsh-vision-settings-pending">{t("unsaved")}</span> : null}
        <IconChevronDownOutline14 className="dsh-vision-settings-chevron" />
      </button>
      {open
        ? (
          <div className="dsh-vision-settings-body">
            {snapshot.status === "loading"
              ? <p className="dsh-vision-settings-status">{t("loading")}</p>
              : null}
            {snapshot.status === "ready" && !snapshot.writable
              ? <p className="dsh-vision-settings-status">{t("readOnly")}</p>
              : null}

            <div className="dsh-vision-settings-field">
              <label className="dsh-vision-settings-label" htmlFor="dsh-vision-provider">
                {t("provider")}
              </label>
              <select
                id="dsh-vision-provider"
                className="dsh-vision-settings-select"
                value={draft.provider ?? ""}
                disabled={disabled}
                onChange={(event) => {
                  const provider = isVisionProviderName(event.target.value)
                    ? event.target.value
                    : undefined
                  setDraft((current) => draftForProvider(current, provider))
                  setKeyDraft("")
                  clearMessages()
                }}
              >
                <option value="">{t("automatic")}</option>
                {Object.entries(VISION_PROVIDERS).map(([id, provider]) => (
                  <option key={id} value={id}>{provider.displayName}</option>
                ))}
              </select>
              <p className="dsh-vision-settings-hint">
                {t(draft.provider === undefined ? "automaticHint" : "configuredHint")}
              </p>
            </div>

            {draft.provider === undefined
              ? null
              : (
                <>
                  <div className="dsh-vision-settings-field">
                    <div className="dsh-vision-settings-field-head">
                      <label className="dsh-vision-settings-label" htmlFor="dsh-vision-api-key">
                        {t("apiKey")}
                      </label>
                      <span
                        className="dsh-vision-settings-badge"
                        data-tone={facts.configured ? "success" : "muted"}
                      >
                        {credentialLabel}
                      </span>
                    </div>
                    <Input
                      id="dsh-vision-api-key"
                      className="dsh-vision-settings-input"
                      type="password"
                      autoComplete="off"
                      value={keyDraft}
                      placeholder={t("keyPlaceholder")}
                      disabled={disabled || !facts.writable}
                      aria-invalid={keyRequired}
                      onChange={(event) => {
                        setKeyDraft(event.target.value)
                        clearMessages()
                      }}
                    />
                    <p className={keyRequired ? "dsh-vision-settings-error" : "dsh-vision-settings-hint"}>
                      {keyHint}
                    </p>
                  </div>

                  <div className="dsh-vision-settings-field">
                    <label className="dsh-vision-settings-label" htmlFor="dsh-vision-model">
                      {t("model")}
                    </label>
                    <Input
                      id="dsh-vision-model"
                      className="dsh-vision-settings-input"
                      value={draft.model}
                      disabled={disabled}
                      aria-invalid={!providerValid}
                      onChange={(event) => {
                        setDraft((current) => ({ ...current, model: event.target.value }))
                        clearMessages()
                      }}
                    />
                    <p className="dsh-vision-settings-hint">{t("modelHint")}</p>
                  </div>

                  <div className="dsh-vision-settings-field">
                    <label className="dsh-vision-settings-label" htmlFor="dsh-vision-base-url">
                      {t("baseURL")}
                    </label>
                    <Input
                      id="dsh-vision-base-url"
                      className="dsh-vision-settings-input"
                      type="url"
                      value={draft.baseURL}
                      disabled={disabled}
                      aria-invalid={!providerValid}
                      onChange={(event) => {
                        setDraft((current) => ({ ...current, baseURL: event.target.value }))
                        clearMessages()
                      }}
                    />
                    <p className={providerValid ? "dsh-vision-settings-hint" : "dsh-vision-settings-error"}>
                      {t(providerValid ? "baseURLHint" : "invalidProvider")}
                    </p>
                  </div>
                </>
              )}

            <div className="dsh-vision-settings-field">
              <label className="dsh-vision-settings-label" htmlFor="dsh-vision-max-images">
                {t("maxImages")}
              </label>
              <Input
                id="dsh-vision-max-images"
                className="dsh-vision-settings-number"
                type="number"
                inputMode="numeric"
                min={1}
                max={32}
                step={1}
                value={String(draft.maxImages)}
                disabled={disabled}
                aria-invalid={!maxImagesValid}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    maxImages: Number(event.target.value),
                  }))
                  clearMessages()
                }}
              />
              <p className={maxImagesValid ? "dsh-vision-settings-hint" : "dsh-vision-settings-error"}>
                {t(maxImagesValid ? "maxImagesHint" : "invalidMaxImages")}
              </p>
            </div>

            <p className="dsh-vision-settings-failover">{t("failover")}</p>
            <div className="dsh-vision-settings-footer">
              <p
                className="dsh-vision-settings-footer-status"
                data-tone={failure === undefined ? "success" : "error"}
                role="status"
              >
                {externalChange ? t("conflict") : failure ?? (saved ? t("saved") : "")}
              </p>
              <button
                type="button"
                className="dsh-vision-settings-action dsh-vision-settings-discard"
                disabled={!dirty || saving}
                onClick={discard}
              >
                {t("discard")}
              </button>
              <button
                type="button"
                className="dsh-vision-settings-action dsh-vision-settings-save"
                disabled={
                  !dirty || !maxImagesValid || !providerValid || keyRequired ||
                  credentialPending || saving || !writable || externalChange
                }
                onClick={save}
              >
                {t(saving ? "saving" : "save")}
              </button>
            </div>
          </div>
        )
        : null}
    </li>
  )
}
