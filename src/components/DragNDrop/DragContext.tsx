// Copyright © 2026 Jalapeno Labs

import type { ReactNode } from 'react'
import type { Modifier } from '@dnd-kit/core'
import type { DraggableContextValue } from './types'

// Core
import { createContext, useContext } from 'react'
import { DndContext, DragOverlay } from '@dnd-kit/core'

const DraggableContext = createContext<DraggableContextValue | null>(null)

export function useDraggableContext(): DraggableContextValue {
  const context = useContext(DraggableContext)
  if (!context) {
    throw new Error('useDraggableContext must be used within a <DragContext>')
  }
  return context
}

type Props = {
  context: DraggableContextValue
  children: ReactNode
  renderOverlay?: (item: DraggableContextValue['activeItem']) => ReactNode
  overlayModifiers?: Modifier[]
}

export function DragContext(props: Props) {
  const {
    renderOverlay,
  } = props

  return <DraggableContext.Provider value={props.context}>
    <DndContext
      sensors={props.context.sensors}
      collisionDetection={props.context.collisionDetection}
      onDragStart={props.context.handleDragStart}
      onDragOver={props.context.handleDragOver}
      onDragEnd={props.context.handleDragEnd}
      onDragCancel={props.context.handleDragCancel}
    >
      {props.children}
      <DragOverlay dropAnimation={null} modifiers={props.overlayModifiers}>
        { props.context.activeItem && renderOverlay
          ? renderOverlay(props.context.activeItem)
          : null
        }
      </DragOverlay>
    </DndContext>
  </DraggableContext.Provider>
}
