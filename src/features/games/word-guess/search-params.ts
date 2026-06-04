import {
  createSearchParamsCache,
  parseAsStringLiteral,
} from "nuqs/server"

import {
  WORD_GUESS_ROUND_MODE_DEFAULT,
  WORD_GUESS_ROUND_MODES,
  WORD_GUESS_LENGTH_DEFAULT,
  WORD_GUESS_LENGTHS,
} from "@/domain/games/word-guess"

const LETTERS_QUERY_VALUES = WORD_GUESS_LENGTHS.map((n) => String(n)) as [
  string,
  ...string[],
]
const MODE_QUERY_VALUES = [...WORD_GUESS_ROUND_MODES] as [string, ...string[]]

/** Shared `letters` query on launch and play routes. */
export const wordGuessSearchParams = {
  letters: parseAsStringLiteral(LETTERS_QUERY_VALUES)
    .withDefault(String(WORD_GUESS_LENGTH_DEFAULT))
    .withOptions({ scroll: false, shallow: true }),
  mode: parseAsStringLiteral(MODE_QUERY_VALUES)
    .withDefault(WORD_GUESS_ROUND_MODE_DEFAULT)
    .withOptions({ scroll: false, shallow: true }),
}

export const wordGuessSearchParamsCache = createSearchParamsCache(
  wordGuessSearchParams,
)
