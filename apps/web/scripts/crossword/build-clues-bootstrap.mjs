/**
 * Bootstrap clue bank from existing on-disk data — no Apify token required.
 *
 * Sources (in priority order):
 *   1. clues.json          — 100 hand-crafted entries
 *   2. crossword-definitions.json — 474 Wiktionary definitions
 *   3. dictionary.target.json — fills gaps for thin-coverage lengths
 *
 * Produces packages/domain/games/crossword/clues.generated.json.
 * Run: node apps/web/scripts/crossword/build-clues-bootstrap.mjs
 */

import { readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "../../../..")

const OUTPUT_PATH = resolve(ROOT, "packages/domain/games/crossword/clues.generated.json")
const HAND_CRAFTED_PATH = resolve(ROOT, "packages/domain/games/crossword/clues.json")
const DEFS_PATH = resolve(ROOT, "packages/domain/games/crossword/crossword-definitions.json")
const TARGET_DICT_PATH = resolve(ROOT, "packages/domain/games/shared/dictionary.target.json")

const LETTERS_ONLY = /^[A-Z]+$/
const MIN_LEN = 3
const MAX_LEN = 10

// Minimum entries per word-length bucket before we supplement from target dict.
const MIN_PER_LENGTH = 50

function shortenClue(text, maxWords = 12) {
  if (!text) return ""
  return text.split(/\s+/).slice(0, maxWords).join(" ")
}

function extractCluesFromMeanings(meanings) {
  const clues = []
  const seen = new Set()

  for (const meaning of meanings) {
    if (!meaning.definitions) continue
    for (const def of meaning.definitions) {
      if (!def.definition) continue
      const shortened = shortenClue(def.definition)
      if (shortened && !seen.has(shortened)) {
        clues.push(shortened)
        seen.add(shortened)
      }
      if (clues.length >= 5) break
    }
    if (clues.length >= 5) break
  }

  return clues
}

async function main() {
  // ── 1. Load sources ───────────────────────────────────────────────────────
  const [handCraftedRaw, defsRaw, targetDictRaw] = await Promise.all([
    readFile(HAND_CRAFTED_PATH, "utf8"),
    readFile(DEFS_PATH, "utf8"),
    readFile(TARGET_DICT_PATH, "utf8"),
  ])

  const handCrafted = JSON.parse(handCraftedRaw).clues   // { answer, clue }[]
  const defEntries = Object.values(JSON.parse(defsRaw))  // { word, found, meanings }[]
  const targetDict = JSON.parse(targetDictRaw)           // { "3": string[], "4": string[], … }

  // ── 2. Build merged map (word → ClueEntry) ────────────────────────────────
  // ClueEntry: { answer: string, clues: string[] }
  const bank = new Map()

  // Priority 1: hand-crafted entries
  for (const { answer, clue } of handCrafted) {
    const word = String(answer).toUpperCase().trim()
    if (!LETTERS_ONLY.test(word)) continue
    if (word.length < MIN_LEN || word.length > MAX_LEN) continue
    bank.set(word, { answer: word, clues: [clue] })
  }

  // Priority 2: Wiktionary definitions
  for (const entry of defEntries) {
    if (!entry.found || !entry.meanings) continue
    const word = String(entry.word).toUpperCase().trim()
    if (!LETTERS_ONLY.test(word)) continue
    if (word.length < MIN_LEN || word.length > MAX_LEN) continue
    if (bank.has(word)) continue  // hand-crafted wins

    const clues = extractCluesFromMeanings(entry.meanings)
    if (clues.length > 0) {
      bank.set(word, { answer: word, clues })
    }
  }

  // ── 3. Count coverage; supplement thin lengths from target dict ───────────
  const byLength = {}
  for (const entry of bank.values()) {
    const len = entry.answer.length
    byLength[len] = (byLength[len] ?? 0) + 1
  }

  console.log("Coverage after hand-crafted + Wiktionary:", byLength)

  for (let len = MIN_LEN; len <= MAX_LEN; len++) {
    const current = byLength[len] ?? 0
    if (current >= MIN_PER_LENGTH) continue

    const pool = (targetDict[String(len)] ?? []).filter(
      (w) => !bank.has(w.toUpperCase()),
    )
    const needed = MIN_PER_LENGTH - current
    const words = pool.slice(0, needed)

    for (const raw of words) {
      const word = raw.toUpperCase()
      bank.set(word, {
        answer: word,
        clues: [`A ${len}-letter word`],
      })
    }

    if (words.length > 0) {
      console.log(`  Supplemented length ${len}: added ${words.length} entries`)
    }
  }

  // ── 4. Write output ───────────────────────────────────────────────────────
  const clues = [...bank.values()]
  const finalCoverage = {}
  for (const e of clues) {
    finalCoverage[e.answer.length] = (finalCoverage[e.answer.length] ?? 0) + 1
  }

  console.log("\nFinal coverage by word length:", finalCoverage)
  console.log("Total entries:", clues.length)

  await writeFile(OUTPUT_PATH, `${JSON.stringify({ clues }, null, 2)}\n`, "utf8")
  console.log(`\nWritten → ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
