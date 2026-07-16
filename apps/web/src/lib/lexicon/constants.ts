/** R2 key prefix for shared lexicon shards (product-scoped layout). */
export const LEXICON_KEY_PREFIX = "shared/lexicon/v1"

export const LEXICON_ANSWER_LENGTHS = [5, 6, 7, 8, 9, 10] as const

export type LexiconAnswerLength = (typeof LEXICON_ANSWER_LENGTHS)[number]

export function lexiconAnswersKey(length: number): string {
  return `${LEXICON_KEY_PREFIX}/answers/${length}.json`
}

export function lexiconGuessableKey(length: number): string {
  return `${LEXICON_KEY_PREFIX}/guessable/${length}.json`
}

export const LEXICON_CROSSWORD_ANSWERS_KEY = `${LEXICON_KEY_PREFIX}/crossword/answers.json`
