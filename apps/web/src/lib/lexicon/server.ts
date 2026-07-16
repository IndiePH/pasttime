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

async function readDevDefinition(word: string): Promise<WordDefinition | null> {
  const raw = await readFile(
    join(DOMAIN_ROOT, "shared", "dictionary.full.enriched.json"),
    "utf8",
  )
  const parsed = JSON.parse(raw) as Record<
    string,
    Array<{
      word: string
      definition: string | null
      synonyms: string[]
      antonyms: string[]
    }>
  >
  const normalized = word.toUpperCase()
  for (const entries of Object.values(parsed)) {
    const match = entries.find((entry) => entry.word.toUpperCase() === normalized)
    if (match?.definition) {
      return {
        word: match.word.toUpperCase(),
        definition: match.definition,
        synonyms: match.synonyms ?? [],
        antonyms: match.antonyms ?? [],
      }
    }
  }
  return null
}

async function readR2Text(key: string): Promise<string | null> {
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

    return (result.results ?? []).map((row: {
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
  }

  const defs: WordDefinition[] = []
  for (const word of normalized) {
    const definition = await readDevDefinition(word)
    if (definition) {
      defs.push(definition)
    }
  }
  return defs
}
