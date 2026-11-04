// Copyright © 2026 Jalapeno Labs

import type {
  ColumnFiltersState,
  ColumnDef,
  ColumnOrderState,
  ColumnSizingState,
  OnChangeFn,
  PaginationState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
  Table,
  VisibilityState,
} from '@tanstack/react-table'
import type { MutableRefObject, ReactNode, RefObject } from 'react'
import type { SmartTableLabels } from './labels'
import type { Promisable } from '../../types'
import type { CsvValue } from '../../utils/csv'
import type { SmartTableColumnFilter } from './filters'

export type DataTableAction<TData extends RowData> = {
  id: string
  // What the action does, already translated. Row actions are icon-only, so
  // this is the button's tooltip and accessible name, and the item's text in
  // the ellipsis menu.
  label: string
  // Returning a promise shows the button loading until it settles.
  onPress: (row: Row<TData>) => Promisable<void>
  // Every action should have one; an action without an icon shows its label.
  icon?: ReactNode
  ariaLabel?: string
  className?: string
  // Dangerous actions sit last in the ellipsis menu, below a divider, in red.
  isDanger?: boolean
  isLoading?: boolean | ((row: Row<TData>) => boolean)
  isDisabled?: boolean | ((row: Row<TData>) => boolean)
  isVisible?: boolean | ((row: Row<TData>) => boolean)
}

// How row actions show: `hover` reveals icon buttons over the right of the
// hovered row, `menu` keeps an ellipsis menu on every row, and `auto` picks
// `menu` on touch and narrow screens, which cannot hover, and `hover` elsewhere.
export type DataTableRowActionsLayout = 'auto' | 'hover' | 'menu'

export type DataTableRowReorderPayload<TData extends RowData> = {
  previousRows: TData[]
  nextRows: TData[]
  activeId: string
  overId: string
}

export type DataTableManagedColumn<TData extends RowData> = {
  columnId: string
  columnLabel: string
  searchKey?: string | null
  // Optional per-row search value resolver. Takes precedence over `searchKey`
  // when both are provided. Use this for synthetic columns whose displayed
  // text is derived from multiple row fields (e.g. a "Date" column rendered
  // from `date` + `time`), so the global filter can match what the user sees
  // rather than a single raw property.
  getSearchValue?: ((row: TData) => string | null) | null
  // Optional per-row tooltip for data cells. When provided, the table wraps
  // the rendered cell in a tooltip whose content is the resolver's output;
  // returning a falsy value (null/'') for a given row skips the tooltip on
  // that row. Use `TableTipContent` for the common bold-label + body shape.
  cellTooltip?: (row: TData) => ReactNode
  // Optional static tooltip shown when hovering the column header.
  headerTooltip?: ReactNode
  // How many lines this column's cells show before clamping, overriding the
  // table's `cellLineClamp`; `false` never clamps (for cells that are always
  // short, or that manage their own height).
  lineClamp?: number | false
  // The column's value in a CSV export. Without it the export takes the
  // column's raw accessor value; give one for display-only cells or cells
  // whose accessor is a sort key, and `null` to leave the column out.
  exportValue?: ((row: TData) => CsvValue) | null
  // Offers this column in the filters drawer, as a select, multi-select,
  // yes-or-no, or text filter. See `SmartTableColumnFilter`.
  filter?: SmartTableColumnFilter<TData>
  columnDef: ColumnDef<TData, unknown>
}

// What a clamped cell offers to show the rest of its content. `expandRow`:
// clicking a row expands it to its full height, one row at a time (the
// highlighted row, where row highlight is on). `modal`: for rows whose click
// navigates, double-clicking a clamped cell opens its full content in a modal.
export type DataTableCellOverflow = 'expandRow' | 'modal'

export type DataTablePaginationConfig = {
  pageIndex: number
  pageSize: number
  pageSizeOptions: number[]
  onPaginationChange: OnChangeFn<PaginationState>
}

export type DataTableProps<TData extends RowData> = {
  tableElementId: string
  tableAriaLabel: string
  className?: string
  data: TData[]
  managedColumns: DataTableManagedColumn<TData>[]
  getRowId?: (row: TData, index: number) => string
  searchTerm?: string
  isDisabled?: boolean
  // Overrides for the table's user-facing strings (English by default).
  labels?: Partial<SmartTableLabels>
  enableSelection?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  columnFilters?: ColumnFiltersState
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  enableSorting?: boolean
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  enableColumnResizing?: boolean
  columnSizing?: ColumnSizingState
  onColumnSizingChange?: OnChangeFn<ColumnSizingState>
  enableColumnVisibility?: boolean
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>
  enableColumnOrder?: boolean
  columnOrder?: ColumnOrderState
  onColumnOrderChange?: OnChangeFn<ColumnOrderState>
  enableRowReorder?: boolean
  isRowReorderBlocked?: boolean
  onRowReorder?: (payload: DataTableRowReorderPayload<TData>) => void
  enableRowHighlight?: boolean
  highlightedRowId?: string | null
  onHighlightedRowChange?: (rowId: string | null) => void
  pagination?: DataTablePaginationConfig
  renderRowActions?: (row: Row<TData>) => ReactNode
  rowActions?: DataTableAction<TData>[]
  rowActionsLayout?: DataTableRowActionsLayout
  // Lines a cell shows before clamping (ux: never more than three). `false`
  // turns clamping off; a column's own `lineClamp` wins over this.
  cellLineClamp?: number | false
  cellOverflow?: DataTableCellOverflow
  // Optional per-row className resolver. The returned classes are appended to
  // the row's <tr>, letting callers style individual rows by their data (e.g.
  // a danger background for invalid/unmapped rows). Returning a falsy value
  // leaves the row's default styling untouched.
  getRowClassName?: (row: Row<TData>) => string | undefined
  onFilteredRowCountChange?: (count: number) => void
  scrollContainerRef?: RefObject<HTMLElement>
  // Receives the TanStack table instance, for controls that live outside the
  // table, such as the CSV export.
  tableRef?: MutableRefObject<Table<TData> | null>
  stickyScrollbar?: boolean
  stickyHeader?: boolean
}

// The managed-column settings (tooltips, line clamp) ride on tanstack's
// per-column `meta` so the row/header renderers can read them at the single
// flexRender points without threading extra props. We deliberately avoid a
// `declare module '@tanstack/react-table'` augmentation here: bundled .d.ts
// rollups drop module augmentations, so instead the read sites narrow `meta`
// through this type at the third-party boundary.
export type ManagedColumnMeta<TData extends RowData> = {
  cellTooltip?: (row: TData) => ReactNode
  headerTooltip?: ReactNode
  lineClamp?: number | false
  columnLabel?: string
}
