import { gameLaunchPath, gamePlayPath } from "../paths"

import {
  TYPE_RUSH_ROUND_MODE_DEFAULT,
  type TypeRushRoundMode,
} from "./settings"

function withTypeRushQuery(path: string, mode: TypeRushRoundMode): string {
  if (mode === TYPE_RUSH_ROUND_MODE_DEFAULT) {
    return path
  }

  return `${path}?mode=${encodeURIComponent(mode)}`
}

export function typeRushLaunchPath(
  mode: TypeRushRoundMode = TYPE_RUSH_ROUND_MODE_DEFAULT
): string {
  return withTypeRushQuery(gameLaunchPath("type-rush"), mode)
}

export function typeRushPlayPath(
  mode: TypeRushRoundMode = TYPE_RUSH_ROUND_MODE_DEFAULT
): string {
  return withTypeRushQuery(gamePlayPath("type-rush"), mode)
}
