// Copyright © 2026 Jalapeno Labs

import type { ReactNode } from 'react'

// Core
import { useEffect, useRef, useState } from 'react'

type Props = {
  content: ReactNode
  children: ReactNode
  // Milliseconds the pointer must hover before the tooltip shows.
  delay?: number
}

const DEFAULT_SHOW_DELAY_MS = 300

/**
 * A minimal hover tooltip for table cells and headers. It renders the content
 * in an absolutely positioned panel above the wrapped children, appearing
 * after a short hover delay and hiding immediately on pointer leave. It is
 * intentionally tiny (no portal, no positioning engine) because table tooltips
 * only ever anchor to the hovered cell.
 */
export function TableTooltip(props: Props) {
  const {
    content,
    children,
    delay = DEFAULT_SHOW_DELAY_MS,
  } = props

  const [ isVisible, setIsVisible ] = useState(false)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (showTimerRef.current !== null) {
        clearTimeout(showTimerRef.current)
      }
    }
  }, [])

  return <span
    className='jala-table-tooltip'
    onMouseEnter={() => {
      showTimerRef.current = setTimeout(() => {
        setIsVisible(true)
        showTimerRef.current = null
      }, delay)
    }}
    onMouseLeave={() => {
      if (showTimerRef.current !== null) {
        clearTimeout(showTimerRef.current)
        showTimerRef.current = null
      }
      setIsVisible(false)
    }}
  >
    {children}
    { isVisible
      ? <span role='tooltip' className='jala-table-tooltip-panel'>{
        content
      }</span>
      : null
    }
  </span>
}
