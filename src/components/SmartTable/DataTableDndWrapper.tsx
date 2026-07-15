// Copyright © 2026 Jalapeno Labs

import type { DragEndEvent } from '@dnd-kit/core'
import type { ReactNode } from 'react'

// Core
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'

type Props = {
  children: ReactNode
  onDragEnd: (event: DragEndEvent) => void
}

/**
 * DndContext wrapper for sortable table rows. The pointer sensor requires a
 * small drag distance before activating so ordinary row clicks (selection,
 * highlighting) never register as drags.
 */
export function DataTableDndWrapper(props: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  )

  return (
    <DndContext sensors={sensors} onDragEnd={props.onDragEnd}>
      {props.children}
    </DndContext>
  )
}
