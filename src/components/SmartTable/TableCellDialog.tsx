// Copyright © 2026 Jalapeno Labs

import type { ManagedColumnMeta } from './DataTable.types'
import type { SmartTableLabels } from './labels'
import type { RowData, Table } from '@tanstack/react-table'

// Core
import { useEffect } from 'react'
import { flexRender } from '@tanstack/react-table'

// User interface
import { TableDialog } from './TableDialog'

export type OpenTableCell = {
  rowId: string
  columnId: string
}

type Props<TData extends RowData> = {
  table: Table<TData>
  cell: OpenTableCell
  labels: SmartTableLabels
  onClose: () => void
}

/**
 * One cell's full content in a modal, titled by its column: what a
 * double-click on a clamped cell opens in tables whose rows navigate.
 */
export function TableCellDialog<TData extends RowData>(props: Props<TData>) {
  const { table, cell: openCell, labels, onClose } = props

  // The row can leave the table while its cell is open, such as when the data
  // reloads without it; there is nothing left to show then.
  const row = table.getRowModel().rowsById[openCell.rowId]
    ?? table.getPrePaginationRowModel().rowsById[openCell.rowId]
  const cell = row?.getAllCells().find((candidate) => candidate.column.id === openCell.columnId)

  useEffect(() => {
    if (!cell) {
      console.debug('TableCellDialog closed: its cell is no longer in the table', openCell)
      onClose()
    }
  }, [ cell, onClose, openCell ])

  if (!cell) {
    return null
  }

  // Third-party interop boundary: DataTable folds the column label into `meta`.
  const meta = cell.column.columnDef.meta as ManagedColumnMeta<TData> | undefined

  return <TableDialog
    title={meta?.columnLabel ?? cell.column.id}
    onClose={onClose}
    onEnter={onClose}
    className='jala-table-cell-dialog'
    footer={<button type='button' className='jala-table-button jala-table-button--primary' onClick={onClose}>
      <span>{ labels.done }</span>
    </button>}
  >
    <div className='jala-table-cell-dialog-content'>{
      flexRender(cell.column.columnDef.cell, cell.getContext())
    }</div>
  </TableDialog>
}
