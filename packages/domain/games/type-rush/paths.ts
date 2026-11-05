import { gameLaunchPath, gamePlayPath } from "../paths"

import {
  TYPE_RUSH_CONTENT_TYPE_DEFAULT,
  TYPE_RUSH_ROUND_MODE_DEFAULT,
  type TypeRushContentType,
  type TypeRushRoundMode,
} from "./settings"

function withTypeRushQuery(
  path: string,
  mode: TypeRushRoundMode,
  contentType: TypeRushContentType,
  fresh: boolean
): string {
  const query: string[] = []
  if (mode !== TYPE_RUSH_ROUND_MODE_DEFAULT) {
    query.push(`mode=${encodeURIComponent(mode)}`)
  }
  if (contentType !== TYPE_RUSH_CONTENT_TYPE_DEFAULT) {
    query.push(`content=${encodeURIComponent(contentType)}`)
  }
  if (fresh) {
    query.push("fresh=true")
  }

  if (query.length === 0) {
    return path
  }

  return `${path}?${query.join("&")}`
}

export function typeRushLaunchPath(
  mode: TypeRushRoundMode = TYPE_RUSH_ROUND_MODE_DEFAULT,
  contentType: TypeRushContentType = TYPE_RUSH_CONTENT_TYPE_DEFAULT,
  fresh = false
): string {
  return withTypeRushQuery(
    gameLaunchPath("type-rush"),
    mode,
    contentType,
    fresh
  )
}

export function typeRushPlayPath(
  mode: TypeRushRoundMode = TYPE_RUSH_ROUND_MODE_DEFAULT,
  contentType: TypeRushContentType = TYPE_RUSH_CONTENT_TYPE_DEFAULT,
  fresh = false
): string {
  return withTypeRushQuery(
    gamePlayPath("type-rush"),
    mode,
    contentType,
    fresh
  )
}
