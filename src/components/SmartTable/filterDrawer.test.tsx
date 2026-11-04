// Copyright © 2026 Jalapeno Labs

import type { SmartTableFilter, SmartTableFilterValues } from './filters'
import type { SmartTableProps } from './SmartTable'

// Core
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useState } from 'react'

// User interface
import { SmartTable } from './SmartTable'
import { createManagedColumns } from './createManagedColumns'

type Task = {
  id: string
  title: string
  state: 'open' | 'blocked' | 'done'
  waitingOn: string | null
}

const tasks: Task[] = [
  { id: '1', title: 'Ship the release', state: 'open', waitingOn: null },
  { id: '2', title: 'Fix the login bug', state: 'blocked', waitingOn: 'Grace' },
  { id: '3', title: 'Write the docs', state: 'done', waitingOn: null },
]

const columns = createManagedColumns<Task, 'title' | 'state'>({
  columnKeys: [ 'title', 'state' ],
  getColumnLabel: (columnKey) => columnKey === 'title'
    ? 'Title'
    : 'State',
  getFilter: (columnKey) => {
    if (columnKey !== 'state') {
      return undefined
    }
    return {
      kind: 'multiSelect',
      options: [
        { value: 'open', label: 'Open' },
        { value: 'blocked', label: 'Blocked' },
        { value: 'done', label: 'Done' },
      ],
    }
  },
  createColumnDef: ({ columnKey, columnLabel }) => ({
    accessorKey: columnKey,
    header: columnLabel,
  }),
})

const waitingFilter: SmartTableFilter<Task> = {
  id: 'waiting',
  label: 'Waiting on someone',
  kind: 'boolean',
  matches: (task, value) => Boolean(task.waitingOn) === value,
}
const tableFilters = [ waitingFilter ]

let tableCounter = 0

function Harness(props: Partial<SmartTableProps<Task>>) {
  tableCounter += 1
  return <SmartTable
    ids={{ tableElementId: `filters-${tableCounter}`, tableLocalStorageId: `filters-${tableCounter}` }}
    tableAriaLabel='Tasks'
    data={tasks}
    managedColumns={columns}
    getRowId={(task) => task.id}
    filters={{ definitions: tableFilters }}
    {...props}
  />
}

function titles() {
  const table = screen.getByRole('table', { name: 'Tasks' })
  return within(table).getAllByRole('row').slice(1).map((row) => within(row).getAllByRole('cell')[0].textContent)
}

