// Copyright © 2026 Jalapeno Labs

import type { SmartTableLabels } from './labels'
import type { ReactNode } from 'react'

// User interface
import { DataTableSearch } from './DataTableSearch'
import { SmartTableStyles } from './tableStyles'

// Misc
import { defaultSmartTableLabels } from './labels'

type Props = {
  searchValue?: string
  onSearchChange?: (value: string) => void
  showSearch?: boolean
  isSearchDisabled?: boolean
  isSearchLoading?: boolean
  searchFocusHotkey?: boolean
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
    isSearchLoading = false,
    searchFocusHotkey = true,
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
    <section className={[ 'jala-table-toolbar jala-table-theme', className ?? '' ].join(' ').trim()}>
      <SmartTableStyles />
      <div
        className={[
          'jala-table-toolbar-group',
          showSearch ? 'jala-table-toolbar-group--search' : '',
        ].join(' ').trim()}
      >
        { showSearch
          ? <DataTableSearch
            value={searchValue}
            onChange={(value) => onSearchChange?.(value)}
            inputId={searchInputElementId}
            placeholder={resolvedPlaceholder}
            labels={labels}
            isDisabled={isSearchDisabled}
            isLoading={isSearchLoading}
            focusHotkey={searchFocusHotkey}
          />
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
