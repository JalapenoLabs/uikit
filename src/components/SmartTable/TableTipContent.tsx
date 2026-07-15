// Copyright © 2026 Jalapeno Labs

import type { ReactNode } from 'react'

// Convenience content component for the common tooltip shape: a bold control
// label on the first line followed by a short body. Pair it with a column's
// `cellTooltip` / `headerTooltip`:
//
//   cellTooltip: (row) => <TableTipContent label='Status'>{row.statusText}</TableTipContent>
//
// Callers may also pass any other ReactNode as tooltip content; this is just
// the house default so every table doesn't re-implement the same markup.

export type TableTipContentProps = {
  label: string
  children: ReactNode
}

export function TableTipContent(props: TableTipContentProps) {
  return (
    <div style={{ maxWidth: '20rem', lineHeight: 1.375 }}>
      <div style={{ fontWeight: 600 }}>{ props.label }</div>
      <div style={{ opacity: 0.9 }}>{ props.children }</div>
    </div>
  )
}
