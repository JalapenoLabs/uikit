// Copyright © 2026 Jalapeno Labs

import type { Promisable } from '../types'
import type { ValidKeys, HotkeyOptions } from '../utils/hotkeys'

import { useEffect } from 'react'

import { subscribeHotkey } from '../utils/hotkeys'

/**
 * Subscribes to a keyboard shortcut for the lifetime of the component. The
 * combination is matched case-insensitively (e.g. `['Control', 's']`).
 */
export function useHotkey(
  keys: ValidKeys[],
  callback: (event: KeyboardEvent) => Promisable<void>,
  options?: HotkeyOptions,
) {
  useEffect(() => {
    return subscribeHotkey(keys, callback, options)
  }, [
    ...keys,
    callback,
    options?.preventDefault,
    options?.stopPropagation,
    options?.blockOtherHotkeys,
  ])
}
