// Copyright © 2026 Jalapeno Labs

import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { buildPaginationRange, DataTableFooter } from './DataTableFooter'
import { defaultSmartTableLabels } from './labels'

describe('buildPaginationRange', () => {
  it('lists every page when they all fit', () => {
    expect(buildPaginationRange(1, 5)).toEqual([ 1, 2, 3, 4, 5 ])
    expect(buildPaginationRange(4, 7)).toEqual([ 1, 2, 3, 4, 5, 6, 7 ])
  })

  it('collapses the tail when the active page is near the start', () => {
    expect(buildPaginationRange(1, 20)).toEqual([ 1, 2, 3, 4, 5, 'ellipsis', 20 ])
  })

  it('collapses the head when the active page is near the end', () => {
    expect(buildPaginationRange(20, 20)).toEqual([ 1, 'ellipsis', 16, 17, 18, 19, 20 ])
  })

  it('collapses both sides when the active page is in the middle', () => {
    expect(buildPaginationRange(10, 20)).toEqual([ 1, 'ellipsis', 9, 10, 11, 'ellipsis', 20 ])
  })

  it('clamps an out-of-range active page', () => {
    expect(buildPaginationRange(99, 20)).toEqual([ 1, 'ellipsis', 16, 17, 18, 19, 20 ])
  })
})

describe('DataTableFooter', () => {
  function renderFooter(overrides: Partial<Parameters<typeof DataTableFooter>[0]> = {}) {
    const onPageChange = vi.fn()
    const onPageSizeChange = vi.fn()

    render(
      <DataTableFooter
        pageSize={25}
        pageSizeOptions={[ 10, 25, 50 ]}
        activePage={2}
        totalPages={5}
        labels={defaultSmartTableLabels}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        {...overrides}
      />,
    )

    return { onPageChange, onPageSizeChange }
  }

  it('marks the active page and navigates on page click', async () => {
    const { onPageChange } = renderFooter()

    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')

    await userEvent.click(screen.getByRole('button', { name: '4' }))
    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('steps back and forward with the chevron buttons', async () => {
    const { onPageChange } = renderFooter()

    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).toHaveBeenCalledWith(1)

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('disables the previous button on the first page and next on the last', () => {
    renderFooter({ activePage: 1, totalPages: 1 })

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('emits page size changes from the native select', async () => {
    const { onPageSizeChange } = renderFooter()

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Rows per page' }), '50')
    expect(onPageSizeChange).toHaveBeenCalledWith(50)
  })
})
