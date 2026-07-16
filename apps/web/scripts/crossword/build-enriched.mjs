/**
 * Canonical builder for the enriched dictionary.
 *
 * (Re)builds `packages/domain/games/shared/dictionary.full.enriched.json` from
 * committed sources only, so the output is deterministic from the repo:
 *
 *   1. `dictionary.target.json` — the canonical word universe (word → length).
 *   2. `dictionary.full.enriched.json` — existing entries (preserved verbatim,
 *      e.g. data gathered live via `enrich-from-mcp.mjs`).
 *   3. `crossword-definitions.json` — bulk Apify definitions (definition seed).
 *
 * A word is included if it has ANY data (a definition, synonym, or antonym)
 * from either source. Entries with no data are omitted (they remain in the
 * enrichment queue until `enrich-from-mcp.mjs` resolves them). The queue is
 * intentionally NOT modified here — see `enrich-from-mcp.mjs` for that.
 *
 * Replaces the former `build-with-pipeworx.mjs`, `enrich-dictionary.mjs`, and
 * `merge-definitions.mjs`.
 *
 *   node scripts/crossword/build-enriched.mjs
 *   npm run crossword:build-enriched
 */
import { readFile, writeFile, mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const SHARED = resolve(__dirname, "../../../../packages/domain/games/shared")
const CROSSWORD = resolve(__dirname, "../../../../packages/domain/games/crossword")
const TARGET_PATH = resolve(SHARED, "dictionary.target.json")
const ENRICHED_PATH = resolve(SHARED, "dictionary.full.enriched.json")
const APIFY_DEFS_PATH = resolve(CROSSWORD, "crossword-definitions.json")

const LENGTHS = [3, 4, 5, 6, 7, 8, 9, 10]

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"))
}

function firstDefinition(meanings) {
  if (!Array.isArray(meanings)) return null
  const seenPos = new Set()
  const parts = []
  for (const m of meanings) {
    const pos = m.partOfSpeech ?? m.part_of_speech ?? ""
    if (seenPos.has(pos)) continue
    seenPos.add(pos)
    const defs = Array.isArray(m.definitions) ? m.definitions : []
    const hit = defs.find((d) => d && typeof d.definition === "string" && d.definition.trim())
    if (hit) parts.push(hit.definition.trim())
    if (parts.length >= 3) break
  }
  return parts.length ? parts.join("; ") : null
}

function collectSynAnt(meanings, key) {
  const out = []
  if (!Array.isArray(meanings)) return out
  for (const m of meanings) {
    if (Array.isArray(m[key])) for (const v of m[key]) if (v) out.push(String(v))
  }
  return out
}

async function main() {
  console.log("\n🔄 Building enriched dictionary from committed sources...\n")

  // 1. canonical word universe (for length bucketing / validation)
  const target = await readJson(TARGET_PATH)
  const targetWords = new Set()
  for (const words of Object.values(target)) {
    for (const w of words) targetWords.add(String(w).toUpperCase())
  }
  console.log(`   target universe: ${targetWords.size} words`)

  // 2. existing enriched entries (preserve)
  let existing = {}
  try {
    existing = await readJson(ENRICHED_PATH)
  } catch {
    existing = {}
  }
  const existingByWord = new Map()
  for (const [, words] of Object.entries(existing)) {
    for (const e of words) {
      if (e && e.word) existingByWord.set(String(e.word).toUpperCase(), e)
    }
  }
  console.log(`   existing enriched: ${existingByWord.size} words`)

  // 3. Apify bulk definitions (definition seed only — no syn/ant)
  let apifyByWord = new Map()
  try {
    const apify = await readJson(APIFY_DEFS_PATH)
    for (const d of apify) {
      if (d && d.word) apifyByWord.set(String(d.word).toUpperCase(), d)
    }
    console.log(`   apify definitions: ${apifyByWord.size} words`)
  } catch {
    console.log("   apify definitions: (none — skipping seed)")
  }

  // Universe = every word that has data in either source.
  const universe = new Set([...existingByWord.keys(), ...apifyByWord.keys()])

  const buckets = Object.fromEntries(LENGTHS.map((l) => [String(l), []]))
  let withDef = 0
  let withSyn = 0
  let withAnt = 0
  let orphaned = 0 // words whose computed length is outside 3..10

  for (const word of universe) {
    const ex = existingByWord.get(word)
    const ap = apifyByWord.get(word)

    const definition =
      (ex && ex.definition) || (ap && firstDefinition(ap.meanings)) || null
    const synonyms = [...new Set([...(ex?.synonyms ?? []), ...collectSynAnt(ap?.meanings, "synonyms")])]
    const antonyms = [...new Set([...(ex?.antonyms ?? []), ...collectSynAnt(ap?.meanings, "antonyms")])]

    if (!definition && synonyms.length === 0 && antonyms.length === 0) continue

    if (definition) withDef++
    if (synonyms.length) withSyn++
    if (antonyms.length) withAnt++

    const entry = { word, definition, synonyms, antonyms }
    const len = String(word.length)
    if (buckets[len]) {
      buckets[len].push(entry)
    } else {
      orphaned++
    }
  }

  for (const len of Object.keys(buckets)) {
    buckets[len].sort((a, b) => a.word.localeCompare(b.word))
  }

  const total = Object.values(buckets).reduce((s, w) => s + w.length, 0)

  await mkdir(dirname(ENRICHED_PATH), { recursive: true })
  await writeFile(ENRICHED_PATH, `${JSON.stringify(buckets, null, 2)}\n`, "utf8")

  console.log(`\n✅ Build complete`)
  console.log(`   total entries:   ${total}`)
  console.log(`   with definition: ${withDef}`)
  console.log(`   with synonyms:   ${withSyn}`)
  console.log(`   with antonyms:   ${withAnt}`)
  if (orphaned) console.log(`   (skipped ${orphaned} word(s) outside lengths 3–10)`)
  console.log(`\n💾 Saved: ${ENRICHED_PATH}`)
}

main().catch((err) => {
  console.error(`\n❌ Error: ${err.message}`)
  process.exitCode = 1
})
