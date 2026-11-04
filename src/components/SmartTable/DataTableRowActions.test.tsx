// Copyright © 2026 Jalapeno Labs

import type { DataTableAction, DataTableRowActionsLayout } from './DataTable.types'

// Core
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

// User interface
import { SmartTable } from './SmartTable'
import { createManagedColumns } from './createManagedColumns'

type Person = {
  id: string
  name: string
}

const people: Person[] = [
  { id: '1', name: 'Ada Lovelace' },
  { id: '2', name: 'Grace Hopper' },
]

const columns = createManagedColumns<Person, 'name'>({
  columnKeys: [ 'name' ],
  getColumnLabel: () => 'Name',
  createColumnDef: ({ columnKey, columnLabel }) => ({
    accessorKey: columnKey,
    header: columnLabel,
  }),
})

function icon(name: string) {
  return <svg data-testid={`icon-${name}`} />
}

let tableCounter = 0

type HarnessProps = {
  rowActions: DataTableAction<Person>[]
  rowActionsLayout?: DataTableRowActionsLayout
  onHighlightedRowChange?: (rowId: string | null) => void
}

function Harness(props: HarnessProps) {
  tableCounter += 1
  return <SmartTable
    ids={{ tableElementId: `row-actions-${tableCounter}`, tableLocalStorageId: `row-actions-${tableCounter}` }}
    tableAriaLabel='People'
    data={people}
    managedColumns={columns}
    getRowId={(person) => person.id}
    rowActions={props.rowActions}
    rowActionsLayout={props.rowActionsLayout}
    enableRowHighlight={Boolean(props.onHighlightedRowChange)}
    onHighlightedRowChange={props.onHighlightedRowChange}
  />
}

function rowOf(name: string) {
  const row = screen.getByText(name).closest('tr')
  if (!row) {
    throw new Error(`No row holds ${name}`)
  }
  return row
}

type Context = {
  user: ReturnType<typeof userEvent.setup>
  onEdit: ReturnType<typeof vi.fn>
  onArchive: ReturnType<typeof vi.fn>
  onShare: ReturnType<typeof vi.fn>
  onDelete: ReturnType<typeof vi.fn>
  actions: DataTableAction<Person>[]
}

