// Copyright © 2026 Jalapeno Labs

import type { SmartTableProps } from './SmartTable'

// Core
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'

// User interface
import { SmartTable } from './SmartTable'
import { createManagedColumns } from './createManagedColumns'

const { downloadCsv } = vi.hoisted(() => ({ downloadCsv: vi.fn() }))
vi.mock('../../utils/csv', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../utils/csv')>(),
  downloadCsv,
}))

type Person = {
  id: string
  name: string
  role: string
  // A sort key, which the export should not show as is.
  rank: number
  notes: string
}

const people: Person[] = [
  { id: '1', name: 'Ada Lovelace', role: 'Engineer', rank: 2, notes: 'first, programmer' },
  { id: '2', name: 'Grace Hopper', role: 'Admiral', rank: 1, notes: '' },
  { id: '3', name: 'Katherine Johnson', role: 'Mathematician', rank: 3, notes: '=1+1' },
]

const columns = createManagedColumns<Person, 'name' | 'role' | 'rank' | 'notes'>({
  columnKeys: [ 'name', 'role', 'rank', 'notes' ],
  getColumnLabel: (columnKey) => ({ name: 'Name', role: 'Role', rank: 'Rank', notes: 'Notes' })[columnKey],
  getExportValue: (columnKey) => {
    if (columnKey === 'rank') {
      return (person: Person) => `#${person.rank}`
    }
    if (columnKey === 'notes') {
      return null
    }
    return undefined
  },
  createColumnDef: ({ columnKey, columnLabel }) => ({
    accessorKey: columnKey,
    header: columnLabel,
  }),
})

let tableCounter = 0

function nextIds() {
  tableCounter += 1
  return { tableElementId: `controls-${tableCounter}`, tableLocalStorageId: `controls-${tableCounter}` }
}

type HarnessProps = Partial<SmartTableProps<Person>>

function Harness(props: HarnessProps) {
  return <SmartTable
    ids={nextIds()}
    tableAriaLabel='People'
    data={people}
    managedColumns={columns}
    getRowId={(person) => person.id}
    {...props}
  />
}

// A page with a titlebar slot that the table's controls render into.
function TitlebarHarness(props: HarnessProps) {
  const [ container, setContainer ] = useState<HTMLDivElement | null>(null)
  return <div>
    <header data-testid='titlebar'>
      <h1>People</h1>
      <div ref={setContainer} />
    </header>
    <main data-testid='content'>
      <Harness {...props} controls={{ container }} />
    </main>
  </div>
}

function tableRowNames() {
  const table = screen.getByRole('table', { name: 'People' })
  return within(table).getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[0].textContent)
}

beforeEach(() => {
  window.localStorage.clear()
  downloadCsv.mockClear()
})

describe('table search', () => {
  it('keeps its own search text when the consumer passes no value', async () => {
    render(<Harness />)
    await userEvent.type(screen.getByRole('searchbox'), 'grace')
    expect(tableRowNames()).toEqual([ 'Grace Hopper' ])
  })

  it('widens once it holds text', async () => {
    render(<Harness />)
    const search = screen.getByRole('searchbox')
    expect(search.parentElement).not.toHaveClass('jala-table-search--filled')

    await userEvent.type(search, 'a')
    expect(search.parentElement).toHaveClass('jala-table-search--filled')
  })

  it('shows a spinner while the search is loading', () => {
    render(<Harness search={{ isLoading: true }} />)
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-busy', 'true')
  })

  it('takes Ctrl+F to focus the search, except while typing elsewhere', () => {
    render(<div>
      <input aria-label='Elsewhere' />
      <Harness />
    </div>)
    const search = screen.getByRole('searchbox')

    fireEvent.keyDown(document.body, { key: 'f', ctrlKey: true })
    expect(search).toHaveFocus()

    const elsewhere = screen.getByRole('textbox', { name: 'Elsewhere' })
    elsewhere.focus()
    fireEvent.keyDown(elsewhere, { key: 'f', ctrlKey: true })
    expect(elsewhere).toHaveFocus()
  })
})

describe('controls outside the table', () => {
  it('renders search, columns, and export into the given container, keeping their state', async () => {
    render(<TitlebarHarness csvExport={{ fileName: 'people' }} />)
    const titlebar = screen.getByTestId('titlebar')
    const content = screen.getByTestId('content')

    expect(within(titlebar).getByRole('searchbox')).toBeInTheDocument()
    expect(within(titlebar).getByRole('button', { name: 'Columns' })).toBeInTheDocument()
    expect(within(titlebar).getByRole('button', { name: 'Export CSV' })).toBeInTheDocument()
    expect(within(content).queryByRole('searchbox')).not.toBeInTheDocument()

    await userEvent.type(within(titlebar).getByRole('searchbox'), 'katherine')
    expect(tableRowNames()).toEqual([ 'Katherine Johnson' ])

    await userEvent.click(within(titlebar).getByRole('button', { name: 'Columns' }))
    const columnsDialog = screen.getByRole('dialog', { name: 'Columns' })
    await userEvent.click(within(columnsDialog).getByRole('checkbox', { name: 'Role' }))
    expect(within(screen.getByRole('table')).queryByText('Mathematician')).not.toBeInTheDocument()
  })

  it('renders no controls while the container is not there yet', () => {
    render(<Harness controls={{ container: null }} />)
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Columns' })).not.toBeInTheDocument()
  })

  it('keeps the Columns chooser when the toolbar is hidden', () => {
    render(<Harness toolbar={{ show: false }} csvExport={{ fileName: 'people' }} />)
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    expect(screen.queryByText('3 results')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Columns' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeInTheDocument()
  })

  it('leaves the Columns chooser out only when asked', () => {
    render(<Harness toolbar={{ show: false }} columnControls={{ show: false }} />)
    expect(screen.queryByRole('button', { name: 'Columns' })).not.toBeInTheDocument()
  })
})

describe('CSV export', () => {
  it('exports the filtered, sorted rows of every page under the visible columns', async () => {
    render(<Harness
      csvExport={{ fileName: () => 'people-export' }}
      sorting={[{ id: 'rank', desc: false }]}
      onSortingChange={() => {}}
      pagination={{ show: true, initialPageSize: 1 }}
    />)

    // Matches Engineer and Katherine, so Grace Hopper is filtered out.
    await userEvent.type(screen.getByRole('searchbox'), 'ine')
    await userEvent.click(screen.getByRole('button', { name: 'Export CSV' }))

    expect(downloadCsv).toHaveBeenCalledTimes(1)
    const [ fileName, csv ] = downloadCsv.mock.calls[0]
    expect(fileName).toBe('people-export')
    // Notes opts out with exportValue null; Rank exports its own value; rows
    // follow the sort by rank, past the one-row page.
    expect(csv).toBe([
      'Name,Role,Rank',
      'Ada Lovelace,Engineer,#2',
      'Katherine Johnson,Mathematician,#3',
    ].join('\r\n'))
  })

  it('leaves out hidden columns', async () => {
    const ids = nextIds()
    window.localStorage.setItem(`${ids.tableLocalStorageId}.columnVisibility.v1`, JSON.stringify({ role: false }))
    render(<Harness ids={ids} csvExport={{ fileName: 'people' }} />)

    await userEvent.click(screen.getByRole('button', { name: 'Export CSV' }))
    expect(downloadCsv.mock.calls[0][1].split('\r\n')[0]).toBe('Name,Rank')
  })

  it('cannot export an empty table', async () => {
    render(<Harness csvExport={{ fileName: 'people' }} />)
    await userEvent.type(screen.getByRole('searchbox'), 'nobody at all')
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled()
  })
})
