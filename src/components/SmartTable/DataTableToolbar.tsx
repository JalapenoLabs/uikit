// Copyright © 2026 Jalapeno Labs

import type { SmartTableLabels } from './labels'
import type { ReactNode } from 'react'

// User interface
import { TableIcon } from './icons'
import { SmartTableStyles } from './tableStyles'

// Misc
import { defaultSmartTableLabels } from './labels'

type Props = {
  searchValue?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
  isSearchDisabled?: boolean
  searchInputElementId?: string
  searchPlaceholder?: string
  showResultsCount?: boolean
  resultsCount?: number
  leftSlot?: ReactNode
  rightSlot?: ReactNode
  className?: string
  labels?: Partial<SmartTableLabels>
}

export function DataTableToolbar(props: Props) {
  const {
    searchValue = '',
    onSearchChange,
    showSearch = true,
    isSearchDisabled = false,
    searchInputElementId = 'table-search',
    searchPlaceholder,
    showResultsCount = true,
    resultsCount = 0,
    leftSlot,
    rightSlot,
    className,
  } = props

  const labels = { ...defaultSmartTableLabels, ...props.labels }
  const resolvedPlaceholder = searchPlaceholder ?? labels.searchPlaceholder

  return (
    <section className={[ 'jala-table-toolbar', className ?? '' ].join(' ').trim()}>
      <SmartTableStyles />
      <div className='jala-table-toolbar-group'>
        { showSearch
          ? (
            <div className='jala-table-search'>
              <span className='jala-table-search-icon'>
                <TableIcon name='search' size={16} />
              </span>
              <input
                type='search'
                className='jala-table-search-input'
                id={searchInputElementId}
                placeholder={resolvedPlaceholder}
                disabled={isSearchDisabled}
                value={searchValue}
                onChange={(event) => onSearchChange?.(event.target.value)}
              />
              { searchValue.length
                ? (
                  <button
                    type='button'
                    className='jala-table-search-clear'
                    aria-label={labels.clearSearch}
                    onClick={() => onSearchChange?.('')}
                  >
                    <TableIcon name='close' size={16} />
                  </button>
                )
                : null
              }
            </div>
          )
          : null
        }
        { leftSlot }
        { showResultsCount
          ? <p className='jala-table-results-count'>{ labels.results(resultsCount) }</p>
          : null
        }
      </div>
      { rightSlot
        ? <div className='jala-table-toolbar-group jala-table-toolbar-group--right'>{ rightSlot }</div>
        : null
      }
    </section>
  )
}
