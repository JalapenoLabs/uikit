// Copyright © 2026 Jalapeno Labs

import type {
  DataTableAction,
  DataTableBulkEdit,
  DataTableCellOverflow,
  DataTableManagedColumn,
  DataTableRowActionsLayout,
  DataTableRowReorderPayload,
  DataTableSelectionAction,
} from './DataTable.types'
import type { SmartTableFilter, SmartTableFilterValues } from './filters'
import type { SmartTableLabels } from './labels'
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState,
} from '@tanstack/react-table'
import type { ReactNode } from 'react'

// Core
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDataTableState } from './useDataTableState'
import { useScrollPositionRestore } from '../../hooks/useScrollPositionRestore'

// User interface
import { DataTable } from './DataTable'
import { DataTableColumnControls } from './DataTableColumnControls'
import { DataTableFilterDrawer } from './DataTableFilterDrawer'
import { DataTableFilterTags } from './DataTableFilterTags'
import { DataTableSearch } from './DataTableSearch'
import { DataTableToolbar } from './DataTableToolbar'
import { TableIcon } from './icons'
import { SmartTableStyles } from './tableStyles'
import { TableTooltip } from './TableTooltip'

// Utility
import { isEqual } from 'lodash-es'
import { downloadCsv } from '../../utils/csv'

// Misc
import { buildTableCsv } from './exportTableCsv'
import { applyFilters, isFilterValueActive, resolveFilters } from './filters'
import { defaultSmartTableLabels } from './labels'

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
  // Leave `value` out and the table keeps the search text itself.
  value?: string
  onChange?: (value: string) => void
  show?: boolean
  isDisabled?: boolean
  placeholder?: string
  // Swaps the magnifying glass for a spinner, while a search waits on a server.
  isLoading?: boolean
  // Ctrl+F focuses the search field instead of the browser's find (default on).
  focusHotkey?: boolean
}

// Where the table's controls (search, filters, columns, export) render
// instead of its own toolbar, such as a page's titlebar. The table keeps all
// of their state. `container` is null until the target element mounts.
export type SmartTableControlsTarget = {
  container: Element | null
}

// A one-click CSV export of the rows the user sees: filtered, sorted, and
// across every page. See `DataTableManagedColumn.exportValue`.
export type SmartTableCsvExport = {
  fileName: string | (() => string)
  show?: boolean
}

// The filters drawer and its tags. Filters come from the managed columns'
// `filter` and from `definitions`, for what is not a column. Leave `values`
// out and the table keeps them itself; pass them with `onValuesChange` to keep
// them elsewhere, such as in the address.
export type SmartTableFilters<TData extends RowData> = {
  definitions?: SmartTableFilter<TData>[]
  values?: SmartTableFilterValues
  onValuesChange?: (values: SmartTableFilterValues) => void
}

