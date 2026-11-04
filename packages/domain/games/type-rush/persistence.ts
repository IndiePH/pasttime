import { getDailySeed } from "../../daily"

import { isTypeRushPromptText } from "./prompts"
import {
  TYPE_RUSH_CONTENT_TYPE_DEFAULT,
  isTypeRushContentType,
  type TypeRushContentType,
  type TypeRushRoundMode,
} from "./settings"
import type { TypeRushRoundState } from "./types"

export function parseStoredTypeRushRound(
  value: unknown,
  mode: TypeRushRoundMode,
  now = Date.now(),
  contentType: TypeRushContentType = TYPE_RUSH_CONTENT_TYPE_DEFAULT
): TypeRushRoundState | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const record = value as Record<string, unknown>
  const promptId = record.promptId
  const text = record.text
  const status = record.status
  const storedContentType =
    record.contentType === undefined
      ? TYPE_RUSH_CONTENT_TYPE_DEFAULT
      : record.contentType
  const typing = record.typing
  const elapsedMs = record.elapsedMs
  const startedAt = record.startedAt

  if (
    typeof promptId !== "string" ||
    typeof text !== "string" ||
    record.mode !== mode ||
    typeof storedContentType !== "string" ||
    !isTypeRushContentType(storedContentType) ||
    storedContentType !== contentType ||
    (status !== "playing" && status !== "won") ||
    typeof elapsedMs !== "number" ||
    !Number.isFinite(elapsedMs) ||
    elapsedMs < 0 ||
    (startedAt !== null &&
      (typeof startedAt !== "number" || !Number.isFinite(startedAt))) ||
    !isStoredTypingState(typing, text, status)
  ) {
    return null
  }

  if (!isTypeRushPromptText(contentType, promptId, text)) {
    return null
  }

  const typedState = typing as TypeRushRoundState["typing"]
  return {
    promptId,
    text,
    mode,
    contentType,
    status,
    typing: {
      text: typedState.text,
      entries: typedState.entries.map((entry) => ({ ...entry })),
      cursor: typedState.cursor,
      complete: typedState.complete,
    },
    elapsedMs,
    startedAt: status === "playing" && startedAt !== null ? now : null,
  }
}

function isStoredTypingState(
  value: unknown,
  text: string,
  status: unknown
): value is TypeRushRoundState["typing"] {
  if (!value || typeof value !== "object") {
    return false
  }

  const record = value as Record<string, unknown>
  const entries = record.entries
  const cursor = record.cursor
  const complete = record.complete

  if (
    record.text !== text ||
    !Array.isArray(entries) ||
    !Number.isInteger(cursor) ||
    cursor !== entries.length ||
    (status === "won" && !complete) ||
    (status === "playing" && complete) ||
    complete !== cursor >= text.length
  ) {
    return false
  }

  return entries.every((entry) => {
    if (!entry || typeof entry !== "object") {
      return false
    }
    const item = entry as Record<string, unknown>
    return (
      typeof item.expected === "string" &&
      item.expected.length === 1 &&
      typeof item.actual === "string" &&
      item.actual.length === 1 &&
      typeof item.correct === "boolean"
    )
  })
}

export function getTypeRushStorageKey(
  mode: TypeRushRoundMode,
  date = new Date(),
  contentType: TypeRushContentType = TYPE_RUSH_CONTENT_TYPE_DEFAULT
): string {
  const variant =
    contentType === TYPE_RUSH_CONTENT_TYPE_DEFAULT ? "default" : contentType

  if (mode === "daily") {
    return `type-rush:daily:${variant}:${getDailySeed(date)}`
  }

  if (contentType === TYPE_RUSH_CONTENT_TYPE_DEFAULT) {
    return "type-rush:practice:session"
  }

  return `type-rush:practice:${variant}:session`
}

export function isTypeRushDailyCompleted(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<string, unknown>).mode === "daily" &&
    (value as Record<string, unknown>).status === "won"
  )
}
