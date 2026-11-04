export {
  formatPlayElapsed,
  freshPlayClock,
  livePlayElapsedMs,
  readStoredPlayClock,
  reconcilePlayClock,
  sealPlayClock,
} from "./play-clock"
export type { PlayClock } from "./play-clock"
export {
  buildEnrichedWordIndex,
  getEnrichedWordFromIndex,
  isEnrichedWordLength,
  listEnrichedAnswerWords,
  normalizeLexiconWord as normalizeEnrichedWord,
  type EnrichedWordEntry,
  type EnrichedWordLength,
  type WordDefinition,
} from "./lexicon-types"
export {
  computeTypingMetrics,
  createTypingState,
  getTypingCharacterStatus,
  getTypingEntry,
  normalizeTypingText,
  submitTypingCharacter,
} from "./typing"
export type {
  TypingCharacterStatus,
  TypingEntry,
  TypingInputPolicy,
  TypingMetrics,
  TypingState,
} from "./typing"
