import { readFileSync, writeFileSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en"

const QUEUE_PATH = resolve(__dirname, "../../../../packages/domain/games/shared/dictionary.enrichment-queue.json")
const ENRICHED_PATH = resolve(__dirname, "../../../../packages/domain/games/shared/dictionary.full.enriched.json")
const BLOCKLIST_PATH = resolve(__dirname, "../../../../packages/domain/games/shared/manual-blocklist.txt")

const queue = JSON.parse(readFileSync(QUEUE_PATH, "utf-8"))
const enriched = JSON.parse(readFileSync(ENRICHED_PATH, "utf-8"))
const blocklist = existsSync(BLOCKLIST_PATH)
  ? new Set(readFileSync(BLOCKLIST_PATH, "utf-8").split("\n").map(l => l.trim()).filter(Boolean))
  : new Set()

function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function getAllWords(queue) {
  const words = []
  for (const len of Object.keys(queue)) {
    for (const w of queue[len]) {
      words.push({ word: w, length: len })
    }
  }
  return words
}

async function fetchWord(word) {
  const url = `${API_BASE}/${encodeURIComponent(word.toLowerCase())}`
  const res = await fetch(url)
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`API error ${res.status} for ${word}`)
  }
  return await res.json()
}

function extractInfo(apiData) {
  if (!apiData || !Array.isArray(apiData) || apiData.length === 0) return null

  const entry = apiData[0]

  const definitions = []
  if (entry.meanings) {
    for (const m of entry.meanings) {
      if (m.definitions) {
        for (const d of m.definitions) {
          if (d.definition) definitions.push(d.definition)
        }
      }
    }
  }

  const synonyms = new Set()
  if (entry.meanings) {
    for (const m of entry.meanings) {
      if (m.synonyms) m.synonyms.forEach(s => { if (typeof s === "string" && s.length > 0) synonyms.add(s) })
      if (m.definitions) {
        for (const d of m.definitions) {
          if (d.synonyms) d.synonyms.forEach(s => { if (typeof s === "string" && s.length > 0) synonyms.add(s) })
        }
      }
    }
  }

  const antonyms = new Set()
  if (entry.meanings) {
    for (const m of entry.meanings) {
      if (m.antonyms) m.antonyms.forEach(a => { if (typeof a === "string" && a.length > 0) antonyms.add(a) })
      if (m.definitions) {
        for (const d of m.definitions) {
          if (d.antonyms) d.antonyms.forEach(a => { if (typeof a === "string" && a.length > 0) antonyms.add(a) })
        }
      }
    }
  }

  return {
    definition: definitions.length > 0 ? definitions[0] : null,
    synonyms: [...synonyms],
    antonyms: [...antonyms],
  }
}

function removeFromQueue(queue, word, length) {
  queue[length] = queue[length].filter(w => w !== word)
  if (queue[length].length === 0) delete queue[length]
}

function addToEnriched(enriched, entry, length) {
  if (!enriched[length]) enriched[length] = []
  enriched[length].push(entry)
  enriched[length].sort((a, b) => a.word.localeCompare(b.word))
}

const allWords = getAllWords(queue)
const sample = pickRandom(allWords, 6)

console.log("Picked words:", sample.map(s => s.word).join(", "))

for (const { word, length } of sample) {
  process.stdout.write(`  ${word}... `)
  try {
    const apiData = await fetchWord(word)
    const info = extractInfo(apiData)

    if (info && (info.definition || info.synonyms.length > 0 || info.antonyms.length > 0)) {
      const entry = {
        word: word,
        definition: info.definition,
        synonyms: info.synonyms,
        antonyms: info.antonyms,
      }
      addToEnriched(enriched, entry, length)
      removeFromQueue(queue, word, length)
      console.log(`enriched (def=${!!info.definition}, syn=${info.synonyms.length}, ant=${info.antonyms.length})`)
    } else {
      removeFromQueue(queue, word, length)
      blocklist.add(word)
      console.log("blocklisted (no useful data)")
    }
  } catch (err) {
    removeFromQueue(queue, word, length)
    blocklist.add(word)
    console.log(`blocklisted (${err.message})`)
  }
}

const sortedQueue = {}
for (const key of Object.keys(queue).sort((a, b) => Number(a) - Number(b))) {
  sortedQueue[key] = queue[key]
}

writeFileSync(QUEUE_PATH, JSON.stringify(sortedQueue, null, 2) + "\n")
writeFileSync(ENRICHED_PATH, JSON.stringify(enriched, null, 2) + "\n")
writeFileSync(BLOCKLIST_PATH, [...blocklist].sort().join("\n") + "\n")

console.log("\nDone. Updated queue, enriched, and blocklist.")
