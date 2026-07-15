// Copyright © 2026 Jalapeno Labs

import type { ColumnOrderState } from '@tanstack/react-table'

/**
 * Merges a (possibly stale) stored column order with the current column list:
 * stored ids that no longer exist are dropped, and columns missing from the
 * stored order are appended in their natural position.
 */
export function mergeColumnOrder(order: ColumnOrderState, columnIds: string[]) {
  const next = order.filter((id) => columnIds.includes(id))
  columnIds.forEach((id) => {
    if (!next.includes(id)) {
      next.push(id)
    }
  })
  return next
}
