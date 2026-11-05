import {
  TYPE_SHIELD_MIN_LENGTH,
  TYPE_SHIELD_WORDS,
} from "@pasttime/domain/games/type-shield"

type TypeShieldLexiconResponse = { words: string[] }

let cachedWords: readonly string[] | null = null

export async function loadTypeShieldDictionary(): Promise<readonly string[]> {
  if (cachedWords && cachedWords.length > 0) {
    return cachedWords
  }

  try {
    const response = await fetch("/api/lexicon/type-shield")
    if (!response.ok) {
      throw new Error(`Type Shield lexicon failed (${response.status})`)
    }
    const payload = (await response.json()) as TypeShieldLexiconResponse
    const words = payload.words
      .map((word) => word.toLowerCase())
      .filter(
        (word) =>
          word.length >= TYPE_SHIELD_MIN_LENGTH && /^[a-z]+$/.test(word),
      )
    if (words.length > 0) {
      cachedWords = words
      return words
    }
  } catch (error) {
    console.warn("Type Shield is using its fallback word list", error)
  }

  return TYPE_SHIELD_WORDS
}
