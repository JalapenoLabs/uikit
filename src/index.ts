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

export { DragContext, useDraggableContext } from './components/DragNDrop/DragContext'
export { DraggableItems } from './components/DragNDrop/DraggableItems'
export { useDraggable } from './components/DragNDrop/useDraggable'
export type {
  DragItem,
  RenderItemProps,
  DropEdge,
  GroupRegistration,
  DraggableContextValue,
  DraggableItemsProps,
} from './components/DragNDrop/types'

export { Accordion } from './components/Accordion/Accordion'
export type { AccordionProps } from './components/Accordion/Accordion'

export { LuminescentText } from './components/LuminescentText/LuminescentText'
export type { LuminescentTextProps } from './components/LuminescentText/LuminescentText'

export { LanguageSelector } from './components/LanguageSelector/LanguageSelector'
export type { LanguageSelectorProps, LanguageOption } from './components/LanguageSelector/LanguageSelector'
export { getFlagEmoji } from './components/LanguageSelector/getFlagEmoji'

export { ThemeSelector } from './components/ThemeSelector/ThemeSelector'
export type { ThemePreference, ThemeSelectorProps } from './components/ThemeSelector/ThemeSelector'
export {
  ThemePreviewLight,
  ThemePreviewDark,
  ThemePreviewSystem,
} from './components/ThemeSelector/previews'

export { DisabledTimerButton } from './components/DisabledTimerButton/DisabledTimerButton'
export type { DisabledTimerButtonProps } from './components/DisabledTimerButton/DisabledTimerButton'

export { StatusChip } from './components/StatusChip/StatusChip'
export type {
  StatusChipProps,
  StatusTone,
  StatusChipVariant,
  StatusChipSize,
} from './components/StatusChip/StatusChip'

export { Information } from './components/Information/Information'
export type { InformationProps, InformationPlacement } from './components/Information/Information'

export { ChangerButton } from './components/ChangerButton/ChangerButton'
export type { ChangerButtonProps } from './components/ChangerButton/ChangerButton'

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
export { useFilterDrawerState } from './hooks/useFilterDrawerState'
export type { FilterDrawerState } from './hooks/useFilterDrawerState'
export { useDomTheme } from './hooks/useDomTheme'
export type { DomTheme } from './hooks/useDomTheme'

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
