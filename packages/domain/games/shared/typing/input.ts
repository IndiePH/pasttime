import type {
  TypingCharacterStatus,
  TypingEntry,
  TypingInputPolicy,
  TypingState,
} from "./types"

export function normalizeTypingText(text: string): string {
  return text.replace(/\r\n?/g, "\n").replace(/\n/g, " ")
}

function charactersMatch(expected: string, actual: string): boolean {
  if (expected.length !== 1 || actual.length !== 1) {
    return false
  }

  return expected.toLocaleLowerCase() === actual.toLocaleLowerCase()
}

export function createTypingState(text: string): TypingState {
  const normalizedText = normalizeTypingText(text)

  return {
    text: normalizedText,
    entries: [],
    cursor: 0,
    complete: normalizedText.length === 0,
  }
}

export function submitTypingCharacter(
  state: TypingState,
  actual: string,
  policy: TypingInputPolicy = "forgiving"
): TypingState {
  if (state.complete || actual.length !== 1) {
    return state
  }

  const expected = state.text[state.cursor]
  const correct = charactersMatch(expected, actual)

  if (!correct && policy === "strict") {
    return state
  }

  const entry: TypingEntry = { expected, actual, correct }
  const entries = [...state.entries, entry]
  const cursor = entries.length

  return {
    ...state,
    entries,
    cursor,
    complete: cursor >= state.text.length,
  }
}

export function backspaceTypingCharacter(state: TypingState): TypingState {
  if (state.entries.length === 0) {
    return state
  }

  const entries = state.entries.slice(0, -1)
  return {
    ...state,
    entries,
    cursor: entries.length,
    complete: false,
  }
}

export function getTypingCharacterStatus(
  state: TypingState,
  index: number
): TypingCharacterStatus {
  if (index < 0 || index >= state.text.length) {
    return "pending"
  }

  if (index === state.cursor && !state.complete) {
    return "current"
  }

  const entry = state.entries[index]
  if (!entry) {
    return "pending"
  }

  return entry.correct ? "correct" : "incorrect"
}

export function getTypingEntry(
  state: TypingState,
  index: number
): TypingEntry | undefined {
  return state.entries[index]
}
