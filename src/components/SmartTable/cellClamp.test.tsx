// Copyright © 2026 Jalapeno Labs

import type { DataTableCellOverflow, DataTableManagedColumn } from './DataTable.types'

// Core
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

// User interface
import { SmartTable } from './SmartTable'
import { createManagedColumns } from './createManagedColumns'

// Misc
import { DOUBLE_CLICK_WINDOW_MS } from './DataTableRow'

type Note = {
  id: string
  title: string
  body: string
}

const notes: Note[] = [
  { id: '1', title: 'Launch plan', body: 'A very long body that would run well past three lines in a real table.' },
  { id: '2', title: 'Retro', body: 'Another long body.' },
]

function buildColumns(options: { bodyLineClamp?: number | false } = {}) {
  return createManagedColumns<Note, 'title' | 'body'>({
    columnKeys: [ 'title', 'body' ],
    getColumnLabel: (columnKey) => columnKey === 'title'
      ? 'Title'
      : 'Body',
    getLineClamp: (columnKey) => columnKey === 'body'
      ? options.bodyLineClamp
      : undefined,
    createColumnDef: ({ columnKey, columnLabel }) => ({
      accessorKey: columnKey,
      header: columnLabel,
      cell: ({ row }) => columnKey === 'title'
        ? <a href={`#/notes/${row.original.id}`}>{ row.original.title }</a>
        : <span>{ row.original.body }</span>,
    }),
  })
}

let tableCounter = 0

type HarnessProps = {
  managedColumns?: DataTableManagedColumn<Note>[]
  cellLineClamp?: number | false
  cellOverflow?: DataTableCellOverflow
  onHighlightedRowChange?: (rowId: string | null) => void
  highlightedRowId?: string | null
}

function Harness(props: HarnessProps) {
  tableCounter += 1
  return <SmartTable
    ids={{ tableElementId: `clamp-${tableCounter}`, tableLocalStorageId: `clamp-${tableCounter}` }}
    tableAriaLabel='Notes'
    data={notes}
    managedColumns={props.managedColumns ?? buildColumns()}
    getRowId={(note) => note.id}
    cellLineClamp={props.cellLineClamp}
    cellOverflow={props.cellOverflow}
    enableRowHighlight={Boolean(props.onHighlightedRowChange)}
    highlightedRowId={props.highlightedRowId}
    onHighlightedRowChange={props.onHighlightedRowChange}
  />
}

function clampOf(text: string) {
  const clamp = screen.getByText(text).closest<HTMLElement>('.jala-table-cell-clamp')
  if (!clamp) {
    throw new Error(`${text} is not clamped`)
  }
  return clamp
}

// The test DOM has no layout, so a clamp never overflows unless told to.
function makeOverflow(clamp: HTMLElement) {
  Object.defineProperty(clamp, 'scrollHeight', { configurable: true, value: 120 })
  Object.defineProperty(clamp, 'clientHeight', { configurable: true, value: 60 })
}

function isExpanded(clamp: HTMLElement) {
  return clamp.classList.contains('jala-table-cell-clamp--expanded')
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('clamping long cells', () => {
  it('clamps every data cell to three lines from a normal cell renderer', () => {
    render(<Harness />)
    expect(clampOf('Launch plan').style.getPropertyValue('--jala-table-clamp-lines')).toBe('3')
    expect(clampOf(notes[0].body).style.getPropertyValue('--jala-table-clamp-lines')).toBe('3')
  })

  it('takes a table-wide line count, and a column can opt out', () => {
    render(<Harness cellLineClamp={2} managedColumns={buildColumns({ bodyLineClamp: false })} />)
    expect(clampOf('Launch plan').style.getPropertyValue('--jala-table-clamp-lines')).toBe('2')
    expect(screen.getByText(notes[0].body).closest('.jala-table-cell-clamp')).toBeNull()
  })

  it('turns off entirely with cellLineClamp false', () => {
    render(<Harness cellLineClamp={false} />)
    expect(screen.getByText('Launch plan').closest('.jala-table-cell-clamp')).toBeNull()
  })
})

describe('expanding a row', () => {
  it('expands one row at a time on click', async () => {
    render(<Harness />)
    const firstBody = clampOf(notes[0].body)
    const secondBody = clampOf(notes[1].body)

    await userEvent.click(firstBody)
    expect(isExpanded(firstBody)).toBe(true)

    await userEvent.click(secondBody)
    expect(isExpanded(firstBody)).toBe(false)
    expect(isExpanded(secondBody)).toBe(true)

    await userEvent.click(secondBody)
    expect(isExpanded(secondBody)).toBe(false)
  })

  it('leaves a press on a link in the row to the link', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('link', { name: 'Launch plan' }))
    expect(isExpanded(clampOf(notes[0].body))).toBe(false)
  })

  it('expands the highlighted row where row highlight is on', () => {
    render(<Harness onHighlightedRowChange={() => {}} highlightedRowId='2' />)
    expect(isExpanded(clampOf(notes[1].body))).toBe(true)
    expect(isExpanded(clampOf(notes[0].body))).toBe(false)
  })
})

describe('opening a cell in a modal', () => {
  it('opens a clamped cell on double-click, titled by its column', async () => {
    render(<Harness cellOverflow='modal' />)
    const body = clampOf(notes[0].body)
    makeOverflow(body)

    await userEvent.dblClick(body)
    const dialog = screen.getByRole('dialog', { name: 'Body' })
    expect(within(dialog).getByText(notes[0].body)).toBeInTheDocument()
    // No row expands in modal mode.
    expect(isExpanded(body)).toBe(false)

    await userEvent.click(within(dialog).getByRole('button', { name: 'Done' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the cell dialog on Escape', async () => {
    render(<Harness cellOverflow='modal' />)
    const body = clampOf(notes[0].body)
    makeOverflow(body)

    await userEvent.dblClick(body)
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does nothing on double-click when the cell already shows everything', async () => {
    render(<Harness cellOverflow='modal' />)
    await userEvent.dblClick(clampOf(notes[0].body))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('holds a navigating row click on a clamped cell, so a double-click can open it instead', async () => {
    const onHighlightedRowChange = vi.fn()
    render(<Harness cellOverflow='modal' onHighlightedRowChange={onHighlightedRowChange} highlightedRowId={null} />)
    const body = clampOf(notes[0].body)
    makeOverflow(body)

    await userEvent.dblClick(body)
    await new Promise((resolve) => setTimeout(resolve, DOUBLE_CLICK_WINDOW_MS + 50))
    expect(onHighlightedRowChange).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: 'Body' })).toBeInTheDocument()
  })

  it('still runs a single click on a clamped cell, once the double-click window passes', async () => {
    const onHighlightedRowChange = vi.fn()
    render(<Harness cellOverflow='modal' onHighlightedRowChange={onHighlightedRowChange} highlightedRowId={null} />)
    const body = clampOf(notes[0].body)
    makeOverflow(body)

    await userEvent.click(body)
    expect(onHighlightedRowChange).not.toHaveBeenCalled()
    await waitFor(() => expect(onHighlightedRowChange).toHaveBeenCalledWith('1'))
  })

  it('runs a click on a cell that is not clamped at once', async () => {
    const onHighlightedRowChange = vi.fn()
    render(<Harness cellOverflow='modal' onHighlightedRowChange={onHighlightedRowChange} highlightedRowId={null} />)

    await userEvent.click(clampOf(notes[1].body))
    expect(onHighlightedRowChange).toHaveBeenCalledWith('2')
  })
})
