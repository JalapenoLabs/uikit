// Copyright © 2026 Jalapeno Labs

import type { DataTableCellOverflow, ManagedColumnMeta } from './DataTable.types'
import type { SmartTableLabels } from './labels'
import type { Row, RowData } from '@tanstack/react-table'
import type { CSSProperties, MouseEvent } from 'react'

// Core
import { useEffect, useRef } from 'react'
import { flexRender } from '@tanstack/react-table'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// User interface
import { TableIcon } from './icons'
import { TableTooltip } from './TableTooltip'

type DataTableRowProps<TData extends RowData> = {
  row: Row<TData>
  isDragDisabled: boolean
  selectionDisabled: boolean
  isHighlighted: boolean
  enableRowHighlight: boolean
  onHighlightedRowChange: (rowId: string | null) => void
  // Whether this row shows its cells' full content instead of clamping them.
  isExpanded: boolean
  onExpandedRowChange: (rowId: string | null) => void
  cellLineClamp: number | false
  cellOverflow: DataTableCellOverflow
  onOpenCell: (rowId: string, columnId: string) => void
  getRowClassName?: (row: Row<TData>) => string | undefined
  labels: SmartTableLabels
}

// A press on one of these is the element's own, never the row's.
const INTERACTIVE_SELECTOR = 'a, button, input, select, textarea, label, [data-no-row-highlight="true"]'
const CLAMP_SELECTOR = '.jala-table-cell-clamp'
// How long a row waits, after a click on a clamped cell, for the second click
// of a double-click before treating it as a single click.
export const DOUBLE_CLICK_WINDOW_MS = 250

function isClampOverflowing(element: Element) {
  return element.scrollHeight > element.clientHeight + 1
}

type SortableBindings = {
  setNodeRef?: ReturnType<typeof useSortable>['setNodeRef']
  setActivatorNodeRef?: ReturnType<typeof useSortable>['setActivatorNodeRef']
  attributes?: ReturnType<typeof useSortable>['attributes']
  listeners?: ReturnType<typeof useSortable>['listeners']
  rowStyle?: CSSProperties
  isDragging?: boolean
}

type DataTableRowBaseProps<TData extends RowData> = DataTableRowProps<TData> & {
  sortable?: SortableBindings
}