type SmartTableToolbar = {
  // `false` hides the search field, results count, and slots. The table's
  // own controls (filters, columns, export) stay, so none is ever lost.
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
  selectionActions?: DataTableSelectionAction<TData>[]
  bulkEdit?: DataTableBulkEdit<TData>
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
  rowActionsLayout?: DataTableRowActionsLayout
  cellLineClamp?: number | false
  cellOverflow?: DataTableCellOverflow
  search?: SmartTableSearch
  controls?: SmartTableControlsTarget
  filters?: SmartTableFilters<TData>
  csvExport?: SmartTableCsvExport
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
    controls,
    filters: filtersConfig,
    csvExport,
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
    selectionActions,
    bulkEdit,
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
    rowActionsLayout,
    cellLineClamp,
    cellOverflow,
  } = props

  const [ internalSorting, setInternalSorting ] = useState<SortingState>([])
  const [ filteredRowCount, setFilteredRowCount ] = useState<number>(data.length)
  const sorting = sortingProp ?? internalSorting
  const handleSortingChange = onSortingChangeProp ?? setInternalSorting

  const { tableElementId, tableLocalStorageId } = ids
  const searchInputElementId = ids.searchInputElementId ?? `${tableElementId}-search`
  const columnControlsButtonId = ids.columnControlsButtonId ?? `${tableElementId}-columns`
  const defaultHiddenColumnIds = persistence?.defaultHiddenColumnIds ?? []

  const [ ownSearchValue, setOwnSearchValue ] = useState('')
  const searchValue = searchConfig?.value ?? ownSearchValue
  const onSearchChangeProp = searchConfig?.onChange
  const isSearchOwned = searchConfig?.value === undefined
  const handleSearchChange = useCallback((value: string) => {
    if (isSearchOwned) {
      setOwnSearchValue(value)
    }
    onSearchChangeProp?.(value)
  }, [ isSearchOwned, onSearchChangeProp ])
  const resolvedLabels = useMemo(() => ({ ...defaultSmartTableLabels, ...labels }), [ labels ])

  const [ ownFilterValues, setOwnFilterValues ] = useState<SmartTableFilterValues>({})
  const [ isFilterDrawerOpen, setIsFilterDrawerOpen ] = useState(false)
  const filterValues = filtersConfig?.values ?? ownFilterValues
  const isFilterValuesOwned = filtersConfig?.values === undefined
  const onFilterValuesChange = filtersConfig?.onValuesChange
  const setFilterValues = useCallback((next: SmartTableFilterValues) => {
    if (isFilterValuesOwned) {
      setOwnFilterValues(next)
    }
    onFilterValuesChange?.(next)
  }, [ isFilterValuesOwned, onFilterValuesChange ])
  const closeFilterDrawer = useCallback(() => setIsFilterDrawerOpen(false), [])
  const resolvedFilters = useMemo(
    () => resolveFilters(managedColumns, filtersConfig?.definitions),
    [ managedColumns, filtersConfig?.definitions ],
  )
  // Filters narrow the rows before the table sees them, so the search, sort,
  // pages, counts, and export all work on what passes them.
  const filteredData = useMemo(
    () => applyFilters(data, resolvedFilters, filterValues),
    [ data, resolvedFilters, filterValues ],
  )
  let activeFilterCount = 0
  for (const filter of resolvedFilters) {
    if (isFilterValueActive(filterValues[filter.id])) {
      activeFilterCount += 1
    }
  }
  const tableRef = useRef<Table<TData> | null>(null)
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
  const columnsElement = shouldRenderColumnControls
    ? <DataTableColumnControls
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
    : null

  function handleExport() {
    const table = tableRef.current
    if (!csvExport || !table) {
      console.warn('SmartTable export was pressed before its table rendered; nothing was exported', ids)
      return
    }
    const fileName = typeof csvExport.fileName === 'function'
      ? csvExport.fileName()
      : csvExport.fileName
    downloadCsv(fileName, buildTableCsv(table, managedColumns))
  }

  const exportElement = csvExport && csvExport.show !== false
    ? <TableTooltip content={resolvedLabels.exportCsv} placement={{ side: 'bottom', align: 'center' }}>
      <button
        type='button'
        className='jala-table-icon-button'
        aria-label={resolvedLabels.exportCsv}
        disabled={isDisabled || filteredRowCount === 0}
        onClick={handleExport}
      >
        <TableIcon name='download' size={18} />
      </button>
    </TableTooltip>
    : null

  const filterCountId = `${tableElementId}-filter-count`
  const filtersElement = resolvedFilters.length
    ? <TableTooltip content={resolvedLabels.filters} placement={{ side: 'bottom', align: 'center' }}>
      <button
        type='button'
        className='jala-table-icon-button jala-table-filters-button'
        aria-label={resolvedLabels.filters}
        aria-describedby={activeFilterCount
          ? filterCountId
          : undefined}
        aria-haspopup='dialog'
        disabled={isDisabled}
        onClick={() => setIsFilterDrawerOpen(true)}
      >
        <TableIcon name='filter' size={18} />
        { activeFilterCount
          ? <>
            <span className='jala-table-filters-badge' aria-hidden='true'>{ activeFilterCount }</span>
            <span id={filterCountId} className='jala-table-sr-only'>{
              resolvedLabels.activeFilterCount(activeFilterCount)
            }</span>
          </>
          : null
        }
      </button>
    </TableTooltip>
    : null

  const searchElement = showSearch
    ? <DataTableSearch
      value={searchValue}
      onChange={handleSearchChange}
      inputId={searchInputElementId}
      placeholder={searchConfig?.placeholder ?? resolvedLabels.searchPlaceholder}
      labels={resolvedLabels}
      isDisabled={searchConfig?.isDisabled}
      isLoading={searchConfig?.isLoading}
      focusHotkey={searchConfig?.focusHotkey}
    />
    : null

  const hasTableControls = Boolean(filtersElement || columnsElement || exportElement)

  // The controls render in one of three places: a consumer's container (such
  // as the page titlebar), the table's own toolbar, or, with the toolbar
  // hidden, a small strip above the table, so the Columns chooser and export
  // are never lost.
  let controlsArea: ReactNode = null
  if (controls) {
    controlsArea = controls.container
      ? createPortal(
        <div className='jala-table-controls jala-table-theme'>
          <SmartTableStyles />
          { searchElement }
          { filtersElement }
          { columnsElement }
          { exportElement }
        </div>,
        controls.container,
      )
      : null
  }
  else if (showToolbar) {
    controlsArea = <DataTableToolbar
      searchValue={searchValue}
      onSearchChange={handleSearchChange}
      showSearch={showSearch}
      isSearchDisabled={searchConfig?.isDisabled ?? false}
      isSearchLoading={searchConfig?.isLoading}
      searchFocusHotkey={searchConfig?.focusHotkey}
      searchInputElementId={searchInputElementId}
      searchPlaceholder={searchConfig?.placeholder}
      showResultsCount={showResultsCount}
      resultsCount={toolbarConfig?.resultsCount ?? filteredRowCount}
      leftSlot={toolbarConfig?.leftSlot}
      rightSlot={toolbarConfig?.rightSlot || hasTableControls
        ? <>
          { toolbarConfig?.rightSlot }
          { filtersElement }
          { columnsElement }
          { exportElement }
        </>
        : null}
      className={toolbarConfig?.className}
      labels={labels}
    />
  }
  else if (hasTableControls) {
    controlsArea = <div className='jala-table-controls jala-table-controls--strip jala-table-theme'>
      { filtersElement }
      { columnsElement }
      { exportElement }
    </div>
  }

  // Any change to the search, filters, or sorting invalidates the current page
  // position, so hop back to the first page.
  const paginationResetState = useMemo(() => ({
    searchValue: searchValue.trim(),
    columnFilters: columnFilters ?? [],
    filterValues,
    sorting,
  }), [ columnFilters, filterValues, searchValue, sorting ])
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
      { controlsArea }
      <DataTableFilterTags
        filters={resolvedFilters}
        values={filterValues}
        labels={resolvedLabels}
        onRemove={(filterId) => setFilterValues({ ...filterValues, [filterId]: null })}
      />
      { isFilterDrawerOpen
        ? <DataTableFilterDrawer
          filters={resolvedFilters}
          values={filterValues}
          labels={resolvedLabels}
          onApply={setFilterValues}
          onClose={closeFilterDrawer}
        />
        : null
      }
      <DataTable
        tableElementId={tableElementId}
        tableAriaLabel={tableAriaLabel}
        className={className}
        data={filteredData}
        managedColumns={managedColumns}
        getRowId={getRowId}
        searchTerm={searchValue}
        isDisabled={isDisabled}
        labels={labels}
        enableSelection={enableSelection}
        rowSelection={rowSelection}
        onRowSelectionChange={onRowSelectionChange}
        selectionActions={selectionActions}
        bulkEdit={bulkEdit}
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
        // Reordering a filtered view would move rows the user cannot see.
        isRowReorderBlocked={isRowReorderBlocked || activeFilterCount > 0}
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
        rowActionsLayout={rowActionsLayout}
        cellLineClamp={cellLineClamp}
        cellOverflow={cellOverflow}
        onFilteredRowCountChange={setFilteredRowCount}
        scrollContainerRef={persistentPosition ? scrollContainerRef : undefined}
        tableRef={tableRef}
        stickyScrollbar={stickyScrollbar}
        stickyHeader={stickyHeader}
      />
    </>
  )
}
