#!/usr/bin/env node
/**
 * build-corpus.mjs
 * Merges the four interim corpus files into a single compact, deduplicated,
 * pre-filtered corpus.json. Run via: node games/crossword/scripts/build-corpus.mjs
 *
 * Priority (highest wins, inserted last to overwrite lower-priority entries):
 *   crossword-definitions.json < clues.cache.json < clues.generated.json < clues.json
 */

import { createRequire } from "module"
import { writeFileSync } from "fs"
import { fileURLToPath } from "url"
import path from "path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Resolve paths relative to the crossword package directory
const crosswordDir = path.resolve(__dirname, "..")

const LETTERS_ONLY = /^[A-Z]+$/
const MIN_LEN = 3
const MAX_LEN = 10

function isValid(answer, clue) {
  return (
    typeof answer === "string" &&
    LETTERS_ONLY.test(answer) &&
    answer.length >= MIN_LEN &&
    answer.length <= MAX_LEN &&
    typeof clue === "string" &&
    clue.trim().length > 0
  )
}

// Map<ANSWER, clue> — lower-priority inserted first, higher-priority overwrites
const map = new Map()

// --- 1. crossword-definitions.json (lowest priority) ---
// Shape: [{word, found, meanings: [{definitions: [{definition}]}]}]
const defsRaw = require(path.join(crosswordDir, "crossword-definitions.json"))
for (const entry of defsRaw) {
  const answer = String(entry.word ?? "").toUpperCase()
  const clue = entry.meanings?.[0]?.definitions?.[0]?.definition ?? ""
  if (isValid(answer, clue)) {
    map.set(answer, clue.trim())
  }
}
console.log(`After crossword-definitions.json: ${map.size} entries`)

// --- 2. clues.cache.json (second lowest priority) ---
// Shape: { [WORD]: { clues: string[] } }
const cacheRaw = require(path.join(crosswordDir, "clues.cache.json"))
for (const [word, data] of Object.entries(cacheRaw)) {
  const answer = String(word).toUpperCase()
  const clue = Array.isArray(data?.clues) ? (data.clues[0] ?? "") : ""
  if (isValid(answer, clue)) {
    map.set(answer, clue.trim())
  }
}
console.log(`After clues.cache.json: ${map.size} entries`)

// --- 3. clues.generated.json (second highest priority) ---
// Shape: { clues: [{answer, clues: string[]}] }
const generatedRaw = require(path.join(crosswordDir, "clues.generated.json"))
for (const entry of generatedRaw.clues ?? []) {
  const answer = String(entry.answer ?? "").toUpperCase()
  const clue = Array.isArray(entry.clues) ? (entry.clues[0] ?? "") : ""
  if (isValid(answer, clue)) {
    map.set(answer, clue.trim())
  }
}
console.log(`After clues.generated.json: ${map.size} entries`)

// --- 4. clues.json (highest priority — curated, overwrites all) ---
// Shape: { clues: [{answer, clue}] }
const cluesRaw = require(path.join(crosswordDir, "clues.json"))
for (const entry of cluesRaw.clues ?? []) {
  const answer = String(entry.answer ?? "").toUpperCase()
  const clue = String(entry.clue ?? "")
  if (isValid(answer, clue)) {
    map.set(answer, clue.trim())
  }
}
console.log(`After clues.json: ${map.size} entries`)

// Build sorted output array
const corpus = Array.from(map.entries())
  .map(([answer, clue]) => ({ answer, clue }))
  .sort((a, b) => a.answer.localeCompare(b.answer))

const outputPath = path.join(crosswordDir, "corpus.json")
writeFileSync(outputPath, JSON.stringify(corpus, null, 2) + "\n", "utf8")
console.log(`\nWrote ${corpus.length} entries to ${outputPath}`)
