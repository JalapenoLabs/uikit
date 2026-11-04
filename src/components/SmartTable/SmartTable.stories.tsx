// Copyright © 2026 Jalapeno Labs

import type { Meta, StoryObj } from '@storybook/react'
import type { DataTableRowReorderPayload } from './DataTable.types'

// Core
import { useState } from 'react'

// User interface
import { SmartTable } from './SmartTable'
import { TableTipContent } from './TableTipContent'
import { createManagedColumns } from './createManagedColumns'

type Person = {
  id: string
  name: string
  role: string
  team: string
  joined: string
  bio: string
}

const people: Person[] = [
  {
    id: '1',
    name: 'Ada Lovelace',
    role: 'Engineer',
    team: 'Compilers',
    joined: '2024-01-15',
    bio: 'Wrote the first algorithm intended to be carried out by a machine.',
  },
  {
    id: '2',
    name: 'Grace Hopper',
    role: 'Admiral',
    team: 'Languages',
    joined: '2023-11-02',
    bio: 'Invented one of the first linkers and popularized machine-independent programming languages.',
  },
  {
    id: '3',
    name: 'Katherine Johnson',
    role: 'Mathematician',
    team: 'Trajectories',
    joined: '2024-03-20',
    bio: 'Calculated orbital mechanics critical to the success of the first crewed spaceflights.',
  },
  {
    id: '4',
    name: 'Margaret Hamilton',
    role: 'Engineer',
    team: 'Flight Software',
    joined: '2023-08-11',
    bio: 'Led the team that wrote the on-board flight software for the Apollo missions.',
  },
  {
    id: '5',
    name: 'Annie Easley',
    role: 'Rocket Scientist',
    team: 'Propulsion',
    joined: '2024-06-05',
    bio: 'Developed software for the Centaur rocket stage at NASA.',
  },
]

const columns = createManagedColumns<Person, 'name' | 'role' | 'team' | 'joined'>({
  columnKeys: [ 'name', 'role', 'team', 'joined' ],
  getColumnLabel: (columnKey) => {
    const labelByKey = {
      name: 'Name',
      role: 'Role',
      team: 'Team',
      joined: 'Date joined',
    }
    return labelByKey[columnKey]
  },
  createColumnDef: ({ columnKey, columnLabel }) => ({
    accessorKey: columnKey,
    header: columnLabel,
  }),
})

function SmartTableStory(props: Partial<Parameters<typeof SmartTable<Person>>[0]>) {
  const [ search, setSearch ] = useState('')

  return <SmartTable
    ids={{
      tableElementId: 'story-people-table',
      tableLocalStorageId: 'story-people-table',
    }}
    tableAriaLabel='People'
    data={people}
    managedColumns={columns}
    getRowId={(row) => row.id}
    search={{ value: search, onChange: setSearch }}
    {...props}
  />
}

const meta: Meta<typeof SmartTable<Person>> = {
  title: 'Components/SmartTable',
  component: SmartTable,
  tags: [ 'autodocs' ],
}

export default meta

type Story = StoryObj<typeof SmartTable<Person>>

export const Basic: Story = {
  render: () => <SmartTableStory />,
}

export const WithSelection: Story = {
  render: function WithSelectionStory() {
    const [ search, setSearch ] = useState('')
    const [ rowSelection, setRowSelection ] = useState({})

    return <SmartTable
      ids={{
        tableElementId: 'story-selectable-table',
        tableLocalStorageId: 'story-selectable-table',
      }}
      tableAriaLabel='People'
      data={people}
      managedColumns={columns}
      getRowId={(row) => row.id}
      search={{ value: search, onChange: setSearch }}
      enableSelection
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
    />
  },
}

export const WithPagination: Story = {
  render: function WithPaginationStory() {
    const [ search, setSearch ] = useState('')
    const manyPeople = Array.from({ length: 60 }, (_unused, index) => ({
      ...people[index % people.length],
      id: String(index + 1),
      name: `${people[index % people.length].name} ${index + 1}`,
    }))

    return <SmartTable
      ids={{
        tableElementId: 'story-paginated-table',
        tableLocalStorageId: 'story-paginated-table',
      }}
      tableAriaLabel='People'
      data={manyPeople}
      managedColumns={columns}
      getRowId={(row) => row.id}
      search={{ value: search, onChange: setSearch }}
      pagination={{ show: true, initialPageSize: 10 }}
    />
  },
}

// Small inline icons for the stories; consumers pass their own icon set.
type StoryIconProps = {
  path: string
}

function StoryIcon(props: StoryIconProps) {
  return <svg width={16} height={16} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2}>
    <path d={props.path} />
  </svg>
}

