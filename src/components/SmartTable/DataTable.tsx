// Copyright © 2026 Jalapeno Labs

import type { DataTableProps } from './DataTable.types'
import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnSizingState,
  FilterFn,
  OnChangeFn,
  RowData,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import type { DragEndEvent } from '@dnd-kit/core'
import type { RefObject } from 'react'

// Core
import { useEffect, useMemo, useRef } from 'react'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { arrayMove } from '@dnd-kit/sortable'
import { useDataTableColumns } from './useDataTableColumns'

// User interface
import { DataTableBody } from './DataTableBody'
import { DataTableDndWrapper } from './DataTableDndWrapper'
import { DataTableFooter } from './DataTableFooter'
import { DataTableHeader } from './DataTableHeader'
import { SmartTableStyles } from './tableStyles'

// Misc
import { mergeColumnOrder } from './columnOrderUtils'
import { defaultSmartTableLabels } from './labels'

const EMPTY_SORTING: SortingState = []
const EMPTY_VISIBILITY: VisibilityState = {}
const EMPTY_ORDER: ColumnOrderState = []
const EMPTY_SIZING: ColumnSizingState = {}
const EMPTY_COLUMN_FILTERS: ColumnFiltersState = []
const EMPTY_ROW_SELECTION: RowSelectionState = {}
const NOOP_HIGHLIGHT_CHANGE = () => {}
const NOOP_SORTING_CHANGE: OnChangeFn<SortingState> = () => {}
const NOOP_VISIBILITY_CHANGE: OnChangeFn<VisibilityState> = () => {}
const NOOP_ORDER_CHANGE: OnChangeFn<ColumnOrderState> = () => {}
const NOOP_SIZING_CHANGE: OnChangeFn<ColumnSizingState> = () => {}
const NOOP_COLUMN_FILTERS_CHANGE: OnChangeFn<ColumnFiltersState> = () => {}
const NOOP_ROW_SELECTION_CHANGE: OnChangeFn<RowSelectionState> = () => {}

function normalizeSearchValue(value: unknown): string | null {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => normalizeSearchValue(entry))
      .filter((entry): entry is string => Boolean(entry))
      .join(' ')
  }

  if (value == null) {
    return null
  }

  return String(value)
}

/**
 * The low-level table: a fully controlled wrapper around TanStack Table that
 * renders sorting, resizing, visibility, ordering, selection, row reorder,
 * row highlight, and pagination. Most consumers want SmartTable, which wires
 * this up with a toolbar, column controls, and localStorage persistence.
 */
