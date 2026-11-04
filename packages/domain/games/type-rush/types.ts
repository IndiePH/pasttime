import type { TypingMetrics, TypingState } from "@pasttime/domain/games/shared"

import type { TypeRushRoundMode } from "./settings"

export type TypeRushRoundStatus = "playing" | "won"

export interface TypeRushRoundState {
  promptId: string
  text: string
  mode: TypeRushRoundMode
  status: TypeRushRoundStatus
  typing: TypingState
  elapsedMs: number
  startedAt: number | null
}

export type TypeRushRoundMetrics = TypingMetrics & {
  elapsedMs: number
}
