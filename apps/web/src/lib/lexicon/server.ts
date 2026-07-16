import { getCloudflareContext } from "@opennextjs/cloudflare"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

import type { WordDefinition } from "@pasttime/domain/games/shared/lexicon-types"
import {
  LEXICON_CROSSWORD_ANSWERS_KEY,
  lexiconAnswersKey,
  lexiconGuessableKey,
} from "@/lib/lexicon/constants"

const DOMAIN_ROOT = join(process.cwd(), "..", "..", "packages", "domain", "games")

type LexiconShard = { words: string[] }

function parseShardPayload(raw: string): string[] {
  const parsed = JSON.parse(raw) as string[] | LexiconShard
  if (Array.isArray(parsed)) {
    return parsed
  }
  return parsed.words ?? []
}

async function readDevAnswersByLength(length: number): Promise<string[]> {
  const raw = await readFile(
    join(DOMAIN_ROOT, "shared", "dictionary.target.json"),
    "utf8",
  )
  const parsed = JSON.parse(raw) as Record<string, string[]>
  return parsed[String(length)] ?? []
}

async function readDevGuessableByLength(length: number): Promise<string[]> {
  const raw = await readFile(
    join(DOMAIN_ROOT, "shared", "dictionary.full.json"),
    "utf8",
  )
  const parsed = JSON.parse(raw) as Record<string, string[]>
  return parsed[String(length)] ?? []
}

async function readDevCrosswordAnswers(): Promise<string[]> {
  const raw = await readFile(join(DOMAIN_ROOT, "crossword", "corpus.json"), "utf8")
  const parsed = JSON.parse(raw) as Array<{ answer: string }>
  return parsed.map((entry) => entry.answer.toUpperCase())
}

type EnrichedEntry = {
  word: string
  definition: string | null
  synonyms: string[]
  antonyms: string[]
}

let enrichedByWord: Map<string, WordDefinition> | null = null

async function loadDevDefinitionIndex(): Promise<Map<string, WordDefinition>> {
  if (enrichedByWord) {
    return enrichedByWord
  }

  const raw = await readFile(
    join(DOMAIN_ROOT, "shared", "dictionary.full.enriched.json"),
    "utf8",
  )
  const parsed = JSON.parse(raw) as Record<string, EnrichedEntry[]>
  const index = new Map<string, WordDefinition>()
  for (const entries of Object.values(parsed)) {
    for (const entry of entries) {
      if (!entry.definition) continue
      const word = entry.word.toUpperCase()
      if (!index.has(word)) {
        index.set(word, {
          word,
          definition: entry.definition,
          synonyms: entry.synonyms ?? [],
          antonyms: entry.antonyms ?? [],
        })
      }
    }
  }
  enrichedByWord = index
  return index
}

async function readDevDefinitions(
  words: readonly string[],
): Promise<WordDefinition[]> {
  const index = await loadDevDefinitionIndex()
  const defs: WordDefinition[] = []
  for (const word of words) {
    const definition = index.get(word.toUpperCase())
    if (definition) {
      defs.push(definition)
    }
  }
  return defs
}

async function readR2Text(key: string): Promise<string | null> {
  try {
    const { env } = await getCloudflareContext({ async: true })
    const bucket = env.CONTENT_R2
    if (!bucket) {
      return null
    }
    const object = await bucket.get(key)
    if (!object) {
      return null
    }
    return object.text()
  } catch (error) {
    console.warn("R2 lexicon read failed; falling back to local files", error)
    return null
  }
}

export async function fetchLexiconAnswers(length: number): Promise<string[]> {
  const key = lexiconAnswersKey(length)
  const fromR2 = await readR2Text(key)
  if (fromR2) {
    return parseShardPayload(fromR2)
  }
  return readDevAnswersByLength(length)
}

export async function fetchLexiconGuessable(length: number): Promise<string[]> {
  const key = lexiconGuessableKey(length)
  const fromR2 = await readR2Text(key)
  if (fromR2) {
    return parseShardPayload(fromR2)
  }
  return readDevGuessableByLength(length)
}

export async function fetchCrosswordAnswers(): Promise<string[]> {
  const fromR2 = await readR2Text(LEXICON_CROSSWORD_ANSWERS_KEY)
  if (fromR2) {
    return parseShardPayload(fromR2)
  }
  return readDevCrosswordAnswers()
}

export async function fetchWordDefinitions(
  words: readonly string[],
): Promise<WordDefinition[]> {
  const normalized = [...new Set(words.map((word) => word.toUpperCase()))]
  if (normalized.length === 0) {
    return []
  }

  let fromD1: WordDefinition[] | null = null
  try {
    const { env } = await getCloudflareContext({ async: true })
    const db = env.LEXICON_DB
    if (db) {
      const placeholders = normalized.map(() => "?").join(", ")
      const result = await db
        .prepare(
          `SELECT word, definition, synonyms, antonyms FROM word_definitions WHERE word IN (${placeholders})`,
        )
        .bind(...normalized)
        .all<{
          word: string
          definition: string
          synonyms: string | null
          antonyms: string | null
        }>()

      fromD1 = (result.results ?? []).map((row: {
        word: string
        definition: string
        synonyms: string | null
        antonyms: string | null
      }) => ({
        word: row.word,
        definition: row.definition,
        synonyms: row.synonyms ? (JSON.parse(row.synonyms) as string[]) : [],
        antonyms: row.antonyms ? (JSON.parse(row.antonyms) as string[]) : [],
      }))

      // Prefer D1 when it has hits. Empty local D1 (migrated, not seeded)
      // falls through to domain JSON for next dev.
      if (fromD1.length > 0) {
        return fromD1
      }
    }
  } catch (error) {
    // Local next dev often has the D1 binding but an unmigrated/empty DB.
    console.warn("D1 lexicon lookup failed; falling back to local files", error)
  }

  try {
    const fromFiles = await readDevDefinitions(normalized)
    if (fromFiles.length > 0) {
      return fromFiles
    }
  } catch (error) {
    // Production Workers have no domain JSON on disk — keep D1 result.
    console.warn("Local lexicon file fallback failed", error)
  }

  return fromD1 ?? []
}
