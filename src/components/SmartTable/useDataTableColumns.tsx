// Copyright © 2026 Jalapeno Labs

import type { DataTableAction } from './DataTable.types'
import type { SmartTableLabels } from './labels'
import type { CellContext, ColumnDef, Row, RowData } from '@tanstack/react-table'
import type { ReactNode } from 'react'

// Core
import { Children, useMemo } from 'react'

const DATA_COLUMN_DEFAULT_SIZE = 220
const DATA_COLUMN_MIN_SIZE = 160
const DATA_COLUMN_MAX_SIZE = 560

type UseDataTableColumnsOptions<TData extends RowData> = {
  columnDefs: ColumnDef<TData, unknown>[]
  enableColumnResizing: boolean
  enableSorting: boolean
  enableRowReorder: boolean
  enableSelection: boolean
  selectionDisabled: boolean
  hasActions: boolean
  renderRowActions?: (row: Row<TData>) => ReactNode
  rowActions?: DataTableAction<TData>[]
  labels: SmartTableLabels
}

function resolveActionFlag<TData extends RowData>(
  value: boolean | ((row: Row<TData>) => boolean) | undefined,
  row: Row<TData>,
) {
  if (typeof value === 'function') {
    return value(row)
  }
  return value
}

/**
 * Applies default sizing/sorting/resizing to the data columns and prepends or
 * appends the synthetic utility columns (drag handle, selection checkbox, row
 * actions tray) as the enabled features require.
 */
export function useDataTableColumns<TData extends RowData>(options: UseDataTableColumnsOptions<TData>) {
  const {
    columnDefs,
    enableColumnResizing,
    enableSorting,
    enableRowReorder,
    enableSelection,
    selectionDisabled,
    hasActions,
    renderRowActions,
    rowActions,
    labels,
  } = options

  const resolvedDataColumnDefs = useMemo(() => {
    return columnDefs.map((columnDef) => ({
      ...columnDef,
      enableResizing: enableColumnResizing && (columnDef.enableResizing ?? true),
      enableSorting: enableSorting && (columnDef.enableSorting ?? true),
      size: columnDef.size ?? DATA_COLUMN_DEFAULT_SIZE,
      minSize: columnDef.minSize ?? DATA_COLUMN_MIN_SIZE,
      maxSize: columnDef.maxSize ?? DATA_COLUMN_MAX_SIZE,
    }))
  }, [ columnDefs, enableColumnResizing, enableSorting ])

  return useMemo<ColumnDef<TData, unknown>[]>(() => {
    const nextColumns: ColumnDef<TData, unknown>[] = []

    if (enableRowReorder) {
      nextColumns.push({
        id: 'drag',
        size: 44,
        minSize: 44,
        maxSize: 44,
        enableResizing: false,
        enableSorting: false,
        header: () => <span className='jala-table-sr-only'>{ labels.move }</span>,
        // The drag handle itself is rendered by DataTableRow, which owns the
        // sortable bindings this cell would need.
        cell: () => null,
      })
    }

    if (enableSelection) {
      nextColumns.push({
        id: 'select',
        size: 44,
        minSize: 44,
        maxSize: 44,
        enableResizing: false,
        enableSorting: false,
        header: ({ table }) => {
          const isAllSelected = table.getIsAllPageRowsSelected()
          const isSomeSelected = table.getIsSomePageRowsSelected()

          return (
            <input
              ref={(input) => {
                if (input) {
                  input.indeterminate = isSomeSelected && !isAllSelected
                }
              }}
              type='checkbox'
              aria-label={labels.selectAll}
              checked={isAllSelected}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
              disabled={selectionDisabled}
              className='jala-table-checkbox'
            />
          )
        },
        // The per-row checkbox is rendered by DataTableRow.
        cell: () => null,
      })
    }

    nextColumns.push(...resolvedDataColumnDefs)

    if (hasActions) {
      nextColumns.push({
        id: 'actions',
        size: 72,
        minSize: 72,
        maxSize: 72,
        enableResizing: false,
        enableSorting: false,
        header: () => <span className='jala-table-sr-only'>{ labels.actions }</span>,
        cell: (info: CellContext<TData, unknown>) => {
          const row = info.row
          const actionContent = renderRowActions
            ? renderRowActions(row)
            : rowActions?.map((action) => {
              const isVisible = resolveActionFlag(action.isVisible, row)
              if (isVisible === false) {
                return null
              }
              const isActionDisabled = resolveActionFlag(action.isDisabled, row)
              return (
                <button
                  key={action.id}
                  type='button'
                  aria-label={action.ariaLabel ?? action.label}
                  onClick={() => action.onPress(row)}
                  className={[ 'jala-table-action-button', action.className ?? '' ].join(' ').trim()}
                  disabled={isActionDisabled}
                  data-no-row-highlight='true'
                >
                  { action.icon }
                  <span>{ action.label }</span>
                </button>
              )
            })

          if (Children.toArray(actionContent).length === 0) {
            return null
          }

          return (
            <div
              className='jala-table-actions-tray'
              data-no-row-highlight='true'
            >
              {actionContent}
            </div>
          )
        },
      })
    }

    return nextColumns
  }, [
    resolvedDataColumnDefs,
    enableRowReorder,
    enableSelection,
    labels,
    selectionDisabled,
    hasActions,
    renderRowActions,
    rowActions,
  ])
}
