// Copyright © 2026 Jalapeno Labs

import type { CSSProperties, KeyboardEvent } from 'react'

// Core
import { useRef } from 'react'

// User interface
import { ThemePreviewLight, ThemePreviewDark, ThemePreviewSystem } from './previews'

// Misc
import { brandColors } from '../../theme/tokens'

/**
 * The three theme modes a consumer can choose between. `system` defers to the
 * operating system's light/dark preference.
 */
export type ThemePreference = 'light' | 'dark' | 'system'

export type ThemeSelectorProps = {
  /** The currently selected preference. This is a controlled component. */
  value: ThemePreference
  /** Called with the new preference whenever the user picks a different card. */
  onChange: (preference: ThemePreference) => void
  /** Optional label overrides keyed by preference. Defaults to Light / Dark / System. */
  labels?: Partial<Record<ThemePreference, string>>
  /** Optional extra class applied to the radiogroup container. */
  className?: string
  /** When true, the whole group is non-interactive and visually muted. */
  isDisabled?: boolean
}

// Each option pairs a preference with its preview artwork. Keeping this as an
// ordered list (rather than a map) fixes the visual and keyboard order.
const OPTIONS = [
  { preference: 'light', Preview: ThemePreviewLight },
  { preference: 'dark', Preview: ThemePreviewDark },
  { preference: 'system', Preview: ThemePreviewSystem },
] as const satisfies ReadonlyArray<{
  preference: ThemePreference
  Preview: (props: { style?: CSSProperties }) => React.JSX.Element
}>

const DEFAULT_LABELS = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
} as const satisfies Record<ThemePreference, string>

/**
 * A controlled, dependency-free theme picker rendered as three large cards,
 * each showing an SVG preview and a label. It behaves as an accessible radio
 * group: arrow keys move between options, Space/Enter selects the focused one,
 * and the selected card is highlighted with the brand primary colour.
 */
export function ThemeSelector(props: ThemeSelectorProps) {
  const {
    value,
    onChange,
    labels,
    className,
    isDisabled = false,
  } = props

  // We manage roving focus manually so the radiogroup exposes a single tab stop
  // and arrow keys move the active radio, matching the WAI-ARIA radio pattern.
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([])

  function selectByIndex(index: number): void {
    const option = OPTIONS[index]
    if (!option || isDisabled) {
      return
    }
    onChange(option.preference)
    cardRefs.current[index]?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
    if (isDisabled) {
      return
    }

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        event.preventDefault()
        selectByIndex((index + 1) % OPTIONS.length)
        break
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        event.preventDefault()
        selectByIndex((index - 1 + OPTIONS.length) % OPTIONS.length)
        break
      }
      case ' ':
      case 'Enter': {
        event.preventDefault()
        selectByIndex(index)
        break
      }
      default: {
        // Other keys fall through to the browser's default handling.
        break
      }
    }
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    gap: '0.75rem',
    opacity: isDisabled
      ? 0.6
      : 1,
  }

  return <div
    role='radiogroup'
    aria-label='Theme preference'
    aria-disabled={isDisabled}
    className={className}
    style={containerStyle}
  >
    {OPTIONS.map((option, index) => {
      const isSelected = option.preference === value
      const label = labels?.[option.preference] ?? DEFAULT_LABELS[option.preference]
      const Preview = option.Preview

      return <button
        key={option.preference}
        ref={(element) => {
          cardRefs.current[index] = element
        }}
        type='button'
        role='radio'
        aria-checked={isSelected}
        aria-label={label}
        disabled={isDisabled}
        // Roving tabindex: only the selected card is in the tab order.
        tabIndex={isSelected
          ? 0
          : -1}
        onClick={() => selectByIndex(index)}
        onKeyDown={(event) => handleKeyDown(event, index)}
        style={cardStyle(isSelected, isDisabled)}
      >
        <Preview style={previewStyle} />
        <span style={labelStyle}>{label}</span>
      </button>
    })}
  </div>
}

// Styling helpers live below the component so the JSX reads cleanly. They are
// plain functions/objects (not exported) to keep this file components-only.

function cardStyle(isSelected: boolean, isDisabled: boolean): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
    padding: '0.75rem',
    borderRadius: '0.75rem',
    border: isSelected
      ? `2px solid ${brandColors.primary}`
      : '2px solid #d4d4d3',
    boxShadow: isSelected
      ? `0 0 0 3px ${brandColors.primary}33`
      : 'none',
    background: 'transparent',
    cursor: isDisabled
      ? 'not-allowed'
      : 'pointer',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  }
}

const previewStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  borderRadius: '0.375rem',
  display: 'block',
}

const labelStyle: CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 600,
}
