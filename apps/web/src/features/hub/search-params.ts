import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server"

import type { StatusFilter } from "@pasttime/domain/games"

const STATUS_FILTER_VALUES = [
  "all",
  "available",
  "coming_soon",
] as const satisfies readonly StatusFilter[]

export const hubSearchParams = {
  status: parseAsStringLiteral(STATUS_FILTER_VALUES)
    .withDefault("all")
    .withOptions({ scroll: false, shallow: false }),
  q: parseAsString.withDefault("").withOptions({
    clearOnDefault: true,
    scroll: false,
    shallow: false,
    throttleMs: 300,
  }),
}

export const hubSearchParamsCache = createSearchParamsCache(hubSearchParams)