beforeEach<Context>((context) => {
  window.localStorage.clear()
  // The hover tray is revealed by a CSS :hover the test DOM cannot apply, so
  // its buttons read as pointer-events: none here; a browser reveals them.
  context.user = userEvent.setup({ pointerEventsCheck: 0 })
  context.onEdit = vi.fn()
  context.onArchive = vi.fn()
  context.onShare = vi.fn()
  context.onDelete = vi.fn()
  context.actions = [
    { id: 'edit', label: 'Edit', icon: icon('edit'), onPress: context.onEdit },
    { id: 'delete', label: 'Delete', icon: icon('delete'), isDanger: true, onPress: context.onDelete },
    { id: 'archive', label: 'Archive', icon: icon('archive'), onPress: context.onArchive },
    { id: 'share', label: 'Share', icon: icon('share'), onPress: context.onShare },
  ]
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('row actions on hover screens', () => {
  it<Context>('shows up to three actions as icon-only buttons named by their label', async (context) => {
    render(<Harness rowActions={context.actions.slice(0, 3)} rowActionsLayout='hover' />)

    const row = rowOf('Ada Lovelace')
    const editButton = within(row).getByRole('button', { name: 'Edit' })
    expect(editButton).not.toHaveTextContent('Edit')
    expect(within(row).getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: 'Archive' })).toBeInTheDocument()
    expect(within(row).queryByRole('button', { name: 'More actions' })).not.toBeInTheDocument()

    await context.user.click(editButton)
    expect(context.onEdit).toHaveBeenCalledTimes(1)
    expect(context.onEdit.mock.calls[0][0].original).toEqual(people[0])
  })

  it<Context>('names each icon-only button in a tooltip', async (context) => {
    render(<Harness rowActions={context.actions.slice(0, 1)} rowActionsLayout='hover' />)

    await context.user.hover(within(rowOf('Ada Lovelace')).getByRole('button', { name: 'Edit' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Edit')
  })

  it<Context>('keeps two buttons and moves the rest into the ellipsis menu past three', async (context) => {
    render(<Harness rowActions={context.actions} rowActionsLayout='hover' />)

    const row = rowOf('Ada Lovelace')
    expect(within(row).getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(within(row).getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(within(row).queryByRole('button', { name: 'Archive' })).not.toBeInTheDocument()

    await context.user.click(within(row).getByRole('button', { name: 'More actions' }))
    const menu = screen.getByRole('menu', { name: 'More actions' })
    const items = within(menu).getAllByRole('menuitem')
    expect(items.map((item) => item.textContent)).toEqual([ 'Archive', 'Share' ])

    await context.user.click(within(menu).getByRole('menuitem', { name: 'Share' }))
    expect(context.onShare).toHaveBeenCalledTimes(1)
    expect(context.onShare.mock.calls[0][0].original).toEqual(people[0])
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it<Context>('hides actions that are not visible for a row and disables those that are disabled', (context) => {
    const actions: DataTableAction<Person>[] = [
      { ...context.actions[0], isVisible: (row) => row.original.id === '1' },
      { ...context.actions[2], isDisabled: true },
    ]
    render(<Harness rowActions={actions} rowActionsLayout='hover' />)

    expect(within(rowOf('Ada Lovelace')).getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    expect(within(rowOf('Grace Hopper')).queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(within(rowOf('Grace Hopper')).getByRole('button', { name: 'Archive' })).toBeDisabled()
  })

  it<Context>('shows an action loading until the promise it returns settles', async (context) => {
    let finish = () => {}
    const slowAction: DataTableAction<Person> = {
      ...context.actions[0],
      onPress: () => new Promise<void>((resolve) => {
        finish = resolve
      }),
    }
    render(<Harness rowActions={[ slowAction ]} rowActionsLayout='hover' />)

    const button = within(rowOf('Ada Lovelace')).getByRole('button', { name: 'Edit' })
    await context.user.click(button)
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()

    await act(async () => finish())
    expect(button).not.toHaveAttribute('aria-busy')
    expect(button).toBeEnabled()
  })

  it<Context>('never counts an action press as a click on its row', async (context) => {
    const onHighlightedRowChange = vi.fn()
    render(<Harness
      rowActions={context.actions}
      rowActionsLayout='hover'
      onHighlightedRowChange={onHighlightedRowChange}
    />)

    const row = rowOf('Ada Lovelace')
    await context.user.click(within(row).getByRole('button', { name: 'Edit' }))
    await context.user.click(within(row).getByRole('button', { name: 'More actions' }))
    // The menu renders in a portal, and React bubbles its clicks to the row.
    await context.user.click(screen.getByRole('menuitem', { name: 'Archive' }))

    expect(onHighlightedRowChange).not.toHaveBeenCalled()
    expect(context.onArchive).toHaveBeenCalledTimes(1)
  })
})

describe('row actions on screens that cannot hover', () => {
  it<Context>('puts every action in the ellipsis menu, dangerous ones last below a divider', async (context) => {
    render(<Harness rowActions={context.actions} rowActionsLayout='menu' />)

    const row = rowOf('Ada Lovelace')
    expect(within(row).queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()

    await context.user.click(within(row).getByRole('button', { name: 'More actions' }))
    const menu = screen.getByRole('menu')
    expect(within(menu).getAllByRole('menuitem').map((item) => item.textContent))
      .toEqual([ 'Edit', 'Archive', 'Share', 'Delete' ])
    expect(within(menu).getByRole('separator')).toBeInTheDocument()

    await context.user.click(within(menu).getByRole('menuitem', { name: 'Delete' }))
    expect(context.onDelete).toHaveBeenCalledTimes(1)
  })

  it<Context>('chooses the menu on its own where the screen cannot hover', (context) => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      media: query,
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    render(<Harness rowActions={context.actions.slice(0, 1)} />)

    const row = rowOf('Ada Lovelace')
    expect(within(row).queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
    expect(within(row).getByRole('button', { name: 'More actions' })).toBeInTheDocument()
  })
})
