// Copyright © 2026 Jalapeno Labs

import type { ComponentType, ReactNode } from 'react'
import type { DragItem, DraggableItemsProps, RenderItemProps } from './types'

// Core
import { memo, useEffect, useId } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Misc
import { useDraggableContext } from './DragContext'

export function DraggableItems<Item extends DragItem = DragItem>(props: DraggableItemsProps<Item>) {
  const groupId = useId()
  const context = useDraggableContext()
  const itemIds = props.items.map((item) => item.id)

  // Sync registration directly during render — safe because it only writes to a ref.
  // This avoids the overhead of useEffect cleanup/re-register on every render cycle.
  context.registerGroup({
    groupId,
    items: props.items,
    onChange: props.onChange as (items: DragItem[]) => void,
  })

  // Clean up on unmount so deleted groups don't leak in the registry.
  // We extract the stable unregisterGroup callback so this effect doesn't
  // depend on the full context value (which changes on every drag state update).
  const { unregisterGroup } = context
  useEffect(() => {
    return () => unregisterGroup(groupId)
  }, [ groupId, unregisterGroup ])

  const isContainerTarget = context.overGroupId === groupId
  const RenderItem = props.renderItem

  const elements: ReactNode[] = []

  // Show a top indicator when hovering before the first item
  const firstItemId = itemIds[0]
  const showTopIndicator = Boolean(
    isContainerTarget
    && context.overEdge === 'before'
    && firstItemId
    && context.overId === firstItemId,
  )

  if (showTopIndicator) {
    elements.push(<DropIndicator key={`${groupId}-top`} />)
  }

  for (const item of props.items) {
    // Before indicator (skip if already showing top indicator for this item)
    if (!showTopIndicator && context.overId === item.id && context.overEdge === 'before') {
      elements.push(<DropIndicator key={`${item.id}-before`} />)
    }

    elements.push(
      <MemoizedSortableItem
        key={item.id}
        item={item}
        groupId={groupId}
        isDisabled={props.isDisabled}
        renderItem={RenderItem as ComponentType<RenderItemProps>}
      />,
    )

    // After indicator
    if (context.overId === item.id && context.overEdge === 'after') {
      elements.push(<DropIndicator key={`${item.id}-after`} />)
    }
  }

  // Show bottom indicator when hovering over container directly (not a specific item)
  const showBottomIndicator = isContainerTarget && context.overEdge === 'inside' && itemIds.length > 0
  const showEmptyIndicator = isContainerTarget && context.overEdge === 'inside' && itemIds.length === 0

  return <SortableContext
    id={groupId}
    items={itemIds}
    strategy={verticalListSortingStrategy}
  >
    <DroppableContainer
      groupId={groupId}
      className={props.className}
      emptyLabel={props.emptyLabel}
      isEmpty={itemIds.length === 0}
      isDisabled={props.isDisabled}
      showBottomIndicator={showBottomIndicator}
      showEmptyIndicator={showEmptyIndicator}
    >
      {elements}
    </DroppableContainer>
  </SortableContext>
}

// -- Droppable container --

type DroppableContainerProps = {
  groupId: string
  className?: string
  emptyLabel?: string
  isEmpty: boolean
  isDisabled?: boolean
  children: ReactNode
  showBottomIndicator: boolean
  showEmptyIndicator: boolean
}

function DroppableContainer(props: DroppableContainerProps) {
  const { setNodeRef } = useDroppable({
    id: `${props.groupId}-droppable`,
    data: { containerId: props.groupId },
    disabled: props.isDisabled,
  })

  const emptyClassName = [
    'rounded-md border border-dashed border-default-300 px-4 py-6',
    'text-center text-sm text-default-500 select-none',
    props.showEmptyIndicator && 'border-primary-500 text-primary-600 bg-primary-50',
  ].filter(Boolean).join(' ')

  return <ul
    ref={setNodeRef}
    className={props.className}
    style={{ listStyle: 'none', padding: 0, margin: 0, minHeight: props.isEmpty ? 80 : undefined }}
  >
    { props.isEmpty
      ? <>
        { props.showEmptyIndicator ? <DropIndicator /> : null }
        { props.emptyLabel
          ? <li style={{ listStyle: 'none' }} className={emptyClassName}>
            { props.emptyLabel }
          </li>
          : null
        }
      </>
      : <>
        { props.showEmptyIndicator ? <DropIndicator /> : null }
        { props.children }
        { props.showBottomIndicator ? <DropIndicator /> : null }
      </>
    }
  </ul>
}

// -- Sortable item wrapper --

type SortableItemProps = {
  item: DragItem
  groupId: string
  isDisabled?: boolean
  renderItem: ComponentType<RenderItemProps>
}

function SortableItem(props: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.item.id,
    data: {
      type: 'item',
      containerId: props.groupId,
      item: props.item,
    },
    disabled: props.isDisabled,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  }

  const RenderItem = props.renderItem

  return <li
    ref={setNodeRef}
    style={style}
    {...attributes}
    {...listeners}
  >
    <RenderItem
      id={props.item.id}
      item={props.item}
    />
  </li>
}

// Only re-render when the item identity, group assignment, disabled state,
// or render function changes. Drag transform/transition changes are handled
// internally by useSortable.
const MemoizedSortableItem = memo(SortableItem, (previous, next) => {
  return (
    previous.item === next.item
    && previous.groupId === next.groupId
    && previous.isDisabled === next.isDisabled
    && previous.renderItem === next.renderItem
  )
})

// -- Drop indicator --

function DropIndicator() {
  return <li
    aria-hidden='true'
    className='pointer-events-none my-1 h-0.5 w-full rounded-full bg-primary'
    style={{ listStyle: 'none' }}
  />
}
