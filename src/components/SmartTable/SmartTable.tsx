// Copyright © 2026 Jalapeno Labs

import type {
  DataTableAction,
  DataTableManagedColumn,
  DataTableRowReorderPayload,
} from './DataTable.types'
import type { SmartTableLabels } from './labels'
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import type { ReactNode } from 'react'

// Core
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDataTableState } from './useDataTableState'
import { useScrollPositionRestore } from '../../hooks/useScrollPositionRestore'

// User interface
import { DataTable } from './DataTable'
import { DataTableColumnControls } from './DataTableColumnControls'
import { DataTableToolbar } from './DataTableToolbar'

// Utility
import { isEqual } from 'lodash-es'

type SmartTableIds = {
  tableElementId: string
  tableLocalStorageId: string
  searchInputElementId?: string
  columnControlsButtonId?: string
}

type SmartTablePersistence = {
  stateVersion?: string
  defaultHiddenColumnIds?: string[]
}

type SmartTableSearch = {
  value?: string
  onChange?: (value: string) => void
  show?: boolean
  isDisabled?: boolean
  placeholder?: string
}

type SmartTableToolbar = {
  show?: boolean
  className?: string
  showResultsCount?: boolean
  resultsCount?: number
  leftSlot?: ReactNode
  rightSlot?: ReactNode
}

type SmartTableColumnControls = {
  show?: boolean
  isDisabled?: boolean
}

type SmartTablePagination = {
  show?: boolean
  initialPageSize?: number
  pageSizeOptions?: number[]
}

export type SmartTableProps<TData extends RowData> = {
  ids: SmartTableIds
  tableAriaLabel: string
  persistence?: SmartTablePersistence
  className?: string
  data: TData[]
  managedColumns: DataTableManagedColumn<TData>[]
  getRowId?: (row: TData, index: number) => string
  isDisabled?: boolean
  // Overrides for the table's user-facing strings (English by default).
  labels?: Partial<SmartTableLabels>
  enableSelection?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  enableSorting?: boolean
  enableColumnResizing?: boolean
  enableColumnVisibility?: boolean
  enableColumnOrder?: boolean
  enableRowReorder?: boolean
  isRowReorderBlocked?: boolean
  onRowReorder?: (payload: DataTableRowReorderPayload<TData>) => void
  enableRowHighlight?: boolean
  highlightedRowId?: string | null
  onHighlightedRowChange?: (rowId: string | null) => void
  renderRowActions?: (row: Row<TData>) => ReactNode
  rowActions?: DataTableAction<TData>[]
  search?: SmartTableSearch
  toolbar?: SmartTableToolbar
  columnControls?: SmartTableColumnControls
  pagination?: SmartTablePagination
  onVisibleSearchKeysChange?: (visibleSearchKeys: string[]) => void
  persistentPosition?: boolean
  stickyScrollbar?: boolean
  stickyHeader?: boolean
}

const DEFAULT_PAGE_SIZE = 25
const DEFAULT_PAGE_SIZE_OPTIONS = [ 10, 25, 50, 100 ]

type VisibleSearchKeysOptions<TData extends RowData> = {
  managedColumns: DataTableManagedColumn<TData>[]
  columnVisibility: VisibilityState
  enableColumnVisibility: boolean
  onVisibleSearchKeysChange?: (visibleSearchKeys: string[]) => void
}

// Notifies the consumer when the set of visible searchable columns changes,
// e.g. to render "searching across name, role, ..." hints next to the input.
function useVisibleSearchKeys<TData extends RowData>(options: VisibleSearchKeysOptions<TData>) {
  const {
    managedColumns,
    columnVisibility,
    enableColumnVisibility,
    onVisibleSearchKeysChange,
  } = options

  const visibleSearchKeys = useMemo(() => {
    const searchKeys = [] as string[]
    const seenSearchKeys = new Set<string>()

    managedColumns.forEach((managedColumn) => {
      const isVisible = !enableColumnVisibility || columnVisibility[managedColumn.columnId] !== false
      if (!isVisible) {
        return
      }

      // Columns with a `getSearchValue` resolver don't have a string key, so
      // we surface the column id as the visible "search key" for them. That
      // keeps the column represented in this list while remaining unambiguous,
      // since column ids are unique within a managed column set.
      const searchKey = managedColumn.getSearchValue
        ? managedColumn.columnId
        : managedColumn.searchKey ?? managedColumn.columnId
      if (!searchKey || seenSearchKeys.has(searchKey)) {
        return
      }

      seenSearchKeys.add(searchKey)
      searchKeys.push(searchKey)
    })

    return searchKeys
  }, [ columnVisibility, enableColumnVisibility, managedColumns ])

  const previousVisibleSearchKeysRef = useRef<string[] | null>(null)
  useEffect(() => {
    if (!onVisibleSearchKeysChange) {
      return
    }

    const previousVisibleSearchKeys = previousVisibleSearchKeysRef.current
    if (previousVisibleSearchKeys && isEqual(previousVisibleSearchKeys, visibleSearchKeys)) {
      return
    }

    previousVisibleSearchKeysRef.current = visibleSearchKeys
    onVisibleSearchKeysChange(visibleSearchKeys)
  }, [ onVisibleSearchKeysChange, visibleSearchKeys ])
}

