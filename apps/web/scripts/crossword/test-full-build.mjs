import { existsSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const APIFY_TOKEN = process.env.APIFY_TOKEN
const APIFY_DATASET_URL = "https://api.apify.com/v2/actors/moving_beacon-owner1~free-dictionary/runs/last/dataset/items"

if (!APIFY_TOKEN) {
  console.error("Error: APIFY_TOKEN environment variable is required")
  process.exitCode = 1
  process.exit(1)
}

const OUTPUT_PATH = resolve(__dirname, "../../../../packages/domain/games/crossword/clues.generated.json")
const CACHE_PATH = resolve(__dirname, "../../../../packages/domain/games/crossword/clues.cache.json")

async function loadCache() {
  if (!existsSync(CACHE_PATH)) return new Map()
  const text = await readFile(CACHE_PATH, "utf8")
  const data = JSON.parse(text)
  return new Map(Object.entries(data))
}

async function saveCache(cache) {
  const obj = Object.fromEntries(cache)
  await mkdir(dirname(CACHE_PATH), { recursive: true })
  await writeFile(CACHE_PATH, `${JSON.stringify(obj, null, 2)}\n`, "utf8")
}

async function fetchAllFromApify() {
  const url = new URL(APIFY_DATASET_URL)
  url.searchParams.set("token", APIFY_TOKEN)

  console.log("Fetching definitions from Apify...")
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Apify error ${response.status}`)
  }

  const definitions = await response.json()
  console.log(`  Fetched ${definitions.length} entries`)

  const byWord = new Map()
  for (const def of definitions) {
    const word = String(def.word).toUpperCase()
    byWord.set(word, def)
  }

  return byWord
}

function shortenClue(text, maxWords = 12) {
  if (!text) return ""
  const words = text.split(/\s+/)
  return words.slice(0, maxWords).join(" ")
}

function generateCluesFromApify(word, entry) {
  const clues = []
  const seen = new Set()

  if (!entry.meanings || !Array.isArray(entry.meanings)) {
    return null
  }

  for (const meaning of entry.meanings) {
    if (meaning.definitions && Array.isArray(meaning.definitions)) {
      for (const def of meaning.definitions) {
        if (def.definition) {
          const shortened = shortenClue(def.definition)
          if (shortened && !seen.has(shortened)) {
            clues.push(shortened)
            seen.add(shortened)
          }
        }
      }
    }

    if (meaning.synonyms && Array.isArray(meaning.synonyms)) {
      for (const syn of meaning.synonyms.slice(0, 2)) {
        if (syn && !seen.has(syn)) {
          clues.push(syn)
          seen.add(syn)
        }
      }
    }

    if (meaning.antonyms && Array.isArray(meaning.antonyms)) {
      for (const ant of meaning.antonyms.slice(0, 1)) {
        if (ant) {
          const antClue = `Opposite of ${ant}`
          if (!seen.has(antClue)) {
            clues.push(antClue)
            seen.add(antClue)
          }
        }
      }
    }

    if (clues.length >= 5) break
  }

  return clues.length > 0 ? clues : null
}

async function main() {
  const cache = await loadCache()
  console.log(`Loaded ${cache.size} entries in cache\n`)

  // Test with these 5 words
  const testWords = ["HAPPY", "APPLE", "HOUSE", "BLUE", "WATER"]

  const apifyData = await fetchAllFromApify()
  console.log(`Apify data indexed for ${apifyData.size} words\n`)

  const output = []

  for (const word of testWords) {
    const entry = apifyData.get(word)
    if (!entry) {
      console.log(`${word}: not found in Apify`)
      continue
    }

    const clues = generateCluesFromApify(word, entry)
    if (clues) {
      output.push({ answer: word, clues })
      cache.set(word, { clues, source: "apify" })
      console.log(`${word}: ${clues.length} clues generated`)
      clues.forEach((clue, i) => {
        console.log(`  ${i + 1}. ${clue}`)
      })
    } else {
      console.log(`${word}: no clues generated`)
      cache.set(word, { clues: [] })
    }
  }

  // Save cache and output
  await saveCache(cache)
  await mkdir(dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, `${JSON.stringify({ clues: output }, null, 2)}\n`, "utf8")

  console.log(`\nSaved ${output.length} clue entries to ${OUTPUT_PATH}`)
  console.log(`Cache updated: ${CACHE_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
