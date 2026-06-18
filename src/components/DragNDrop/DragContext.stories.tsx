// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'
import type { DragItem, RenderItemProps } from './types'

// Core
import { useState } from 'react'

// User interface
import { DragContext } from './DragContext'
import { DraggableItems } from './DraggableItems'

// Misc
import { useDraggable } from './useDraggable'

type FruitItem = DragItem & {
  label: string
}

const INITIAL_FRUITS: FruitItem[] = [
  { id: 'apple', label: 'Apple' },
  { id: 'banana', label: 'Banana' },
  { id: 'cherry', label: 'Cherry' },
  { id: 'date', label: 'Date' },
]

function FruitRow(props: RenderItemProps<FruitItem>) {
  return <div
    style={{
      padding: '8px 12px',
      marginBottom: 6,
      borderRadius: 6,
      border: '1px solid #d1d5db',
      background: '#ffffff',
      cursor: 'grab',
    }}
  >
    { props.item.label }
  </div>
}

// A minimal, interactive sortable list demoing the ported drag-and-drop API.
function SortableFruitList() {
  const context = useDraggable()
  const [ fruits, setFruits ] = useState<FruitItem[]>(INITIAL_FRUITS)

  return <DragContext
    context={context}
    renderOverlay={(activeItem) => {
      if (!activeItem) {
        return null
      }
      return <FruitRow id={activeItem.id} item={activeItem as FruitItem} />
    }}
  >
    <div style={{ width: 260 }}>
      <DraggableItems<FruitItem>
        items={fruits}
        onChange={setFruits}
        renderItem={FruitRow}
        emptyLabel='No fruit left'
      />
    </div>
  </DragContext>
}

const meta: Meta<typeof SortableFruitList> = {
  title: 'Components/DragContext',
  component: SortableFruitList,
  tags: [ 'autodocs' ],
}

export default meta

type Story = StoryObj<typeof SortableFruitList>

export const SortableList: Story = {}
