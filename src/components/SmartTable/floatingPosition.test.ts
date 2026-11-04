// Copyright © 2026 Jalapeno Labs

import type { AnchorRect } from './floatingPosition'

// Core
import { describe, expect, it } from 'vitest'
import { computeFloatingPosition } from './floatingPosition'

const viewport = { width: 1000, height: 800 }
const layer = { width: 200, height: 100 }

function anchorAt(top: number, left: number, width = 40, height = 20): AnchorRect {
  return {
    top,
    bottom: top + height,
    left,
    right: left + width,
    width,
  }
}

describe('computeFloatingPosition', () => {
  it('places the layer below the anchor, aligned to its end', () => {
    const position = computeFloatingPosition(anchorAt(300, 500), layer, viewport, { side: 'bottom', align: 'end' })
    // 6px gap below a 20px tall anchor at 300; right edges line up at 540.
    expect(position).toEqual({ top: 326, left: 340, side: 'bottom' })
  })

  it('centers the layer above the anchor', () => {
    const position = computeFloatingPosition(anchorAt(300, 500), layer, viewport, { side: 'top', align: 'center' })
    expect(position).toEqual({ top: 194, left: 420, side: 'top' })
  })

  it('aligns the layer to the anchor start', () => {
    const position = computeFloatingPosition(anchorAt(300, 500), layer, viewport, { side: 'bottom', align: 'start' })
    expect(position.left).toBe(500)
  })

  it('flips to the other side when the preferred side has no room', () => {
    const nearTop = computeFloatingPosition(anchorAt(20, 500), layer, viewport, { side: 'top', align: 'center' })
    expect(nearTop.side).toBe('bottom')
    expect(nearTop.top).toBe(46)

    const nearBottom = computeFloatingPosition(anchorAt(760, 500), layer, viewport, { side: 'bottom', align: 'center' })
    expect(nearBottom.side).toBe('top')
    expect(nearBottom.top).toBe(654)
  })

  it('stays on the preferred side when neither side has more room', () => {
    const tallLayer = { width: 200, height: 790 }
    const position = computeFloatingPosition(anchorAt(390, 500), tallLayer, viewport, { side: 'top', align: 'center' })
    expect(position.side).toBe('top')
  })

  it('keeps the layer inside the viewport horizontally', () => {
    const atLeftEdge = computeFloatingPosition(anchorAt(300, 0), layer, viewport, { side: 'bottom', align: 'end' })
    expect(atLeftEdge.left).toBe(8)

    const atRightEdge = computeFloatingPosition(anchorAt(300, 980), layer, viewport, { side: 'bottom', align: 'start' })
    expect(atRightEdge.left).toBe(792)
  })

  it('pins a layer wider than the viewport to the start margin', () => {
    const wideLayer = { width: 1200, height: 100 }
    const placement = { side: 'bottom', align: 'center' } as const
    const position = computeFloatingPosition(anchorAt(300, 500), wideLayer, viewport, placement)
    expect(position.left).toBe(8)
  })
})
