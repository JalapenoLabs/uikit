// Copyright © 2026 Jalapeno Labs

import type { ManagedColumnTooltipMeta } from './DataTable.types'
import type { SmartTableLabels } from './labels'
import type { RowData, Table } from '@tanstack/react-table'

// Core
import { flexRender } from '@tanstack/react-table'

// User interface
import { TableIcon } from './icons'
import { TableTooltip } from './TableTooltip'

type Props<TData extends RowData> = {
  table: Table<TData>
  labels: SmartTableLabels
  stickyHeader?: boolean
}

export function DataTableHeader<TData extends RowData>(props: Props<TData>) {
  const { table, labels, stickyHeader } = props

  return (
    <thead className='jala-table-head'>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const isCompactHeader = header.column.id === 'drag' || header.column.id === 'select'

            return (
              <th
                key={header.id}
                className={[
                  'jala-table-header-cell',
                  stickyHeader ? 'jala-table-header-cell--sticky' : '',
                  isCompactHeader ? 'jala-table-header-cell--compact' : '',
                ].join(' ').trim()}
                style={{ width: header.getSize() }}
              >
                {header.isPlaceholder
                  ? null
                  : (() => {
                    const content = flexRender(header.column.columnDef.header, header.getContext())
                    // Third-party interop boundary: tooltip resolvers ride on
                    // tanstack's untyped `meta`, so narrow it back here.
                    const meta = header.column.columnDef.meta as ManagedColumnTooltipMeta<TData> | undefined
                    const headerTooltip = meta?.headerTooltip

                    let inner = content
                    if (header.column.getCanSort()) {
                      const sortState = header.column.getIsSorted()
                      const sortIcon = sortState === 'asc'
                        ? 'sortUp' as const
                        : sortState === 'desc'
                          ? 'sortDown' as const
                          : null
                      const sortLabel = sortState === 'asc'
                        ? labels.sortAscending
                        : sortState === 'desc'
                          ? labels.sortDescending
                          : labels.sort

                      inner = (
                        <button
                          type='button'
                          onClick={header.column.getToggleSortingHandler()}
                          className='jala-table-sort-button'
                          aria-label={sortLabel}
                        >
                          <span>{ content }</span>
                          { sortIcon
                            ? <TableIcon name={sortIcon} size={14} className='jala-table-sort-icon' />
                            : null
                          }
                        </button>
                      )
                    }

                    if (!headerTooltip) {
                      return inner
                    }
                    return (
                      <TableTooltip content={headerTooltip}>
                        <span style={{ display: 'inline-flex', maxWidth: '100%' }}>{ inner }</span>
                      </TableTooltip>
                    )
                  })()
                }
                {header.column.getCanResize()
                  ? <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className='jala-table-resize-handle'
                  />
                  : null
                }
              </th>
            )
          })}
        </tr>
      ))}
    </thead>
  )
}
