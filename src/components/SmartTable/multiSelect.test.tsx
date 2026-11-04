// Copyright © 2026 Jalapeno Labs

import type { DataTableBulkEdit, DataTableSelectionAction } from './DataTable.types'
import type { SmartTableProps } from './SmartTable'
import type { RowSelectionState } from '@tanstack/react-table'

// Core
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'

// User interface
import { SmartTable } from './SmartTable'
import { createManagedColumns } from './createManagedColumns'

type Task = {
  id: string
  title: string
}

function buildTasks(count: number): Task[] {
  return Array.from({ length: count }, (_unused, index) => ({
    id: String(index + 1),
    title: `Task ${String(index + 1).padStart(2, '0')}`,
  }))
}

const columns = createManagedColumns<Task, 'title'>({
  columnKeys: [ 'title' ],
  getColumnLabel: () => 'Title',
  createColumnDef: ({ columnKey, columnLabel }) => ({
    accessorKey: columnKey,
    header: columnLabel,
  }),
})

let tableCounter = 0

type HarnessProps = Partial<SmartTableProps<Task>> & {
  onSelectionChange?: (selection: RowSelectionState) => void
}

function Harness(props: HarnessProps) {
  const { onSelectionChange, ...tableProps } = props
  const [ rowSelection, setRowSelection ] = useState<RowSelectionState>({})
  const [ ids ] = useState(() => {
    tableCounter += 1
    return { tableElementId: `select-${tableCounter}`, tableLocalStorageId: `select-${tableCounter}` }
  })

  return <SmartTable
    ids={ids}
    tableAriaLabel='Tasks'
    data={buildTasks(5)}
    managedColumns={columns}
    getRowId={(task) => task.id}
    enableSelection
    rowSelection={rowSelection}
    onRowSelectionChange={(updater) => {
      setRowSelection((current) => {
        const next = typeof updater === 'function'
          ? updater(current)
          : updater
        onSelectionChange?.(next)
        return next
      })
    }}
    {...tableProps}
  />
}

function checkboxOf(title: string) {
  const row = screen.getByText(title).closest('tr')
  if (!row) {
    throw new Error(`No row holds ${title}`)
  }
  return within(row).getByRole('checkbox', { name: 'Select row' })
}

function checkedTitles() {
  const table = screen.getByRole('table', { name: 'Tasks' })
  return within(table)
    .getAllByRole('row')
    .slice(1)
    .filter((row) => within(row).getByRole('checkbox').matches(':checked'))
    .map((row) => within(row).getAllByRole('cell')[1].textContent)
}

function bar() {
  return screen.getByRole('toolbar', { name: 'Selection' })
}

