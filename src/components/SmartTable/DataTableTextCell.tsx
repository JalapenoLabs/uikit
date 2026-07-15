// Copyright © 2026 Jalapeno Labs

// Core
import { useLayoutEffect, useRef } from 'react'

// User interface
import { HighlightFuzzy } from '../HighlightFuzzy/HighlightFuzzy'

export type DataTableTextCellProps = {
  text: string
  searchTerm?: string
  isHighlighted: boolean
  isResizingColumn: boolean
  shouldAnimateExpand: boolean
  widthPx: number
}

const CLAMP_CLASS_NAME = 'jala-table-clamp3'

/**
 * The standard text cell: clamps to three lines, highlights the search term,
 * and expands with a height animation when its row is highlighted. The height
 * animation is measured manually (clamp height vs. full scrollHeight) because
 * CSS cannot transition between `-webkit-line-clamp` states.
 */
export function DataTableTextCell(props: DataTableTextCellProps) {
  const textClassName = props.isHighlighted
    ? 'jala-table-text-cell'
    : `jala-table-text-cell ${CLAMP_CLASS_NAME}`
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const wasHighlightedRef = useRef(false)
  const transitionEndHandlerRef = useRef<((event: TransitionEvent) => void) | null>(null)

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const content = contentRef.current
    if (!wrapper || !content) {
      return () => {}
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (transitionEndHandlerRef.current) {
      wrapper.removeEventListener('transitionend', transitionEndHandlerRef.current)
      transitionEndHandlerRef.current = null
    }

    let shouldAnimate = false
    let startHeight = 0
    let endHeight = 0

    if (!props.isHighlighted && !wasHighlightedRef.current) {
      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        if (transitionEndHandlerRef.current) {
          wrapper.removeEventListener('transitionend', transitionEndHandlerRef.current)
          transitionEndHandlerRef.current = null
        }
      }
    }

    if (!props.isHighlighted) {
      wrapper.style.height = ''
    }
    else if (!wasHighlightedRef.current && props.shouldAnimateExpand) {
      if (props.isResizingColumn) {
        wrapper.style.height = 'auto'
      }
      else {
        // Measure the clamped height, then the expanded height, and animate
        // between the two. The forced offsetHeight reads flush layout so the
        // measurements are taken against the correct state.
        content.classList.add(CLAMP_CLASS_NAME)
        wrapper.style.height = ''
        void wrapper.offsetHeight
        startHeight = Math.ceil(wrapper.getBoundingClientRect().height)
        content.classList.remove(CLAMP_CLASS_NAME)
        void wrapper.offsetHeight
        endHeight = Math.ceil(content.scrollHeight)
        wrapper.style.height = `${startHeight}px`
        if (Math.abs(endHeight - startHeight) <= 1) {
          wrapper.style.height = 'auto'
        }
        else {
          shouldAnimate = true
        }
      }
    }
    else {
      wrapper.style.height = 'auto'
    }

    if (shouldAnimate) {
      void wrapper.offsetHeight
      animationFrameRef.current = requestAnimationFrame(() => {
        wrapper.style.height = `${endHeight}px`
        animationFrameRef.current = null
      })
      const handleTransitionEnd = (event: TransitionEvent) => {
        if (event.target !== wrapper || event.propertyName !== 'height') {
          return
        }
        wrapper.style.height = 'auto'
        if (transitionEndHandlerRef.current) {
          wrapper.removeEventListener('transitionend', transitionEndHandlerRef.current)
          transitionEndHandlerRef.current = null
        }
      }
      transitionEndHandlerRef.current = handleTransitionEnd
      wrapper.addEventListener('transitionend', handleTransitionEnd)
    }

    wasHighlightedRef.current = props.isHighlighted

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      if (transitionEndHandlerRef.current) {
        wrapper.removeEventListener('transitionend', transitionEndHandlerRef.current)
        transitionEndHandlerRef.current = null
      }
    }
  }, [
    props.text,
    props.searchTerm,
    props.widthPx,
    props.isHighlighted,
    props.shouldAnimateExpand,
    props.isResizingColumn,
  ])

  const trimmedSearch = props.searchTerm?.trim()

  return (
    <div
      style={{
        overflow: 'hidden',
        transition: props.isHighlighted && !props.isResizingColumn
          ? 'height 200ms ease-in-out, opacity 200ms ease-in-out'
          : 'opacity 200ms ease-in-out',
        opacity: props.isHighlighted
          ? 1
          : 0.9,
      }}
      ref={wrapperRef}
    >
      <div ref={contentRef} className={textClassName}>
        { trimmedSearch
          ? (
            <HighlightFuzzy
              text={props.text}
              query={props.searchTerm}
            />
          )
          : <p>{ props.text }</p>
        }
      </div>
    </div>
  )
}