export function DataTable<TData extends RowData>(props: DataTableProps<TData>) {
  const {
    tableElementId,
    tableAriaLabel,
    className,
    data,
    managedColumns,
    getRowId,
    searchTerm,
    isDisabled,
    enableSelection = false,
    rowSelection: rowSelectionProp,
    onRowSelectionChange,
    columnFilters: columnFiltersProp,
    onColumnFiltersChange: onColumnFiltersChangeProp,
    enableSorting = false,
    sorting: sortingProp,
    onSortingChange,
    enableColumnResizing = false,
    columnSizing: columnSizingProp,
    onColumnSizingChange,
    enableColumnVisibility = false,
    columnVisibility: columnVisibilityProp,
    onColumnVisibilityChange,
    enableColumnOrder = false,
    columnOrder: columnOrderProp,
    onColumnOrderChange,
    enableRowReorder = false,
    isRowReorderBlocked = false,
    onRowReorder,
    enableRowHighlight = false,
    highlightedRowId: highlightedRowIdProp,
    onHighlightedRowChange,
    pagination,
    renderRowActions,
    rowActions,
    getRowClassName,
    onFilteredRowCountChange,
    scrollContainerRef,
    stickyScrollbar = false,
    stickyHeader = false,
  } = props

  const labels = useMemo(
    () => ({ ...defaultSmartTableLabels, ...props.labels }),
    [ props.labels ],
  )

  const managedColumnIds = useMemo(() => {
    return managedColumns.map((managedColumn) => managedColumn.columnId)
  }, [ managedColumns ])

  // A column is searchable through one of two paths:
  //   1. `getSearchValue(row)` — a resolver that returns a computed string
  //      (e.g. a formatted date). Preferred when set.
  //   2. `searchKey` — a property name on `row.original`. Falls back to the
  //      column id when not specified, unless the consumer passes
  //      `searchKey: null` to explicitly opt the column out of search.
  const { managedSearchKeyByColumnId, managedSearchValueByColumnId } = useMemo(() => {
    const keyEntries = [] as [string, string][]
    const resolverEntries = [] as [string, (row: TData) => string | null][]

    managedColumns.forEach((managedColumn) => {
      if (managedColumn.getSearchValue) {
        resolverEntries.push([ managedColumn.columnId, managedColumn.getSearchValue ])
        return
      }
      const searchKey = managedColumn.searchKey ?? managedColumn.columnId
      if (!searchKey) {
        return
      }
      keyEntries.push([ managedColumn.columnId, searchKey ])
    })

    return {
      managedSearchKeyByColumnId: new Map(keyEntries),
      managedSearchValueByColumnId: new Map(resolverEntries),
    }
  }, [ managedColumns ])

  const managedColumnDefs = useMemo(() => {
    return managedColumns.map((managedColumn) => {
      // Fold the tooltip resolvers into tanstack `meta` (merging any meta the
      // caller already set) so DataTableRow / DataTableHeader can read them at
      // their flexRender points. Columns without tooltips keep their original
      // meta untouched.
      const hasTooltip = managedColumn.cellTooltip || managedColumn.headerTooltip !== undefined
      const meta = hasTooltip
        ? {
          ...managedColumn.columnDef.meta,
          cellTooltip: managedColumn.cellTooltip,
          headerTooltip: managedColumn.headerTooltip,
        }
        : managedColumn.columnDef.meta

      return {
        ...managedColumn.columnDef,
        id: managedColumn.columnId,
        ...(meta ? { meta } : {}),
      }
    })
  }, [ managedColumns ])

  const sorting = sortingProp ?? EMPTY_SORTING
  const handleSortingChange = onSortingChange ?? NOOP_SORTING_CHANGE

  const columnVisibility = columnVisibilityProp ?? EMPTY_VISIBILITY
  const handleVisibilityChange = onColumnVisibilityChange ?? NOOP_VISIBILITY_CHANGE

  const columnOrder = columnOrderProp ?? EMPTY_ORDER
  const handleOrderChange = onColumnOrderChange ?? NOOP_ORDER_CHANGE

  const columnSizing = columnSizingProp ?? EMPTY_SIZING
  const handleSizingChange = onColumnSizingChange ?? NOOP_SIZING_CHANGE

  const columnFilters = columnFiltersProp ?? EMPTY_COLUMN_FILTERS
  const handleColumnFiltersChange = onColumnFiltersChangeProp ?? NOOP_COLUMN_FILTERS_CHANGE

  const highlightedRowId = highlightedRowIdProp ?? null
  const handleHighlightedRowChange = onHighlightedRowChange ?? NOOP_HIGHLIGHT_CHANGE

  const rowSelection = rowSelectionProp ?? EMPTY_ROW_SELECTION
  const handleRowSelectionChange = onRowSelectionChange ?? NOOP_ROW_SELECTION_CHANGE
  const selectionDisabled = Boolean(isDisabled || !enableSelection)
  const hasSelectionProps = rowSelectionProp !== undefined && onRowSelectionChange !== undefined
  const hasWarnedSelectionConfigRef = useRef(false)

  // Selection without controlled props silently renders dead checkboxes, so
  // surface the misconfiguration loudly (once per table).
  useEffect(() => {
    if (!enableSelection || hasSelectionProps) {
      hasWarnedSelectionConfigRef.current = false
      return
    }

    if (hasWarnedSelectionConfigRef.current) {
      return
    }
    hasWarnedSelectionConfigRef.current = true

    console.warn(
      `DataTable "${tableElementId}" has enableSelection=true but is missing controlled selection props. `
      + 'Pass both rowSelection and onRowSelectionChange.',
    )
  }, [ enableSelection, hasSelectionProps, tableElementId ])

  const hasActions = Boolean(renderRowActions || rowActions?.length)

  const resolveRowId = (row: TData, index: number) => {
    if (getRowId) {
      return getRowId(row, index)
    }
    return String(index)
  }

  const resolvedColumnDefs = useDataTableColumns<TData>({
    columnDefs: managedColumnDefs,
    enableColumnResizing,
    enableSorting,
    enableRowReorder,
    enableSelection,
    selectionDisabled,
    hasActions,
    renderRowActions,
    rowActions,
    labels,
  })

  const tableColumnOrder = enableColumnOrder
    ? (() => {
      const orderedData = mergeColumnOrder(columnOrder, managedColumnIds)
      const prefix = [] as string[]
      if (enableRowReorder) {
        prefix.push('drag')
      }
      if (enableSelection) {
        prefix.push('select')
      }
      const suffix = hasActions
        ? [ 'actions' ]
        : []
      return [ ...prefix, ...orderedData, ...suffix ]
    })()
    : undefined

  const tableColumnVisibility: VisibilityState | undefined = enableColumnVisibility
    ? {
      ...columnVisibility,
      ...(enableRowReorder ? { drag: true } : {}),
      ...(enableSelection ? { select: true } : {}),
      ...(hasActions ? { actions: true } : {}),
    }
    : undefined

  const canColumnBeGloballyFiltered = (columnId: string) => {
    const hasSearchSource = managedSearchKeyByColumnId.has(columnId)
      || managedSearchValueByColumnId.has(columnId)
    if (!hasSearchSource) {
      return false
    }
    return !enableColumnVisibility || tableColumnVisibility?.[columnId] !== false
  }

  const globalFilterFn = useMemo<FilterFn<TData>>(() => {
    return (row, columnId, filterValue) => {
      const normalizedFilter = String(filterValue ?? '').trim().toLowerCase()
      if (!normalizedFilter) {
        return true
      }

      const computeSearchValue = managedSearchValueByColumnId.get(columnId)
      if (computeSearchValue) {
        const value = normalizeSearchValue(computeSearchValue(row.original))
        return value?.toLowerCase().includes(normalizedFilter) ?? false
      }

      const searchKey = managedSearchKeyByColumnId.get(columnId)
      if (!searchKey) {
        return false
      }

      const original = row.original as Record<string, unknown>
      const value = normalizeSearchValue(original[searchKey])
      return value?.toLowerCase().includes(normalizedFilter) ?? false
    }
  }, [ managedSearchKeyByColumnId, managedSearchValueByColumnId ])

  // Order and visibility changes coming back from react-table cover the
  // synthetic columns (drag/select/actions) too; strip those before handing
  // the state to the consumer, whose world is only the managed columns.
  const handleColumnOrderChange = (updater: ColumnOrderState | ((current: ColumnOrderState) => ColumnOrderState)) => {
    if (!enableColumnOrder) {
      return
    }
    const prefix = [] as string[]
    if (enableRowReorder) {
      prefix.push('drag')
    }
    if (enableSelection) {
      prefix.push('select')
    }
    const suffix = hasActions
      ? [ 'actions' ]
      : []
    const currentFull = [ ...prefix, ...mergeColumnOrder(columnOrder, managedColumnIds), ...suffix ]
    const nextFull = typeof updater === 'function'
      ? updater(currentFull)
      : updater
    const nextOrder = mergeColumnOrder(
      nextFull.filter((columnId) => managedColumnIds.includes(columnId)),
      managedColumnIds,
    )
    handleOrderChange(nextOrder)
  }

  const handleColumnVisibilityChange = (updater: VisibilityState | ((current: VisibilityState) => VisibilityState)) => {
    if (!enableColumnVisibility) {
      return
    }
    const currentFull: VisibilityState = {
      ...columnVisibility,
      ...(enableRowReorder ? { drag: true } : {}),
      ...(enableSelection ? { select: true } : {}),
      ...(hasActions ? { actions: true } : {}),
    }
    const nextFull = typeof updater === 'function'
      ? updater(currentFull)
      : updater
    const next: VisibilityState = {}
    managedColumnIds.forEach((columnId) => {
      if (nextFull[columnId] === false) {
        next[columnId] = false
      }
    })
    handleVisibilityChange(next)
  }

  const handleColumnSizingChange = (
    updater: ColumnSizingState | ((current: ColumnSizingState) => ColumnSizingState),
  ) => {
    if (!enableColumnResizing) {
      return
    }
    const nextFull = typeof updater === 'function'
      ? updater(columnSizing)
      : updater
    const next = Object.fromEntries(
      Object.entries(nextFull).filter(([ key ]) => managedColumnIds.includes(key)),
    )
    handleSizingChange(next)
  }

  const table = useReactTable<TData>({
    data,
    columns: resolvedColumnDefs,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: pagination
      ? getPaginationRowModel()
      : undefined,
    getRowId: resolveRowId,
    getColumnCanGlobalFilter: (column) => canColumnBeGloballyFiltered(column.id),
    globalFilterFn,
    columnResizeMode: enableColumnResizing
      ? 'onChange'
      : undefined,
    autoResetPageIndex: false,
    enableSortingRemoval: true,
    enableRowSelection: enableSelection,
    onRowSelectionChange: enableSelection && !selectionDisabled
      ? handleRowSelectionChange
      : undefined,
    onSortingChange: enableSorting
      ? handleSortingChange
      : undefined,
    onColumnVisibilityChange: enableColumnVisibility
      ? handleColumnVisibilityChange
      : undefined,
    onColumnOrderChange: enableColumnOrder
      ? handleColumnOrderChange
      : undefined,
    onColumnSizingChange: enableColumnResizing
      ? handleColumnSizingChange
      : undefined,
    onColumnFiltersChange: columnFiltersProp
      ? handleColumnFiltersChange
      : undefined,
    onPaginationChange: pagination?.onPaginationChange,
    state: {
      globalFilter: searchTerm ?? '',
      rowSelection: enableSelection
        ? rowSelection
        : undefined,
      columnFilters: columnFiltersProp
        ? columnFilters
        : undefined,
      columnSizing: enableColumnResizing
        ? columnSizing
        : undefined,
      pagination: pagination
        ? {
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        }
        : undefined,
      sorting: enableSorting
        ? sorting
        : undefined,
      columnVisibility: enableColumnVisibility
        ? tableColumnVisibility
        : undefined,
      columnOrder: enableColumnOrder
        ? tableColumnOrder
        : undefined,
    },
  })

  const rowModels = table.getRowModel().rows
  const fullRowModels = pagination
    ? table.getPrePaginationRowModel().rows
    : rowModels

  useEffect(() => {
    onFilteredRowCountChange?.(fullRowModels.length)
  }, [ fullRowModels.length, onFilteredRowCountChange ])

  const tableState = table.getState()
  // Disabled features are handed to react-table as `state.<feature>: undefined`
  // (i.e. uncontrolled), so getState() can legitimately return undefined for
  // `sorting` / `columnFilters`. Guard the reads so a table without
  // `enableSorting` (or without `columnFilters`) doesn't crash here.
  const hasActiveFilters = Boolean(
    String(tableState.globalFilter ?? '').trim()
    || (tableState.columnFilters?.length ?? 0) > 0,
  )
  const hasActiveSorting = (tableState.sorting?.length ?? 0) > 0

  // Row reordering only makes sense against the natural row order, so any
  // active filter or sort blocks it (dropping a row "between" two rows of a
  // filtered view would silently reorder hidden neighbors).
  const isDragDisabled = Boolean(
    isDisabled
    || isRowReorderBlocked
    || hasActiveFilters
    || hasActiveSorting
    || !onRowReorder
    || !enableRowReorder,
  )
  const shouldUseSortableRows = enableRowReorder && !isDragDisabled

  const handleRowDragEnd = (event: DragEndEvent) => {
    if (isDragDisabled) {
      return
    }
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    const currentRows = pagination
      ? table.getPrePaginationRowModel().rows
      : table.getRowModel().rows
    const currentRowIds = currentRows.map((row) => row.id)
    const oldIndex = currentRowIds.indexOf(String(active.id))
    const newIndex = currentRowIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const nextRowIds = arrayMove(currentRowIds, oldIndex, newIndex)
    const rowMap = new Map(currentRows.map((row) => [ row.id, row.original ]))
    const nextRows: TData[] = []
    nextRowIds.forEach((rowId) => {
      const original = rowMap.get(rowId)
      if (original !== undefined) {
        nextRows.push(original)
      }
    })

    if (nextRows.length !== currentRows.length) {
      console.warn('Row reorder failed; some rows could not be resolved from ids.')
      return
    }

    onRowReorder?.({
      previousRows: currentRows.map((row) => row.original),
      nextRows,
      activeId: String(active.id),
      overId: String(over.id),
    })
  }

  const tableElement = (
    <table
      className='jala-table'
      style={{ tableLayout: 'fixed', width: '100%', minWidth: table.getTotalSize() }}
      aria-label={tableAriaLabel}
    >
      <DataTableHeader table={table} labels={labels} stickyHeader={stickyHeader} />
      <DataTableBody
        table={table}
        rowModels={rowModels}
        shouldUseSortableRows={shouldUseSortableRows}
        isDragDisabled={isDragDisabled}
        highlightedRowId={highlightedRowId}
        onHighlightedRowChange={handleHighlightedRowChange}
        selectionDisabled={selectionDisabled}
        enableRowHighlight={enableRowHighlight}
        getRowClassName={getRowClassName}
        searchTerm={searchTerm}
        labels={labels}
      />
    </table>
  )

  return (
    <section
      id={tableElementId}
      className={[ 'jala-table-root', className ?? '' ].join(' ').trim()}
      ref={stickyScrollbar ? scrollContainerRef : undefined}
    >
      <SmartTableStyles />
      <div
        className={stickyScrollbar
          ? undefined
          : 'jala-table-scroll'}
        ref={stickyScrollbar
          ? undefined
          : scrollContainerRef as RefObject<HTMLDivElement>}
      >
        { shouldUseSortableRows
          ? (
            <DataTableDndWrapper onDragEnd={handleRowDragEnd}>
              {tableElement}
            </DataTableDndWrapper>
          )
          : tableElement
        }
      </div>
      { pagination
        ? (
          <DataTableFooter
            pageSize={pagination.pageSize}
            pageSizeOptions={pagination.pageSizeOptions}
            activePage={pagination.pageIndex + 1}
            totalPages={table.getPageCount()}
            isDisabled={isDisabled}
            labels={labels}
            onPageChange={(page) => {
              pagination.onPaginationChange((current) => ({
                ...current,
                pageIndex: Math.max(0, page - 1),
              }))
            }}
            onPageSizeChange={(pageSize) => {
              pagination.onPaginationChange((current) => ({
                ...current,
                pageIndex: 0,
                pageSize,
              }))
            }}
          />
        )
        : null
      }
    </section>
  )
}
