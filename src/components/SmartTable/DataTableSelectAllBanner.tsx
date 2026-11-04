// Copyright © 2026 Jalapeno Labs

import type { SmartTableLabels } from './labels'

type Props = {
  pageRowCount: number
  totalRowCount: number
  isEverythingSelected: boolean
  labels: SmartTableLabels
  onSelectEverything: () => void
  onClear: () => void
}

/**
 * Shown once every row on the page is selected and more pages exist: it
 * offers to select every row across the pages, and once that is done, to
 * clear the selection. Selecting or unselecting any row returns to an
 * ordinary selection.
 */
export function DataTableSelectAllBanner(props: Props) {
  const { labels } = props

  return <div className='jala-table-select-all-banner' role='status'>
    { props.isEverythingSelected
      ? <>
        <span>{ labels.everythingSelected(props.totalRowCount) }</span>
        <button type='button' className='jala-table-link-button' onClick={props.onClear}>
          <span>{ labels.clearSelection }</span>
        </button>
      </>
      : <>
        <span>{ labels.pageSelected(props.pageRowCount) }</span>
        <button type='button' className='jala-table-link-button' onClick={props.onSelectEverything}>
          <span>{ labels.selectEverything(props.totalRowCount) }</span>
        </button>
      </>
    }
  </div>
}
