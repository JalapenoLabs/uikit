// Copyright © 2026 Jalapeno Labs

import type { SmartTableLabels } from './labels'

// User interface
import { TableIcon } from './icons'

type Props = {
  pageSize: number
  pageSizeOptions: number[]
  activePage: number
  totalPages: number
  isDisabled?: boolean
  labels: SmartTableLabels
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

// With 7 or fewer pages every page number fits; beyond that the range
// collapses around the active page with ellipsis gaps.
const MAX_VISIBLE_PAGES = 7

/**
 * Computes the visible page items for the footer pagination: all pages when
 * they fit, otherwise the first page, the last page, a window around the
 * active page, and `'ellipsis'` markers for the collapsed gaps.
 */
export function buildPaginationRange(activePage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_unused, index) => index + 1)
  }

  const clampedActive = Math.min(Math.max(activePage, 1), totalPages)
  const windowStart = Math.max(2, Math.min(clampedActive - 1, totalPages - 4))
  const windowEnd = Math.min(totalPages - 1, Math.max(clampedActive + 1, 5))

  const range: Array<number | 'ellipsis'> = [ 1 ]
  if (windowStart > 2) {
    range.push('ellipsis')
  }
  for (let page = windowStart; page <= windowEnd; page++) {
    range.push(page)
  }
  if (windowEnd < totalPages - 1) {
    range.push('ellipsis')
  }
  range.push(totalPages)

  return range
}

export function DataTableFooter(props: Props) {
  const {
    pageSize,
    pageSizeOptions,
    activePage,
    totalPages,
    isDisabled = false,
    labels,
    onPageChange,
    onPageSizeChange,
  } = props

  const safeTotalPages = Math.max(1, totalPages)
  const paginationRange = buildPaginationRange(activePage, safeTotalPages)

  return (
    <footer className='jala-table-footer'>
      <div className='jala-table-footer-summary'>
        <span>{ labels.rowsPerPage }</span>
        <div className='jala-table-page-size-select'>
          <select
            aria-label={labels.rowsPerPage}
            value={String(pageSize)}
            disabled={isDisabled}
            className='jala-table-native-select'
            onChange={(event) => {
              const nextPageSize = Number(event.target.value)
              if (!Number.isFinite(nextPageSize) || nextPageSize <= 0) {
                console.debug('DataTableFooter received invalid page size value', event.target.value)
                return
              }

              onPageSizeChange(nextPageSize)
              event.currentTarget.blur()
            }}
          >
            { pageSizeOptions.map((option) => (
              <option key={String(option)} value={String(option)}>
                { String(option) }
              </option>
            )) }
          </select>
        </div>
      </div>

      <nav className='jala-table-pagination' aria-label={labels.pagination}>
        <button
          type='button'
          className='jala-table-page-button'
          aria-label={labels.previousPage}
          disabled={isDisabled || activePage <= 1}
          onClick={() => onPageChange(activePage - 1)}
        >
          <TableIcon name='chevronLeft' size={16} />
        </button>
        { paginationRange.map((item, index) => {
          if (item === 'ellipsis') {
            return <span key={`ellipsis-${index}`} className='jala-table-page-ellipsis' aria-hidden='true'>
              &hellip;
            </span>
          }
          return (
            <button
              key={item}
              type='button'
              className={[
                'jala-table-page-button',
                item === activePage ? 'jala-table-page-button--active' : '',
              ].join(' ').trim()}
              aria-current={item === activePage ? 'page' : undefined}
              disabled={isDisabled}
              onClick={() => onPageChange(item)}
            >
              { String(item) }
            </button>
          )
        }) }
        <button
          type='button'
          className='jala-table-page-button'
          aria-label={labels.nextPage}
          disabled={isDisabled || activePage >= safeTotalPages}
          onClick={() => onPageChange(activePage + 1)}
        >
          <TableIcon name='chevronRight' size={16} />
        </button>
      </nav>
    </footer>
  )
}
