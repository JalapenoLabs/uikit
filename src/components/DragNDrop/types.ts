// Copyright © 2026 Jalapeno Labs

import type { ComponentType } from 'react'
import type {
  CollisionDetection,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  useSensors,
} from '@dnd-kit/core'

export type DragItem = {
  id: string
} & Record<string, unknown>

export type RenderItemProps<Item extends DragItem = DragItem> = {
  id: string
  item: Item
}

export type DropEdge = 'before' | 'after' | 'inside' | null

export type GroupRegistration<Item extends DragItem = DragItem> = {
  groupId: string
  items: Item[]
  onChange: (items: Item[]) => void
}

export type DraggableContextValue = {
  sensors: ReturnType<typeof useSensors>
  activeItem: DragItem | null
  overId: string | null
  overGroupId: string | null
  overEdge: DropEdge
  collisionDetection: CollisionDetection
  registerGroup: (registration: GroupRegistration) => void
  unregisterGroup: (groupId: string) => void
  handleDragStart: (event: DragStartEvent) => void
  handleDragOver: (event: DragOverEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  handleDragCancel: () => void
}

export type DraggableItemsProps<Item extends DragItem = DragItem> = {
  items: Item[]
  onChange: (items: Item[]) => void
  renderItem: ComponentType<RenderItemProps<Item>>
  className?: string
  emptyLabel?: string
  isDisabled?: boolean
}
