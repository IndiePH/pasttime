import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import {
  buildCrosswordPool,
  type CrosswordPoolWord,
} from "../crossword/generator"
import {
  buildEnrichedWordIndex,
  type EnrichedWordEntry,
} from "../shared/lexicon-types"

const GAMES_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")

function readJson<T>(relativePath: string): T {
  return JSON.parse(
    readFileSync(join(GAMES_ROOT, relativePath), "utf8"),
  ) as T
}

let cachedCorpusPool: readonly CrosswordPoolWord[] | null = null

/** Node/test-only loader — never imported by the web Worker graph. */
export function loadCommittedCorpusPool(): readonly CrosswordPoolWord[] {
  if (!cachedCorpusPool) {
    const corpus = readJson<Array<{ answer: string; clue: string }>>(
      "crossword/corpus.json",
    )
    cachedCorpusPool = buildCrosswordPool(
      corpus.map((entry) => entry.answer),
      new Map(corpus.map((entry) => [entry.answer.toUpperCase(), entry.clue])),
    )
  }
  return cachedCorpusPool
}

let cachedEnrichedIndex: ReturnType<typeof buildEnrichedWordIndex> | null = null

export function loadCommittedEnrichedIndex(): ReturnType<
  typeof buildEnrichedWordIndex
> {
  if (!cachedEnrichedIndex) {
    const enriched = readJson<Record<string, EnrichedWordEntry[]>>(
      "shared/dictionary.full.enriched.json",
    )
    const entries = Object.values(enriched).flat()
    cachedEnrichedIndex = buildEnrichedWordIndex(entries)
  }
  return cachedEnrichedIndex
}

export function loadCommittedGuessableSet(
  length: number,
): ReadonlySet<string> {
  const full = readJson<Record<string, string[]>>("shared/dictionary.full.json")
  return new Set((full[String(length)] ?? []).map((word) => word.toUpperCase()))
}

export function loadCommittedAnswerWords(length: number): readonly string[] {
  const target = readJson<Record<string, string[]>>(
    "shared/dictionary.target.json",
  )
  return (target[String(length)] ?? []).map((word) => word.toUpperCase())
}
