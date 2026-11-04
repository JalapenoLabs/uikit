// Copyright © 2026 Jalapeno Labs

// Inputs that take no typing: keys pressed on them keep their page-wide
// meaning, such as a table's Escape after a click on a row's checkbox.
const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
])

/**
 * Whether keyboard focus is somewhere the user types: a text-like input, a
 * textarea, a select, or editable content. Hotkeys yield to these, so keys
 * keep their usual meaning while typing.
 */
export function isTextEntry(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  if (target.isContentEditable) {
    return true
  }
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
    return true
  }
  if (target instanceof HTMLInputElement) {
    return !NON_TEXT_INPUT_TYPES.has(target.type)
  }
  return false
}
