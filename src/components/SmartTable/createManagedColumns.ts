// Copyright © 2026 Jalapeno Labs

import type { DataTableManagedColumn } from './DataTable.types'
import type { ColumnDef, RowData } from '@tanstack/react-table'

type CreateManagedColumnParams<TData extends RowData, TColumnKey extends string> = {
  columnKey: TColumnKey
  columnId: string
  columnLabel: string
  searchKey: string | null
  getSearchValue: ((row: TData) => string | null) | null
  columnIndex: number
}

type ColumnDefOverride<TData extends RowData, TColumnKey extends string> = (
  | ColumnDef<TData, unknown>
  | ((params: CreateManagedColumnParams<TData, TColumnKey>) => ColumnDef<TData, unknown>)
)

type CreateManagedColumnsOptions<TData extends RowData, TColumnKey extends string> = {
  columnKeys: readonly TColumnKey[]
  getColumnId?: (columnKey: TColumnKey, columnIndex: number) => string
  getColumnLabel?: (columnKey: TColumnKey, columnIndex: number) => string
  getSearchKey?: (columnKey: TColumnKey, columnIndex: number) => string | null
  // Optional: per-column search-value resolver. When a column returns a
  // function here, the global filter matches against the function's output
  // instead of a raw property on `row.original`. Return `null` to defer to
  // `searchKey`. See `DataTableManagedColumn.getSearchValue`.
  getSearchValue?: (columnKey: TColumnKey, columnIndex: number) => ((row: TData) => string | null) | null
  createColumnDef: (params: CreateManagedColumnParams<TData, TColumnKey>) => ColumnDef<TData, unknown>
  columnDefOverrides?: Partial<Record<TColumnKey, ColumnDefOverride<TData, TColumnKey>>>
}

/**
 * Builds a `DataTableManagedColumn[]` from a list of column keys plus a
 * `createColumnDef` factory, with optional per-column overrides. This keeps
 * repetitive tables declarative: the key list is the single source of truth
 * for ids, labels, and search keys.
 */
export function createManagedColumns<TData extends RowData, TColumnKey extends string>(
  options: CreateManagedColumnsOptions<TData, TColumnKey>,
) {
  const {
    columnKeys,
    getColumnId = (columnKey) => String(columnKey),
    getColumnLabel = (columnKey) => String(columnKey),
    getSearchKey = (columnKey) => String(columnKey),
    getSearchValue,
    createColumnDef,
    columnDefOverrides,
  } = options

  return columnKeys.map<DataTableManagedColumn<TData>>((columnKey, columnIndex) => {
    const columnId = getColumnId(columnKey, columnIndex)
    const columnLabel = getColumnLabel(columnKey, columnIndex)
    const searchKey = getSearchKey(columnKey, columnIndex)
    const searchValueResolver = getSearchValue?.(columnKey, columnIndex) ?? null
    const params = {
      columnKey,
      columnId,
      columnLabel,
      searchKey,
      getSearchValue: searchValueResolver,
      columnIndex,
    }

    const override = columnDefOverrides?.[columnKey]
    const resolvedColumnDef = typeof override === 'function'
      ? override(params)
      : override ?? createColumnDef(params)

    return {
      columnId,
      columnLabel,
      searchKey,
      getSearchValue: searchValueResolver,
      columnDef: {
        ...resolvedColumnDef,
        id: columnId,
      },
    }
  })
}
