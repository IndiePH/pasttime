#!/usr/bin/env node
/**
 * Publish lexicon shards to R2 and seed D1 from committed domain JSON.
 *
 * Usage (from repo root):
 *   npm run lexicon:publish -w @pasttime/web
 *
 * Requires wrangler login and Cloudflare resources:
 *   wrangler r2 bucket create pasttime-content
 *   wrangler d1 create pasttime-lexicon
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { run } from "./_run.mjs"

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = join(SCRIPT_DIR, "..", "..")
const DOMAIN_ROOT = join(WEB_ROOT, "..", "..", "packages", "domain", "games")
const PREFIX = "shared/lexicon/v1"
const BUCKET = process.env.LEXICON_R2_BUCKET ?? "pasttime-content"
const D1_NAME = process.env.LEXICON_D1_NAME ?? "pasttime-lexicon"
const LENGTHS = [5, 6, 7, 8, 9, 10]
const D1_BATCH_SIZE = 250
const d1Only = process.argv.includes("--d1-only")

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"))
}

function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`
}

function uploadJson(key, payload) {
  const tempDir = mkdtempSync(join(tmpdir(), "lexicon-upload-"))
  const filePath = join(tempDir, "payload.json")
  writeFileSync(filePath, JSON.stringify(payload))
  try {
    run(
      "npx",
      [
        "wrangler",
        "r2",
        "object",
        "put",
        `${BUCKET}/${key}`,
        "--file",
        filePath,
        "--remote",
      ],
      { cwd: WEB_ROOT, label: `upload ${key}` },
    )
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
  console.log(`uploaded s3://${BUCKET}/${key}`)
}

function seedD1(rows) {
  const tempDir = mkdtempSync(join(tmpdir(), "lexicon-seed-"))
  const batchTotal = Math.ceil(rows.length / D1_BATCH_SIZE)

  try {
    for (let offset = 0; offset < rows.length; offset += D1_BATCH_SIZE) {
      const batch = rows.slice(offset, offset + D1_BATCH_SIZE)
      const batchNumber = Math.floor(offset / D1_BATCH_SIZE) + 1
      const sqlPath = join(tempDir, `seed-${batchNumber}.sql`)
      const statements = batch.map((row) => {
        const synonyms = JSON.stringify(row.synonyms ?? [])
        const antonyms = JSON.stringify(row.antonyms ?? [])
        return `INSERT INTO word_definitions (word, definition, synonyms, antonyms, updated_at)
VALUES (${sqlLiteral(row.word)}, ${sqlLiteral(row.definition)}, ${sqlLiteral(synonyms)}, ${sqlLiteral(antonyms)}, datetime('now'))
ON CONFLICT(word) DO UPDATE SET
  definition = excluded.definition,
  synonyms = excluded.synonyms,
  antonyms = excluded.antonyms,
  updated_at = excluded.updated_at;`
      })
      writeFileSync(sqlPath, statements.join("\n"))
      run(
        "npx",
        [
          "wrangler",
          "d1",
          "execute",
          D1_NAME,
          "--remote",
          "--file",
          sqlPath,
          "--yes",
        ],
        { cwd: WEB_ROOT, label: `seed d1 batch ${batchNumber}/${batchTotal}` },
      )
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
  console.log(`seeded ${rows.length} rows into D1 ${D1_NAME}`)
}

const enriched = readJson(join(DOMAIN_ROOT, "shared", "dictionary.full.enriched.json"))
const full = readJson(join(DOMAIN_ROOT, "shared", "dictionary.full.json"))
const corpus = readJson(join(DOMAIN_ROOT, "crossword", "corpus.json"))

function enrichedAnswerWords(length) {
  return (enriched[String(length)] ?? [])
    .filter((entry) => entry.definition?.trim())
    .map((entry) => String(entry.word).toUpperCase())
    .sort((a, b) => a.localeCompare(b))
}

if (!d1Only) {
  for (const length of LENGTHS) {
    uploadJson(`${PREFIX}/answers/${length}.json`, {
      words: enrichedAnswerWords(length),
    })
    uploadJson(`${PREFIX}/guessable/${length}.json`, {
      words: (full[key] ?? []).map((word) => word.toUpperCase()),
    })
  }

  const crosswordAnswers = [
    ...new Set(
      corpus.map((entry) => String(entry.answer).toUpperCase()),
    ),
  ]
  uploadJson(`${PREFIX}/crossword/answers.json`, { words: crosswordAnswers })
}

const definitionRows = []
for (const entries of Object.values(enriched)) {
  for (const entry of entries) {
    if (!entry.definition) continue
    definitionRows.push({
      word: String(entry.word).toUpperCase(),
      definition: entry.definition,
      synonyms: entry.synonyms ?? [],
      antonyms: entry.antonyms ?? [],
    })
  }
}
seedD1(definitionRows)

console.log("Lexicon publish complete.")
