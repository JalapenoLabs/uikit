// Copyright © 2026 Jalapeno Labs

import type {
  DataTableBulkEdit,
  DataTableBulkEditChanges,
  DataTableBulkEditField,
} from './DataTable.types'
import type { SmartTableLabels } from './labels'
import type { RowData } from '@tanstack/react-table'

// Core
import { useId, useState } from 'react'

// User interface
import { TableDialog } from './TableDialog'
import { TableIcon } from './icons'
import { TableTooltip } from './TableTooltip'

type Mode = 'keep' | 'set' | 'clear'

type FieldDraft = {
  mode: Mode
  value: string
}

type Props<TData extends RowData> = {
  bulkEdit: DataTableBulkEdit<TData>
  rows: TData[]
  labels: SmartTableLabels
  onClose: () => void
}

type FieldProps = {
  field: DataTableBulkEditField
  draft: FieldDraft
  labels: SmartTableLabels
  onChange: (draft: FieldDraft) => void
}

function BulkEditField(props: FieldProps) {
  const { field, draft, labels, onChange } = props
  const modeId = useId()
  const valueId = useId()

  const modes: { mode: Mode, label: string }[] = [
    { mode: 'keep', label: labels.keepAsIs },
    { mode: 'set', label: labels.setTo },
  ]
  if (field.canClear !== false) {
    modes.push({ mode: 'clear', label: labels.clearField })
  }

  let valueInput = null
  if (draft.mode === 'set') {
    const valueProps = {
      'id': valueId,
      'aria-label': field.label,
      'value': draft.value,
    }
    if (field.kind === 'select') {
      valueInput = <select
        {...valueProps}
        className='jala-table-native-select'
        onChange={(event) => onChange({ ...draft, value: event.target.value })}
      >
        <option value='' disabled>{ field.label }</option>
        { field.options?.map((option) => <option key={option.value} value={option.value}>{ option.label }</option>) }
      </select>
    }
    else if (field.kind === 'textarea') {
      valueInput = <textarea
        {...valueProps}
        rows={4}
        className='jala-table-text-input jala-table-textarea'
        onChange={(event) => onChange({ ...draft, value: event.target.value })}
      />
    }
    else {
      valueInput = <input
        {...valueProps}
        type='text'
        autoComplete='off'
        className='jala-table-text-input'
        onChange={(event) => onChange({ ...draft, value: event.target.value })}
      />
    }
  }

  return <div className='jala-table-field'>
    <label className='jala-table-field-label' htmlFor={modeId}>{ field.label }</label>
    <select
      id={modeId}
      className='jala-table-native-select'
      value={draft.mode}
      onChange={(event) => {
        const mode = modes.find((entry) => entry.mode === event.target.value)?.mode ?? 'keep'
        onChange({ ...draft, mode })
      }}
    >
      { modes.map((entry) => <option key={entry.mode} value={entry.mode}>{ entry.label }</option>) }
    </select>
    { valueInput }
  </div>
}

/**
 * Edits the selected rows together. Each field is kept as is, set to a value,
 * or cleared; nothing changes until the user applies, and only the fields they
 * chose to change reach `onApply`.
 */
export function DataTableBulkEditDialog<TData extends RowData>(props: Props<TData>) {
  const { bulkEdit, rows, labels, onClose } = props
  const [ drafts, setDrafts ] = useState<Record<string, FieldDraft>>({})
  const [ isApplying, setIsApplying ] = useState(false)

  const changes: DataTableBulkEditChanges = {}
  let isComplete = true
  for (const field of bulkEdit.fields) {
    const draft = drafts[field.id]
    if (draft?.mode === 'clear') {
      changes[field.id] = { mode: 'clear' }
    }
    if (draft?.mode === 'set') {
      changes[field.id] = { mode: 'set', value: draft.value }
      // "Set to" nothing is not a change anyone means; Clear is for that.
      if (!draft.value.trim()) {
        isComplete = false
      }
    }
  }
  const canApply = Object.keys(changes).length > 0 && isComplete && !isApplying

  const hasNothingToApply = !canApply && !isApplying
  const applyButton = <button
    type='button'
    className='jala-table-button jala-table-button--primary'
    disabled={!canApply}
    aria-busy={isApplying || undefined}
    onClick={apply}
  >
    { isApplying
      ? <TableIcon name='spinner' size={16} className='jala-table-spin' />
      : null
    }
    <span>{ labels.applyBulkEdit(rows.length) }</span>
  </button>

  async function apply() {
    if (!canApply) {
      return
    }
    setIsApplying(true)
    try {
      await bulkEdit.onApply(changes, rows)
      onClose()
    }
    catch (error) {
      // The consumer reports the failure; the dialog stays open on what was
      // entered so nothing is lost.
      console.warn('Bulk edit was not applied', error)
      setIsApplying(false)
    }
  }

  return <TableDialog
    title={labels.bulkEditTitle(rows.length)}
    onClose={onClose}
    onEnter={apply}
    footer={<>
      <button type='button' className='jala-table-button' onClick={onClose}>
        <span>{ labels.cancel }</span>
      </button>
      {/* A disabled button says why in a tooltip, whose wrapper can still be hovered. */}
      <TableTooltip content={labels.bulkEditNothingChosen} isDisabled={!hasNothingToApply}>{
        applyButton
      }</TableTooltip>
    </>}
  >
    <div className='jala-table-field-list'>
      { bulkEdit.fields.map((field) => <BulkEditField
        key={field.id}
        field={field}
        draft={drafts[field.id] ?? { mode: 'keep', value: '' }}
        labels={labels}
        onChange={(draft) => setDrafts((current) => ({ ...current, [field.id]: draft }))}
      />) }
    </div>
  </TableDialog>
}
