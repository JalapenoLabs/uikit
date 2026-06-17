// Copyright © 2026 Jalapeno Labs

import { describe, it, expect, expectTypeOf } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useSelection } from './useSelection'

type Row = {
  id: number
  label: string
  meta: {
    enabled: boolean
  }
}

const sampleRows: Row[] = [
  { id: 1, label: 'alpha', meta: { enabled: true }},
  { id: 2, label: 'bravo', meta: { enabled: false }},
]

describe('useSelection', () => {
  it('starts empty and unchecked when the full list has items', () => {
    const { result } = renderHook(() => useSelection<Row>(sampleRows))
    expect(result.current.current).toEqual([])
    expect(result.current.allChecked).toBe(false)
    expectTypeOf(result.current.current).toEqualTypeOf<Row[]>()
  })

  it('reports allChecked when the full list is empty', () => {
    const { result } = renderHook(() => useSelection<Row>([]))
    expect(result.current.allChecked).toBe(true)
  })

  it('sets, clears, and replaces the current selection', () => {
    const { result } = renderHook(() => useSelection<Row>(sampleRows))

    act(() => result.current.set([ sampleRows[1] ]))
    expect(result.current.current).toEqual([ sampleRows[1] ])

    act(() => result.current.clear())
    expect(result.current.current).toEqual([])

    act(() => result.current.set(sampleRows))
    expect(result.current.current).toEqual(sampleRows)
  })

  it('adds, detects, and removes selections by deep equality', () => {
    const { result } = renderHook(() => useSelection<Row>(sampleRows))

    act(() => result.current.add({ id: 1, label: 'alpha', meta: { enabled: true }}))
    expect(result.current.has({ id: 1, label: 'alpha', meta: { enabled: true }})).toBe(true)

    act(() => result.current.remove({ id: 1, label: 'alpha', meta: { enabled: true }}))
    expect(result.current.current).toEqual([])
  })

  it('toggles selections and respects forced actions', () => {
    const { result } = renderHook(() => useSelection<Row>(sampleRows))
    const row = sampleRows[0]

    act(() => result.current.toggle(row))
    expect(result.current.current).toEqual([ row ])

    act(() => result.current.toggle(row))
    expect(result.current.current).toEqual([])

    act(() => result.current.toggle(row, 'add'))
    expect(result.current.current).toEqual([ row ])

    act(() => result.current.toggle(row, 'remove'))
    expect(result.current.current).toEqual([])
  })

  it('toggleAll selects everything, then clears when all are selected', () => {
    const { result } = renderHook(() => useSelection<Row>(sampleRows))

    act(() => result.current.toggleAll())
    expect(result.current.current).toEqual(sampleRows)
    expect(result.current.allChecked).toBe(true)

    act(() => result.current.toggleAll())
    expect(result.current.current).toEqual([])
  })

  it('derives selectedKeys and applies onSelectionChange when a key is given', () => {
    const { result } = renderHook(() => useSelection<Row, 'id'>(sampleRows, 'id'))

    act(() => result.current.onSelectionChange(new Set([ '2' ])))
    expect(result.current.selectedKeys).toEqual([ '2' ])
    expect(result.current.current).toEqual([ sampleRows[1] ])

    act(() => result.current.onSelectionChange('all'))
    expect(result.current.current).toEqual(sampleRows)
  })
})
