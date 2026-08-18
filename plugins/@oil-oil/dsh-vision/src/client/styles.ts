export const SETTINGS_STYLE_ID = "@oil-oil/dsh-vision/settings"

export const SETTINGS_CSS = String.raw`
.dsh-vision-settings-card {
  list-style: none;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-3);
  transition: border-color .16s, background .16s;
}

.dsh-vision-settings-card:hover,
.dsh-vision-settings-card[data-open="true"] {
  border-color: var(--dsw-alias-label-dimmed);
}

.dsh-vision-settings-card[data-open="true"] {
  background: var(--dsw-alias-bg-layer-2);
}

.dsh-vision-settings-header {
  width: 100%;
  appearance: none;
  border: 0;
  border-radius: 12px;
  padding: 14px 16px;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dsh-vision-settings-header:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: -2px;
}

.dsh-vision-settings-head-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dsh-vision-settings-name {
  color: var(--dsw-alias-label-primary);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}

.dsh-vision-settings-description {
  color: var(--dsw-alias-label-tertiary);
  font-size: 13px;
  line-height: 1.5;
}

.dsh-vision-settings-pending,
.dsh-vision-settings-badge {
  flex: none;
  border-radius: 999px;
  padding: 1px 8px;
  background: var(--dsw-alias-bg-module-platform);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  font-weight: 500;
  line-height: 17px;
  white-space: nowrap;
}

.dsh-vision-settings-badge[data-tone="success"] {
  color: var(--dsw-alias-state-success-primary);
}

.dsh-vision-settings-badge[data-tone="muted"] {
  color: var(--dsw-alias-label-tertiary);
}

.dsh-vision-settings-chevron {
  flex: none;
  color: var(--dsw-alias-label-tertiary);
  transition: transform .16s;
}

.dsh-vision-settings-card[data-open="true"] .dsh-vision-settings-chevron {
  transform: rotate(180deg);
}

.dsh-vision-settings-body {
  margin: 0 16px;
  border-top: 1px solid var(--dsw-alias-border-l2);
  padding-bottom: 8px;
}

.dsh-vision-settings-status {
  margin: 12px 0 0;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 1.5;
}

.dsh-vision-settings-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
}

.dsh-vision-settings-field + .dsh-vision-settings-field {
  border-top: 1px solid var(--dsw-alias-border-l2);
}

.dsh-vision-settings-field-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dsh-vision-settings-label {
  flex: 1;
  min-width: 0;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
}

.dsh-vision-settings-select {
  box-sizing: border-box;
  width: 100%;
  height: 34px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  padding: 0 34px 0 12px;
  background: var(--dsw-alias-bg-layer-3);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
}

.dsh-vision-settings-select:focus-visible {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
}

.dsh-vision-settings-select:disabled {
  color: var(--dsw-alias-label-tertiary);
  cursor: default;
}

.dsh-vision-settings-input {
  box-sizing: border-box;
  width: 100%;
}

.dsh-vision-settings-number {
  width: 160px;
}

.dsh-vision-settings-hint,
.dsh-vision-settings-error {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}

.dsh-vision-settings-hint {
  color: var(--dsw-alias-label-tertiary);
}

.dsh-vision-settings-error {
  color: var(--dsw-alias-label-error);
}

.dsh-vision-settings-failover {
  margin: 0;
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--dsw-alias-bg-module-platform);
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.dsh-vision-settings-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  border-top: 1px solid var(--dsw-alias-border-l2);
  padding: 12px 0 4px;
}

.dsh-vision-settings-footer-status {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
}

.dsh-vision-settings-footer-status[data-tone="success"] {
  color: var(--dsw-alias-state-success-primary);
}

.dsh-vision-settings-footer-status[data-tone="error"] {
  color: var(--dsw-alias-label-error);
}

.dsh-vision-settings-action {
  appearance: none;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 5px 14px;
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  cursor: pointer;
}

.dsh-vision-settings-discard {
  border-color: var(--dsw-alias-border-l2);
  background: none;
  color: var(--dsw-alias-label-secondary);
}

.dsh-vision-settings-discard:hover:not(:disabled) {
  border-color: var(--dsw-alias-label-dimmed);
  color: var(--dsw-alias-label-primary);
}

.dsh-vision-settings-save {
  background: var(--dsw-alias-label-primary);
  color: var(--dsw-alias-bg-layer-3);
}

.dsh-vision-settings-action:disabled {
  opacity: .4;
  cursor: default;
}

.dsh-vision-settings-action:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 1px;
}

@media (max-width: 560px) {
  .dsh-vision-settings-footer {
    flex-wrap: wrap;
  }

  .dsh-vision-settings-footer-status {
    flex-basis: 100%;
  }
}
`
