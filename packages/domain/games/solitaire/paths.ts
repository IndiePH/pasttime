import { gameLaunchPath, gamePlayPath } from "../paths"

import type { SolitaireMode } from "./modes"
import type { SolitaireRoundMode } from "./round"

function withModeQuery(path: string, mode: SolitaireMode): string {
  return `${path}?mode=${mode}`
}

export function solitaireLaunchPath(mode: SolitaireMode): string {
  return withModeQuery(gameLaunchPath("solitaire"), mode)
}

export function solitairePlayPath(
  mode: SolitaireMode,
  round: SolitaireRoundMode,
): string {
  const params = new URLSearchParams({ mode, round })
  return `${gamePlayPath("solitaire")}?${params.toString()}`
}
