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
