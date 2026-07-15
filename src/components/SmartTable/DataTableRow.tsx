// Copyright © 2026 Jalapeno Labs

import type { ManagedColumnTooltipMeta } from './DataTable.types'
import type { SmartTableLabels } from './labels'
import type { Row, RowData } from '@tanstack/react-table'
import type { CSSProperties, MouseEvent } from 'react'

// Core
import { useCallback } from 'react'
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
  getRowClassName?: (row: Row<TData>) => string | undefined
  labels: SmartTableLabels
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
    getRowClassName,
    labels,
    sortable,
  } = props

  const handleRowClick = useCallback((event: MouseEvent<HTMLTableRowElement>) => {
    if (!enableRowHighlight) {
      return
    }
    // Interactive elements (checkboxes, action buttons, drag handles) opt out
    // of row highlighting so clicking them never toggles the row.
    const target = event.target as HTMLElement | null
    if (target?.closest('[data-no-row-highlight="true"]')) {
      return
    }
    onHighlightedRowChange(isHighlighted
      ? null
      : row.id)
  }, [ enableRowHighlight, isHighlighted, onHighlightedRowChange, row.id ])

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
              style={{ width: 0 }}
              data-no-row-highlight='true'
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          )
        }

        const renderedCell = flexRender(cell.column.columnDef.cell, cell.getContext())
        // Third-party interop boundary: the tooltip resolvers were folded into
        // tanstack's untyped `meta` by DataTable, so narrow it back here.
        const meta = cell.column.columnDef.meta as ManagedColumnTooltipMeta<TData> | undefined
        const tooltipContent = meta?.cellTooltip
          ? meta.cellTooltip(row.original)
          : null

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
