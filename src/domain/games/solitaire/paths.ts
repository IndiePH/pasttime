import { gameLaunchPath, gamePlayPath } from "@/domain/games/paths"

import type { SolitaireMode } from "./modes"

function withModeQuery(path: string, mode: SolitaireMode): string {
  return `${path}?mode=${mode}`
}

export function solitaireLaunchPath(mode: SolitaireMode): string {
  return withModeQuery(gameLaunchPath("solitaire"), mode)
}

export function solitairePlayPath(mode: SolitaireMode): string {
  return withModeQuery(gamePlayPath("solitaire"), mode)
}
