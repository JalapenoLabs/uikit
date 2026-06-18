// Copyright © 2026 Jalapeno Labs

import type { DragItem, RenderItemProps } from './types'

// Core
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

// User interface
import { DragContext, useDraggableContext } from './DragContext'
import { DraggableItems } from './DraggableItems'

// Misc
import { useDraggable } from './useDraggable'

type FruitItem = DragItem & {
  label: string
}

const FRUITS: FruitItem[] = [
  { id: 'apple', label: 'Apple' },
  { id: 'banana', label: 'Banana' },
  { id: 'cherry', label: 'Cherry' },
]

function FruitRow(props: RenderItemProps<FruitItem>) {
  return <span>{props.item.label}</span>
}

// A small harness wiring useDraggable -> DragContext -> DraggableItems, mirroring
// the public API consumers are expected to use.
function FruitListHarness() {
  const context = useDraggable()

  return <DragContext context={context}>
    <DraggableItems<FruitItem>
      items={FRUITS}
      onChange={() => undefined}
      renderItem={FruitRow}
    />
  </DragContext>
}

describe('DragContext', () => {
  it('renders every item supplied to DraggableItems', () => {
    render(<FruitListHarness />)

    for (const fruit of FRUITS) {
      expect(screen.getByText(fruit.label)).toBeInTheDocument()
    }
  })

  it('renders the items inside a single sortable list element', () => {
    const { container } = render(<FruitListHarness />)

    const lists = container.querySelectorAll('ul')
    expect(lists).toHaveLength(1)

    // Each item is rendered as a list item wrapping its row.
    const listItems = container.querySelectorAll('li')
    expect(listItems).toHaveLength(FRUITS.length)
  })

  it('renders the empty label when no items are provided', () => {
    function EmptyHarness() {
      const context = useDraggable()
      return <DragContext context={context}>
        <DraggableItems<FruitItem>
          items={[]}
          onChange={() => undefined}
          renderItem={FruitRow}
          emptyLabel='No fruit here'
        />
      </DragContext>
    }

    render(<EmptyHarness />)
    expect(screen.getByText('No fruit here')).toBeInTheDocument()
  })

  it('throws when useDraggableContext is used outside of a DragContext provider', () => {
    function OrphanConsumer() {
      useDraggableContext()
      return null
    }

    // The provider guard should surface a descriptive error rather than failing silently.
    expect(() => render(<OrphanConsumer />)).toThrow('useDraggableContext must be used within a <DragContext>')
  })
})