function DataTableRowBase<TData extends RowData>(props: DataTableRowBaseProps<TData>) {
  const {
    row,
    isDragDisabled,
    selectionDisabled,
    isHighlighted,
    enableRowHighlight,
    onHighlightedRowChange,
    isExpanded,
    onExpandedRowChange,
    cellLineClamp,
    cellOverflow,
    onOpenCell,
    getRowClassName,
    labels,
    sortable,
  } = props

  const pendingClickRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function cancelPendingClick() {
    if (pendingClickRef.current !== null) {
      clearTimeout(pendingClickRef.current)
      pendingClickRef.current = null
    }
  }

  useEffect(() => cancelPendingClick, [])

  function pressRow() {
    if (cellOverflow === 'expandRow' && !enableRowHighlight) {
      onExpandedRowChange(isExpanded
        ? null
        : row.id)
      return
    }
    if (enableRowHighlight) {
      onHighlightedRowChange(isHighlighted
        ? null
        : row.id)
    }
  }

  function handleRowClick(event: MouseEvent<HTMLTableRowElement>) {
    // Checkboxes, links, action buttons, and drag handles are their own
    // presses, so pressing one never toggles or opens the row.
    const target = event.target
    if (!(target instanceof Element) || target.closest(INTERACTIVE_SELECTOR)) {
      return
    }

    if (cellOverflow === 'expandRow') {
      pressRow()
      return
    }

    // In modal mode a row's click is the consumer's, such as navigating. On a
    // clamped cell it waits briefly, so the second click of a double-click can
    // open the cell instead of leaving the page under it.
    cancelPendingClick()
    if (event.detail > 1) {
      return
    }
    const clamp = target.closest(CLAMP_SELECTOR)
    if (clamp && isClampOverflowing(clamp)) {
      pendingClickRef.current = setTimeout(() => {
        pendingClickRef.current = null
        pressRow()
      }, DOUBLE_CLICK_WINDOW_MS)
      return
    }
    pressRow()
  }

  function handleRowDoubleClick(event: MouseEvent<HTMLTableRowElement>) {
    if (cellOverflow !== 'modal') {
      return
    }
    const target = event.target
    if (!(target instanceof Element) || target.closest(INTERACTIVE_SELECTOR)) {
      return
    }
    const clamp = target.closest<HTMLElement>(CLAMP_SELECTOR)
    const columnId = clamp?.dataset.columnId
    if (!clamp || !columnId || !isClampOverflowing(clamp)) {
      return
    }
    cancelPendingClick()
    // A double-click also selects the word under the pointer; the dialog is
    // the answer, so the stray selection goes.
    window.getSelection()?.removeAllRanges()
    onOpenCell(row.id, columnId)
  }

  return (
    <tr
      ref={sortable?.setNodeRef}
      style={sortable?.rowStyle}
      className={[
        'jala-table-row',
        isHighlighted ? 'jala-table-row--active' : '',
        sortable?.isDragging ? 'jala-table-row--dragging' : '',
        getRowClassName?.(row) ?? '',
      ].join(' ').trim()}
      onClick={handleRowClick}
      onDoubleClick={handleRowDoubleClick}
    >
      {row.getVisibleCells().map((cell) => {
        if (cell.column.id === 'drag') {
          return (
            <td
              key={cell.id}
              className='jala-table-cell jala-table-cell--compact'
              style={{ width: cell.column.getSize() }}
              data-no-row-highlight='true'
            >
              <button
                ref={sortable?.setActivatorNodeRef}
                type='button'
                aria-label={labels.move}
                className='jala-table-drag-button'
                disabled={isDragDisabled}
                {...sortable?.attributes}
                {...sortable?.listeners}
                data-no-row-highlight='true'
              >
                <TableIcon name='dragHandle' size={20} />
              </button>
            </td>
          )
        }

        if (cell.column.id === 'select') {
          return (
            <td
              key={cell.id}
              className='jala-table-cell jala-table-cell--compact'
              style={{ width: cell.column.getSize() }}
              data-no-row-highlight='true'
            >
              <input
                type='checkbox'
                aria-label={labels.select}
                checked={row.getIsSelected()}
                onChange={row.getToggleSelectedHandler()}
                disabled={selectionDisabled || !row.getCanSelect()}
                className='jala-table-checkbox'
                data-no-row-highlight='true'
              />
            </td>
          )
        }

        if (cell.column.id === 'actions') {
          return (
            <td
              key={cell.id}
              className='jala-table-actions-cell'
              style={{ width: cell.column.getSize() }}
              data-no-row-highlight='true'
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          )
        }

        // Third-party interop boundary: the managed-column settings were
        // folded into tanstack's untyped `meta` by DataTable, so narrow it here.
        const meta = cell.column.columnDef.meta as ManagedColumnMeta<TData> | undefined
        const tooltipContent = meta?.cellTooltip
          ? meta.cellTooltip(row.original)
          : null
        const lineClamp = meta?.lineClamp ?? cellLineClamp
        const content = flexRender(cell.column.columnDef.cell, cell.getContext())
        const renderedCell = lineClamp === false
          ? content
          : <div
            className={[
              'jala-table-cell-clamp',
              isExpanded ? 'jala-table-cell-clamp--expanded' : '',
            ].join(' ').trim()}
            style={{ '--jala-table-clamp-lines': lineClamp } as CSSProperties}
            data-column-id={cell.column.id}
          >{
              content
            }</div>

        return (
          <td
            key={cell.id}
            className='jala-table-cell'
            style={{ width: cell.column.getSize() }}
          >
            { tooltipContent
              ? (
                <TableTooltip content={tooltipContent}>
                  <div style={{ width: '100%' }}>{ renderedCell }</div>
                </TableTooltip>
              )
              : renderedCell
            }
          </td>
        )
      })}
    </tr>
  )
}

export function DataTableRow<TData extends RowData>(props: DataTableRowProps<TData>) {
  return <DataTableRowBase {...props} />
}

export function DataTableSortableRow<TData extends RowData>(props: DataTableRowProps<TData>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.row.id,
    disabled: props.isDragDisabled,
  })

  const rowStyle: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <DataTableRowBase
      {...props}
      sortable={{
        setNodeRef,
        setActivatorNodeRef,
        attributes,
        listeners,
        rowStyle,
        isDragging,
      }}
    />
  )
}
