import {
  backspaceTypingCharacter,
  computeTypingMetrics,
  createTypingState,
  submitTypingCharacter,
  type TypingInputPolicy,
} from "../shared/typing"

import { pickTypeRushPrompt, type TypeRushPrompt } from "./prompts"
import {
  TYPE_RUSH_CONTENT_TYPE_DEFAULT,
  type TypeRushContentType,
  type TypeRushRoundMode,
} from "./settings"
import type { TypeRushRoundMetrics, TypeRushRoundState } from "./types"

export interface CreateTypeRushRoundOptions {
  mode: TypeRushRoundMode
  contentType?: TypeRushContentType
  prompt?: TypeRushPrompt
  date?: Date
  now?: number
  random?: () => number
}

export function createTypeRushRound({
  mode,
  contentType = TYPE_RUSH_CONTENT_TYPE_DEFAULT,
  date = new Date(),
  now = Date.now(),
  random = Math.random,
  prompt,
}: CreateTypeRushRoundOptions): TypeRushRoundState {
  const selectedPrompt =
    prompt ?? pickTypeRushPrompt(mode, date, random, contentType)

  return {
    promptId: selectedPrompt.id,
    text: selectedPrompt.text,
    mode,
    contentType,
    status: "playing",
    typing: createTypingState(selectedPrompt.text),
    elapsedMs: 0,
    startedAt: null,
  }
}

export function getTypeRushElapsedMs(
  round: TypeRushRoundState,
  now = Date.now()
): number {
  if (round.status !== "playing" || round.startedAt === null) {
    return round.elapsedMs
  }

  return round.elapsedMs + Math.max(0, now - round.startedAt)
}

export function getTypeRushMetrics(
  round: TypeRushRoundState,
  now = Date.now()
): TypeRushRoundMetrics {
  const elapsedMs = getTypeRushElapsedMs(round, now)
  return {
    ...computeTypingMetrics(round.typing, elapsedMs),
    elapsedMs,
  }
}

export function submitTypeRushCharacter(
  round: TypeRushRoundState,
  actual: string,
  now = Date.now(),
  policy: TypingInputPolicy = "forgiving"
): TypeRushRoundState {
  if (round.status !== "playing") {
    return round
  }

  const nextTyping = submitTypingCharacter(round.typing, actual, policy)
  if (nextTyping === round.typing) {
    return round
  }

  const startedAt = round.startedAt ?? now
  if (!nextTyping.complete) {
    return {
      ...round,
      typing: nextTyping,
      startedAt,
    }
  }

  return {
    ...round,
    typing: nextTyping,
    status: "won",
    elapsedMs: round.elapsedMs + Math.max(0, now - startedAt),
    startedAt: null,
  }
}

export function backspaceTypeRushCharacter(
  round: TypeRushRoundState
): TypeRushRoundState {
  if (round.status !== "playing") {
    return round
  }

  const typing = backspaceTypingCharacter(round.typing)
  return typing === round.typing ? round : { ...round, typing }
}

export function sealTypeRushRound(
  round: TypeRushRoundState,
  now = Date.now()
): TypeRushRoundState {
  if (round.status !== "playing" || round.startedAt === null) {
    return round
  }

  return {
    ...round,
    elapsedMs: round.elapsedMs + Math.max(0, now - round.startedAt),
    startedAt: now,
  }
}
