import enrichedData from "./dictionary.full.enriched.json"

/**
 * The canonical enriched dictionary: words with their definition, synonyms and
 * antonyms. Backed by `dictionary.full.enriched.json` (a committed source file,
 * rebuilt by `apps/web/scripts/crossword/build-enriched.mjs` and filled live by
 * `enrich-from-mcp.mjs`). Coverage is partial and grows over time — always
 * treat a missing entry as "no data yet", never as "not a word".
 */
export type EnrichedWordEntry = {
  word: string
  definition: string | null
  synonyms: string[]
  antonyms: string[]
}

/** Supported word lengths in the dictionary (3–10 letters). */
export type EnrichedWordLength = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

type EnrichedDictionary = Record<string, EnrichedWordEntry[]>

const ENRICHED_DICTIONARY = enrichedData as EnrichedDictionary

export function isEnrichedWordLength(value: number): value is EnrichedWordLength {
  return Number.isInteger(value) && value >= 3 && value <= 10
}

const ENRICHED_BY_LENGTH = new Map<number, readonly EnrichedWordEntry[]>(
  Object.entries(ENRICHED_DICTIONARY).map(([length, words]) => [
    Number(length),
    words ?? [],
  ]),
)

const ENRICHED_BY_WORD = new Map<string, EnrichedWordEntry>()
for (const words of ENRICHED_BY_LENGTH.values()) {
  for (const entry of words) {
    ENRICHED_BY_WORD.set(entry.word.toUpperCase(), entry)
  }
}

export const ENRICHED_WORD_COUNT = ENRICHED_BY_WORD.size

export function normalizeEnrichedWord(value: string): string {
  return value.trim().toUpperCase()
}

export function getEnrichedWord(rawWord: string): EnrichedWordEntry | undefined {
  return ENRICHED_BY_WORD.get(normalizeEnrichedWord(rawWord))
}

export function hasEnrichedWord(rawWord: string): boolean {
  return ENRICHED_BY_WORD.has(normalizeEnrichedWord(rawWord))
}

export function getEnrichedWordsByLength(
  length: EnrichedWordLength,
): readonly EnrichedWordEntry[] {
  return ENRICHED_BY_LENGTH.get(length) ?? []
}
