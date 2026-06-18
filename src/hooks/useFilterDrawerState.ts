// Copyright © 2026 Jalapeno Labs

// Core
import { useCallback, useState } from 'react'

type UseFilterDrawerStateOptions<Filters> = {
  initialFilters: Filters
  cloneFilters: (value: Filters) => Filters
}

/**
 * Manages a draft/committed filter pair for a save-or-cancel drawer pattern.
 *
 * The committed `filters` only change when the caller explicitly saves, while the user edits
 * a `draftFilters` copy in the meantime. Opening the drawer, closing without saving, or cancelling
 * all revert the draft back to the committed value so abandoned edits never leak through.
 *
 * `cloneFilters` is supplied by the caller so the hook stays dependency-free and the caller controls
 * how deep the copy needs to be for their particular filter shape.
 */
export function useFilterDrawerState<Filters>(options: UseFilterDrawerStateOptions<Filters>) {
  const { initialFilters, cloneFilters } = options

  const [ filters, setFilters ] = useState<Filters>(() => cloneFilters(initialFilters))
  const [ draftFilters, setDraftFilters ] = useState<Filters>(() => cloneFilters(initialFilters))
  const [ isFilterDrawerOpen, setIsFilterDrawerOpen ] = useState(false)

  const handleFilterDrawerOpen = useCallback(() => {
    setDraftFilters(cloneFilters(filters))
    setIsFilterDrawerOpen(true)
  }, [ cloneFilters, filters ])

  const handleFilterDrawerOpenChange = useCallback((nextOpen: boolean) => {
    setIsFilterDrawerOpen(nextOpen)
    if (!nextOpen) {
      setDraftFilters(cloneFilters(filters))
    }
  }, [ cloneFilters, filters ])

  const handleFilterSave = useCallback(() => {
    setFilters(cloneFilters(draftFilters))
  }, [ cloneFilters, draftFilters ])

  const handleFilterCancel = useCallback(() => {
    setDraftFilters(cloneFilters(filters))
  }, [ cloneFilters, filters ])

  const clearDraftFilters = useCallback(() => {
    setDraftFilters(cloneFilters(initialFilters))
  }, [ cloneFilters, initialFilters ])

  return {
    filters,
    draftFilters,
    setDraftFilters,
    isFilterDrawerOpen,
    handleFilterDrawerOpen,
    handleFilterDrawerOpenChange,
    handleFilterSave,
    handleFilterCancel,
    clearDraftFilters,
  } as const
}

export type FilterDrawerState<Filters> = ReturnType<typeof useFilterDrawerState<Filters>>
