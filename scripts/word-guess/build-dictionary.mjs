import { createInterface } from "node:readline"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { createReadStream, existsSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import { words as popularEnglishWords } from "popular-english-words"

const require = createRequire(import.meta.url)
const allCities = require("all-the-cities")
const countryList = require("country-list")
const femaleFirstNames = require("@stdlib/datasets-female-first-names-en")
const maleFirstNames = require("@stdlib/datasets-male-first-names-en")

const ALLOWED_LENGTHS = new Set([5, 6, 7, 8, 9, 10])
const LETTERS_ONLY_PATTERN = /^[A-Za-z]+$/
const ALL_CAPS_PATTERN = /^[A-Z]+$/
const LOWERCASE_ONLY_PATTERN = /^[a-z]+$/
const WORDS_BY_LENGTH_LIMIT = {
  5: 5000,
  6: 5000,
  7: 4500,
  8: 4000,
  9: 3200,
  10: 2500,
}
const MAX_POPULARITY_RANK_BY_LENGTH = {
  5: 70000,
  6: 60000,
  7: 50000,
  8: 40000,
  9: 32000,
  10: 26000,
}
const BLOCKED_PRONOUNS = new Set([
  "ANOTHER",
  "ANYBODY",
  "ANYONE",
  "ANYTHING",
  "EACHOTHER",
  "EVERYBODY",
  "EVERYONE",
  "EVERYTHING",
  "HERSELF",
  "HIMSELF",
  "HISSELF",
  "ITSELF",
  "MYSELF",
  "NOBODY",
  "NONE",
  "NOTHING",
  "OURSELF",
  "OURSELVES",
  "SOMEONE",
  "SOMEBODY",
  "SOMETHING",
  "THEIR",
  "THEIRS",
  "THEM",
  "THEMSELVES",
  "THEY",
  "THOSE",
  "WHOEVER",
  "WHOMEVER",
  "YOURSELF",
  "YOURSELVES",
])
const BLOCKED_PREFIXES = [
  "AERO",
  "ASTRO",
  "BIO",
  "CARDIO",
  "CHRONO",
  "CYTO",
  "DERM",
  "ENDO",
  "GASTRO",
  "GLYCO",
  "HEMATO",
  "HEMO",
  "HISTO",
  "HYDRO",
  "IMUNO",
  "IMMUNO",
  "LYMPH",
  "MICRO",
  "MYCO",
  "NEPHRO",
  "NEURO",
  "OSTEO",
  "PATHO",
  "PHARMA",
  "PHOTO",
  "PHYSIO",
  "PSYCHO",
  "THERMO",
]
const BLOCKED_SUFFIXES = [
  "ALGIA",
  "ASES",
  "EMIA",
  "GENIC",
  "GRAPHY",
  "ITIS",
  "LOGY",
  "OSIS",
  "OTOMY",
  "PHAGE",
  "PHAGY",
  "PHILE",
  "PHOBIA",
  "SCOPY",
  "TOMY",
  "ZOOID",
]
function normalizeToken(value) {
  return value.trim().toUpperCase()
}

function getNameAndPlaceBlocklist() {
  const blocked = new Set()
  const addToken = (value) => {
    if (typeof value !== "string") {
      return
    }

    const token = normalizeToken(value)
    if (
      ALLOWED_LENGTHS.has(token.length) &&
      LETTERS_ONLY_PATTERN.test(token)
    ) {
      blocked.add(token)
    }
  }
  const addPhrase = (value) => {
    if (typeof value !== "string") {
      return
    }

    for (const part of value.split(/[^A-Za-z]+/)) {
      addToken(part)
    }
  }

  for (const name of maleFirstNames()) {
    addToken(name)
  }
  for (const name of femaleFirstNames()) {
    addToken(name)
  }

  for (const city of allCities) {
    addPhrase(city.name)
    addPhrase(city.altName)
  }

  for (const countryName of countryList.getNames()) {
    addPhrase(countryName)
  }

  return blocked
}

const BLOCKED_NAMES_AND_PLACES = getNameAndPlaceBlocklist()

const SOURCE_PATH = resolve(
  "src/domain/games/word-guess/american-english-large.txt",
)
const OUTPUT_PATH = resolve(
  "src/domain/games/word-guess/dictionary.generated.json",
)

function createWordsByLengthMap() {
  const wordsByLength = new Map()
  for (const length of ALLOWED_LENGTHS) {
    wordsByLength.set(length, new Set())
  }
  return wordsByLength
}

function shouldRejectByDomainFilter(word) {
  if (BLOCKED_PRONOUNS.has(word)) {
    return true
  }

  if (BLOCKED_NAMES_AND_PLACES.has(word)) {
    return true
  }

  return (
    BLOCKED_PREFIXES.some((prefix) => word.startsWith(prefix)) ||
    BLOCKED_SUFFIXES.some((suffix) => word.endsWith(suffix))
  )
}

function isWordPopularEnough(word, length) {
  const rank = popularEnglishWords.getWordRank(word.toLowerCase())
  return rank !== -1 && rank <= MAX_POPULARITY_RANK_BY_LENGTH[length]
}

async function loadCandidatesFromText(wordsByLength, counters) {
  const input = createReadStream(SOURCE_PATH, { encoding: "utf8" })
  const reader = createInterface({
    input,
    crlfDelay: Infinity,
  })

  for await (const line of reader) {
    counters.totalLines += 1
    const candidate = line.trim()
    if (candidate.length === 0) {
      continue
    }

    if (!LETTERS_ONLY_PATTERN.test(candidate)) {
      counters.rejectedByChars += 1
      continue
    }

    if (ALL_CAPS_PATTERN.test(candidate)) {
      counters.rejectedByCaps += 1
      continue
    }

    if (!LOWERCASE_ONLY_PATTERN.test(candidate)) {
      counters.rejectedByCapitalization += 1
      continue
    }

    const word = candidate.toUpperCase()
    if (!ALLOWED_LENGTHS.has(word.length)) {
      counters.rejectedByLength += 1
      continue
    }

    wordsByLength.get(word.length).add(word)
    counters.acceptedLines += 1
  }
}

async function loadCandidatesFromExistingDictionary(wordsByLength, counters) {
  const content = await readFile(OUTPUT_PATH, { encoding: "utf8" })
  const dictionary = JSON.parse(content)

  for (const [lengthRaw, words] of Object.entries(dictionary)) {
    const length = Number(lengthRaw)
    if (!ALLOWED_LENGTHS.has(length) || !Array.isArray(words)) {
      continue
    }

    for (const candidate of words) {
      counters.totalLines += 1
      if (typeof candidate !== "string") {
        counters.rejectedByChars += 1
        continue
      }

      const word = candidate.trim().toUpperCase()
      if (!LETTERS_ONLY_PATTERN.test(word)) {
        counters.rejectedByChars += 1
        continue
      }

      wordsByLength.get(length).add(word)
      counters.acceptedLines += 1
    }
  }
}

async function buildWordGuessDictionary() {
  const wordsByLength = createWordsByLengthMap()
  const counters = {
    totalLines: 0,
    acceptedLines: 0,
    rejectedByChars: 0,
    rejectedByCaps: 0,
    rejectedByLength: 0,
    rejectedByCapitalization: 0,
    rejectedByPopularity: 0,
    rejectedByDomainFilter: 0,
  }

  if (existsSync(SOURCE_PATH)) {
    await loadCandidatesFromText(wordsByLength, counters)
  } else if (existsSync(OUTPUT_PATH)) {
    console.warn(
      `Source dictionary not found at ${SOURCE_PATH}; refining existing generated dictionary instead.`,
    )
    await loadCandidatesFromExistingDictionary(wordsByLength, counters)
  } else {
    throw new Error(
      `No dictionary source found. Expected ${SOURCE_PATH} or ${OUTPUT_PATH}.`,
    )
  }

  const dictionary = {}
  for (const length of [...ALLOWED_LENGTHS].sort((a, b) => a - b)) {
    const candidates = [...wordsByLength.get(length)].filter((word) => {
      if (shouldRejectByDomainFilter(word)) {
        counters.rejectedByDomainFilter += 1
        return false
      }

      if (!isWordPopularEnough(word, length)) {
        counters.rejectedByPopularity += 1
        return false
      }

      return true
    })
    const sorted = candidates.sort((a, b) => a.localeCompare(b))
    dictionary[length] = sorted.slice(0, WORDS_BY_LENGTH_LIMIT[length])
  }

  await mkdir(dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, `${JSON.stringify(dictionary, null, 2)}\n`, {
    encoding: "utf8",
  })

  console.log(`Dictionary written to ${OUTPUT_PATH}`)
  console.log(`Total lines: ${counters.totalLines}`)
  console.log(`Accepted lines: ${counters.acceptedLines}`)
  console.log(`Rejected (non A-Z): ${counters.rejectedByChars}`)
  console.log(`Rejected (ALL CAPS): ${counters.rejectedByCaps}`)
  console.log(
    `Rejected (not strict lowercase source token): ${counters.rejectedByCapitalization}`,
  )
  console.log(`Rejected (unsupported length): ${counters.rejectedByLength}`)
  console.log(`Rejected (domain filters): ${counters.rejectedByDomainFilter}`)
  console.log(`Rejected (low popularity): ${counters.rejectedByPopularity}`)
  for (const length of [...ALLOWED_LENGTHS].sort((a, b) => a - b)) {
    console.log(
      `${length}-letter words: ${dictionary[length].length.toLocaleString()}`,
    )
  }
}

buildWordGuessDictionary().catch((error) => {
  console.error("Failed to build dictionary", error)
  process.exitCode = 1
})
