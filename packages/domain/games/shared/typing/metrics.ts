import type { TypingMetrics, TypingState } from "./types"

function round(value: number, places: number): number {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

export function computeTypingMetrics(
  state: TypingState,
  elapsedMs: number
): TypingMetrics {
  const correctChars = state.entries.filter((entry) => entry.correct).length
  const errorChars = state.entries.length - correctChars
  const processedChars = state.entries.length
  const safeElapsedMs = Math.max(0, elapsedMs)
  const effectiveElapsedMs =
    processedChars === 0 ? 0 : Math.max(1_000, safeElapsedMs)
  const accuracy =
    processedChars === 0 ? 0 : round(correctChars / processedChars, 3)
  const wpm =
    effectiveElapsedMs === 0
      ? 0
      : round(processedChars / 5 / (effectiveElapsedMs / 60_000), 1)

  return {
    correctChars,
    errorChars,
    processedChars,
    accuracy,
    wpm,
  }
}
