import { hashSeed } from "../../daily/seed"
import {
  createTypingState,
  submitTypingCharacter,
} from "../shared/typing"

import {
  getTypeShieldFallMs,
  getTypeShieldSpawnGap,
  getTypeShieldWpm,
  typeShieldBurstSize,
  type TypeShieldDifficulty,
} from "./difficulty"
import { TYPE_SHIELD_MODE_DEFAULT, TYPE_SHIELD_SURVIVAL_MS, type TypeShieldMode } from "./mode"
import type { TypeShieldComet, TypeShieldState } from "./types"
import { pickTypeShieldWord } from "./vocabulary"
import { TYPE_SHIELD_WORDS } from "./words"

export const TYPE_SHIELD_MAX_LIVES = 5
export const TYPE_SHIELD_MAX_ACTIVE = 3
const SCORE_PER_LETTER = 10

export interface CreateTypeShieldRoundOptions {
  now?: number
  seed?: number
  words?: readonly string[]
  difficulty?: TypeShieldDifficulty
  mode?: TypeShieldMode
}

export function getTypeShieldCometProgress(
  comet: TypeShieldComet,
  now: number
): number {
  if (comet.fallMs <= 0) {
    return 1
  }
  return Math.min(1, Math.max(0, (now - comet.spawnedAt) / comet.fallMs))
}

export function getTypeShieldLockedComet(
  state: TypeShieldState
): TypeShieldComet | null {
  const active = state.comets.filter((comet) => comet.typing.cursor > 0)
  return active.length === 1 ? (active[0] ?? null) : null
}

export function createTypeShieldRound({
  now = Date.now(),
  seed = hashSeed(now),
  words = TYPE_SHIELD_WORDS,
  difficulty = "easy",
  mode = TYPE_SHIELD_MODE_DEFAULT,
}: CreateTypeShieldRoundOptions = {}): TypeShieldState {
  const roster = words.length > 0 ? words : TYPE_SHIELD_WORDS
  const opening = spawnWave(
    {
      status: "playing",
      lives: TYPE_SHIELD_MAX_LIVES,
      score: 0,
      destroyed: 0,
      comets: [],
      nextSpawnAt: now,
      spawnCount: 0,
      seed,
      startedAt: now,
      difficulty,
      mode,
      words: roster,
    },
    now,
  )
  return {
    ...opening.state,
    nextSpawnAt:
      now + getTypeShieldSpawnGap(opening.letters, getTypeShieldWpm(difficulty, 0)),
  }
}

export function advanceTypeShield(
  state: TypeShieldState,
  now: number
): TypeShieldState {
  if (state.status !== "playing") {
    return state
  }

  let next = resolveImpacts(state, now)
  if (next.status !== "playing") {
    return next
  }

  next = resolveSurvival(next, now)
  if (next.status !== "playing") {
    return next
  }

  while (
    next.comets.length < TYPE_SHIELD_MAX_ACTIVE &&
    now >= next.nextSpawnAt
  ) {
    const spawnAt = next.nextSpawnAt
    const wave = spawnWave(next, spawnAt)
    next = {
      ...wave.state,
      nextSpawnAt:
        spawnAt + getTypeShieldSpawnGap(wave.letters, paceWpm(wave.state, spawnAt)),
    }
  }

  return next
}

export function submitTypeShieldCharacter(
  state: TypeShieldState,
  actual: string,
  _now: number
): TypeShieldState {
  if (state.status !== "playing" || actual.length !== 1) {
    return state
  }

  const nextPrefix = typedPrefix(state) + actual.toLocaleLowerCase()
  const matches = state.comets.some((comet) =>
    comet.word.toLocaleLowerCase().startsWith(nextPrefix),
  )
  if (!matches) {
    return state
  }

  return applyTypedPrefix(state, nextPrefix)
}

export function backspaceTypeShieldCharacter(
  state: TypeShieldState
): TypeShieldState {
  const prefix = typedPrefix(state)
  if (!prefix || state.status !== "playing") {
    return state
  }

  return applyTypedPrefix(state, prefix.slice(0, -1))
}