beforeEach(() => {
  window.localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('the selection bar', () => {
  it('appears with a selection and counts it', async () => {
    render(<Harness />)
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()

    await userEvent.click(checkboxOf('Task 02'))
    expect(within(bar()).getByText('1 selected')).toBeInTheDocument()

    await userEvent.click(checkboxOf('Task 04'))
    expect(within(bar()).getByText('2 selected')).toBeInTheDocument()
  })

  it('selects every row on the page with Select all, and clears with the X', async () => {
    render(<Harness />)
    await userEvent.click(checkboxOf('Task 01'))

    await userEvent.click(within(bar()).getByRole('button', { name: 'Select all' }))
    expect(checkedTitles()).toHaveLength(5)

    await userEvent.hover(within(bar()).getByRole('button', { name: 'Clear selection' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Clear selection (Esc)')
    await userEvent.click(within(bar()).getByRole('button', { name: 'Clear selection' }))
    expect(checkedTitles()).toEqual([])
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
  })

  it('hands its actions the selected rows that pass the search', async () => {
    const onPress = vi.fn()
    const actions: DataTableSelectionAction<Task>[] = [{ id: 'archive', label: 'Archive', onPress }]
    render(<Harness selectionActions={actions} />)

    await userEvent.click(checkboxOf('Task 01'))
    await userEvent.click(checkboxOf('Task 02'))
    await userEvent.type(screen.getByRole('searchbox'), '02')

    await userEvent.click(within(bar()).getByRole('button', { name: 'Archive' }))
    expect(onPress).toHaveBeenCalledWith([{ id: '2', title: 'Task 02' }])
  })

  it('applies a choice from a drop-up to every selected row', async () => {
    const onChoose = vi.fn()
    const actions: DataTableSelectionAction<Task>[] = [{
      id: 'status',
      label: 'Change status',
      choices: [{ value: 'open', label: 'Open' }, { value: 'done', label: 'Done' }],
      onChoose,
    }]
    render(<Harness selectionActions={actions} />)
    await userEvent.click(checkboxOf('Task 03'))

    await userEvent.click(within(bar()).getByRole('button', { name: 'Change status' }))
    await userEvent.click(screen.getByRole('menuitem', { name: 'Done' }))
    expect(onChoose).toHaveBeenCalledWith('done', [{ id: '3', title: 'Task 03' }])
  })

  it('holds every action while one is running', async () => {
    let finish = () => {}
    const actions: DataTableSelectionAction<Task>[] = [
      {
        id: 'slow',
        label: 'Archive',
        onPress: () => new Promise<void>((resolve) => {
          finish = resolve
        }),
      },
      { id: 'other', label: 'Duplicate', onPress: vi.fn() },
    ]
    render(<Harness selectionActions={actions} />)
    await userEvent.click(checkboxOf('Task 01'))

    await userEvent.click(within(bar()).getByRole('button', { name: 'Archive' }))
    expect(within(bar()).getByRole('button', { name: 'Archive' })).toHaveAttribute('aria-busy', 'true')
    expect(within(bar()).getByRole('button', { name: 'Duplicate' })).toBeDisabled()

    await act(async () => finish())
    expect(within(bar()).getByRole('button', { name: 'Duplicate' })).toBeEnabled()
  })

  it('moves the actions that do not fit into an overflow menu, from the right', async () => {
    // Every measured element is 200px wide on a 1024px screen: the count and
    // the X take 400, so two of three actions fit beside the overflow button.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      { width: 200, height: 32, top: 0, left: 0, right: 200, bottom: 32, x: 0, y: 0, toJSON: () => ({}) },
    )
    const actions: DataTableSelectionAction<Task>[] = [
      { id: 'one', label: 'Archive', onPress: vi.fn() },
      { id: 'two', label: 'Duplicate', onPress: vi.fn() },
      {
        id: 'three',
        label: 'Change status',
        choices: [{ value: 'open', label: 'Open' }, { value: 'done', label: 'Done' }],
        onChoose: vi.fn(),
      },
    ]
    render(<Harness selectionActions={actions} />)
    await userEvent.click(checkboxOf('Task 01'))

    expect(within(bar()).getByRole('button', { name: 'Archive' })).toBeInTheDocument()
    expect(within(bar()).getByRole('button', { name: 'Duplicate' })).toBeInTheDocument()
    expect(within(bar()).queryByRole('button', { name: 'Change status' })).not.toBeInTheDocument()

    await userEvent.click(within(bar()).getByRole('button', { name: 'More actions' }))
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent))
      .toEqual([ 'Change status: Open', 'Change status: Done' ])
  })
})

describe('range selection', () => {
  // One user-event instance, so the held modifier keys carry into the click.
  it('selects every row between the last click and a shift-click', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(checkboxOf('Task 01'))

    await user.keyboard('{Shift>}')
    await user.click(checkboxOf('Task 04'))
    await user.keyboard('{/Shift}')
    expect(checkedTitles()).toEqual([ 'Task 01', 'Task 02', 'Task 03', 'Task 04' ])
  })

  it('unselects the range with Ctrl+Shift', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(within(screen.getByRole('table')).getByRole('checkbox', { name: 'Select all rows' }))
    // Unselecting and reselecting the last row makes it the range's anchor.
    await user.click(checkboxOf('Task 05'))
    await user.click(checkboxOf('Task 05'))

    await user.keyboard('{Control>}{Shift>}')
    await user.click(checkboxOf('Task 03'))
    await user.keyboard('{/Shift}{/Control}')
    expect(checkedTitles()).toEqual([ 'Task 01', 'Task 02' ])
  })
})

describe('selection hotkeys', () => {
  it('clears on Escape', async () => {
    render(<Harness />)
    await userEvent.click(checkboxOf('Task 01'))
    await userEvent.click(document.body)

    await userEvent.keyboard('{Escape}')
    expect(checkedTitles()).toEqual([])
  })

  it('works right after a checkbox click, with focus still on the checkbox', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(checkboxOf('Task 01'))
    await user.click(checkboxOf('Task 02'))
    expect(checkboxOf('Task 02')).toHaveFocus()

    await user.keyboard('{Control>}z{/Control}')
    expect(checkedTitles()).toEqual([ 'Task 01' ])

    await user.keyboard('{Control>}a{/Control}')
    expect(checkedTitles()).toHaveLength(5)

    await user.keyboard('{Escape}')
    expect(checkedTitles()).toEqual([])
  })

  it('selects all with Ctrl+A and deselects all with Ctrl+Shift+A', () => {
    render(<Harness />)

    fireEvent.keyDown(document.body, { key: 'a', ctrlKey: true })
    expect(checkedTitles()).toHaveLength(5)

    fireEvent.keyDown(document.body, { key: 'A', ctrlKey: true, shiftKey: true })
    expect(checkedTitles()).toEqual([])
  })

  it('leaves Ctrl+A to a text field that has focus', () => {
    render(<Harness />)
    const search = screen.getByRole('searchbox')
    search.focus()

    fireEvent.keyDown(search, { key: 'a', ctrlKey: true })
    expect(checkedTitles()).toEqual([])
  })

  it('undoes and redoes selection changes while the bar is open', async () => {
    render(<Harness />)
    await userEvent.click(checkboxOf('Task 01'))
    await userEvent.click(checkboxOf('Task 02'))
    await userEvent.click(document.body)

    fireEvent.keyDown(document.body, { key: 'z', ctrlKey: true })
    expect(checkedTitles()).toEqual([ 'Task 01' ])

    fireEvent.keyDown(document.body, { key: 'z', ctrlKey: true, shiftKey: true })
    expect(checkedTitles()).toEqual([ 'Task 01', 'Task 02' ])
  })

  it('leaves Ctrl+Z to the app while nothing is selected', () => {
    render(<Harness />)
    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true })
    document.body.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
  })
})

