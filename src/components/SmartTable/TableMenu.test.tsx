// Copyright © 2026 Jalapeno Labs

import type { TableMenuItem } from './TableMenu'

// Core
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

// User interface
import { TableMenu } from './TableMenu'

type Context = {
  items: TableMenuItem[]
  onOpenChange: ReturnType<typeof vi.fn>
}

beforeEach<Context>((context) => {
  context.onOpenChange = vi.fn()
  context.items = [
    { id: 'open', label: 'Open', onPress: vi.fn() },
    { id: 'rename', label: 'Rename', onPress: vi.fn() },
    { id: 'locked', label: 'Locked', isDisabled: true, onPress: vi.fn() },
  ]
})

function renderMenu(context: Context) {
  return render(<div>
    <TableMenu label='More actions' items={context.items} onOpenChange={context.onOpenChange} />
    <button type='button'>Elsewhere</button>
  </div>)
}

describe('TableMenu', () => {
  it<Context>('opens on press and focuses the first item', async (context) => {
    renderMenu(context)
    const trigger = screen.getByRole('button', { name: 'More actions' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menuitem', { name: 'Open' })).toHaveFocus()
    expect(context.onOpenChange).toHaveBeenLastCalledWith(true)
  })

  it<Context>('moves between enabled items with the arrow keys', async (context) => {
    renderMenu(context)
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }))

    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus()

    // The disabled item is skipped, so moving on wraps back to the first.
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: 'Open' })).toHaveFocus()

    await userEvent.keyboard('{ArrowUp}')
    expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus()
  })

  it<Context>('closes on Escape and returns focus to the trigger', async (context) => {
    renderMenu(context)
    const trigger = screen.getByRole('button', { name: 'More actions' })
    await userEvent.click(trigger)

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(context.onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it<Context>('closes when the pointer presses outside it', async (context) => {
    renderMenu(context)
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }))

    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it<Context>('runs an item and closes', async (context) => {
    renderMenu(context)
    await userEvent.click(screen.getByRole('button', { name: 'More actions' }))

    await userEvent.click(screen.getByRole('menuitem', { name: 'Rename' }))
    expect(context.items[1].onPress).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it<Context>('shows a text trigger without an ellipsis', async (context) => {
    render(<TableMenu label='Change status' triggerContent={<span>Change status</span>} items={context.items} />)
    expect(screen.getByRole('button', { name: 'Change status' })).toHaveAttribute('aria-haspopup', 'menu')
  })
})
