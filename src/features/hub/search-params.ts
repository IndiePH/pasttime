import {
  createSearchParamsCache,
  parseAsStringLiteral,
} from "nuqs/server"

import type { StatusFilter } from "@/domain/games"

const STATUS_FILTER_VALUES = [
  "all",
  "available",
  "coming_soon",
] as const satisfies readonly StatusFilter[]

export const hubSearchParams = {
  status: parseAsStringLiteral(STATUS_FILTER_VALUES)
    .withDefault("all")
    .withOptions({ scroll: false, shallow: false }),
}

export const hubSearchParamsCache = createSearchParamsCache(hubSearchParams)
