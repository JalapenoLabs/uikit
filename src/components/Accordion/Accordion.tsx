// Copyright © 2026 Jalapeno Labs

import type { CSSProperties, ReactNode } from 'react'

// Core
import { useCallback, useId, useState } from 'react'

// Misc
import { brandColors } from '../../theme/tokens'

export type AccordionProps = {
  // The header content rendered inside the toggle button.
  title: ReactNode
  // The collapsible body revealed when the accordion is open.
  children: ReactNode
  // Uncontrolled initial open state. Ignored when `open` is provided.
  defaultOpen?: boolean
  // Controlled open state. When provided, the component does not own its state.
  open?: boolean
  // Notified on every requested open/closed change (both controlled and uncontrolled).
  onOpenChange?: (open: boolean) => void
  // When set, the uncontrolled open state is persisted to localStorage under this key.
  persistKey?: string
  className?: string
  // When true, the header button is inert and the body cannot be toggled.
  disabled?: boolean
}

/**
 * Reads the persisted open state from localStorage.
 *
 * Wrapped in try/catch and guarded for SSR: a missing `window`, disabled storage,
 * or malformed value all fall back to `defaultOpen` rather than throwing.
 */
function readPersistedOpen(persistKey: string | undefined, defaultOpen: boolean): boolean {
  if (!persistKey || typeof window === 'undefined') {
    return defaultOpen
  }

  try {
    const stored = window.localStorage.getItem(persistKey)
    if (stored === null) {
      return defaultOpen
    }

    return stored === 'true'
  }
  catch (error) {
    console.debug('Accordion failed to read persisted open state, using defaultOpen', { persistKey, error })
    return defaultOpen
  }
}

/**
 * Writes the open state to localStorage. SSR-safe and swallows storage failures
 * (private mode, quota, disabled cookies) so toggling never crashes the UI.
 */
function writePersistedOpen(persistKey: string, open: boolean): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(persistKey, String(open))
  }
  catch (error) {
    console.debug('Accordion failed to persist open state', { persistKey, error })
  }
}

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  width: '100%',
  padding: '0.875rem 1.125rem',
  background: 'transparent',
  border: 'none',
  font: 'inherit',
  fontWeight: 600,
  textAlign: 'left',
  color: 'inherit',
}

const containerStyle: CSSProperties = {
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '0.75rem',
  overflow: 'hidden',
}

const bodyStyle: CSSProperties = {
  padding: '0 1.125rem 1rem',
}

/**
 * A lightweight, dependency-free accordion.
 *
 * Supports both controlled (`open` provided) and uncontrolled modes. In
 * uncontrolled mode the initial state is seeded from `persistKey` localStorage
 * when present, otherwise from `defaultOpen`. The header is an accessible button
 * wired to the body region via `aria-controls` / `aria-labelledby`.
 */
export function Accordion(props: AccordionProps) {
  const {
    title,
    children,
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    persistKey,
    className,
    disabled = false,
  } = props

  const generatedId = useId()
  const headerId = `${generatedId}-header`
  const bodyId = `${generatedId}-body`

  const isControlled = controlledOpen !== undefined

  // The seed runs once via the lazy initializer so localStorage is read a single time.
  const [ uncontrolledOpen, setUncontrolledOpen ] = useState<boolean>(
    () => readPersistedOpen(persistKey, defaultOpen),
  )

  const isOpen = isControlled
    ? controlledOpen
    : uncontrolledOpen

  const handleToggle = useCallback(() => {
    if (disabled) {
      return
    }

    const nextOpen = !isOpen

    // Controlled consumers own the state, so we only request the change.
    if (!isControlled) {
      setUncontrolledOpen(nextOpen)

      if (persistKey) {
        writePersistedOpen(persistKey, nextOpen)
      }
    }

    onOpenChange?.(nextOpen)
  }, [ disabled, isOpen, isControlled, persistKey, onOpenChange ])

  return <div
    className={className}
    style={containerStyle}
  >
    <button
      id={headerId}
      type='button'
      style={{
        ...headerStyle,
        cursor: disabled
          ? 'not-allowed'
          : 'pointer',
        opacity: disabled
          ? 0.6
          : 1,
      }}
      aria-expanded={isOpen}
      aria-controls={bodyId}
      disabled={disabled}
      onClick={handleToggle}
    >
      <span>{title}</span>
      <svg
        width='16'
        height='16'
        viewBox='0 0 24 24'
        fill='none'
        stroke={brandColors.primary}
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
        style={{
          flexShrink: 0,
          transition: 'transform 0.2s ease',
          transform: isOpen
            ? 'rotate(180deg)'
            : 'rotate(0deg)',
        }}
      >
        <polyline points='6 9 12 15 18 9' />
      </svg>
    </button>
    <div
      id={bodyId}
      role='region'
      aria-labelledby={headerId}
      hidden={!isOpen}
      style={bodyStyle}
    >
      {children}
    </div>
  </div>
}
