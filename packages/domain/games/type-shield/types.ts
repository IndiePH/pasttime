import type { TypingState } from "../shared/typing"

import type { TypeShieldDifficulty } from "./difficulty"
import type { TypeShieldMode } from "./mode"

export type TypeShieldStatus = "playing" | "won" | "lost"

export type TypeShieldComet = {
  id: string
  word: string
  /** 0–1 across the dome, kept inset so the fall has room. */
  lane: number
  spawnedAt: number
  fallMs: number
  typing: TypingState
}

export type TypeShieldState = {
  status: TypeShieldStatus
  lives: number
  score: number
  destroyed: number
  comets: TypeShieldComet[]
  nextSpawnAt: number
  spawnCount: number
  seed: number
  startedAt: number
  difficulty: TypeShieldDifficulty
  mode: TypeShieldMode
  words: readonly string[]
}
