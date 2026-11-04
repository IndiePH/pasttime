import { createSearchParamsCache, parseAsStringLiteral } from "nuqs/server"

import {
  TYPE_RUSH_ROUND_MODE_DEFAULT,
  TYPE_RUSH_ROUND_MODES,
} from "@pasttime/domain/games/type-rush"

const MODE_QUERY_VALUES = [...TYPE_RUSH_ROUND_MODES] as [string, ...string[]]

export const typeRushSearchParams = {
  mode: parseAsStringLiteral(MODE_QUERY_VALUES)
    .withDefault(TYPE_RUSH_ROUND_MODE_DEFAULT)
    .withOptions({ scroll: false, shallow: true }),
}

export const typeRushSearchParamsCache =
  createSearchParamsCache(typeRushSearchParams)
