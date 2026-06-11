import { gameLaunchPath, gamePlayPath, gameRoomPath } from "../paths"

import {
  WORD_GUESS_ROUND_MODE_DEFAULT,
  type WordGuessLength,
  type WordGuessRoundMode,
} from "./settings"

type WordGuessPathOptions = {
  letters: WordGuessLength
  mode?: WordGuessRoundMode
}

function withWordGuessQuery(path: string, options: WordGuessPathOptions): string {
  const query = new URLSearchParams()
  query.set("letters", String(options.letters))

  if (options.mode && options.mode !== WORD_GUESS_ROUND_MODE_DEFAULT) {
    query.set("mode", options.mode)
  }

  return `${path}?${query.toString()}`
}

export function wordGuessLaunchPath(
  letters: WordGuessLength,
  mode?: WordGuessRoundMode,
): string {
  return withWordGuessQuery(gameLaunchPath("word-guess"), { letters, mode })
}

export function wordGuessPlayPath(
  letters: WordGuessLength,
  mode?: WordGuessRoundMode,
): string {
  return withWordGuessQuery(gamePlayPath("word-guess"), { letters, mode })
}

export function wordGuessRoomPath(
  code: string,
  letters: WordGuessLength,
  mode?: WordGuessRoundMode,
): string {
  return withWordGuessQuery(gameRoomPath("word-guess", code), { letters, mode })
}
