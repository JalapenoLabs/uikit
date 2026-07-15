// Copyright © 2026 Jalapeno Labs

import type { SmartTableLabels } from './labels'
import type { ColumnOrderState, VisibilityState } from '@tanstack/react-table'
import type { DragEndEvent } from '@dnd-kit/core'

// Core
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// User interface
import { TableIcon } from './icons'
import { SmartTableStyles } from './tableStyles'

// Misc
import { defaultSmartTableLabels } from './labels'

type SortableColumnItemProps = {
  id: string
  label: string
  isVisible: boolean
  canToggleVisibility: boolean
  canReorderColumns: boolean
  moveLabel: string
  onVisibilityChange: (id: string, nextVisible: boolean) => void
}

function SortableColumnItem(props: SortableColumnItemProps) {
  const {
    id,
    label,
    isVisible,
    canToggleVisibility,
    canReorderColumns,
    moveLabel,
    onVisibilityChange,
  } = props

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: !canReorderColumns,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging
      ? 1
      : undefined,
  }

  return <div
    ref={setNodeRef}
    style={style}
    className={[
      'jala-table-column-item',
      isDragging ? 'jala-table-column-item--dragging' : '',
    ].join(' ').trim()}
  >
    <div className='jala-table-column-item-label'>
      { canToggleVisibility
        ? (
          <label className='jala-table-column-item-label'>
            <input
              type='checkbox'
              checked={isVisible}
              onChange={(event) => onVisibilityChange(id, event.target.checked)}
              className='jala-table-checkbox'
            />
            <span>{ label }</span>
          </label>
        )
        : <span>{ label }</span>
      }
    </div>
    { canReorderColumns
      ? (
        <button
          type='button'
          aria-label={moveLabel}
          className='jala-table-drag-button'
          {...attributes}
          {...listeners}
        >
          <TableIcon name='dragHandle' size={16} />
        </button>
      )
      : null
    }
  </div>
}

type Props = {
  buttonId: string
  orderedColumnIds: string[]
  columnLabels: Map<string, string>
  columnVisibility: VisibilityState
  setColumnVisibility: (next: VisibilityState | ((current: VisibilityState) => VisibilityState)) => void
  setColumnOrder: (next: ColumnOrderState | ((current: ColumnOrderState) => ColumnOrderState)) => void
  canToggleVisibility: boolean
  canReorderColumns: boolean
  isDisabled?: boolean
  labels?: Partial<SmartTableLabels>
}

/**
 * The "Columns" toolbar button plus its popover: a checkbox list to toggle
 * column visibility and drag handles to reorder columns. The popover closes on
 * outside-click and on Escape.
 */
export function DataTableColumnControls(props: Props) {
  const {
    buttonId,
    orderedColumnIds,
    columnLabels,
    columnVisibility,
    setColumnVisibility,
    setColumnOrder,
    canToggleVisibility,
    canReorderColumns,
    isDisabled = false,
  } = props

  const labels = { ...defaultSmartTableLabels, ...props.labels }

  const [ isOpen, setIsOpen ] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const popoverId = useId()

  useEffect(() => {
    function handlePointerDown(event: globalThis.MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handlePointerDown)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [ isOpen ])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  )

  const handleColumnDragEnd = useCallback((event: DragEndEvent) => {
    if (!canReorderColumns) {
      return
    }
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }
    const oldIndex = orderedColumnIds.indexOf(String(active.id))
    const newIndex = orderedColumnIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) {
      return
    }
    setColumnOrder(arrayMove(orderedColumnIds, oldIndex, newIndex))
  }, [ canReorderColumns, orderedColumnIds, setColumnOrder ])

  const handleColumnVisibilityChange = useCallback((columnId: string, nextVisible: boolean) => {
    if (!canToggleVisibility) {
      return
    }
    setColumnVisibility((current) => {
      const next = { ...current }
      if (nextVisible) {
        delete next[columnId]
      }
      else {
        next[columnId] = false
      }
      return next
    })
  }, [ canToggleVisibility, setColumnVisibility ])

  const hasColumns = orderedColumnIds.length > 0

  return (
    <div className='jala-table-columns' ref={wrapperRef}>
      <SmartTableStyles />
      <button
        type='button'
        className='jala-table-columns-button'
        id={buttonId}
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        aria-controls={popoverId}
        disabled={isDisabled || !hasColumns}
        onClick={() => setIsOpen((previousIsOpen) => !previousIsOpen)}
      >
        <TableIcon name='columns' size={18} />
        <span>{ labels.columns }</span>
      </button>
      { isOpen
        ? (
          <div
            id={popoverId}
            role='dialog'
            aria-label={labels.columns}
            className='jala-table-columns-popover'
          >
            <p className='jala-table-columns-heading'>{ labels.columns }</p>
            <DndContext
              sensors={sensors}
              onDragEnd={handleColumnDragEnd}
            >
              <SortableContext items={orderedColumnIds} strategy={verticalListSortingStrategy}>
                <div className='jala-table-column-list'>
                  { orderedColumnIds.map((columnId) => {
                    const label = columnLabels.get(columnId)
                    if (!label) {
                      return null
                    }
                    const isVisible = columnVisibility[columnId] !== false
                    return (
                      <SortableColumnItem
                        key={columnId}
                        id={columnId}
                        label={label}
                        isVisible={isVisible}
                        canToggleVisibility={canToggleVisibility}
                        canReorderColumns={canReorderColumns}
                        moveLabel={labels.move}
                        onVisibilityChange={handleColumnVisibilityChange}
                      />
                    )
                  }) }
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )
        : null
      }
    </div>
  )
}