async function openDrawer() {
  await userEvent.click(screen.getByRole('button', { name: 'Filters' }))
  return screen.getByRole('dialog', { name: 'Filters' })
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('filters drawer', () => {
  it('lists the column filters and the table filters, and applies the draft', async () => {
    render(<Harness />)
    const drawer = await openDrawer()

    await userEvent.click(within(drawer).getByRole('checkbox', { name: 'Open' }))
    await userEvent.click(within(drawer).getByRole('checkbox', { name: 'Blocked' }))
    await userEvent.click(within(within(drawer).getByRole('radiogroup', { name: 'Waiting on someone' }))
      .getByRole('radio', { name: 'No' }))
    // Nothing changes until Apply.
    expect(titles()).toHaveLength(3)

    await userEvent.click(within(drawer).getByRole('button', { name: 'Apply filters' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(titles()).toEqual([ 'Ship the release' ])
  })

  it('applies on Enter', async () => {
    render(<Harness />)
    const drawer = await openDrawer()
    await userEvent.click(within(drawer).getByRole('checkbox', { name: 'Done' }))

    await userEvent.keyboard('{Enter}')
    expect(titles()).toEqual([ 'Write the docs' ])
  })

  it('leaves the filters as they were on Cancel or Escape', async () => {
    render(<Harness />)
    let drawer = await openDrawer()
    await userEvent.click(within(drawer).getByRole('checkbox', { name: 'Done' }))
    await userEvent.click(within(drawer).getByRole('button', { name: 'Cancel' }))
    expect(titles()).toHaveLength(3)

    drawer = await openDrawer()
    expect(within(drawer).getByRole('checkbox', { name: 'Done' })).not.toBeChecked()
    await userEvent.click(within(drawer).getByRole('checkbox', { name: 'Done' }))
    await userEvent.keyboard('{Escape}')
    expect(titles()).toHaveLength(3)
  })

  it('shows how many filters are on', async () => {
    render(<Harness />)
    const drawer = await openDrawer()
    await userEvent.click(within(drawer).getByRole('checkbox', { name: 'Done' }))
    await userEvent.click(within(drawer).getByRole('button', { name: 'Apply filters' }))

    expect(screen.getByRole('button', { name: 'Filters' })).toHaveAccessibleDescription('1 filter on')
  })
})

describe('filter tags', () => {
  it('shows each active filter as a tag that one press removes', async () => {
    render(<Harness filters={{ definitions: tableFilters, values: undefined }} />)
    const drawer = await openDrawer()
    await userEvent.click(within(drawer).getByRole('checkbox', { name: 'Open' }))
    await userEvent.click(within(drawer).getByRole('checkbox', { name: 'Done' }))
    await userEvent.click(within(within(drawer).getByRole('radiogroup')).getByRole('radio', { name: 'No' }))
    await userEvent.click(within(drawer).getByRole('button', { name: 'Apply filters' }))

    const tagList = screen.getByRole('list', { name: 'Active filters' })
    expect(within(tagList).getAllByRole('button').map((tag) => tag.textContent))
      .toEqual([ 'State: Open, Done', 'Waiting on someone: No' ])
    expect(titles()).toEqual([ 'Ship the release', 'Write the docs' ])

    await userEvent.click(within(tagList).getByText('State: Open, Done'))
    expect(screen.getByRole('button', { name: 'Remove filter Waiting on someone: No' })).toBeInTheDocument()
    expect(titles()).toEqual([ 'Ship the release', 'Write the docs' ])

    await userEvent.click(screen.getByRole('button', { name: 'Remove filter Waiting on someone: No' }))
    expect(screen.queryByRole('list', { name: 'Active filters' })).not.toBeInTheDocument()
    expect(titles()).toHaveLength(3)
  })

  it('shows the full text of a tag in a tooltip', async () => {
    render(<Harness filters={{ definitions: tableFilters, values: { state: [ 'open', 'blocked', 'done' ]}}} />)
    await userEvent.hover(screen.getByRole('button', { name: 'Remove filter State: Open, Blocked, Done' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('State: Open, Blocked, Done')
  })
})

describe('filters kept by the consumer', () => {
  it('starts from and reports the consumer\'s values', async () => {
    const onValuesChange = vi.fn()

    function ControlledHarness() {
      const [ values, setValues ] = useState<SmartTableFilterValues>({ state: [ 'blocked' ]})
      return <Harness filters={{
        definitions: tableFilters,
        values,
        onValuesChange: (next) => {
          onValuesChange(next)
          setValues(next)
        },
      }}
      />
    }

    render(<ControlledHarness />)
    expect(titles()).toEqual([ 'Fix the login bug' ])

    await userEvent.click(screen.getByRole('button', { name: 'Remove filter State: Blocked' }))
    expect(onValuesChange).toHaveBeenCalledWith({ state: null })
    expect(titles()).toHaveLength(3)
  })

  it('goes back to the first page when the filters change', async () => {
    const manyTasks = Array.from({ length: 12 }, (_unused, index) => ({
      ...tasks[index % 3],
      id: String(index + 1),
      title: `Task ${String(index + 1).padStart(2, '0')}`,
    }))
    render(<Harness data={manyTasks} pagination={{ show: true, initialPageSize: 5 }} />)

    await userEvent.click(screen.getByRole('button', { name: '2' }))
    expect(titles()[0]).toBe('Task 06')

    const drawer = await openDrawer()
    await userEvent.click(within(drawer).getByRole('checkbox', { name: 'Open' }))
    await userEvent.click(within(drawer).getByRole('button', { name: 'Apply filters' }))
    expect(titles()).toEqual([ 'Task 01', 'Task 04', 'Task 07', 'Task 10' ])
  })
})
