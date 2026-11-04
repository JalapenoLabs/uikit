// Copyright © 2026 Jalapeno Labs

export type FloatingSide = 'top' | 'bottom'
export type FloatingAlign = 'start' | 'center' | 'end'

export type FloatingPlacement = {
  side: FloatingSide
  align: FloatingAlign
}

export type AnchorRect = {
  top: number
  bottom: number
  left: number
  right: number
  width: number
}

export type FloatingSize = {
  width: number
  height: number
}

export type FloatingPosition = {
  top: number
  left: number
  side: FloatingSide
}

// The closest a floating layer may come to the viewport's edges.
const VIEWPORT_MARGIN = 8
// The space between an anchor and the layer floating beside it.
const ANCHOR_GAP = 6

const leftByAlign = {
  start: (anchor: AnchorRect) => anchor.left,
  center: (anchor: AnchorRect, layer: FloatingSize) => anchor.left + (anchor.width - layer.width) / 2,
  end: (anchor: AnchorRect, layer: FloatingSize) => anchor.right - layer.width,
} as const satisfies Record<FloatingAlign, (anchor: AnchorRect, layer: FloatingSize) => number>

function clamp(value: number, minimum: number, maximum: number) {
  // A layer larger than the room it has pins to the near edge rather than
  // spilling off the start of the screen.
  if (maximum < minimum) {
    return minimum
  }
  return Math.min(Math.max(value, minimum), maximum)
}

/**
 * Where a `position: fixed` layer goes beside its anchor: on the preferred
 * side when it fits there, flipped to the other side when only that one has
 * room, and always kept inside the viewport.
 */
export function computeFloatingPosition(
  anchor: AnchorRect,
  layer: FloatingSize,
  viewport: FloatingSize,
  placement: FloatingPlacement,
): FloatingPosition {
  const roomAbove = anchor.top - ANCHOR_GAP - VIEWPORT_MARGIN
  const roomBelow = viewport.height - anchor.bottom - ANCHOR_GAP - VIEWPORT_MARGIN

  let side = placement.side
  if (side === 'top' && layer.height > roomAbove && roomBelow > roomAbove) {
    side = 'bottom'
  }
  if (side === 'bottom' && layer.height > roomBelow && roomAbove > roomBelow) {
    side = 'top'
  }

  const unclampedTop = side === 'top'
    ? anchor.top - ANCHOR_GAP - layer.height
    : anchor.bottom + ANCHOR_GAP
  const unclampedLeft = leftByAlign[placement.align](anchor, layer)

  return {
    top: clamp(unclampedTop, VIEWPORT_MARGIN, viewport.height - layer.height - VIEWPORT_MARGIN),
    left: clamp(unclampedLeft, VIEWPORT_MARGIN, viewport.width - layer.width - VIEWPORT_MARGIN),
    side,
  }
}
