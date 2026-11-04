// Copyright © 2026 Jalapeno Labs

import type { DataTableSelectionAction } from './DataTable.types'
import type { FloatingPlacement } from './floatingPosition'
import type { SmartTableLabels } from './labels'
import type { TableMenuItem } from './TableMenu'
import type { RowData } from '@tanstack/react-table'
import type { Promisable } from '../../types'

// Core
import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// User interface
import { TableIcon } from './icons'
import { TableMenu } from './TableMenu'
import { TableTooltip } from './TableTooltip'

// Misc
import { countFittingActions } from './selection'

type Props<TData extends RowData> = {
  selectedRows: TData[]
  actions: DataTableSelectionAction<TData>[]
  labels: SmartTableLabels
  onSelectAll: () => void
  onClear: () => void
}

// The bar keeps this far from the viewport's edges, and its sections and
// actions this far apart (matching the stylesheet).
const BAR_VIEWPORT_MARGIN = 16
const BAR_HORIZONTAL_PADDING = 8
const BAR_GAP = 4
const OVERFLOW_BUTTON_WIDTH = 32
const DROP_UP: FloatingPlacement = { side: 'top', align: 'start' }
const DROP_UP_END: FloatingPlacement = { side: 'top', align: 'end' }

/**
 * The floating multi-select bar along the bottom of the page (ux.md, Table
 * multi-select): the selected count, Select all, a divider, the table's
 * actions, a divider, and an X that clears the selection. Actions that do not
 * fit the screen's width move, from the right, into an overflow menu; the
 * count, dividers, and X never move.
 */
export function DataTableSelectionBar<TData extends RowData>(props: Props<TData>) {
  const { selectedRows, actions, labels, onSelectAll, onClear } = props

  const startRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [ visibleCount, setVisibleCount ] = useState(actions.length)
  const [ pendingActionId, setPendingActionId ] = useState<string | null>(null)

  // Measure every action at its natural width in a hidden copy, then fit as
  // many as the widest the bar may be allows.
  useLayoutEffect(() => {
    function measure() {
      const actionWidths = Array.from(measureRef.current?.children ?? [])
        .map((element) => element.getBoundingClientRect().width)
      const fixedWidth = (startRef.current?.getBoundingClientRect().width ?? 0)
        + (endRef.current?.getBoundingClientRect().width ?? 0)
      const availableWidth = window.innerWidth
        - BAR_VIEWPORT_MARGIN * 2
        - BAR_HORIZONTAL_PADDING * 2
        - BAR_GAP * 2
        - fixedWidth
      setVisibleCount(countFittingActions(actionWidths, availableWidth, OVERFLOW_BUTTON_WIDTH, BAR_GAP))
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [ actions, labels, selectedRows.length ])

  async function run(actionId: string, press: () => Promisable<void>) {
    const result = press()
    if (!(result instanceof Promise)) {
      return
    }
    setPendingActionId(actionId)
    try {
      await result
    }
    finally {
      setPendingActionId(null)
    }
  }

  const isBusy = pendingActionId !== null
  const visibleActions = actions.slice(0, visibleCount)
  const overflowActions = actions.slice(visibleCount)

  function renderAction(action: DataTableSelectionAction<TData>) {
    const isPending = pendingActionId === action.id
    const content = <>
      { isPending
        ? <TableIcon name='spinner' size={16} className='jala-table-spin' />
        : action.icon
      }
      <span>{ action.label }</span>
    </>

    if (action.choices) {
      const onChoose = action.onChoose
      return <TableMenu
        key={action.id}
        label={action.label}
        placement={DROP_UP}
        isDisabled={isBusy || action.isDisabled}
        triggerClassName={action.isDanger ? 'jala-table-menu-trigger--danger' : undefined}
        triggerContent={<>
          { content }
          <TableIcon name='chevronUp' size={14} />
        </>}
        items={action.choices.map((choice) => ({
          id: choice.value,
          label: choice.label,
          icon: choice.icon,
          onPress: () => void run(action.id, () => onChoose(choice.value, selectedRows)),
        }))}
      />
    }

    const onPress = action.onPress
    return <button
      key={action.id}
      type='button'
      className={[
        'jala-table-menu-trigger',
        action.isDanger ? 'jala-table-menu-trigger--danger' : '',
      ].join(' ').trim()}
      disabled={isBusy || action.isDisabled}
      aria-busy={isPending || undefined}
      onClick={() => void run(action.id, () => onPress(selectedRows))}
    >
      { content }
    </button>
  }

  // A choice action in the overflow menu lists its choices as items of their own.
  const overflowItems: TableMenuItem[] = []
  for (const action of overflowActions) {
    if (action.choices) {
      const onChoose = action.onChoose
      for (const choice of action.choices) {
        overflowItems.push({
          id: `${action.id}:${choice.value}`,
          label: labels.choiceItem(action.label, choice.label),
          icon: choice.icon ?? action.icon,
          isDanger: action.isDanger,
          isDisabled: isBusy || action.isDisabled,
          onPress: () => void run(action.id, () => onChoose(choice.value, selectedRows)),
        })
      }
      continue
    }
    const onPress = action.onPress
    overflowItems.push({
      id: action.id,
      label: action.label,
      icon: action.icon,
      isDanger: action.isDanger,
      isDisabled: isBusy || action.isDisabled,
      onPress: () => void run(action.id, () => onPress(selectedRows)),
    })
  }

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      role='toolbar'
      aria-label={labels.selectionBar}
      className='jala-table-theme jala-table-selection-bar'
      data-no-row-highlight='true'
    >
      <div ref={startRef} className='jala-table-selection-bar-section'>
        <span className='jala-table-selection-count' aria-live='polite'>{
          labels.selectedCount(selectedRows.length)
        }</span>
        <button type='button' className='jala-table-menu-trigger' onClick={onSelectAll}>
          <TableIcon name='selectAll' size={16} />
          <span>{ labels.selectPage }</span>
        </button>
        <span className='jala-table-selection-divider' aria-hidden='true' />
      </div>

      <div className='jala-table-selection-bar-section jala-table-selection-actions'>
        { visibleActions.map(renderAction) }
        { overflowItems.length
          ? <TableMenu label={labels.moreActions} placement={DROP_UP_END} items={overflowItems} />
          : null
        }
      </div>

      <div ref={endRef} className='jala-table-selection-bar-section'>
        <span className='jala-table-selection-divider' aria-hidden='true' />
        <TableTooltip content={labels.clearSelectionHint}>
          <button
            type='button'
            className='jala-table-icon-button'
            aria-label={labels.clearSelection}
            onClick={onClear}
          >
            <TableIcon name='close' size={18} />
          </button>
        </TableTooltip>
      </div>

      {/* Every action at its natural width, for measuring only. */}
      <div ref={measureRef} className='jala-table-selection-measure' aria-hidden='true'>
        { actions.map((action) => <span key={action.id} className='jala-table-menu-trigger'>
          { action.icon }
          <span>{ action.label }</span>
          { action.choices
            ? <TableIcon name='chevronUp' size={14} />
            : null
          }
        </span>) }
      </div>
    </div>,
    document.body,
  )
}
