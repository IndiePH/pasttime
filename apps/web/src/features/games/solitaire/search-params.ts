import {
  createSearchParamsCache,
  parseAsStringLiteral,
} from "nuqs/server"

import {
  SOLITAIRE_MODE_DEFAULT,
  SOLITAIRE_MODES,
  SOLITAIRE_ROUND_MODE_DEFAULT,
  SOLITAIRE_ROUND_MODES,
} from "@pasttime/domain/games/solitaire"

/** Shared layout `mode` and round (`daily` | `random`) on launch and play routes. */
export const solitaireSearchParams = {
  mode: parseAsStringLiteral(SOLITAIRE_MODES)
    .withDefault(SOLITAIRE_MODE_DEFAULT)
    .withOptions({ scroll: false, shallow: true }),
  round: parseAsStringLiteral(SOLITAIRE_ROUND_MODES)
    .withDefault(SOLITAIRE_ROUND_MODE_DEFAULT)
    .withOptions({ scroll: false, shallow: true }),
}

export const solitaireSearchParamsCache = createSearchParamsCache(
  solitaireSearchParams,
)
