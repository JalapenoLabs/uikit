// Copyright © 2026 Jalapeno Labs

import type { RowSelectionState } from '@tanstack/react-table'

/**
 * The selection after a shift-click: every row between the anchor (the row
 * last clicked) and the clicked row, inclusive, in display order, is selected,
 * or unselected for Ctrl+Shift. Without an anchor in view, the clicked row
 * alone changes.
 */
export function selectRange(
  current: RowSelectionState,
  orderedRowIds: string[],
  anchorRowId: string | null,
  clickedRowId: string,
  shouldSelect: boolean,
): RowSelectionState {
  const clickedIndex = orderedRowIds.indexOf(clickedRowId)
  if (clickedIndex === -1) {
    console.debug('selectRange was given a row that is not in the table, so nothing changed', clickedRowId)
    return current
  }
  const anchorIndex = anchorRowId === null
    ? -1
    : orderedRowIds.indexOf(anchorRowId)
  const fromIndex = anchorIndex === -1
    ? clickedIndex
    : anchorIndex

  const next: RowSelectionState = { ...current }
  const startIndex = Math.min(fromIndex, clickedIndex)
  const endIndex = Math.max(fromIndex, clickedIndex)
  for (let index = startIndex; index <= endIndex; index++) {
    const rowId = orderedRowIds[index]
    if (shouldSelect) {
      next[rowId] = true
    }
    else {
      delete next[rowId]
    }
  }
  return next
}

export function countSelected(selection: RowSelectionState) {
  let count = 0
  for (const rowId in selection) {
    if (selection[rowId]) {
      count += 1
    }
  }
  return count
}

// Selection history keeps this many steps; older ones fall off.
const HISTORY_LIMIT = 100

export type SelectionHistory = {
  past: RowSelectionState[]
  future: RowSelectionState[]
}

export const EMPTY_SELECTION_HISTORY: SelectionHistory = { past: [], future: []}

/** Records a change away from `previous`; a new change drops anything to redo. */
export function recordSelectionChange(history: SelectionHistory, previous: RowSelectionState): SelectionHistory {
  return {
    past: [ ...history.past, previous ].slice(-HISTORY_LIMIT),
    future: [],
  }
}

/** One step back, or null when there is nothing to undo. */
export function undoSelection(history: SelectionHistory, current: RowSelectionState) {
  const previous = history.past.at(-1)
  if (!previous) {
    return null
  }
  return {
    selection: previous,
    history: {
      past: history.past.slice(0, -1),
      future: [ current, ...history.future ],
    },
  }
}

/** One step forward again, or null when there is nothing to redo. */
export function redoSelection(history: SelectionHistory, current: RowSelectionState) {
  const next = history.future[0]
  if (!next) {
    return null
  }
  return {
    selection: next,
    history: {
      past: [ ...history.past, current ],
      future: history.future.slice(1),
    },
  }
}

/**
 * How many of the bar's actions fit before the rest go into its overflow
 * menu. Actions keep their order; the menu takes room only when some action
 * does not fit, and then the actions taken from the right make room for it.
 */
export function countFittingActions(
  actionWidths: number[],
  availableWidth: number,
  overflowWidth: number,
  gap: number,
): number {
  let allWidth = 0
  for (const width of actionWidths) {
    allWidth += width
  }
  allWidth += gap * Math.max(0, actionWidths.length - 1)
  if (allWidth <= availableWidth) {
    return actionWidths.length
  }

  let usedWidth = overflowWidth
  let count = 0
  for (const width of actionWidths) {
    const nextWidth = usedWidth + gap + width
    if (nextWidth > availableWidth) {
      break
    }
    usedWidth = nextWidth
    count += 1
  }
  return count
}
