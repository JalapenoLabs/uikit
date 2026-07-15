// Copyright © 2026 Jalapeno Labs

// Misc
import { brandColors } from '../../theme/tokens'

// The table is styled by one scoped stylesheet emitted as an inline <style>
// element (the same pattern LuminescentText uses for its keyframes). This keeps
// the package free of a CSS build step and free of any css-in-js dependency,
// while still supporting the hover / sticky / clamp behaviors that plain inline
// styles cannot express. Every class is namespaced with `jala-table-` so the
// sheet cannot collide with consumer styles, and theming happens through CSS
// variables that flip under a `.dark` ancestor (or `[data-theme='dark']`).
export const smartTableCss = `
.jala-table-root,
.jala-table-toolbar {
  --jala-table-text: #3f3f46;
  --jala-table-text-strong: #52525b;
  --jala-table-text-muted: #71717a;
  --jala-table-border: rgba(228, 228, 231, 0.6);
  --jala-table-header-border: rgba(212, 212, 216, 0.8);
  --jala-table-divider: rgba(15, 23, 42, 0.24);
  --jala-table-surface: #fbfaf9;
  --jala-table-panel-bg: #ffffff;
  --jala-table-panel-border: rgba(0, 0, 0, 0.1);
  --jala-table-item-bg: #fafafa;
  --jala-table-row-hover-bg: rgba(250, 250, 250, 0.7);
  --jala-table-row-active-bg: rgba(244, 244, 245, 0.6);
  --jala-table-control-bg: rgb(244, 244, 245);
  --jala-table-control-text: rgb(24, 24, 27);
  --jala-table-accent: ${brandColors.primary};
  --jala-table-shadow:
    0 8px 16px -6px rgba(15, 23, 42, 0.35),
    0 2px 6px -2px rgba(15, 23, 42, 0.2);
}

.dark .jala-table-root,
.dark .jala-table-toolbar,
[data-theme='dark'] .jala-table-root,
[data-theme='dark'] .jala-table-toolbar {
  --jala-table-text: #d4d4d8;
  --jala-table-text-strong: #d4d4d8;
  --jala-table-text-muted: #a1a1aa;
  --jala-table-border: rgba(63, 63, 70, 0.6);
  --jala-table-header-border: rgba(82, 82, 91, 0.8);
  --jala-table-divider: rgba(226, 232, 240, 0.35);
  --jala-table-surface: #18181b;
  --jala-table-panel-bg: rgb(39, 39, 42);
  --jala-table-panel-border: rgba(161, 161, 170, 0.4);
  --jala-table-item-bg: rgba(24, 24, 27, 0.6);
  --jala-table-row-hover-bg: rgba(39, 39, 42, 0.6);
  --jala-table-row-active-bg: rgba(63, 63, 70, 0.6);
  --jala-table-control-bg: rgb(24, 24, 27);
  --jala-table-control-text: rgb(244, 244, 245);
}

/* ------------------------------ Table shell ------------------------------ */

.jala-table-scroll {
  width: 100%;
  overflow-x: auto;
}

.jala-table {
  min-width: max-content;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--jala-table-text);
}

/* -------------------------------- Header --------------------------------- */

.jala-table-head {
  text-align: left;
  color: var(--jala-table-text-strong);
}

.jala-table-header-cell {
  position: relative;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.025em;
  color: var(--jala-table-text-strong);
  border-top: 1px solid var(--jala-table-header-border);
  border-bottom: 1px solid var(--jala-table-header-border);
}

.jala-table-header-cell--compact {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.jala-table-header-cell--sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--jala-table-surface);
}

.jala-table-header-cell:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 14px;
  background: var(--jala-table-divider);
  pointer-events: none;
}

.jala-table-sort-button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem 0 0;
  border: none;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.jala-table-sort-button > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jala-table-sort-icon {
  flex-shrink: 0;
  color: var(--jala-table-text-muted);
}

.jala-table-resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 0.75rem;
  cursor: col-resize;
  touch-action: none;
  user-select: none;
}

/* --------------------------------- Rows ---------------------------------- */

.jala-table-row {
  position: relative;
  z-index: 0;
  overflow: visible;
  --row-bg: transparent;
  background-color: var(--row-bg);
  transition: background-color 150ms ease;
}

.jala-table-row:hover {
  z-index: 11;
  --row-bg: var(--jala-table-row-hover-bg);
}

.jala-table-row:hover .jala-table-actions-tray {
  opacity: 1;
  pointer-events: auto;
}

.jala-table-row td:not(.jala-table-actions-cell) {
  position: relative;
  z-index: 0;
  background-color: var(--row-bg);
}

.jala-table-row--active,
.jala-table-row--active:hover {
  --row-bg: var(--jala-table-row-active-bg);
}

.jala-table-row--dragging {
  opacity: 0.7;
}

.jala-table-cell {
  padding: 0.75rem 1rem;
  vertical-align: top;
  min-width: 0;
  border-bottom: 1px solid var(--jala-table-border);
}

.jala-table-cell--compact {
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.jala-table-empty-cell {
  padding: 1.5rem 1rem;
  font-size: 0.875rem;
  color: var(--jala-table-text-muted);
}

.jala-table-checkbox {
  accent-color: var(--jala-table-accent);
}

.jala-table-drag-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--jala-table-text-muted);
  cursor: grab;
}

.jala-table-drag-button:active {
  cursor: grabbing;
}

.jala-table-drag-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

/* ------------------------------ Row actions ------------------------------ */

.jala-table-actions-cell {
  position: sticky;
  right: 0;
  width: 0;
  min-width: 0;
  max-width: 0;
  padding: 0;
  overflow: visible;
  z-index: 4;
  background: transparent;
}

.jala-table-actions-tray {
  position: absolute;
  right: 0;
  bottom: calc(100% - 4px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  pointer-events: none;
  background: var(--jala-table-surface);
  border-radius: 10px;
  padding: 6px 40px 6px 12px;
  min-width: 160px;
  z-index: 6;
  color: var(--jala-table-text-muted);
  box-shadow: var(--jala-table-shadow);
  clip-path: inset(-24px -20px 0 -20px);
}

.jala-table-action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  font-size: 0.875rem;
  color: var(--jala-table-text-strong);
  cursor: pointer;
  transition: opacity 150ms ease;
}

.jala-table-action-button:hover {
  opacity: 0.8;
}

.jala-table-action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ------------------------------- Text cell ------------------------------- */

.jala-table-text-cell {
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

.jala-table-text-cell p {
  margin: 0;
}

.jala-table-clamp3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  white-space: pre-wrap;
}

/* -------------------------------- Toolbar -------------------------------- */

.jala-table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: var(--jala-table-text);
}

.jala-table-toolbar-group {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.75rem;
}

.jala-table-toolbar-group--right {
  flex-wrap: wrap;
  gap: 0.5rem;
}

.jala-table-results-count {
  flex-shrink: 0;
  margin: 0;
  color: var(--jala-table-text-muted);
}

.jala-table-search {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-width: 16rem;
}

.jala-table-search-icon {
  position: absolute;
  left: 0.75rem;
  display: inline-flex;
  color: var(--jala-table-text-muted);
  pointer-events: none;
}

.jala-table-search-input {
  width: 100%;
  padding: 0.5rem 2.25rem;
  border: 1px solid var(--jala-table-header-border);
  border-radius: 0.5rem;
  background: transparent;
  font: inherit;
  color: var(--jala-table-text);
}

.jala-table-search-input::placeholder {
  color: var(--jala-table-text-muted);
}

/* The toolbar renders its own clear button, so hide the native one. */
.jala-table-search-input::-webkit-search-cancel-button {
  display: none;
  -webkit-appearance: none;
}

.jala-table-search-input:focus {
  outline: none;
  border-color: var(--jala-table-accent);
}

.jala-table-search-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.jala-table-search-clear {
  position: absolute;
  right: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border: none;
  background: transparent;
  color: var(--jala-table-text-muted);
  cursor: pointer;
}

.jala-table-search-clear:hover {
  color: var(--jala-table-text);
}

/* ----------------------------- Column controls --------------------------- */

.jala-table-columns {
  position: relative;
  display: inline-flex;
}

.jala-table-columns-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  font: inherit;
  color: var(--jala-table-text-strong);
  cursor: pointer;
  transition: background-color 150ms ease;
}

.jala-table-columns-button:hover {
  background-color: var(--jala-table-row-active-bg);
}

.jala-table-columns-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.jala-table-columns-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 30;
  display: flex;
  min-width: 16rem;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--jala-table-panel-border);
  border-radius: 0.75rem;
  background: var(--jala-table-panel-bg);
  color: var(--jala-table-text);
  box-shadow: var(--jala-table-shadow);
}

.jala-table-columns-heading {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--jala-table-text-muted);
}

.jala-table-column-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.jala-table-column-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--jala-table-border);
  border-radius: 0.5rem;
  background: var(--jala-table-item-bg);
  transition: box-shadow 150ms ease;
}

.jala-table-column-item--dragging {
  box-shadow: var(--jala-table-shadow);
}

.jala-table-column-item-label {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.jala-table-column-item-label span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* -------------------------------- Footer --------------------------------- */

.jala-table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-width: 0;
  padding: 14px 0 4px;
  color: var(--jala-table-text-muted);
}

.jala-table-footer-summary {
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  min-width: 0;
  gap: 10px;
  font-size: 0.95rem;
  white-space: nowrap;
}

.jala-table-page-size-select {
  flex: 0 0 88px;
  width: 88px;
  min-width: 88px;
}

.jala-table-native-select {
  width: 100%;
  min-width: 0;
  height: 36px;
  padding: 0 32px 0 12px;
  border: 1px solid var(--jala-table-panel-border);
  border-radius: 10px;
  background: var(--jala-table-control-bg);
  color: var(--jala-table-control-text);
  font-size: 0.95rem;
  line-height: 1;
}

.jala-table-native-select:focus {
  outline: none;
  border-color: var(--jala-table-accent);
}

.jala-table-native-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.jala-table-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
  gap: 4px;
}

.jala-table-page-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 6px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font: inherit;
  font-size: 0.875rem;
  color: var(--jala-table-text-strong);
  cursor: pointer;
  transition: background-color 150ms ease;
}

.jala-table-page-button:hover:not(:disabled) {
  background-color: var(--jala-table-row-active-bg);
}

.jala-table-page-button--active {
  background-color: var(--jala-table-control-bg);
  color: var(--jala-table-control-text);
  font-weight: 600;
}

.jala-table-page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.jala-table-page-ellipsis {
  min-width: 32px;
  text-align: center;
  color: var(--jala-table-text-muted);
}

@media (max-width: 768px) {
  .jala-table-footer {
    flex-wrap: wrap;
  }

  .jala-table-footer-summary {
    white-space: normal;
  }
}

/* -------------------------------- Tooltip -------------------------------- */

.jala-table-tooltip {
  position: relative;
  display: inline-flex;
  max-width: 100%;
}

.jala-table-tooltip-panel {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 40;
  width: max-content;
  max-width: 20rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.5rem;
  background: rgba(24, 24, 27, 0.95);
  color: #fafafa;
  font-size: 0.8125rem;
  line-height: 1.35;
  pointer-events: none;
}

/* ------------------------------- Utilities ------------------------------- */

.jala-table-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`

/**
 * The scoped stylesheet for SmartTable and its standalone pieces. Rendering it
 * per component instance (rather than mutating document.head from an effect)
 * keeps it SSR-safe; browsers dedupe identical rules cheaply, so a toolbar and
 * a table both emitting the sheet is harmless.
 */
export function SmartTableStyles() {
  return <style>{smartTableCss}</style>
}
