// Copyright © 2026 Jalapeno Labs

import type {
  CollisionDetection,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import type { DragItem, DropEdge, GroupRegistration, DraggableContextValue } from './types'

// Core
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  pointerWithin,
  closestCenter,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

type GroupLookup = {
  groupId: string
  items: DragItem[]
  onChange: (items: DragItem[]) => void
}

// Consolidated drag state to batch updates into a single re-render
type DragState = {
  activeItem: DragItem | null
  overId: string | null
  overGroupId: string | null
  overEdge: DropEdge
}

const INITIAL_DRAG_STATE: DragState = {
  activeItem: null,
  overId: null,
  overGroupId: null,
  overEdge: null,
}

export function useDraggable(): DraggableContextValue {
  const groupsRef = useRef<Map<string, GroupLookup>>(new Map())

  // Reverse index: itemId -> groupId for O(1) lookups
  const itemIndexRef = useRef<Map<string, string>>(new Map())

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const [ dragState, setDragState ] = useState<DragState>(INITIAL_DRAG_STATE)

  // Mirror overGroupId to a ref so handleDragEnd can read the latest value
  // synchronously. React 18 batches setState updaters, so reading state via
  // a functional updater inside an event handler is not reliable.
  const overGroupIdRef = useRef<string | null>(null)
  useEffect(() => {
    overGroupIdRef.current = dragState.overGroupId
  }, [ dragState.overGroupId ])

  const registerGroup = useCallback((registration: GroupRegistration) => {
    // Clear stale index entries from the previous registration of this group
    const previousGroup = groupsRef.current.get(registration.groupId)
    if (previousGroup) {
      for (const item of previousGroup.items) {
        itemIndexRef.current.delete(item.id)
      }
    }

    groupsRef.current.set(registration.groupId, {
      groupId: registration.groupId,
      items: registration.items,
      onChange: registration.onChange as (items: DragItem[]) => void,
    })

    // Rebuild index entries for this group
    for (const item of registration.items) {
      itemIndexRef.current.set(item.id, registration.groupId)
    }
  }, [])

  const unregisterGroup = useCallback((groupId: string) => {
    const group = groupsRef.current.get(groupId)
    if (group) {
      for (const item of group.items) {
        itemIndexRef.current.delete(item.id)
      }
    }
    groupsRef.current.delete(groupId)
  }, [])

  const resetDragState = useCallback(() => {
    setDragState(INITIAL_DRAG_STATE)
  }, [])

  const collisionDetection: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) {
      return pointerCollisions
    }
    return closestCenter(args)
  }, [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const itemId = String(event.active.id)
    const groupId = itemIndexRef.current.get(itemId)
    const group = groupId ? groupsRef.current.get(groupId) : null
    const item = group?.items.find((entry) => entry.id === itemId) ?? null

    setDragState({
      activeItem: item,
      overId: null,
      overGroupId: null,
      overEdge: null,
    })
  }, [])

  const handleDragCancel = useCallback(() => {
    resetDragState()
  }, [ resetDragState ])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over, delta } = event

    if (!over) {
      setDragState((previous) => {
        if (!previous.overId && !previous.overGroupId && !previous.overEdge) {
          return previous
        }
        return { ...previous, overId: null, overGroupId: null, overEdge: null }
      })
      return
    }

    // Resolve the target group: either from sortable data or droppable data
    const overSortable = over.data.current?.sortable
    const sortableContainerId = overSortable?.containerId as string | undefined
    const droppableContainerId = (
      over.data.current as { containerId?: string } | undefined
    )?.containerId
    const targetGroupId = sortableContainerId ?? droppableContainerId ?? String(over.id)

    if (overSortable) {
      // Determine whether drop should land before or after the hovered item.
      // Prefer the live translated rect; otherwise project the initial rect by
      // the pointer delta. If neither rect is available we default to 'after'.
      const initialRect = active.rect.current.initial
      const translatedRect = active.rect.current.translated ?? (initialRect
        ? {
          top: initialRect.top + delta.y,
          height: initialRect.height,
        }
        : null
      )
      let nextEdge: DropEdge = 'after'
      if (translatedRect) {
        const activeCenterY = translatedRect.top + translatedRect.height / 2
        const overCenterY = over.rect.top + over.rect.height / 2
        nextEdge = activeCenterY <= overCenterY
          ? 'before'
          : 'after'
      }
      const nextOverId = String(over.id)

      setDragState((previous) => {
        if (
          previous.overGroupId === targetGroupId
          && previous.overId === nextOverId
          && previous.overEdge === nextEdge
        ) {
          return previous
        }
        return {
          ...previous,
          overGroupId: targetGroupId,
          overId: nextOverId,
          overEdge: nextEdge,
        }
      })
      return
    }

    // Hovering over a droppable container directly (not a sortable item)
    setDragState((previous) => {
      if (
        previous.overGroupId === targetGroupId
        && previous.overId === null
        && previous.overEdge === 'inside'
      ) {
        return previous
      }
      return {
        ...previous,
        overGroupId: targetGroupId,
        overId: null,
        overEdge: 'inside',
      }
    })
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event
    const activeId = String(active.id)

    const activeContainerId = active.data.current?.sortable?.containerId as string | undefined
    const currentOverGroupId = overGroupIdRef.current

    // Dropped outside any sortable target but inside a container zone
    if (!over && currentOverGroupId && activeContainerId && currentOverGroupId !== activeContainerId) {
      const sourceGroup = groupsRef.current.get(activeContainerId)
      const targetGroup = groupsRef.current.get(currentOverGroupId)

      if (!sourceGroup || !targetGroup) {
        console.debug('useDraggable: missing group metadata on cross-container drop', {
          activeContainerId,
          currentOverGroupId,
        })
        resetDragState()
        return
      }

      const activeIndex = sourceGroup.items.findIndex((item) => item.id === activeId)
      if (activeIndex < 0) {
        console.debug('useDraggable: could not find dragged item in source group', { activeId })
        resetDragState()
        return
      }

      const movedItem = sourceGroup.items[activeIndex]
      sourceGroup.onChange(sourceGroup.items.filter((_, index) => index !== activeIndex))
      targetGroup.onChange([ ...targetGroup.items, movedItem ])
      resetDragState()
      return
    }

    if (!over) {
      resetDragState()
      return
    }

    // Resolve target container
    const overSortable = over.data.current?.sortable
    const sortableContainerId = overSortable?.containerId as string | undefined
    const droppableContainerId = (
      over.data.current as { containerId?: string } | undefined
    )?.containerId
    const targetContainerId = sortableContainerId ?? droppableContainerId ?? String(over.id)

    if (!activeContainerId || !targetContainerId) {
      console.debug('useDraggable: missing container ids on drag end', {
        activeContainerId,
        targetContainerId,
      })
      resetDragState()
      return
    }

    const sourceGroup = groupsRef.current.get(activeContainerId)
    const targetGroup = groupsRef.current.get(targetContainerId)

    if (!sourceGroup || !targetGroup) {
      console.debug('useDraggable: missing group metadata on drag end', {
        activeContainerId,
        targetContainerId,
      })
      resetDragState()
      return
    }

    const activeIndex = sourceGroup.items.findIndex((item) => item.id === activeId)
    if (activeIndex < 0) {
      console.debug('useDraggable: could not find dragged item in source group', { activeId })
      resetDragState()
      return
    }

    const rawOverIndex = overSortable?.index as number | undefined
    const isSameGroup = activeContainerId === targetContainerId
    let overIndex = rawOverIndex ?? (isSameGroup ? activeIndex : targetGroup.items.length)

    // Compute drop edge to match the preview indicator
    let dropEdge: DropEdge = 'inside'
    if (overSortable) {
      // Prefer the live translated rect; otherwise project the initial rect by
      // the pointer delta. If neither rect is available we default to 'after'.
      const initialRect = active.rect.current.initial
      const translatedRect = active.rect.current.translated ?? (initialRect
        ? {
          top: initialRect.top + delta.y,
          height: initialRect.height,
        }
        : null
      )
      dropEdge = 'after'
      if (translatedRect) {
        const activeCenterY = translatedRect.top + translatedRect.height / 2
        const overCenterY = over.rect.top + over.rect.height / 2
        dropEdge = activeCenterY <= overCenterY
          ? 'before'
          : 'after'
      }
    }

    if (dropEdge === 'after' && rawOverIndex !== undefined) {
      overIndex = rawOverIndex + 1
    }
    else if (dropEdge === 'before' && rawOverIndex !== undefined) {
      overIndex = rawOverIndex
    }

    if (!overSortable) {
      overIndex = targetGroup.items.length
    }

    if (isSameGroup) {
      const targetIndex = Math.max(0, Math.min(overIndex, sourceGroup.items.length - 1))
      if (activeIndex !== targetIndex) {
        sourceGroup.onChange(arrayMove(sourceGroup.items, activeIndex, targetIndex))
      }
      resetDragState()
      return
    }

    // Cross-container move
    const movedItem = sourceGroup.items[activeIndex]
    const nextSourceItems = sourceGroup.items.filter((_, index) => index !== activeIndex)
    const nextTargetItems = [ ...targetGroup.items ]
    const boundedIndex = Math.max(0, Math.min(overIndex, nextTargetItems.length))
    nextTargetItems.splice(boundedIndex, 0, movedItem)

    sourceGroup.onChange(nextSourceItems)
    targetGroup.onChange(nextTargetItems)
    resetDragState()
  }, [ resetDragState ])

  return useMemo(() => ({
    sensors,
    activeItem: dragState.activeItem,
    overId: dragState.overId,
    overGroupId: dragState.overGroupId,
    overEdge: dragState.overEdge,
    collisionDetection,
    registerGroup,
    unregisterGroup,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  }), [
    sensors,
    dragState,
    collisionDetection,
    registerGroup,
    unregisterGroup,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  ])
}