function typedPrefix(state: TypeShieldState): string {
  let prefix = ""
  for (const comet of state.comets) {
    if (comet.typing.cursor > prefix.length) {
      prefix = comet.word.slice(0, comet.typing.cursor).toLocaleLowerCase()
    }
  }
  return prefix
}

function applyTypedPrefix(
  state: TypeShieldState,
  prefix: string,
): TypeShieldState {
  const matched = prefix.toLocaleLowerCase()
  let score = state.score
  let destroyed = state.destroyed
  const comets: TypeShieldComet[] = []

  for (const comet of state.comets) {
    const word = comet.word.toLocaleLowerCase()
    if (matched.length > 0 && word.startsWith(matched)) {
      if (word.length === matched.length) {
        score += comet.word.length * SCORE_PER_LETTER
        destroyed += 1
        continue
      }
      comets.push({
        ...comet,
        typing: typingMatched(comet.word, matched.length),
      })
      continue
    }
    comets.push({
      ...comet,
      typing: createTypingState(comet.word),
    })
  }

  return { ...state, score, destroyed, comets }
}

function typingMatched(word: string, count: number) {
  let typing = createTypingState(word)
  for (let index = 0; index < count; index += 1) {
    typing = submitTypingCharacter(typing, word[index] ?? "", "strict")
  }
  return typing
}

function resolveSurvival(
  state: TypeShieldState,
  now: number,
): TypeShieldState {
  if (state.mode !== "survival") {
    return state
  }
  if (now - state.startedAt < TYPE_SHIELD_SURVIVAL_MS) {
    return state
  }
  return {
    ...state,
    status: "won",
    comets: [],
  }
}

function resolveImpacts(
  state: TypeShieldState,
  now: number
): TypeShieldState {
  const surviving: TypeShieldComet[] = []
  let lives = state.lives

  for (const comet of state.comets) {
    if (now - comet.spawnedAt >= comet.fallMs) {
      lives -= 1
    } else {
      surviving.push(comet)
    }
  }

  if (lives === state.lives) {
    return state
  }

  return {
    ...state,
    lives: Math.max(0, lives),
    status: lives > 0 ? "playing" : "lost",
    comets: lives > 0 ? surviving : [],
  }
}

function spawnWave(
  state: TypeShieldState,
  now: number,
): { state: TypeShieldState; letters: number } {
  const count = typeShieldBurstSize(
    state.difficulty,
    hashSeed(state.seed + state.spawnCount * 97 + 3),
    TYPE_SHIELD_MAX_ACTIVE - state.comets.length,
  )
  if (count <= 0) {
    return { state, letters: 1 }
  }
  let next = state
  for (let index = 0; index < count; index += 1) {
    const word = pickWord(next)
    const laneSeed = hashSeed(next.seed + next.spawnCount * 97 + 13)
    const lane = 0.05 + (laneSeed % 9000) / 10000
    const comet: TypeShieldComet = {
      id: `${next.spawnCount}-${word}`,
      word,
      lane,
      spawnedAt: now,
      fallMs: 0,
      typing: createTypingState(word),
    }
    next = {
      ...next,
      comets: [...next.comets, comet],
      spawnCount: next.spawnCount + 1,
    }
  }

  const spawned = next.comets.slice(-count)
  const letters = spawned.reduce((sum, comet) => sum + comet.word.length, 0)
  const fallMs = getTypeShieldFallMs(Math.max(1, letters), paceWpm(state, now))
  const spawnedIds = new Set(spawned.map((comet) => comet.id))
  return {
    letters: Math.max(1, letters),
    state: {
      ...next,
      comets: next.comets.map((comet) =>
        spawnedIds.has(comet.id) ? { ...comet, fallMs } : comet,
      ),
    },
  }
}

function paceWpm(state: TypeShieldState, now: number): number {
  return getTypeShieldWpm(state.difficulty, Math.max(0, now - state.startedAt))
}

function pickWord(state: TypeShieldState): string {
  return pickTypeShieldWord({
    difficulty: state.difficulty,
    words: state.words,
    active: new Set(state.comets.map((comet) => comet.word)),
    seed: hashSeed(state.seed + state.spawnCount * 97),
  })
}
