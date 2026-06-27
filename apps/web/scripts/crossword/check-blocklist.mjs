import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en"
const BLOCKLIST_PATH = resolve(__dirname, "../../../../packages/domain/games/shared/manual-blocklist.txt")
const ENRICHED_PATH = resolve(__dirname, "../../../../packages/domain/games/shared/dictionary.full.enriched.json")

const blocklist = readFileSync(BLOCKLIST_PATH, "utf-8").split("\n").map(l => l.trim()).filter(Boolean)
const enriched = JSON.parse(readFileSync(ENRICHED_PATH, "utf-8"))

const enrichedWords = new Set()
for (const entries of Object.values(enriched)) {
  for (const e of entries) enrichedWords.add(e.word.toUpperCase())
}

// Check which blocklisted words are already in enriched
const alreadyEnriched = blocklist.filter(w => enrichedWords.has(w.toUpperCase()))
if (alreadyEnriched.length > 0) {
  console.log(`WARNING: ${alreadyEnriched.length} blocklisted words already exist in enriched:`)
  alreadyEnriched.forEach(w => console.log(`  ${w}`))
}

const delay = ms => new Promise(r => setTimeout(r, ms))

let found = 0
let notFound = 0
let errors = 0
let recoverable = []

for (const word of blocklist) {
  process.stdout.write(`  ${word}... `)
  try {
    await delay(500)
    const res = await fetch(`${API_BASE}/${encodeURIComponent(word.toLowerCase())}`)
    if (res.ok) {
      const data = await res.json()
      const defs = data?.[0]?.meanings?.flatMap(m => m.definitions?.map(d => d.definition) ?? []) ?? []
      const syns = data?.[0]?.meanings?.flatMap(m => m.synonyms ?? []) ?? []
      const ants = data?.[0]?.meanings?.flatMap(m => m.antonyms ?? []) ?? []
      if (defs.length > 0 || syns.length > 0 || ants.length > 0) {
        console.log(`VALID (def=${defs.length}, syn=${syns.length}, ant=${ants.length})`)
        recoverable.push({ word, defs: defs[0] || null })
        found++
      } else {
        console.log("empty response")
        notFound++
      }
    } else if (res.status === 404) {
      console.log("404")
      notFound++
    } else {
      console.log(`error ${res.status}`)
      errors++
    }
  } catch (err) {
    console.log(`fetch error: ${err.message}`)
    errors++
  }
}

console.log(`\nResults: ${found} recoverable, ${notFound} not found, ${errors} errors`)
if (recoverable.length > 0) {
  console.log("\nRecoverable words (blocklisted but API has data):")
  recoverable.forEach(r => console.log(`  ${r.word}: ${r.defs}`))
}
