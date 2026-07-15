// Copyright © 2026 Jalapeno Labs

import type { RowSelectionState } from '@tanstack/react-table'

// Core
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'

// User interface
import { SmartTable } from './SmartTable'
import { createManagedColumns } from './createManagedColumns'

type Person = {
  id: string
  name: string
  role: string
}

const people: Person[] = [
  { id: '1', name: 'Ada Lovelace', role: 'Engineer' },
  { id: '2', name: 'Grace Hopper', role: 'Admiral' },
  { id: '3', name: 'Katherine Johnson', role: 'Mathematician' },
]

const columns = createManagedColumns<Person, 'name' | 'role'>({
  columnKeys: [ 'name', 'role' ],
  getColumnLabel: (columnKey) => columnKey === 'name'
    ? 'Name'
    : 'Role',
  createColumnDef: ({ columnKey, columnLabel }) => ({
    accessorKey: columnKey,
    header: columnLabel,
  }),
})

let testCounter = 0

function buildIds() {
  // A unique localStorage namespace per test keeps persisted column state from
  // bleeding between tests.
  testCounter += 1
  return {
    tableElementId: `people-table-${testCounter}`,
    tableLocalStorageId: `people-table-${testCounter}`,
  }
}

type HarnessProps = {
  ids: ReturnType<typeof buildIds>
  data?: Person[]
  enableSelection?: boolean
  pagination?: { show: boolean, initialPageSize?: number }
}

function SmartTableHarness(props: HarnessProps) {
  const [ search, setSearch ] = useState('')
  const [ rowSelection, setRowSelection ] = useState<RowSelectionState>({})

  return <SmartTable
    ids={props.ids}
    tableAriaLabel='People'
    data={props.data ?? people}
    managedColumns={columns}
    getRowId={(row) => row.id}
    search={{ value: search, onChange: setSearch }}
    enableSelection={props.enableSelection}
    rowSelection={props.enableSelection ? rowSelection : undefined}
    onRowSelectionChange={props.enableSelection ? setRowSelection : undefined}
    pagination={props.pagination}
  />
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('SmartTable', () => {
  it('renders headers, rows, and the results count', () => {
    render(<SmartTableHarness ids={buildIds()} />)

    const table = screen.getByRole('table', { name: 'People' })
    expect(within(table).getByText('Name')).toBeInTheDocument()
    expect(within(table).getByText('Role')).toBeInTheDocument()
    expect(within(table).getByText('Ada Lovelace')).toBeInTheDocument()
    expect(within(table).getByText('Katherine Johnson')).toBeInTheDocument()
    expect(screen.getByText('3 results')).toBeInTheDocument()
  })

  it('filters rows through the global search and can clear back', async () => {
    render(<SmartTableHarness ids={buildIds()} />)

    await userEvent.type(screen.getByPlaceholderText('Search...'), 'grace')

    const table = screen.getByRole('table', { name: 'People' })
    expect(within(table).getByText('Grace Hopper')).toBeInTheDocument()
    expect(within(table).queryByText('Ada Lovelace')).not.toBeInTheDocument()
    expect(screen.getByText('1 result')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(within(table).getByText('Ada Lovelace')).toBeInTheDocument()
  })

  it('shows the empty label when the search matches nothing', async () => {
    render(<SmartTableHarness ids={buildIds()} />)

    await userEvent.type(screen.getByPlaceholderText('Search...'), 'zzzz')

    expect(screen.getByText('No results match your search.')).toBeInTheDocument()
  })

  it('sorts rows when a header is clicked and cycles back to unsorted', async () => {
    render(<SmartTableHarness ids={buildIds()} />)

    const table = screen.getByRole('table', { name: 'People' })

    function rowTexts() {
      // Skip the header row.
      const rows = within(table).getAllByRole('row').slice(1)
      return rows.map((row) => within(row).getAllByRole('cell')[0].textContent)
    }

    expect(rowTexts()).toEqual([ 'Ada Lovelace', 'Grace Hopper', 'Katherine Johnson' ])

    const sortButtons = within(table).getAllByRole('button', { name: 'Sort' })
    const roleSortButton = sortButtons.find((button) => button.textContent?.includes('Role'))
    expect(roleSortButton).toBeDefined()

    await userEvent.click(roleSortButton!)
    expect(rowTexts()).toEqual([ 'Grace Hopper', 'Ada Lovelace', 'Katherine Johnson' ])

    await userEvent.click(within(table).getByRole('button', { name: 'Sorted ascending' }))
    expect(rowTexts()).toEqual([ 'Katherine Johnson', 'Ada Lovelace', 'Grace Hopper' ])

    await userEvent.click(within(table).getByRole('button', { name: 'Sorted descending' }))
    expect(rowTexts()).toEqual([ 'Ada Lovelace', 'Grace Hopper', 'Katherine Johnson' ])
  })

  it('toggles column visibility through the column controls and persists it', async () => {
    const ids = buildIds()
    render(<SmartTableHarness ids={ids} />)

    const table = screen.getByRole('table', { name: 'People' })
    expect(within(table).getByText('Role')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Columns' }))
    const popover = screen.getByRole('dialog', { name: 'Columns' })
    await userEvent.click(within(popover).getByRole('checkbox', { name: 'Role' }))

    expect(within(table).queryByText('Role')).not.toBeInTheDocument()
    expect(within(table).queryByText('Engineer')).not.toBeInTheDocument()

    const stored = window.localStorage.getItem(`${ids.tableLocalStorageId}.columnVisibility.v1`)
    expect(stored).toBe(JSON.stringify({ role: false }))
  })

  it('selects rows individually and via select-all', async () => {
    render(<SmartTableHarness ids={buildIds()} enableSelection />)

    const table = screen.getByRole('table', { name: 'People' })
    const rowCheckboxes = within(table).getAllByRole('checkbox', { name: 'Select row' })
    expect(rowCheckboxes).toHaveLength(3)

    await userEvent.click(rowCheckboxes[1])
    expect(rowCheckboxes[1]).toBeChecked()
    expect(rowCheckboxes[0]).not.toBeChecked()

    await userEvent.click(within(table).getByRole('checkbox', { name: 'Select all rows' }))
    rowCheckboxes.forEach((checkbox) => expect(checkbox).toBeChecked())
  })

  it('paginates rows and navigates between pages', async () => {
    const manyPeople: Person[] = Array.from({ length: 25 }, (_unused, index) => ({
      id: String(index + 1),
      name: `Person ${String(index + 1).padStart(2, '0')}`,
      role: 'Engineer',
    }))

    render(
      <SmartTableHarness
        ids={buildIds()}
        data={manyPeople}
        pagination={{ show: true, initialPageSize: 10 }}
      />,
    )

    const table = screen.getByRole('table', { name: 'People' })
    expect(within(table).getByText('Person 01')).toBeInTheDocument()
    expect(within(table).queryByText('Person 11')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '2' }))
    expect(within(table).getByText('Person 11')).toBeInTheDocument()
    expect(within(table).queryByText('Person 01')).not.toBeInTheDocument()

    // 25 rows at 10 per page = 3 pages.
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
  })

  it('warns when selection is enabled without controlled props', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const ids = buildIds()

    render(
      <SmartTable
        ids={ids}
        tableAriaLabel='People'
        data={people}
        managedColumns={columns}
        getRowId={(row) => row.id}
        enableSelection
      />,
    )

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('missing controlled selection props'))
    warnSpy.mockRestore()
  })
})
