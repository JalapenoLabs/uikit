// Copyright © 2026 Jalapeno Labs

import type { ResolvedFilter, SmartTableFilterValues } from './filters'
import type { SmartTableLabels } from './labels'
import type { RowData } from '@tanstack/react-table'

// User interface
import { TableIcon } from './icons'
import { TableTooltip } from './TableTooltip'

// Misc
import { describeFilter, isFilterValueActive } from './filters'

type Props<TData extends RowData> = {
  filters: ResolvedFilter<TData>[]
  values: SmartTableFilterValues
  labels: SmartTableLabels
  onRemove: (filterId: string) => void
}

/**
 * The active filters as a row of tags above the table. A press anywhere on a
 * tag removes its filter; the X on its right says so. Long tags end in an
 * ellipsis and show their full text in a tooltip.
 */
export function DataTableFilterTags<TData extends RowData>(props: Props<TData>) {
  const { filters, values, labels, onRemove } = props

  const tags: { id: string, text: string }[] = []
  for (const filter of filters) {
    const value = values[filter.id]
    if (isFilterValueActive(value)) {
      tags.push({ id: filter.id, text: describeFilter(filter, value, labels) })
    }
  }

  if (!tags.length) {
    return null
  }

  return <ul className='jala-table-filter-tags jala-table-theme' aria-label={labels.activeFilters}>
    { tags.map((tag) => <li key={tag.id}>
      <TableTooltip content={tag.text}>
        <button
          type='button'
          className='jala-table-filter-tag'
          aria-label={labels.removeFilter(tag.text)}
          onClick={() => onRemove(tag.id)}
        >
          <span className='jala-table-filter-tag-text'>{ tag.text }</span>
          <TableIcon name='close' size={14} />
        </button>
      </TableTooltip>
    </li>) }
  </ul>
}
