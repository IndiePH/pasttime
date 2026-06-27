import { existsSync } from "node:fs"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { words as popularEnglishWords } from "popular-english-words"

const require = createRequire(import.meta.url)
const englishWordList = require("an-array-of-english-words")

const __dirname = dirname(fileURLToPath(import.meta.url))

const LETTERS_ONLY = /^[A-Za-z]+$/
const SHORT_LENGTHS = new Set([3, 4])
const LONG_LENGTHS = [5, 6, 7, 8, 9, 10]
const SHORT_LIMITS = { 3: 200, 4: 400 }
const APIFY_TOKEN = process.env.APIFY_TOKEN
const APIFY_DATASET_URL = "https://api.apify.com/v2/actors/moving_beacon-owner1~free-dictionary/runs/last/dataset/items"

if (!APIFY_TOKEN) {
  console.error("Error: APIFY_TOKEN environment variable is required")
  process.exitCode = 1
  process.exit(1)
}

const OUTPUT_PATH = resolve(__dirname, "../../../../packages/domain/games/crossword/clues.generated.json")
const CACHE_PATH = resolve(__dirname, "../../../../packages/domain/games/crossword/clues.cache.json")
const TARGET_DICT_PATH = resolve(__dirname, "../../../../packages/domain/games/shared/dictionary.target.json")
const PROFANITY_PATH = resolve(__dirname, "../word-guess/profanity-blocklist.txt")

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

async function loadProfanityBlocklist() {
  const text = await readFile(PROFANITY_PATH, "utf8")
  return new Set(
    text.split(/\r?\n/)
      .map((l) => l.trim().toUpperCase())
      .filter((l) => l.length > 0 && !l.startsWith("#")),
  )
}

async function loadExistingClues() {
  if (!existsSync(OUTPUT_PATH)) return []
  const text = await readFile(OUTPUT_PATH, "utf8")
  return JSON.parse(text).clues
}

function getShortWords(profanityBlocklist) {
  const englishSet = new Set(englishWordList.map((w) => w.toUpperCase()))
  const byLength = { 3: [], 4: [] }

  for (const raw of popularEnglishWords.getAll()) {
    const word = String(raw).trim().toUpperCase()
    if (!LETTERS_ONLY.test(word)) continue
    if (!SHORT_LENGTHS.has(word.length)) continue
    if (!englishSet.has(word)) continue
    if (profanityBlocklist.has(word)) continue
    byLength[word.length].push(word)
  }

  const result = []
  for (const [len, words] of Object.entries(byLength)) {
    result.push(...words.slice(0, SHORT_LIMITS[len]))
  }
  return result
}

async function getLongWords() {
  const text = await readFile(TARGET_DICT_PATH, "utf8")
  const dict = JSON.parse(text)
  const result = []
  for (const length of LONG_LENGTHS) {
    result.push(...(dict[length] ?? []))
  }
  return result
}

async function fetchAllFromApify() {
  const url = new URL(APIFY_DATASET_URL)
  url.searchParams.set("token", APIFY_TOKEN)

  console.log("Fetching definitions from Apify dataset (this may take a moment)...")
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Apify error ${response.status}`)
  }

  const definitions = await response.json()
  console.log(`  Fetched ${definitions.length} definition entries from Apify`)

  // Index by uppercase word
  const byWord = new Map()
  for (const def of definitions) {
    const word = String(def.word).toUpperCase()
    if (!byWord.has(word)) {
      byWord.set(word, [])
    }
    byWord.get(word).push(def)
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

  // Process each meaning
  for (const meaning of entry.meanings) {
    // Definitions
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

    // Synonyms from this meaning
    if (meaning.synonyms && Array.isArray(meaning.synonyms)) {
      for (const syn of meaning.synonyms.slice(0, 2)) {
        if (syn && !seen.has(syn)) {
          clues.push(syn)
          seen.add(syn)
        }
      }
    }

    // Antonym-based clues
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

async function getCluesForWord(word, cache, apifyData) {
  const cached = cache.get(word)
  if (cached && cached.clues) {
    return cached.clues.length > 0 ? { answer: word, clues: cached.clues } : null
  }

  const entry = apifyData.get(word)
  if (!entry) {
    cache.set(word, { clues: [] })
    return null
  }

  const clues = generateCluesFromApify(word, entry)
  cache.set(word, { clues: clues || [], source: "apify" })
  return clues ? { answer: word, clues } : null
}

async function main() {
  const [profanityBlocklist, cache, existingClues] = await Promise.all([
    loadProfanityBlocklist(),
    loadCache(),
    loadExistingClues(),
  ])

  const existing = new Map(existingClues.map((e) => [e.answer, e]))
  console.log(`Loaded ${existing.size} existing clue entries from output file`)
  console.log(`Loaded ${cache.size} entries in local cache`)

  // Fetch Apify data (indexed by word)
  let apifyData = new Map()
  try {
    apifyData = await fetchAllFromApify()
  } catch (err) {
    console.error(`Failed to fetch Apify data: ${err.message}`)
    console.log("Continuing with cached data only...")
  }

  const shortWords = getShortWords(profanityBlocklist)
  const longWords = await getLongWords()

  const allWords = [...shortWords, ...longWords]
  const newWords = allWords.filter((w) => !existing.has(w))
  console.log(`Words total: ${allWords.length} | Need clues: ${newWords.length}`)

  if (newWords.length === 0) {
    console.log("Nothing to do — all words already have clues.")
    return
  }

  console.log(`\nGenerating clues for ${newWords.length} words...`)
  let generated = 0
  const total = newWords.length

  for (const word of newWords) {
    const entry = await getCluesForWord(word, cache, apifyData)
    if (entry) {
      existing.set(entry.answer, entry)
      generated++
    }

    // Save progress every 50 words
    if (generated % 50 === 0) {
      await saveCache(cache)
      console.log(
        `  Progress: ${generated}/${total} new clues | ${existing.size} total entries`,
      )
    }
  }

  // Final save
  await saveCache(cache)
  const output = { clues: [...existing.values()] }
  await mkdir(dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8")

  console.log(
    `\nDone. Generated ${generated} new entries, ${existing.size} total clues`,
  )
  console.log(`Output: ${OUTPUT_PATH}`)
  console.log(`Cache: ${CACHE_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
