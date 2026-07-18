import { createSearchParamsCache, parseAsStringLiteral } from "nuqs/server"

import {
  SUDOKU_DIFFICULTIES,
  SUDOKU_DIFFICULTY_DEFAULT,
  SUDOKU_ROUND_MODES,
  SUDOKU_ROUND_MODE_DEFAULT,
} from "@pasttime/domain/games/sudoku"

/** Shared `difficulty` + `mode` query on launch and play routes. */
export const sudokuSearchParams = {
  difficulty: parseAsStringLiteral(SUDOKU_DIFFICULTIES)
    .withDefault(SUDOKU_DIFFICULTY_DEFAULT)
    .withOptions({ scroll: false }),
  mode: parseAsStringLiteral(SUDOKU_ROUND_MODES)
    .withDefault(SUDOKU_ROUND_MODE_DEFAULT)
    .withOptions({ scroll: false }),
}

export const sudokuSearchParamsCache = createSearchParamsCache(sudokuSearchParams)
