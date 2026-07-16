import type { WordDefinition } from "@pasttime/domain/games/shared/lexicon-types"
import { wordSetFromList } from "@pasttime/domain/games/shared/lexicon-types"

type ShardResponse = { words: string[] }
type DefinitionsResponse = { definitions: WordDefinition[] }

const answerCache = new Map<number, string[]>()
const guessableCache = new Map<number, ReadonlySet<string>>()
let crosswordAnswersCache: string[] | null = null
const definitionCache = new Map<string, WordDefinition>()

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Lexicon request failed (${response.status})`)
  }
  return (await response.json()) as T
}

export async function loadWordGuessLexicon(length: number): Promise<{
  answerWords: readonly string[]
  guessableSet: ReadonlySet<string>
}> {
  const cachedAnswers = answerCache.get(length)
  const cachedGuessable = guessableCache.get(length)
  if (cachedAnswers && cachedGuessable) {
    return { answerWords: cachedAnswers, guessableSet: cachedGuessable }
  }

  const [answersPayload, guessablePayload] = await Promise.all([
    fetchJson<ShardResponse>(`/api/lexicon/answers/${length}`),
    fetchJson<ShardResponse>(`/api/lexicon/guessable/${length}`),
  ])

  const answerWords = answersPayload.words.map((word) => word.toUpperCase())
  const guessableSet = wordSetFromList(guessablePayload.words)
  answerCache.set(length, answerWords)
  guessableCache.set(length, guessableSet)
  return { answerWords, guessableSet }
}

export async function loadCrosswordAnswers(): Promise<readonly string[]> {
  if (crosswordAnswersCache) {
    return crosswordAnswersCache
  }
  const payload = await fetchJson<ShardResponse>("/api/lexicon/crossword/answers")
  crosswordAnswersCache = payload.words.map((word) => word.toUpperCase())
  return crosswordAnswersCache
}

export async function loadWordDefinitions(
  words: readonly string[],
): Promise<ReadonlyMap<string, string>> {
  const normalized = [...new Set(words.map((word) => word.toUpperCase()))]
  const missing = normalized.filter((word) => !definitionCache.has(word))
  if (missing.length > 0) {
    const response = await fetch("/api/lexicon/definitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ words: missing }),
    })
    if (!response.ok) {
      throw new Error(`Lexicon request failed (${response.status})`)
    }
    const payload = (await response.json()) as DefinitionsResponse
    for (const definition of payload.definitions) {
      definitionCache.set(definition.word.toUpperCase(), definition)
    }
  }

  const clues = new Map<string, string>()
  for (const word of normalized) {
    const definition = definitionCache.get(word)
    if (definition?.definition) {
      clues.set(word, definition.definition)
    }
  }
  return clues
}

export async function loadWordDefinition(
  word: string,
): Promise<WordDefinition | null> {
  const clues = await loadWordDefinitions([word])
  const normalized = word.toUpperCase()
  const cached = definitionCache.get(normalized)
  if (cached) {
    return cached
  }
  const clue = clues.get(normalized)
  if (!clue) {
    return null
  }
  return {
    word: normalized,
    definition: clue,
    synonyms: [],
    antonyms: [],
  }
}

export function clearLexiconClientCache(): void {
  answerCache.clear()
  guessableCache.clear()
  crosswordAnswersCache = null
  definitionCache.clear()
}
