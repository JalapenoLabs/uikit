// Copyright © 2026 Jalapeno Labs

import type { DataTableCellOverflow } from './DataTable.types'
import type { RowSelectModifiers } from './DataTableRow'
import type { SmartTableLabels } from './labels'
import type { Row, RowData, Table } from '@tanstack/react-table'

// Core
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

// User interface
import { DataTableRow, DataTableSortableRow } from './DataTableRow'

type Props<TData extends RowData> = {
  table: Table<TData>
  rowModels: Row<TData>[]
  shouldUseSortableRows: boolean
  isDragDisabled: boolean
  highlightedRowId: string | null
  onHighlightedRowChange: (rowId: string | null) => void
  selectionDisabled: boolean
  enableRowHighlight: boolean
  expandedRowId: string | null
  onExpandedRowChange: (rowId: string | null) => void
  cellLineClamp: number | false
  cellOverflow: DataTableCellOverflow
  onOpenCell: (rowId: string, columnId: string) => void
  onSelectRow: (rowId: string, modifiers: RowSelectModifiers) => void
  getRowClassName?: (row: Row<TData>) => string | undefined
  searchTerm?: string
  labels: SmartTableLabels
}

export function DataTableBody<TData extends RowData>(props: Props<TData>) {
  const {
    table,
    rowModels,
    shouldUseSortableRows,
    isDragDisabled,
    highlightedRowId,
    onHighlightedRowChange,
    selectionDisabled,
    enableRowHighlight,
    expandedRowId,
    onExpandedRowChange,
    cellLineClamp,
    cellOverflow,
    onOpenCell,
    onSelectRow,
    getRowClassName,
    searchTerm,
    labels,
  } = props

  if (rowModels.length === 0) {
    return (
      <tbody>
        <tr>
          <td className='jala-table-empty-cell' colSpan={table.getAllColumns().length}>
            {searchTerm ? labels.searchNoResults : ''}
          </td>
        </tr>
      </tbody>
    )
  }

  if (shouldUseSortableRows) {
    return (
      <tbody>
        <SortableContext
          items={rowModels.map((row) => row.id)}
          strategy={verticalListSortingStrategy}
        >
          {rowModels.map((row) => (
            <DataTableSortableRow
              key={row.id}
              row={row}
              isDragDisabled={isDragDisabled}
              isHighlighted={highlightedRowId === row.id}
              onHighlightedRowChange={onHighlightedRowChange}
              selectionDisabled={selectionDisabled}
              enableRowHighlight={enableRowHighlight}
              isExpanded={expandedRowId === row.id}
              onExpandedRowChange={onExpandedRowChange}
              cellLineClamp={cellLineClamp}
              cellOverflow={cellOverflow}
              onOpenCell={onOpenCell}
              onSelectRow={onSelectRow}
              getRowClassName={getRowClassName}
              labels={labels}
            />
          ))}
        </SortableContext>
      </tbody>
    )
  }

  return (
    <tbody>
      {rowModels.map((row) => (
        <DataTableRow
          key={row.id}
          row={row}
          isDragDisabled={isDragDisabled}
          isHighlighted={highlightedRowId === row.id}
          onHighlightedRowChange={onHighlightedRowChange}
          selectionDisabled={selectionDisabled}
          enableRowHighlight={enableRowHighlight}
          isExpanded={expandedRowId === row.id}
          onExpandedRowChange={onExpandedRowChange}
          cellLineClamp={cellLineClamp}
          cellOverflow={cellOverflow}
          onOpenCell={onOpenCell}
          onSelectRow={onSelectRow}
          getRowClassName={getRowClassName}
          labels={labels}
        />
      ))}
    </tbody>
  )
}
