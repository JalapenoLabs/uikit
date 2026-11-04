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
  exportCsv: string

  // Filters
  filters: string
  applyFilters: string
  cancel: string
  filterAny: string
  filterYes: string
  filterNo: string
  activeFilters: string
  // A tag's text, such as "Status: Open, Blocked".
  filterTag: (filterLabel: string, valueText: string) => string
  removeFilter: (tagText: string) => string
  activeFilterCount: (count: number) => string

  // Multi-select
  selectionBar: string
  selectedCount: (count: number) => string
  // Selects every row on the page (the bar's button, and Ctrl+A).
  selectPage: string
  clearSelection: string
  // The X's tooltip, which also names its hotkey.
  clearSelectionHint: string
  pageSelected: (pageRowCount: number) => string
  selectEverything: (totalRowCount: number) => string
  everythingSelected: (totalRowCount: number) => string
  // A choice action's choice in the overflow menu, such as "Status: Done".
  choiceItem: (actionLabel: string, choiceLabel: string) => string
  bulkEdit: string
  bulkEditTitle: (count: number) => string
  bulkEditNothingChosen: string
  keepAsIs: string
  setTo: string
  clearField: string
  applyBulkEdit: (count: number) => string

  // Header
  sort: string
  sortAscending: string
  sortDescending: string

  // Body
  move: string
  select: string
  selectAll: string
  actions: string
  moreActions: string
  searchNoResults: string
  // Closes a clamped cell's full content.
  done: string

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
  exportCsv: 'Export CSV',
  filters: 'Filters',
  applyFilters: 'Apply filters',
  cancel: 'Cancel',
  filterAny: 'Any',
  filterYes: 'Yes',
  filterNo: 'No',
  activeFilters: 'Active filters',
  filterTag: (filterLabel, valueText) => `${filterLabel}: ${valueText}`,
  removeFilter: (tagText) => `Remove filter ${tagText}`,
  activeFilterCount: (count) => count === 1
    ? '1 filter on'
    : `${count} filters on`,
  selectionBar: 'Selection',
  selectedCount: (count) => `${count} selected`,
  selectPage: 'Select all',
  clearSelection: 'Clear selection',
  clearSelectionHint: 'Clear selection (Esc)',
  pageSelected: (pageRowCount) => pageRowCount === 1
    ? 'The 1 row on this page is selected.'
    : `All ${pageRowCount} rows on this page are selected.`,
  selectEverything: (totalRowCount) => `Select all ${totalRowCount}`,
  everythingSelected: (totalRowCount) => `All ${totalRowCount} rows are selected.`,
  choiceItem: (actionLabel, choiceLabel) => `${actionLabel}: ${choiceLabel}`,
  bulkEdit: 'Edit fields',
  bulkEditTitle: (count) => count === 1
    ? 'Edit 1 row'
    : `Edit ${count} rows`,
  bulkEditNothingChosen: 'Choose a field to change',
  keepAsIs: 'Keep as is',
  setTo: 'Set to',
  clearField: 'Clear',
  applyBulkEdit: (count) => `Apply to ${count}`,
  sort: 'Sort',
  sortAscending: 'Sorted ascending',
  sortDescending: 'Sorted descending',
  move: 'Move',
  select: 'Select row',
  selectAll: 'Select all rows',
  actions: 'Actions',
  moreActions: 'More actions',
  searchNoResults: 'No results match your search.',
  done: 'Done',
  rowsPerPage: 'Rows per page',
  pagination: 'Pagination',
  previousPage: 'Previous page',
  nextPage: 'Next page',
}
