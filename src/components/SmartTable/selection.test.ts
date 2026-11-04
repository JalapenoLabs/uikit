// Copyright © 2026 Jalapeno Labs

// Core
import { describe, expect, it } from 'vitest'
import {
  countFittingActions,
  countSelected,
  EMPTY_SELECTION_HISTORY,
  recordSelectionChange,
  redoSelection,
  selectRange,
  undoSelection,
} from './selection'

const rowIds = [ 'a', 'b', 'c', 'd', 'e' ]

describe('selectRange', () => {
  it('selects from the anchor to the clicked row, either direction', () => {
    expect(selectRange({}, rowIds, 'b', 'd', true)).toEqual({ b: true, c: true, d: true })
    expect(selectRange({}, rowIds, 'd', 'b', true)).toEqual({ b: true, c: true, d: true })
  })

  it('keeps the rest of the selection', () => {
    expect(selectRange({ e: true }, rowIds, 'a', 'b', true)).toEqual({ a: true, b: true, e: true })
  })

  it('unselects the range', () => {
    expect(selectRange({ a: true, b: true, c: true }, rowIds, 'c', 'b', false)).toEqual({ a: true })
  })

  it('changes the clicked row alone without an anchor in view', () => {
    expect(selectRange({}, rowIds, null, 'c', true)).toEqual({ c: true })
    expect(selectRange({}, rowIds, 'gone', 'c', true)).toEqual({ c: true })
  })

  it('changes nothing for a row that is not in the table', () => {
    const current = { a: true }
    expect(selectRange(current, rowIds, 'a', 'gone', true)).toBe(current)
  })
})

describe('countSelected', () => {
  it('counts only the rows marked selected', () => {
    expect(countSelected({ a: true, b: false, c: true })).toBe(2)
  })
})

describe('selection history', () => {
  it('steps back and forward through recorded changes', () => {
    let history = recordSelectionChange(EMPTY_SELECTION_HISTORY, {})
    history = recordSelectionChange(history, { a: true })
    const current = { a: true, b: true }

    const back = undoSelection(history, current)
    expect(back?.selection).toEqual({ a: true })

    const backAgain = undoSelection(back!.history, back!.selection)
    expect(backAgain?.selection).toEqual({})
    expect(undoSelection(backAgain!.history, backAgain!.selection)).toBeNull()

    const forward = redoSelection(backAgain!.history, backAgain!.selection)
    expect(forward?.selection).toEqual({ a: true })
  })

  it('drops what could be redone once a new change is made', () => {
    const history = recordSelectionChange(EMPTY_SELECTION_HISTORY, {})
    const back = undoSelection(history, { a: true })
    const changed = recordSelectionChange(back!.history, back!.selection)
    expect(redoSelection(changed, { c: true })).toBeNull()
  })
})

describe('countFittingActions', () => {
  it('fits every action when they all have room, with no overflow button', () => {
    expect(countFittingActions([ 100, 100, 100 ], 308, 32, 4)).toBe(3)
  })

  it('takes actions from the right until the rest fit beside the overflow button', () => {
    // 32 + 4 + 100 + 4 + 100 = 240 fits in 300; a third would need 344.
    expect(countFittingActions([ 100, 100, 100 ], 300, 32, 4)).toBe(2)
  })

  it('can leave every action to the overflow menu', () => {
    expect(countFittingActions([ 200, 200 ], 100, 32, 4)).toBe(0)
  })

  it('fits an empty list', () => {
    expect(countFittingActions([], 0, 32, 4)).toBe(0)
  })
})
