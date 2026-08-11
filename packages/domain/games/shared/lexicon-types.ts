/** Definition row shape shared by D1, API, and client hydration. */
export type WordDefinition = {
  word: string
  definition: string
  synonyms: string[]
  antonyms: string[]
}

export type EnrichedWordEntry = {
  word: string
  definition: string | null
  synonyms: string[]
  antonyms: string[]
}

/** Supported word lengths in the enriched dictionary (5–10 for Word Guess). */
export type EnrichedWordLength = 5 | 6 | 7 | 8 | 9 | 10

export function normalizeLexiconWord(value: string): string {
  return value.trim().toUpperCase()
}

export function wordSetFromList(words: readonly string[]): ReadonlySet<string> {
  return new Set(words.map(normalizeLexiconWord))
}

export function buildEnrichedWordIndex(entries: readonly EnrichedWordEntry[]): {
  byWord: ReadonlyMap<string, EnrichedWordEntry>
  byLength: ReadonlyMap<number, readonly EnrichedWordEntry[]>
} {
  const byWord = new Map<string, EnrichedWordEntry>()
  const byLength = new Map<number, EnrichedWordEntry[]>()

  for (const entry of entries) {
    const word = normalizeLexiconWord(entry.word)
    byWord.set(word, { ...entry, word })
    const length = word.length
    const bucket = byLength.get(length) ?? []
    bucket.push({ ...entry, word })
    byLength.set(length, bucket)
  }

  return { byWord, byLength }
}

export function getEnrichedWordFromIndex(
  rawWord: string,
  index: ReadonlyMap<string, EnrichedWordEntry>,
): EnrichedWordEntry | undefined {
  return index.get(normalizeLexiconWord(rawWord))
}

export function isEnrichedWordLength(value: number): value is EnrichedWordLength {
  return Number.isInteger(value) && value >= 5 && value <= 10
}

/**
 * Word Guess answer pool: enriched entries with a non-empty definition,
 * sorted A→Z. Keeps daily/endless targets aligned with definition lookup.
 */
export function listEnrichedAnswerWords(
  enrichedByLength: Readonly<Record<string, readonly EnrichedWordEntry[]>>,
  length: number,
): string[] {
  const entries = enrichedByLength[String(length)] ?? []
  return entries
    .filter((entry) => Boolean(entry.definition?.trim()))
    .map((entry) => normalizeLexiconWord(entry.word))
    .sort((a, b) => a.localeCompare(b))
}