const storyRowActions = [
  {
    id: 'edit',
    label: 'Edit',
    icon: <StoryIcon path='M4 20h4L19 9l-4-4L4 16v4z' />,
    onPress: (row: { original: Person }) => console.log('Edit', row.original),
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: <StoryIcon path='M3 7h18M5 7v13h14V7M9 11h6' />,
    // A promise shows the button loading until it settles.
    onPress: () => new Promise<void>((resolve) => setTimeout(resolve, 1200)),
  },
  {
    id: 'share',
    label: 'Share',
    icon: <StoryIcon path='M4 12v8h16v-8M12 3v13M7 8l5-5 5 5' />,
    onPress: (row: { original: Person }) => console.log('Share', row.original),
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: <StoryIcon path='M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13' />,
    isDanger: true,
    onPress: (row: { original: Person }) => console.log('Delete', row.original),
  },
]

// Hover a row: icon-only buttons with tooltips float over its right side.
// Past three actions, the first two stay and the rest go into the ellipsis menu.
export const WithRowActions: Story = {
  render: () => <SmartTableStory rowActions={storyRowActions} />,
}

// What touch and narrow screens get on their own: the ellipsis menu on every row.
export const WithRowActionsMenu: Story = {
  render: () => <SmartTableStory rowActions={storyRowActions} rowActionsLayout='menu' />,
}

export const WithRowReorder: Story = {
  render: function WithRowReorderStory() {
    const [ rows, setRows ] = useState(people)

    return <SmartTable
      ids={{
        tableElementId: 'story-reorderable-table',
        tableLocalStorageId: 'story-reorderable-table',
      }}
      tableAriaLabel='People'
      data={rows}
      managedColumns={columns}
      getRowId={(row) => row.id}
      enableSorting={false}
      enableRowReorder
      onRowReorder={(payload: DataTableRowReorderPayload<Person>) => setRows(payload.nextRows)}
    />
  },
}

export const WithTooltips: Story = {
  render: function WithTooltipsStory() {
    const [ search, setSearch ] = useState('')
    const tooltipColumns = columns.map((column) => {
      if (column.columnId !== 'name') {
        return column
      }
      return {
        ...column,
        headerTooltip: 'The person\'s full name',
        cellTooltip: (row: Person) => <TableTipContent label={row.name}>{row.bio}</TableTipContent>,
      }
    })

    return <SmartTable
      ids={{
        tableElementId: 'story-tooltip-table',
        tableLocalStorageId: 'story-tooltip-table',
      }}
      tableAriaLabel='People'
      data={people}
      managedColumns={tooltipColumns}
      getRowId={(row) => row.id}
      search={{ value: search, onChange: setSearch }}
    />
  },
}

const longBio = ' Their work changed how every team after them builds, tests, and ships software, '
  + 'and is still taught today as the foundation of the field.'

const bioColumns = createManagedColumns<Person, 'name' | 'role' | 'bio'>({
  columnKeys: [ 'name', 'role', 'bio' ],
  getColumnLabel: (columnKey) => ({ name: 'Name', role: 'Role', bio: 'Biography' })[columnKey],
  createColumnDef: ({ columnKey, columnLabel }) => ({
    accessorFn: (row) => columnKey === 'bio'
      ? row.bio + longBio
      : row[columnKey],
    header: columnLabel,
    size: columnKey === 'bio'
      ? 300
      : 180,
  }),
})

// Every cell clamps to three lines. Click a row to read it in full; clicking
// another row closes the first.
export const WithLongCells: Story = {
  render: () => <SmartTableStory managedColumns={bioColumns} />,
}

// For rows whose click navigates: double-click a clamped cell to read it.
export const WithLongCellsInModal: Story = {
  render: () => <SmartTableStory managedColumns={bioColumns} cellOverflow='modal' />,
}

const titlebarStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  flexWrap: 'wrap',
  marginBottom: 16,
} as const

// The table's search, columns, and export in a page titlebar, through
// `controls.container`. The table keeps their state.
export const InTitlebar: Story = {
  render: function InTitlebarStory() {
    const [ container, setContainer ] = useState<HTMLDivElement | null>(null)

    return <div>
      <header style={titlebarStyle}>
        <h1 style={{ margin: 0, fontSize: 28 }}>People</h1>
        <div ref={setContainer} style={{ display: 'contents' }} />
      </header>
      <SmartTable
        ids={{
          tableElementId: 'story-titlebar-table',
          tableLocalStorageId: 'story-titlebar-table',
        }}
        tableAriaLabel='People'
        data={people}
        managedColumns={columns}
        getRowId={(row) => row.id}
        controls={{ container }}
        csvExport={{ fileName: 'people' }}
      />
    </div>
  },
}

// Without a toolbar the Columns chooser and export still sit above the table.
export const WithoutToolbar: Story = {
  render: () => <SmartTableStory toolbar={{ show: false }} csvExport={{ fileName: 'people' }} />,
}

export const Localized: Story = {
  render: () => <SmartTableStory
    labels={{
      searchPlaceholder: 'Buscar...',
      columns: 'Columnas',
      results: (count) => `${count} resultados`,
    }}
  />,
}
