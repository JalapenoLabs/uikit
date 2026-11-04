// Copyright © 2026 Jalapeno Labs

import type { DataTableManagedColumn } from './DataTable.types'
import type { SmartTableLabels } from './labels'
import type { RowData } from '@tanstack/react-table'

export type SmartTableFilterOption = {
  value: string
  label: string
}

// What a row offers a column filter to match against: one value, or several
// (such as the projects an item belongs to).
export type SmartTableFilterRowValue = string | number | boolean | null | undefined | readonly (string | number)[]

// How each kind of filter is edited in the drawer, and what its value is:
// `select` one option, `multiSelect` any of several, `boolean` yes or no
// (unset means either), and `text` a substring.
type FilterKinds<TData extends RowData> =
  | {
    kind: 'select'
    options: SmartTableFilterOption[]
    matches?: (row: TData, value: string) => boolean
  }
  | {
    kind: 'multiSelect'
    options: SmartTableFilterOption[]
    matches?: (row: TData, value: string[]) => boolean
  }
  | {
    kind: 'boolean'
    matches?: (row: TData, value: boolean) => boolean
  }
  | {
    kind: 'text'
    matches?: (row: TData, value: string) => boolean
  }

/**
 * A filter declared on a managed column. Its id and label are the column's.
 * Without `matches`, a row matches by its value for the column: `getValue`,
 * or else the row's property named by the column's search key (or id).
 */
export type SmartTableColumnFilter<TData extends RowData> = FilterKinds<TData> & {
  getValue?: (row: TData) => SmartTableFilterRowValue
}

/**
 * A filter on the table as a whole, for what is not a column (such as
 * "Waiting on someone"). Without `matches` the table shows the filter in the
 * drawer and as a tag but leaves applying it to the consumer, for filters the
 * consumer answers itself, such as by loading different rows.
 */
export type SmartTableFilter<TData extends RowData> = FilterKinds<TData> & {
  id: string
  label: string
}

export type SmartTableFilterValue = string | string[] | boolean | null
export type SmartTableFilterValues = Record<string, SmartTableFilterValue | undefined>

// One list of every filter the table offers, whichever way it was declared.
export type ResolvedFilter<TData extends RowData> = SmartTableFilter<TData> & {
  // Only set for column filters without their own `matches`.
  getValue?: (row: TData) => SmartTableFilterRowValue
}

/**
 * Every filter the table offers: those its columns declare, in column order,
 * then the table's own.
 */
export function resolveFilters<TData extends RowData>(
  managedColumns: DataTableManagedColumn<TData>[],
  tableFilters: SmartTableFilter<TData>[] = [],
): ResolvedFilter<TData>[] {
  const resolved: ResolvedFilter<TData>[] = []
  for (const managedColumn of managedColumns) {
    const columnFilter = managedColumn.filter
    if (!columnFilter) {
      continue
    }
    const propertyName = managedColumn.searchKey ?? managedColumn.columnId
    resolved.push({
      ...columnFilter,
      id: managedColumn.columnId,
      label: managedColumn.columnLabel,
      getValue: columnFilter.getValue ?? ((row: TData) => {
        // Third-party interop boundary: a row is the consumer's own shape.
        const value = (row as Record<string, unknown>)[propertyName]
        return isFilterRowValue(value)
          ? value
          : String(value)
      }),
    })
  }
  resolved.push(...tableFilters)
  return resolved
}

function isFilterRowValue(value: unknown): value is SmartTableFilterRowValue {
  return value === null
    || value === undefined
    || [ 'string', 'number', 'boolean' ].includes(typeof value)
    || Array.isArray(value)
}

/** Whether a filter value narrows anything: unset, empty text, and no options do not. */
export function isFilterValueActive(value: SmartTableFilterValue | undefined): value is string | string[] | boolean {
  if (value === null || value === undefined) {
    return false
  }
  if (typeof value === 'string') {
    return Boolean(value.trim())
  }
  if (Array.isArray(value)) {
    return value.length > 0
  }
  return true
}

function asList(rowValue: SmartTableFilterRowValue): string[] {
  if (rowValue === null || rowValue === undefined) {
    return []
  }
  if (Array.isArray(rowValue)) {
    return rowValue.map((entry) => String(entry))
  }
  return [ String(rowValue) ]
}

function matchesByValue<TData extends RowData>(
  filter: ResolvedFilter<TData>,
  row: TData,
  value: string | string[] | boolean,
) {
  if (!filter.getValue) {
    // A table filter without `matches` is applied by the consumer.
    return true
  }
  const rowValue = filter.getValue(row)
  const rowValues = asList(rowValue)

  if (filter.kind === 'boolean') {
    const isTruthy = Array.isArray(rowValue)
      ? rowValue.length > 0
      : Boolean(rowValue)
    return isTruthy === value
  }
  if (filter.kind === 'text') {
    const needle = String(value).trim().toLocaleLowerCase()
    return rowValues.some((rowText) => rowText.toLocaleLowerCase().includes(needle))
  }
  const wanted = Array.isArray(value)
    ? value
    : [ String(value) ]
  return rowValues.some((rowText) => wanted.includes(rowText))
}

function matchesFilter<TData extends RowData>(
  filter: ResolvedFilter<TData>,
  row: TData,
  value: string | string[] | boolean,
) {
  // Each kind's `matches` takes that kind's value; the drawer only ever
  // writes a value of the filter's own kind.
  if (filter.kind === 'boolean' && filter.matches && typeof value === 'boolean') {
    return filter.matches(row, value)
  }
  if (filter.kind === 'multiSelect' && filter.matches && Array.isArray(value)) {
    return filter.matches(row, value)
  }
  if ((filter.kind === 'select' || filter.kind === 'text') && filter.matches && typeof value === 'string') {
    return filter.matches(row, value)
  }
  return matchesByValue(filter, row, value)
}

/** The rows that pass every active filter, in their original order. */
export function applyFilters<TData extends RowData>(
  rows: TData[],
  filters: ResolvedFilter<TData>[],
  values: SmartTableFilterValues,
): TData[] {
  const activeFilters: { filter: ResolvedFilter<TData>, value: string | string[] | boolean }[] = []
  for (const filter of filters) {
    const value = values[filter.id]
    if (isFilterValueActive(value)) {
      activeFilters.push({ filter, value })
    }
  }
  if (!activeFilters.length) {
    return rows
  }

  const matchingRows: TData[] = []
  for (const row of rows) {
    if (activeFilters.every(({ filter, value }) => matchesFilter(filter, row, value))) {
      matchingRows.push(row)
    }
  }
  return matchingRows
}

/** How an active filter reads on its tag: "Status: Open, Blocked". */
export function describeFilter<TData extends RowData>(
  filter: ResolvedFilter<TData>,
  value: string | string[] | boolean,
  labels: SmartTableLabels,
) {
  let valueText: string
  if (typeof value === 'boolean') {
    valueText = value
      ? labels.filterYes
      : labels.filterNo
  }
  else if (filter.kind === 'select' || filter.kind === 'multiSelect') {
    const labelByValue = new Map(filter.options.map((option) => [ option.value, option.label ]))
    const chosen = Array.isArray(value)
      ? value
      : [ value ]
    valueText = chosen
      .map((optionValue) => labelByValue.get(optionValue) ?? optionValue)
      .join(', ')
  }
  else {
    valueText = String(value).trim()
  }
  return labels.filterTag(filter.label, valueText)
}
