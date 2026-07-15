// Copyright © 2026 Jalapeno Labs

import type { ReactNode } from 'react'

export type TableIconName =
  | 'search'
  | 'close'
  | 'columns'
  | 'dragHandle'
  | 'sortUp'
  | 'sortDown'
  | 'chevronLeft'
  | 'chevronRight'

// Every icon is drawn on a 24x24 grid with `currentColor` strokes so it
// inherits size and color from its surroundings. Inlining the paths keeps the
// table free of an icon-library dependency.
const pathsByIconName = {
  search: <>
    <circle cx='11' cy='11' r='7' />
    <line x1='21' y1='21' x2='16' y2='16' />
  </>,
  close: <>
    <line x1='18' y1='6' x2='6' y2='18' />
    <line x1='6' y1='6' x2='18' y2='18' />
  </>,
  columns: <>
    <rect x='3' y='4' width='18' height='16' rx='2' />
    <line x1='9' y1='4' x2='9' y2='20' />
    <line x1='15' y1='4' x2='15' y2='20' />
  </>,
  dragHandle: <>
    <circle cx='9' cy='6' r='1.25' fill='currentColor' stroke='none' />
    <circle cx='9' cy='12' r='1.25' fill='currentColor' stroke='none' />
    <circle cx='9' cy='18' r='1.25' fill='currentColor' stroke='none' />
    <circle cx='15' cy='6' r='1.25' fill='currentColor' stroke='none' />
    <circle cx='15' cy='12' r='1.25' fill='currentColor' stroke='none' />
    <circle cx='15' cy='18' r='1.25' fill='currentColor' stroke='none' />
  </>,
  sortUp: <>
    <line x1='12' y1='19' x2='12' y2='5' />
    <polyline points='5 12 12 5 19 12' />
  </>,
  sortDown: <>
    <line x1='12' y1='5' x2='12' y2='19' />
    <polyline points='19 12 12 19 5 12' />
  </>,
  chevronLeft: <polyline points='15 18 9 12 15 6' />,
  chevronRight: <polyline points='9 18 15 12 9 6' />,
} as const satisfies Record<TableIconName, ReactNode>

type Props = {
  name: TableIconName
  size?: number
  className?: string
}

export function TableIcon(props: Props) {
  const {
    name,
    size = 16,
    className,
  } = props

  return <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
    aria-hidden='true'
    focusable='false'
  >
    {pathsByIconName[name]}
  </svg>
}
