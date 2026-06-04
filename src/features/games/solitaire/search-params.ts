import {
  createSearchParamsCache,
  parseAsStringLiteral,
} from "nuqs/server"

import { SOLITAIRE_MODE_DEFAULT, SOLITAIRE_MODES } from "@/domain/games/solitaire"

/** Shared `mode` query on launch and play routes. */
export const solitaireSearchParams = {
  mode: parseAsStringLiteral(SOLITAIRE_MODES)
    .withDefault(SOLITAIRE_MODE_DEFAULT)
    .withOptions({ scroll: false, shallow: true }),
}

export const solitaireSearchParamsCache = createSearchParamsCache(
  solitaireSearchParams,
)
