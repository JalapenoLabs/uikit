// Copyright © 2026 Jalapeno Labs

import type { CSSProperties, ReactNode } from 'react'

// Core
import { useEffect, useId, useRef, useState } from 'react'

// Misc
import { brandColors } from '../../theme/tokens'

export type InformationPlacement = 'top' | 'bottom' | 'left' | 'right'

export type InformationProps = {
  // The popover body. Callers pass already-translated content.
  content: ReactNode
  // Optional heading rendered above the content.
  title?: ReactNode
  // Where the panel sits relative to the trigger. Defaults to 'right'.
  placement?: InformationPlacement
  // Icon size in pixels. Defaults to 24.
  size?: number
  className?: string
}

// The gap, in pixels, between the trigger and the popover panel.
const PANEL_OFFSET = 8

// Per-placement panel positioning. Each entry is a partial inline style that
// anchors the absolutely positioned panel against the relatively positioned
// wrapper, keeping the cross-axis centered on the trigger.
const panelPositionByPlacement = {
  top: {
    bottom: `calc(100% + ${PANEL_OFFSET}px)`,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  bottom: {
    top: `calc(100% + ${PANEL_OFFSET}px)`,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  left: {
    right: `calc(100% + ${PANEL_OFFSET}px)`,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  right: {
    left: `calc(100% + ${PANEL_OFFSET}px)`,
    top: '50%',
    transform: 'translateY(-50%)',
  },
} as const satisfies Record<InformationPlacement, CSSProperties>

/**
 * A dependency-free info affordance: a dimmed circled-i icon that brightens on
 * hover and toggles a small popover panel showing an optional title and the
 * provided content. The panel closes on outside-click and on Escape, and the
 * trigger carries the aria wiring (haspopup, expanded, controls) so assistive
 * technology can follow the relationship.
 */
export function Information(props: InformationProps) {
  const {
    content,
    title,
    placement = 'right',
    size = 24,
    className,
  } = props

  const [ isOpen, setIsOpen ] = useState(false)
  const [ isHovered, setIsHovered ] = useState(false)

  const wrapperRef = useRef<HTMLSpanElement>(null)
  const panelId = useId()

  // Close on outside-click and on Escape. The listeners guard on `isOpen` so
  // they stay inert while the panel is closed, which keeps the effect's return
  // path consistent (it always registers and tears down the same listeners).
  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handlePointerDown)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [ isOpen ])

  const wrapperStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  }

  const triggerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: brandColors.primary,
    cursor: 'pointer',
    lineHeight: 0,
    opacity: isOpen || isHovered
      ? 1
      : 0.3,
    transition: 'opacity 150ms ease',
  }

  const panelStyle: CSSProperties = {
    position: 'absolute',
    zIndex: 1,
    minWidth: '12rem',
    maxWidth: '20rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    background: '#ffffff',
    color: '#1a1a1a',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    textAlign: 'left',
    ...panelPositionByPlacement[placement],
  }

  return <span
    ref={wrapperRef}
    className={className}
    style={wrapperStyle}
  >
    <button
      type='button'
      aria-haspopup='dialog'
      aria-expanded={isOpen}
      aria-controls={panelId}
      aria-label='More information'
      style={triggerStyle}
      onClick={() => setIsOpen((previousIsOpen) => !previousIsOpen)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill='none'
        stroke='currentColor'
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
        aria-hidden='true'
        focusable='false'
      >
        <circle cx='12' cy='12' r='10' />
        <line x1='12' y1='11' x2='12' y2='16' />
        <line x1='12' y1='8' x2='12.01' y2='8' />
      </svg>
    </button>
    { isOpen
      ? <div
        id={panelId}
        role='dialog'
        aria-label='More information'
        style={panelStyle}
      >
        { title
          ? <div style={{ marginBottom: '0.25rem', fontWeight: 600, fontSize: '0.875rem' }}>{
            title
          }</div>
          : null
        }
        <div style={{ fontSize: '0.875rem' }}>{
          content
        }</div>
      </div>
      : null
    }
  </span>
}
