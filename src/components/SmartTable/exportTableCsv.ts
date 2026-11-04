// Copyright © 2026 Jalapeno Labs

import type { DataTableManagedColumn } from './DataTable.types'
import type { CsvValue } from '../../utils/csv'
import type { RowData, Table } from '@tanstack/react-table'

// Misc
import { toCsv } from '../../utils/csv'

/**
 * The table as the user sees it, as CSV: every row that passes the search and
 * filters, in the current sort order and across all pages, under the visible
 * columns in their current order. Each column exports its `exportValue`, or
 * its raw accessor value; columns with `exportValue: null` stay out.
 */
export function buildTableCsv<TData extends RowData>(
  table: Table<TData>,
  managedColumns: DataTableManagedColumn<TData>[],
) {
  const managedColumnById = new Map(managedColumns.map((managedColumn) => [ managedColumn.columnId, managedColumn ]))

  // Visible leaf columns are already in display order; the drag handle,
  // checkbox, and actions columns are not managed, so they fall away here.
  const exportedColumns: DataTableManagedColumn<TData>[] = []
  for (const column of table.getVisibleLeafColumns()) {
    const managedColumn = managedColumnById.get(column.id)
    if (managedColumn && managedColumn.exportValue !== null) {
      exportedColumns.push(managedColumn)
    }
  }

  const header: CsvValue[] = exportedColumns.map((managedColumn) => managedColumn.columnLabel)
  const lines: CsvValue[][] = [ header ]
  for (const row of table.getPrePaginationRowModel().rows) {
    lines.push(exportedColumns.map((managedColumn) => {
      if (managedColumn.exportValue) {
        return managedColumn.exportValue(row.original)
      }
      // Third-party interop boundary: an accessor's value is untyped. Values
      // a CSV cannot hold (objects) export as their string form.
      const value = row.getValue<unknown>(managedColumn.columnId)
      if (value === null || value === undefined || value instanceof Date) {
        return value
      }
      if (Array.isArray(value)) {
        return value.map((entry) => String(entry))
      }
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value
      }
      return String(value)
    }))
  }

  return toCsv(lines)
}
