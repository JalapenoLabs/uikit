// Copyright © 2026 Jalapeno Labs

import type { LiteralUnion, Promisable } from '../types'

export type EventKey = string
export type ValidKeys = LiteralUnion<'Control' | 'Shift' | 'Alt' | 'Meta', EventKey>

export type HotkeyOptions = {
  preventDefault?: boolean
  stopPropagation?: boolean
  blockOtherHotkeys?: boolean
}

type HotkeySubscription = {
  keys: ValidKeys[]
  callback: (event: KeyboardEvent) => Promisable<void>
  options?: HotkeyOptions
}

const keysDown = new Set<EventKey>()
const subscriptions: HotkeySubscription[] = []
let listenersInstalled = false

/**
 * Subscribes to a key combination. The global keyboard listeners are installed
 * lazily on the first subscription, so importing this module has no side
 * effects and is safe under server-side rendering. Returns an unsubscribe
 * function.
 */
export function subscribeHotkey(
  keys: ValidKeys[],
  callback: (event: KeyboardEvent) => Promisable<void>,
  options?: HotkeyOptions,
): () => void {
  installListenersOnce()

  const normalizedKeys = keys.map((key) => key.toLowerCase() as ValidKeys)
  const subscription: HotkeySubscription = {
    keys: normalizedKeys,
    callback,
    options,
  }
  subscriptions.push(subscription)

  return function unsubscribeHotkey() {
    const index = subscriptions.indexOf(subscription)
    if (index !== -1) {
      subscriptions.splice(index, 1)
    }
  }
}

function installListenersOnce() {
  if (listenersInstalled || typeof window === 'undefined') {
    return
  }
  listenersInstalled = true

  window.addEventListener('keydown', async (event) => {
    if (!shouldHandle(event) || event.repeat) {
      return
    }

    keysDown.add(event.key.toLowerCase())
    await processHotkeySubscriptions(event)
  })

  window.addEventListener('keyup', (event) => {
    keysDown.delete(event.key.toLowerCase())
  })

  // Clear held keys whenever focus or visibility is lost, otherwise a key
  // released off-window stays "down" forever.
  window.addEventListener('blur', () => keysDown.clear())
  window.addEventListener('pagehide', () => keysDown.clear())
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      keysDown.clear()
    }
  })
}

async function processHotkeySubscriptions(event: KeyboardEvent) {
  if (keysDown.size === 0) {
    return
  }

  const pending: Promisable<void>[] = []

  for (const subscription of subscriptions) {
    const allKeysDown = subscription.keys.every((key) => keysDown.has(key))
    if (!allKeysDown) {
      continue
    }

    pending.push(subscription.callback(event))

    if (subscription.options?.preventDefault) {
      event.preventDefault()
    }
    if (subscription.options?.stopPropagation) {
      event.stopImmediatePropagation()
      event.stopPropagation()
    }
    if (subscription.options?.blockOtherHotkeys) {
      break
    }
  }

  await Promise.all(pending)
}

function shouldHandle(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null

  const isModifierDown = event.shiftKey || event.ctrlKey || event.altKey || event.metaKey
  const isUserEditing = target?.tagName === 'INPUT'
    || target?.tagName === 'TEXTAREA'
    || Boolean(target?.isContentEditable)

  // Let plain keystrokes flow to inputs; only intercept modifier combinations
  // while the user is typing.
  if (!isModifierDown && isUserEditing) {
    return false
  }

  return true
}
