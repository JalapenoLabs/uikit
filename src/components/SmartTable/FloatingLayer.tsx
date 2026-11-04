// Copyright © 2026 Jalapeno Labs

import type { FloatingPlacement, FloatingPosition } from './floatingPosition'
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

// Core
import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Misc
import { computeFloatingPosition } from './floatingPosition'

type Props = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
  anchor: HTMLElement | null
  placement: FloatingPlacement
  children: ReactNode
}

/**
 * A layer that floats beside an anchor element: tooltips, menus, and
 * drop-ups. It renders into `document.body` with fixed positioning, because
 * the table's horizontal scroll container clips anything absolutely
 * positioned inside it. It mounts hidden, measures itself, and appears in
 * place before the browser paints, then follows its anchor through scrolling
 * and resizing.
 *
 * The layer carries `data-no-row-highlight`: React bubbles a portal's events
 * through its React parents, so without it a click in a row's menu would also
 * count as a click on the row.
 */
export function FloatingLayer(props: Props) {
  const {
    anchor,
    placement,
    children,
    className,
    ...attributes
  } = props

  const layerRef = useRef<HTMLDivElement | null>(null)
  const [ position, setPosition ] = useState<FloatingPosition | null>(null)

  useLayoutEffect(() => {
    if (!anchor) {
      console.debug('FloatingLayer has no anchor element yet, so it stays hidden')
      return undefined
    }

    function updatePosition() {
      const layer = layerRef.current
      if (!layer || !anchor) {
        return
      }
      const layerRect = layer.getBoundingClientRect()
      setPosition(computeFloatingPosition(
        anchor.getBoundingClientRect(),
        { width: layerRect.width, height: layerRect.height },
        { width: window.innerWidth, height: window.innerHeight },
        placement,
      ))
    }

    updatePosition()
    // Capture scrolls from every scroll container, not just the window, so a
    // layer anchored inside a scrolled table keeps up with it.
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [ anchor, placement.side, placement.align ])

  if (typeof document === 'undefined') {
    return null
  }

  const style: CSSProperties = {
    position: 'fixed',
    top: position?.top ?? 0,
    left: position?.left ?? 0,
    visibility: position
      ? 'visible'
      : 'hidden',
  }

  return createPortal(
    <div
      {...attributes}
      ref={layerRef}
      style={style}
      className={[ 'jala-table-theme', className ?? '' ].join(' ').trim()}
      data-side={position?.side ?? placement.side}
      data-no-row-highlight='true'
    >
      {children}
    </div>,
    document.body,
  )
}
