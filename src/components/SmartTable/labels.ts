// Copyright © 2026 Jalapeno Labs

/**
 * Every user-facing string the table renders. The table ships with English
 * defaults and stays i18n-agnostic: consumers localize by passing a partial
 * override (e.g. built from their own translation layer) through the `labels`
 * prop on SmartTable / DataTable.
 */
export type SmartTableLabels = {
  // Toolbar
  searchPlaceholder: string
  clearSearch: string
  results: (count: number) => string

  // Column controls
  columns: string

  // Header
  sort: string
  sortAscending: string
  sortDescending: string

  // Body
  move: string
  select: string
  selectAll: string
  actions: string
  searchNoResults: string

  // Footer
  rowsPerPage: string
  pagination: string
  previousPage: string
  nextPage: string
}

export const defaultSmartTableLabels: SmartTableLabels = {
  searchPlaceholder: 'Search...',
  clearSearch: 'Clear search',
  results: (count) => count === 1
    ? '1 result'
    : `${count} results`,
  columns: 'Columns',
  sort: 'Sort',
  sortAscending: 'Sorted ascending',
  sortDescending: 'Sorted descending',
  move: 'Move',
  select: 'Select row',
  selectAll: 'Select all rows',
  actions: 'Actions',
  searchNoResults: 'No results match your search.',
  rowsPerPage: 'Rows per page',
  pagination: 'Pagination',
  previousPage: 'Previous page',
  nextPage: 'Next page',
}
