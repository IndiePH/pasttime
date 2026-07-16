import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs/server"

import { CROSSWORD_GRID_SIZE_DEFAULT } from "@pasttime/domain/games/crossword"

const MODE_QUERY_VALUES = ["daily", "random"] as const

export const crosswordSearchParams = {
  size: parseAsInteger.withDefault(CROSSWORD_GRID_SIZE_DEFAULT).withOptions({ scroll: false }),
  mode: parseAsStringLiteral(MODE_QUERY_VALUES).withDefault("daily").withOptions({ scroll: false }),
}

export const crosswordSearchParamsCache = createSearchParamsCache(crosswordSearchParams)