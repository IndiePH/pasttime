import { normalizeWordGuessWord } from "./dictionary"
import type { WordGuessGuessEvaluation, WordGuessLetterResult } from "./types"

export function evaluateWordGuessGuess(
  answerRaw: string,
  guessRaw: string,
): WordGuessGuessEvaluation {
  const answer = normalizeWordGuessWord(answerRaw)
  const guess = normalizeWordGuessWord(guessRaw)

  const letters = Array.from(guess)
  const answerLetters = Array.from(answer)
  const results: WordGuessLetterResult[] = letters.map((letter) => ({
    letter,
    state: "absent",
  }))
  const unusedCounts = new Map<string, number>()

  for (let i = 0; i < letters.length; i += 1) {
    const letter = letters[i]
    const answerLetter = answerLetters[i]

    if (letter === answerLetter) {
      results[i] = { letter, state: "correct" }
      continue
    }

    const count = unusedCounts.get(answerLetter) ?? 0
    unusedCounts.set(answerLetter, count + 1)
  }

  for (let i = 0; i < letters.length; i += 1) {
    if (results[i].state === "correct") {
      continue
    }

    const letter = letters[i]
    const remaining = unusedCounts.get(letter) ?? 0
    if (remaining > 0) {
      results[i] = { letter, state: "present" }
      unusedCounts.set(letter, remaining - 1)
    }
  }

  const isCorrect = results.every((item) => item.state === "correct")

  return {
    guess,
    letters: results,
    isCorrect,
  }
}