/**
 * The batteries-included table: DataTable wired up with a search toolbar,
 * column visibility/order controls, optional pagination, and localStorage
 * persistence for column state. This is the recommended entry point; drop to
 * DataTable + useDataTableState when you need to own the layout or state.
 */
export function SmartTable<TData extends RowData>(props: SmartTableProps<TData>) {
  const {
    ids,
    persistence,
    managedColumns,
    sorting: sortingProp,
    onSortingChange: onSortingChangeProp,
    search: searchConfig,
    toolbar: toolbarConfig,
    columnControls: columnControlsConfig,
    pagination: paginationConfig,
    onVisibleSearchKeysChange,
    persistentPosition = false,
    stickyScrollbar = false,
    stickyHeader = true,
    tableAriaLabel,
    className,
    data,
    getRowId,
    isDisabled,
    labels,
    enableSelection = false,
    rowSelection,
    onRowSelectionChange,
    columnFilters,
    onColumnFiltersChange,
    enableSorting = true,
    enableColumnResizing = true,
    enableColumnVisibility = true,
    enableColumnOrder = true,
    enableRowReorder = false,
    isRowReorderBlocked,
    onRowReorder,
    enableRowHighlight = false,
    highlightedRowId,
    onHighlightedRowChange,
    renderRowActions,
    rowActions,
  } = props

  const [ internalSorting, setInternalSorting ] = useState<SortingState>([])
  const [ filteredRowCount, setFilteredRowCount ] = useState<number>(data.length)
  const sorting = sortingProp ?? internalSorting
  const handleSortingChange = onSortingChangeProp ?? setInternalSorting

  const { tableElementId, tableLocalStorageId } = ids
  const searchInputElementId = ids.searchInputElementId ?? `${tableElementId}-search`
  const columnControlsButtonId = ids.columnControlsButtonId ?? `${tableElementId}-columns`
  const defaultHiddenColumnIds = persistence?.defaultHiddenColumnIds ?? []

  const searchValue = searchConfig?.value ?? ''
  const showSearch = searchConfig?.show ?? true
  const showToolbar = toolbarConfig?.show ?? true
  const showResultsCount = toolbarConfig?.showResultsCount ?? true
  const showColumnControls = columnControlsConfig?.show ?? true
  const columnControlsDisabled = columnControlsConfig?.isDisabled ?? false
  const showPagination = paginationConfig?.show ?? false

  // Normalize the page-size options once: drop invalid entries, always include
  // the initial page size, and keep the list sorted.
  const { initialPageSize, pageSizeOptions } = useMemo(() => {
    const normalizedOptions = (paginationConfig?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS)
      .filter((pageSize) => Number.isInteger(pageSize) && pageSize > 0)
    const fallbackPageSize = (paginationConfig?.initialPageSize != null && paginationConfig.initialPageSize > 0)
      ? paginationConfig.initialPageSize
      : DEFAULT_PAGE_SIZE
    const optionsSet = new Set<number>(normalizedOptions)
    optionsSet.add(fallbackPageSize)

    return {
      initialPageSize: fallbackPageSize,
      pageSizeOptions: Array.from(optionsSet).sort((a, b) => a - b),
    }
  }, [ paginationConfig?.initialPageSize, paginationConfig?.pageSizeOptions ])

  const [ pagination, setPagination ] = useState<PaginationState>(() => ({
    pageIndex: 0,
    pageSize: initialPageSize,
  }))

  const { managedColumnIds, columnLabels } = useMemo(() => {
    const resolvedIds = [] as string[]
    const resolvedLabels = new Map<string, string>()
    managedColumns.forEach((managedColumn) => {
      resolvedIds.push(managedColumn.columnId)
      resolvedLabels.set(managedColumn.columnId, managedColumn.columnLabel)
    })
    return {
      managedColumnIds: resolvedIds,
      columnLabels: resolvedLabels,
    }
  }, [ managedColumns ])

  const {
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    columnSizing,
    setColumnSizing,
    orderedColumnIds,
  } = useDataTableState({
    tableLocalStorageId,
    managedColumnIds,
    storageVersion: persistence?.stateVersion,
    defaultHiddenColumnIds,
    sorting: enableSorting
      ? sorting
      : undefined,
    onSortingChange: enableSorting
      ? handleSortingChange
      : undefined,
  })

  useVisibleSearchKeys({
    managedColumns,
    columnVisibility,
    enableColumnVisibility,
    onVisibleSearchKeysChange,
  })

  const scrollStorageKey = `${tableLocalStorageId}.scrollPosition`
  const scrollContainerRef = useScrollPositionRestore(persistentPosition ? scrollStorageKey : '')

  const shouldRenderColumnControls = showColumnControls && (enableColumnVisibility || enableColumnOrder)
  const toolbarRightSlot = shouldRenderColumnControls
    ? (
      <>
        { toolbarConfig?.rightSlot }
        <DataTableColumnControls
          buttonId={columnControlsButtonId}
          orderedColumnIds={orderedColumnIds}
          columnLabels={columnLabels}
          columnVisibility={columnVisibility}
          setColumnVisibility={setColumnVisibility}
          setColumnOrder={setColumnOrder}
          canToggleVisibility={enableColumnVisibility}
          canReorderColumns={enableColumnOrder}
          isDisabled={columnControlsDisabled || isDisabled}
          labels={labels}
        />
      </>
    )
    : toolbarConfig?.rightSlot

  // Any change to the search, filters, or sorting invalidates the current page
  // position, so hop back to the first page.
  const paginationResetState = useMemo(() => ({
    searchValue: searchValue.trim(),
    columnFilters: columnFilters ?? [],
    sorting,
  }), [ columnFilters, searchValue, sorting ])
  const previousPaginationResetStateRef = useRef(paginationResetState)

  useEffect(() => {
    if (!showPagination) {
      return
    }

    const previousPaginationResetState = previousPaginationResetStateRef.current
    if (isEqual(previousPaginationResetState, paginationResetState)) {
      return
    }

    previousPaginationResetStateRef.current = paginationResetState
    setPagination((current) => current.pageIndex === 0
      ? current
      : {
        ...current,
        pageIndex: 0,
      })
  }, [ paginationResetState, showPagination ])

  // Clamp the page index back into range when the filtered row count shrinks.
  useEffect(() => {
    if (!showPagination) {
      return
    }

    const totalPages = Math.max(1, Math.ceil(filteredRowCount / pagination.pageSize))
    const maxPageIndex = totalPages - 1

    setPagination((current) => current.pageIndex <= maxPageIndex
      ? current
      : {
        ...current,
        pageIndex: maxPageIndex,
      })
  }, [ filteredRowCount, pagination.pageSize, showPagination ])

  return (
    <>
      { showToolbar
        ? (
          <DataTableToolbar
            searchValue={searchValue}
            onSearchChange={searchConfig?.onChange}
            showSearch={showSearch}
            isSearchDisabled={searchConfig?.isDisabled ?? false}
            searchInputElementId={searchInputElementId}
            searchPlaceholder={searchConfig?.placeholder}
            showResultsCount={showResultsCount}
            resultsCount={toolbarConfig?.resultsCount ?? filteredRowCount}
            leftSlot={toolbarConfig?.leftSlot}
            rightSlot={toolbarRightSlot}
            className={toolbarConfig?.className}
            labels={labels}
          />
        )
        : null
      }
      <DataTable
        tableElementId={tableElementId}
        tableAriaLabel={tableAriaLabel}
        className={className}
        data={data}
        managedColumns={managedColumns}
        getRowId={getRowId}
        searchTerm={searchValue}
        isDisabled={isDisabled}
        labels={labels}
        enableSelection={enableSelection}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        columnFilters={columnFilters}
        onColumnFiltersChange={onColumnFiltersChange}
        enableSorting={enableSorting}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        enableColumnResizing={enableColumnResizing}
        columnSizing={columnSizing}
        onColumnSizingChange={setColumnSizing}
        enableColumnVisibility={enableColumnVisibility}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        enableColumnOrder={enableColumnOrder}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
        enableRowReorder={enableRowReorder}
        isRowReorderBlocked={isRowReorderBlocked}
        onRowReorder={onRowReorder}
        enableRowHighlight={enableRowHighlight}
        highlightedRowId={highlightedRowId}
        onHighlightedRowChange={onHighlightedRowChange}
        pagination={showPagination
          ? {
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
            pageSizeOptions,
            onPaginationChange: setPagination,
          }
          : undefined}
        renderRowActions={renderRowActions}
        rowActions={rowActions}
        onFilteredRowCountChange={setFilteredRowCount}
        scrollContainerRef={persistentPosition ? scrollContainerRef : undefined}
        stickyScrollbar={stickyScrollbar}
        stickyHeader={stickyHeader}
      />
    </>
  )
}
