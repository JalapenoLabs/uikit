// Copyright © 2026 Jalapeno Labs

import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useFilterDrawerState } from './useFilterDrawerState'

type Filters = {
  search: string
  tags: string[]
}

const initialFilters: Filters = {
  search: '',
  tags: [],
}

function cloneFilters(value: Filters): Filters {
  return {
    search: value.search,
    tags: [ ...value.tags ],
  }
}

function renderFilterDrawer(overrides?: Partial<Filters>) {
  return renderHook(() => useFilterDrawerState<Filters>({
    initialFilters: {
      ...initialFilters,
      ...overrides,
    },
    cloneFilters,
  }))
}

describe('useFilterDrawerState', () => {
  it('starts closed with committed and draft both cloned from the initial filters', () => {
    const { result } = renderFilterDrawer({ search: 'ready' })

    expect(result.current.isFilterDrawerOpen).toBe(false)
    expect(result.current.filters).toEqual({ search: 'ready', tags: []})
    expect(result.current.draftFilters).toEqual({ search: 'ready', tags: []})
  })

  it('clones the initial filters so external mutation does not leak into state', () => {
    const mutableInitial: Filters = { search: 'seed', tags: [ 'one' ]}
    const { result } = renderHook(() => useFilterDrawerState<Filters>({
      initialFilters: mutableInitial,
      cloneFilters,
    }))

    mutableInitial.tags.push('two')
    mutableInitial.search = 'mutated'

    expect(result.current.filters).toEqual({ search: 'seed', tags: [ 'one' ]})
    expect(result.current.draftFilters).toEqual({ search: 'seed', tags: [ 'one' ]})
  })

  it('edits the draft without touching the committed filters until save', () => {
    const { result } = renderFilterDrawer()

    act(() => result.current.setDraftFilters({ search: 'pending', tags: [ 'alpha' ]}))

    expect(result.current.draftFilters).toEqual({ search: 'pending', tags: [ 'alpha' ]})
    expect(result.current.filters).toEqual({ search: '', tags: []})
  })

  it('commits the draft into the filters when saved', () => {
    const { result } = renderFilterDrawer()

    act(() => result.current.setDraftFilters({ search: 'committed', tags: [ 'beta' ]}))
    act(() => result.current.handleFilterSave())

    expect(result.current.filters).toEqual({ search: 'committed', tags: [ 'beta' ]})
    expect(result.current.draftFilters).toEqual({ search: 'committed', tags: [ 'beta' ]})
  })

  it('decouples the committed filters from later draft edits after a save', () => {
    const { result } = renderFilterDrawer()

    act(() => result.current.setDraftFilters({ search: 'first', tags: []}))
    act(() => result.current.handleFilterSave())
    act(() => result.current.setDraftFilters({ search: 'second', tags: []}))

    expect(result.current.filters).toEqual({ search: 'first', tags: []})
    expect(result.current.draftFilters).toEqual({ search: 'second', tags: []})
  })

  it('reverts the draft back to the committed filters on cancel', () => {
    const { result } = renderFilterDrawer({ search: 'saved' })

    act(() => result.current.setDraftFilters({ search: 'scratch', tags: [ 'temp' ]}))
    act(() => result.current.handleFilterCancel())

    expect(result.current.draftFilters).toEqual({ search: 'saved', tags: []})
    expect(result.current.filters).toEqual({ search: 'saved', tags: []})
  })

  it('opens the drawer and reseeds the draft from the committed filters', () => {
    const { result } = renderFilterDrawer({ search: 'committed' })

    act(() => result.current.setDraftFilters({ search: 'stale', tags: [ 'leftover' ]}))
    act(() => result.current.handleFilterDrawerOpen())

    expect(result.current.isFilterDrawerOpen).toBe(true)
    expect(result.current.draftFilters).toEqual({ search: 'committed', tags: []})
  })

  it('keeps draft edits while open but discards them when the drawer closes', () => {
    const { result } = renderFilterDrawer({ search: 'committed' })

    act(() => result.current.handleFilterDrawerOpenChange(true))
    act(() => result.current.setDraftFilters({ search: 'typing', tags: [ 'wip' ]}))

    expect(result.current.isFilterDrawerOpen).toBe(true)
    expect(result.current.draftFilters).toEqual({ search: 'typing', tags: [ 'wip' ]})

    act(() => result.current.handleFilterDrawerOpenChange(false))

    expect(result.current.isFilterDrawerOpen).toBe(false)
    expect(result.current.draftFilters).toEqual({ search: 'committed', tags: []})
  })

  it('resets the draft back to the initial filters when cleared', () => {
    // The hook captures `initialFilters` via a lazy useState initializer on first render, so
    // `clearDraftFilters` always reverts the draft to that original baseline rather than to the
    // currently committed filters.
    const { result } = renderFilterDrawer({ search: 'baseline', tags: [ 'persisted' ]})

    act(() => result.current.setDraftFilters({ search: 'committed', tags: [ 'committed-tag' ]}))
    act(() => result.current.handleFilterSave())
    act(() => result.current.setDraftFilters({ search: 'scratch', tags: [ 'temp' ]}))
    act(() => result.current.clearDraftFilters())

    expect(result.current.draftFilters).toEqual({ search: 'baseline', tags: [ 'persisted' ]})
    expect(result.current.filters).toEqual({ search: 'committed', tags: [ 'committed-tag' ]})
  })
})
