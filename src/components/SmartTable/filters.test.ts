// Copyright © 2026 Jalapeno Labs

import type { DataTableManagedColumn } from './DataTable.types'
import type { SmartTableFilter } from './filters'

// Core
import { describe, expect, it } from 'vitest'
import { applyFilters, describeFilter, isFilterValueActive, resolveFilters } from './filters'

// Misc
import { defaultSmartTableLabels } from './labels'

type Task = {
  id: string
  title: string
  state: string
  tags: string[]
  waitingOn: string | null
}

const tasks: Task[] = [
  { id: '1', title: 'Ship the release', state: 'open', tags: [ 'web' ], waitingOn: null },
  { id: '2', title: 'Fix the login bug', state: 'blocked', tags: [ 'web', 'api' ], waitingOn: 'Grace' },
  { id: '3', title: 'Write the docs', state: 'done', tags: [], waitingOn: null },
]

const stateOptions = [
  { value: 'open', label: 'Open' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'done', label: 'Done' },
]

const managedColumns: DataTableManagedColumn<Task>[] = [
  {
    columnId: 'title',
    columnLabel: 'Title',
    filter: { kind: 'text' },
    columnDef: { accessorKey: 'title' },
  },
  {
    columnId: 'state',
    columnLabel: 'State',
    filter: { kind: 'multiSelect', options: stateOptions },
    columnDef: { accessorKey: 'state' },
  },
  {
    columnId: 'tags',
    columnLabel: 'Tags',
    filter: {
      kind: 'select',
      options: [{ value: 'web', label: 'Web' }, { value: 'api', label: 'API' }],
      getValue: (task) => task.tags,
    },
    columnDef: { accessorKey: 'tags' },
  },
  {
    columnId: 'unfiltered',
    columnLabel: 'Unfiltered',
    columnDef: { accessorKey: 'id' },
  },
]

const tableFilters: SmartTableFilter<Task>[] = [
  {
    id: 'waiting',
    label: 'Waiting on someone',
    kind: 'boolean',
    matches: (task, value) => Boolean(task.waitingOn) === value,
  },
  // Applied by the consumer, such as by loading other rows.
  { id: 'deleted', label: 'Deleted', kind: 'boolean' },
]

const filters = resolveFilters(managedColumns, tableFilters)

function ids(rows: Task[]) {
  return rows.map((task) => task.id)
}

describe('resolveFilters', () => {
  it('lists column filters in column order, then the table filters', () => {
    expect(filters.map((filter) => [ filter.id, filter.label ])).toEqual([
      [ 'title', 'Title' ],
      [ 'state', 'State' ],
      [ 'tags', 'Tags' ],
      [ 'waiting', 'Waiting on someone' ],
      [ 'deleted', 'Deleted' ],
    ])
  })
})

describe('applyFilters', () => {
  it('keeps every row while no filter is active', () => {
    expect(applyFilters(tasks, filters, {})).toBe(tasks)
    expect(applyFilters(tasks, filters, { title: '  ', state: [], tags: null })).toBe(tasks)
  })

  it('matches text case-insensitively within the column value', () => {
    expect(ids(applyFilters(tasks, filters, { title: 'LOGIN' }))).toEqual([ '2' ])
    expect(ids(applyFilters(tasks, filters, { title: ' the ' }))).toEqual([ '1', '2', '3' ])
  })

  it('matches a multi-select on any chosen option', () => {
    expect(ids(applyFilters(tasks, filters, { state: [ 'open', 'done' ]}))).toEqual([ '1', '3' ])
  })

  it('matches a select against a list value', () => {
    expect(ids(applyFilters(tasks, filters, { tags: 'api' }))).toEqual([ '2' ])
  })

  it('uses a filter\'s own matcher', () => {
    expect(ids(applyFilters(tasks, filters, { waiting: true }))).toEqual([ '2' ])
    expect(ids(applyFilters(tasks, filters, { waiting: false }))).toEqual([ '1', '3' ])
  })

  it('leaves a table filter without a matcher to the consumer', () => {
    expect(applyFilters(tasks, filters, { deleted: true })).toEqual(tasks)
  })

  it('requires every active filter', () => {
    expect(ids(applyFilters(tasks, filters, { state: [ 'open', 'blocked' ], tags: 'web', waiting: false })))
      .toEqual([ '1' ])
  })
})

describe('isFilterValueActive', () => {
  it('treats unset, blank, and empty values as inactive', () => {
    expect([ null, undefined, '', '  ', []].map(isFilterValueActive)).toEqual([ false, false, false, false, false ])
    expect([ 'x', [ 'a' ], true, false ].map(isFilterValueActive)).toEqual([ true, true, true, true ])
  })
})

describe('describeFilter', () => {
  it('names the filter and its value the way the drawer shows them', () => {
    const [ title, state, tags, waiting ] = filters
    expect(describeFilter(title, '  login ', defaultSmartTableLabels)).toBe('Title: login')
    expect(describeFilter(state, [ 'open', 'blocked' ], defaultSmartTableLabels)).toBe('State: Open, Blocked')
    expect(describeFilter(tags, 'api', defaultSmartTableLabels)).toBe('Tags: API')
    expect(describeFilter(waiting, false, defaultSmartTableLabels)).toBe('Waiting on someone: No')
  })
})
