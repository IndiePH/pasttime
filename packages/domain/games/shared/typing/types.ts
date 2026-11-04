export type TypingCharacterStatus =
  | "pending"
  | "current"
  | "correct"
  | "incorrect"

export type TypingInputPolicy = "forgiving" | "strict"

export type TypingEntry = {
  expected: string
  actual: string
  correct: boolean
}

export type TypingState = {
  text: string
  entries: readonly TypingEntry[]
  cursor: number
  complete: boolean
}

export type TypingMetrics = {
  correctChars: number
  errorChars: number
  processedChars: number
  accuracy: number
  wpm: number
}
