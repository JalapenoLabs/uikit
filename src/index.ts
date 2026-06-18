// Copyright © 2026 Jalapeno Labs

// ///////////////////////////// //
//          Components           //
// ///////////////////////////// //

export { Button } from './components/Button/Button'
export type { ButtonProps, ButtonVariant } from './components/Button/Button'

export { FlattenErrors } from './components/FlattenErrors/FlattenErrors'

export { HighlightFuzzy } from './components/HighlightFuzzy/HighlightFuzzy'

export { AnimatedPercent } from './components/AnimatedPercent/AnimatedPercent'

export { CoverageRing } from './components/CoverageRing/CoverageRing'
export {
  getCoverageColor,
  COVERAGE_RED,
  COVERAGE_YELLOW,
  COVERAGE_GREEN,
} from './components/CoverageRing/coverageColor'

export { Loader } from './components/Loader/Loader'
export type { Props as LoaderProps } from './components/Loader/Loader'

export { Timer } from './components/Timer/Timer'
export type { Props as TimerProps } from './components/Timer/Timer'

export { TrimLongText } from './components/TrimLongText/TrimLongText'
export type { TrimLongTextProps } from './components/TrimLongText/TrimLongText'

// ///////////////////////////// //
//             Hooks             //
// ///////////////////////////// //

export { useRepeater } from './hooks/useRepeater'
export { useTimer } from './hooks/useTimer'
export { useRerender } from './hooks/useRerender'
export { useSelection } from './hooks/useSelection'
export type { SelectionInput } from './hooks/useSelection'
export { useSubstringSearch } from './hooks/useSubstringSearch'
export { usePagination } from './hooks/usePagination'
export { useScrollOnMount } from './hooks/useScrollOnMount'
export { useScrollPositionRestore } from './hooks/useScrollPositionRestore'
export { useHotkey } from './hooks/useHotkey'

// ///////////////////////////// //
//           Utilities           //
// ///////////////////////////// //

export { clipText, clipTextFromEnd } from './utils/clipText'
export { getErrorMessage } from './utils/getErrorMessage'
export { getLast } from './utils/getLast'
export { clampPercent, formatPercent } from './utils/percent'
export { reorderArray } from './utils/reorderArray'
export { stringify } from './utils/stringify'
export { formatBytes } from './utils/formatBytes'
export { singleThreadedInterval } from './utils/singleThreadedInterval'
export { singleThreadedPollWithTimeout } from './utils/singleThreadedPollWithTimeout'
export { setTimeoutToNextSecond } from './utils/setTimeoutToNextSecond'
export { fuzzyMatch } from './utils/fuzzyMatch'
export type { FuzzyMatch } from './utils/fuzzyMatch'
export { subscribeHotkey } from './utils/hotkeys'
export type { EventKey, ValidKeys, HotkeyOptions } from './utils/hotkeys'
export { getFileExtension } from './utils/getFileExtension'
export { sanitizeTestName } from './utils/sanitizeTestName'
export { validAbsoluteLinuxFilePathRegex, dotEnvEntryRegex } from './utils/regex'
export { parseJsonSafe, stringifyJsonSafe } from './utils/json'
export type { Validator } from './utils/json'
export { deepDiff } from './utils/deepDiff'
export type { Difference } from './utils/deepDiff'

// ///////////////////////////// //
//        Design tokens          //
// ///////////////////////////// //

export { brandColors } from './theme/tokens'
export type { BrandColorName } from './theme/tokens'

// ///////////////////////////// //
//            Types              //
// ///////////////////////////// //

export type { Promisable, LiteralUnion } from './types'
