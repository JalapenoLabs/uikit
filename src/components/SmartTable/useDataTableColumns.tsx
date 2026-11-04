// Copyright © 2026 Jalapeno Labs

import type { DataTableAction } from './DataTable.types'
import type { SmartTableLabels } from './labels'
import type { CellContext, ColumnDef, Row, RowData } from '@tanstack/react-table'
import type { ReactNode } from 'react'

// Core
import { useMemo } from 'react'

// User interface
import { DataTableRowActions } from './DataTableRowActions'

const DATA_COLUMN_DEFAULT_SIZE = 220
const DATA_COLUMN_MIN_SIZE = 160
const DATA_COLUMN_MAX_SIZE = 560
const ACTIONS_MENU_COLUMN_SIZE = 48

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
  rowActionsLayout: 'hover' | 'menu'
  labels: SmartTableLabels
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
    rowActionsLayout,
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
      // The hover tray floats over the row, so its column takes no room; the
      // ellipsis menu on screens that cannot hover gets a column of its own,
      // so it never covers the row's last cell.
      const actionsColumnSize = rowActionsLayout === 'menu'
        ? ACTIONS_MENU_COLUMN_SIZE
        : 0
      nextColumns.push({
        id: 'actions',
        size: actionsColumnSize,
        minSize: actionsColumnSize,
        maxSize: actionsColumnSize,
        enableResizing: false,
        enableSorting: false,
        header: () => <span className='jala-table-sr-only'>{ labels.actions }</span>,
        cell: (info: CellContext<TData, unknown>) => <DataTableRowActions
          row={info.row}
          rowActions={rowActions}
          renderRowActions={renderRowActions}
          layout={rowActionsLayout}
          labels={labels}
        />,
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
    rowActionsLayout,
  ])
}
