// Copyright © 2026 Jalapeno Labs

import type { FloatingPlacement } from './floatingPosition'
import type { ReactNode } from 'react'

// Core
import { useEffect, useId, useRef, useState } from 'react'

// User interface
import { FloatingLayer } from './FloatingLayer'

type Props = {
  content: ReactNode
  children: ReactNode
  // Milliseconds the pointer must hover before the tooltip shows.
  delay?: number
  placement?: FloatingPlacement
  // Keeps the wrapper, so the children never remount, but shows nothing.
  isDisabled?: boolean
  className?: string
}

const DEFAULT_SHOW_DELAY_MS = 300
const DEFAULT_PLACEMENT: FloatingPlacement = { side: 'top', align: 'center' }

/**
 * A small tooltip for table cells, headers, and icon-only buttons. It shows
 * after a short hover, or at once when keyboard focus lands inside it, and
 * hides on pointer leave, blur, press, or Escape. The panel floats in a
 * portal, so the table's scroll container never clips it.
 */
export function TableTooltip(props: Props) {
  const {
    content,
    children,
    delay = DEFAULT_SHOW_DELAY_MS,
    placement = DEFAULT_PLACEMENT,
  } = props

  const [ isVisible, setIsVisible ] = useState(false)
  const [ triggerElement, setTriggerElement ] = useState<HTMLSpanElement | null>(null)
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipId = useId()

  function cancelShowTimer() {
    if (showTimerRef.current !== null) {
      clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
  }

  function hide() {
    cancelShowTimer()
    setIsVisible(false)
  }

  useEffect(() => cancelShowTimer, [])

  return <span
    ref={setTriggerElement}
    className={[ 'jala-table-tooltip', props.className ?? '' ].join(' ').trim()}
    aria-describedby={isVisible
      ? tooltipId
      : undefined}
    onMouseEnter={() => {
      cancelShowTimer()
      showTimerRef.current = setTimeout(() => {
        setIsVisible(true)
        showTimerRef.current = null
      }, delay)
    }}
    onMouseLeave={hide}
    onFocus={(event) => {
      // Only keyboard focus shows it at once; a mouse press focuses too, and
      // pressing is an answer to the tooltip rather than a question.
      if (event.target.matches(':focus-visible')) {
        setIsVisible(true)
      }
    }}
    onBlur={hide}
    onMouseDown={hide}
    onKeyDown={(event) => {
      if (event.key === 'Escape' && isVisible) {
        hide()
      }
    }}
  >
    {children}
    { isVisible && !props.isDisabled
      ? <FloatingLayer
        anchor={triggerElement}
        placement={placement}
        id={tooltipId}
        role='tooltip'
        className='jala-table-tooltip-panel'
      >{
          content
        }</FloatingLayer>
      : null
    }
  </span>
}