describe('selecting everything across pages', () => {
  it('offers every row once the whole page is selected, and any change goes back to a page selection', async () => {
    render(<Harness data={buildTasks(12)} pagination={{ show: true, initialPageSize: 5 }} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    await userEvent.click(within(screen.getByRole('table')).getByRole('checkbox', { name: 'Select all rows' }))
    expect(screen.getByRole('status')).toHaveTextContent('All 5 rows on this page are selected.')

    await userEvent.click(screen.getByRole('button', { name: 'Select all 12' }))
    expect(screen.getByRole('status')).toHaveTextContent('All 12 rows are selected.')
    expect(within(bar()).getByText('12 selected')).toBeInTheDocument()

    await userEvent.click(checkboxOf('Task 02'))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(within(bar()).getByText('11 selected')).toBeInTheDocument()
  })
})

describe('bulk edit', () => {
  it('changes only the fields the user chose, for every selected row', async () => {
    const onApply = vi.fn()
    const bulkEdit: DataTableBulkEdit<Task> = {
      fields: [
        { id: 'owner', label: 'Owner', kind: 'text' },
        { id: 'notes', label: 'Notes', kind: 'textarea' },
        {
          id: 'state',
          label: 'State',
          kind: 'select',
          options: [{ value: 'open', label: 'Open' }, { value: 'done', label: 'Done' }],
        },
      ],
      onApply,
    }
    render(<Harness bulkEdit={bulkEdit} />)
    await userEvent.click(checkboxOf('Task 01'))
    await userEvent.click(checkboxOf('Task 02'))

    await userEvent.click(within(bar()).getByRole('button', { name: 'Edit fields' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit 2 rows' })
    const applyButton = within(dialog).getByRole('button', { name: 'Apply to 2' })
    expect(applyButton).toBeDisabled()

    await userEvent.selectOptions(within(dialog).getAllByRole('combobox')[0], 'Set to')
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Owner' }), 'Grace')
    await userEvent.selectOptions(within(dialog).getAllByRole('combobox')[1], 'Clear')
    expect(applyButton).toBeEnabled()

    await userEvent.click(applyButton)
    expect(onApply).toHaveBeenCalledWith(
      { owner: { mode: 'set', value: 'Grace' }, notes: { mode: 'clear' }},
      [{ id: '1', title: 'Task 01' }, { id: '2', title: 'Task 02' }],
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('stays open on what was entered when applying fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const bulkEdit: DataTableBulkEdit<Task> = {
      fields: [{ id: 'owner', label: 'Owner', kind: 'text', canClear: false }],
      onApply: () => Promise.reject(new Error('offline')),
    }
    render(<Harness bulkEdit={bulkEdit} />)
    await userEvent.click(checkboxOf('Task 01'))
    await userEvent.click(within(bar()).getByRole('button', { name: 'Edit fields' }))
    const dialog = screen.getByRole('dialog', { name: 'Edit 1 row' })

    const modeSelect = within(dialog).getByRole('combobox')
    expect(within(modeSelect).queryByRole('option', { name: 'Clear' })).not.toBeInTheDocument()
    await userEvent.selectOptions(modeSelect, 'Set to')
    await userEvent.type(within(dialog).getByRole('textbox', { name: 'Owner' }), 'Ada')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Apply to 1' }))

    expect(screen.getByRole('dialog', { name: 'Edit 1 row' })).toBeInTheDocument()
    expect(within(dialog).getByRole('textbox', { name: 'Owner' })).toHaveValue('Ada')
  })
})

describe('on phones', () => {
  it('turns multi-select off', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      media: query,
      matches: query.includes('max-width'),
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    render(<Harness />)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()

    fireEvent.keyDown(document.body, { key: 'a', ctrlKey: true })
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
  })
})
