import { mkdir, readFile, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import { words as popularEnglishWords } from "popular-english-words"

const require = createRequire(import.meta.url)
const allCities = require("all-the-cities")
const countryList = require("country-list")
const femaleFirstNames = require("@stdlib/datasets-female-first-names-en")
const maleFirstNames = require("@stdlib/datasets-male-first-names-en")
const englishWordList = require("an-array-of-english-words")

const ALLOWED_LENGTHS = new Set([3, 4, 5, 6, 7, 8, 9, 10])
// ASCII English alphabet only — rejects accents, apostrophes, hyphens, digits.
const LETTERS_ONLY_PATTERN = /^[A-Za-z]+$/
const WORDS_BY_LENGTH_LIMIT = {
  3: 1200,
  4: 3200,
  5: 5000,
  6: 5000,
  7: 4500,
  8: 4000,
  9: 3200,
  10: 2500,
}
const MAX_POPULARITY_RANK_BY_LENGTH = {
  3: 85000,
  4: 85000,
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
// Purely grammatical 3–4 letter words that make poor game answers.
const BLOCKED_FUNCTION_WORDS = new Set([
  // Conjunctions / articles / prepositions
  "THE", "AND", "BUT", "NOR", "FOR", "VIA",
  "ALSO", "FROM", "INTO", "ONTO", "THAN", "UPON", "WITH",
  // Pronouns (3–4 letter, not already in BLOCKED_PRONOUNS)
  "HER", "HIM", "HIS", "ITS", "OUR", "SHE", "WHO", "YOU",
  "EACH", "HERS", "MINE", "OURS", "THAT", "THIS", "WHAT", "WHOM", "YOUR",
  // Auxiliaries
  "ARE", "CAN", "HAS", "HAD", "MAY", "WAS",
  "BEEN", "DOES", "HAVE", "MUST", "NEED", "USED", "WERE", "WILL",
  // Adverbs / particles
  "HOW", "NOT", "TOO", "WHY",
  "ELSE", "ONLY", "VERY",
  // Determiners / quantifiers
  "ALL", "ANY", "FEW",
  "BOTH", "LESS", "MANY", "MOST", "MUCH", "MORE", "SOME", "SUCH",
])
function normalizeToken(value) {
  return value.trim().toUpperCase()
}

// Real English words (~275k). The corpus contains many proper nouns that are
// "popular" but not dictionary words; intersecting against this list drops them.
const ENGLISH_WORD_SET = new Set(
  englishWordList.map((word) => word.toUpperCase()),
)

async function loadCustomBlocklists() {
  const read = async (name) => {
    const text = await readFile(resolve(SHARED_DIR, name), "utf8")
    return text
      .split(/\r?\n/)
      .map((l) => l.trim().toUpperCase())
      .filter((l) => l.length > 0 && !l.startsWith("#"))
  }
  const [manual, profanity] = await Promise.all([
    read("manual-blocklist.txt"),
    read("profanity-blocklist.txt"),
  ])
  return new Set([...manual, ...profanity])
}

function getNameAndPlaceBlocklist() {
  const blocked = new Set()

  // First names: skip if the token is a real English word (common noun/verb/adj).
  // CROSS, STING, GRACE etc. are valid game answers even though they appear in
  // name databases; only block names that have no independent English meaning.
  const addNameToken = (value) => {
    if (typeof value !== "string") {
      return
    }
    const token = normalizeToken(value)
    if (
      ALLOWED_LENGTHS.has(token.length) &&
      LETTERS_ONLY_PATTERN.test(token) &&
      !ENGLISH_WORD_SET.has(token)
    ) {
      blocked.add(token)
    }
  }

  // Cities and countries: block unconditionally. Words like BOSTON or JORDAN
  // may appear in the English word list with secondary meanings, but in a word
  // guessing game they read as proper nouns and make poor answers.
  const addPlaceToken = (value) => {
    if (typeof value !== "string") {
      return
    }
    const token = normalizeToken(value)
    if (ALLOWED_LENGTHS.has(token.length) && LETTERS_ONLY_PATTERN.test(token)) {
      blocked.add(token)
    }
  }

  for (const name of maleFirstNames()) {
    addNameToken(name)
  }
  for (const name of femaleFirstNames()) {
    addNameToken(name)
  }

  // Only block cities large enough to be widely recognised as proper nouns.
  // Small towns (e.g. Forest, VA pop 9 k; Early, TX pop 2.8 k) share names
  // with common English words and should not be blocked.
  const MIN_CITY_POPULATION = 50_000
  for (const city of allCities) {
    if ((city.population || 0) >= MIN_CITY_POPULATION) {
      addPlaceToken(city.name)
      addPlaceToken(city.altName)
    }
  }

  for (const countryName of countryList.getNames()) {
    addPlaceToken(countryName)
  }

  return blocked
}

const BLOCKED_NAMES_AND_PLACES = getNameAndPlaceBlocklist()

const SHARED_DIR = resolve("../../packages/domain/games/shared")
// Heavily filtered answer words — used to pick the target word in word-guess.
const OUTPUT_PATH = resolve(SHARED_DIR, "dictionary.target.json")
// All valid English words minus profanity — used to validate player input.
// Includes plurals, verb forms, etc. so BANKS and RUNNING are accepted guesses.
const FULL_OUTPUT_PATH = resolve(SHARED_DIR, "dictionary.full.json")

function createWordsByLengthMap() {
  const wordsByLength = new Map()
  for (const length of ALLOWED_LENGTHS) {
    wordsByLength.set(length, new Set())
  }
  return wordsByLength
}

function isBlocklistedDerivative(word, blocklist) {
  if (word.endsWith("S") && blocklist.has(word.slice(0, -1))) return true
  if (word.endsWith("ES") && blocklist.has(word.slice(0, -2))) return true
  if (word.endsWith("IES") && blocklist.has(word.slice(0, -3) + "Y")) return true

  if (word.endsWith("ING")) {
    const stem = word.slice(0, -3)
    if (blocklist.has(stem)) return true
    if (blocklist.has(stem + "E")) return true
    if (word.length >= 7 && blocklist.has(word.slice(0, -4))) return true
  }

  if (word.endsWith("ED")) {
    if (blocklist.has(word.slice(0, -2))) return true
    if (blocklist.has(word.slice(0, -1))) return true
    if (word.length >= 6 && blocklist.has(word.slice(0, -3))) return true
  }

  if (word.endsWith("ER")) {
    const stem = word.slice(0, -2)
    if (blocklist.has(stem)) return true
    if (blocklist.has(stem + "E")) return true
    if (word.length >= 6 && blocklist.has(word.slice(0, -3))) return true
  }

  return false
}

function shouldRejectByDomainFilter(word) {
  if (BLOCKED_PRONOUNS.has(word)) {
    return true
  }

  if (BLOCKED_FUNCTION_WORDS.has(word)) {
    return true
  }

  if (BLOCKED_NAMES_AND_PLACES.has(word)) {
    return true
  }

  // Regular -ies plurals (ABILITIES, ACTIVITIES). Also drops a few invariant
  // -ies nouns (SERIES, SPECIES); acceptable for a guessing game.
  if (word.endsWith("IES")) {
    return true
  }

  // -S plurals where the stem is a real English word (REACTORS→REACTOR,
  // CRUISES→CRUISE). Base words that naturally end in S (GRASS, BONUS, KUDOS)
  // are kept because their "stem" is not a dictionary word.
  if (word.endsWith("S") && ENGLISH_WORD_SET.has(word.slice(0, -1))) {
    return true
  }

  // -ING verb forms. Checks both the direct stem (EATING→EAT) and the
  // doubled-consonant stem (RUNNING→RUN). Both checks require the stem to be
  // at least 3 chars (word.length >= 6 / >= 7) so that 2-letter abbreviations
  // in the dictionary (e.g. ST) don't incorrectly flag base words like STING.
  if (
    word.endsWith("ING") &&
    ((word.length >= 6 && ENGLISH_WORD_SET.has(word.slice(0, -3))) ||
      (word.length >= 7 && ENGLISH_WORD_SET.has(word.slice(0, -4))))
  ) {
    return true
  }

  // -ED verb forms. Checks both the direct stem (JUMPED→JUMP) and the
  // doubled-consonant stem (REBELLED→REBEL). Doubled-consonant check requires
  // word.length >= 6 so the stem is at least 3 chars.
  if (
    word.endsWith("ED") &&
    (ENGLISH_WORD_SET.has(word.slice(0, -2)) ||
      (word.length >= 6 && ENGLISH_WORD_SET.has(word.slice(0, -3))))
  ) {
    return true
  }

  // -EST superlatives (FASTEST→FAST, BIGGEST→BIG via doubled consonant).
  // word.length >= 7 avoids false positives on 6-letter base words like
  // FOREST (stem FOR) and MODEST (stem MOD).
  if (
    word.endsWith("EST") &&
    word.length >= 7 &&
    (ENGLISH_WORD_SET.has(word.slice(0, -3)) ||
      ENGLISH_WORD_SET.has(word.slice(0, -4)))
  ) {
    return true
  }

  // -LY adverbs/adjectives (SLOWLY→SLOW, KINDLY→KIND).
  // word.length >= 6 avoids false positives on 5-letter base words like
  // EARLY (stem EAR), CURLY (stem CUR), BURLY (stem BUR).
  if (
    word.endsWith("LY") &&
    word.length >= 6 &&
    ENGLISH_WORD_SET.has(word.slice(0, -2))
  ) {
    return true
  }

  // -ER comparatives (FASTER→FAST, LOUDER→LOUD). Direct stem only — no
  // doubled-consonant check to avoid false positives on BITTER, LETTER, etc.
  // word.length >= 6 keeps 5-letter base words (WATER, TIGER, AFTER, OFFER).
  // Agent nouns (LEADER→LEAD, DEALER→DEAL) are also caught; accepted trade-off.
  if (
    word.endsWith("ER") &&
    word.length >= 6 &&
    ENGLISH_WORD_SET.has(word.slice(0, -2))
  ) {
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

function loadCandidatesFromCorpus(wordsByLength, counters) {
  for (const raw of popularEnglishWords.getAll()) {
    counters.totalLines += 1
    const candidate = String(raw).trim()

    if (!LETTERS_ONLY_PATTERN.test(candidate)) {
      counters.rejectedByChars += 1
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

async function buildWordGuessDictionary() {
  const wordsByLength = createWordsByLengthMap()
  const counters = {
    totalLines: 0,
    acceptedLines: 0,
    rejectedByChars: 0,
    rejectedByLength: 0,
    rejectedByNonDictionary: 0,
    rejectedByCustomBlocklist: 0,
    rejectedByPopularity: 0,
    rejectedByDomainFilter: 0,
  }

  const [customBlocklist] = await Promise.all([
    loadCustomBlocklists(),
    Promise.resolve(loadCandidatesFromCorpus(wordsByLength, counters)),
  ])

  const dictionary = {}
  for (const length of [...ALLOWED_LENGTHS].sort((a, b) => a - b)) {
    const accepted = [...wordsByLength.get(length)].filter((word) => {
      if (!ENGLISH_WORD_SET.has(word)) {
        counters.rejectedByNonDictionary += 1
        return false
      }

      if (customBlocklist.has(word) || isBlocklistedDerivative(word, customBlocklist)) {
        counters.rejectedByCustomBlocklist += 1
        return false
      }

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

    const sorted = accepted.sort((a, b) => a.localeCompare(b))
    dictionary[length] = sorted.slice(0, WORDS_BY_LENGTH_LIMIT[length])
  }

  await mkdir(dirname(OUTPUT_PATH), { recursive: true })
  await writeFile(OUTPUT_PATH, `${JSON.stringify(dictionary, null, 2)}\n`, {
    encoding: "utf8",
  })

  // Build the full validation dictionary from the English word list directly.
  // No domain filters, no popularity cap — any real English word (minus profanity)
  // is a valid guess, so BANKS, RUNNING, etc. are accepted as player input.
  const fullDictionary = {}
  for (const length of [...ALLOWED_LENGTHS].sort((a, b) => a - b)) {
    fullDictionary[length] = []
  }
  for (const raw of englishWordList) {
    const word = raw.toUpperCase()
    if (
      ALLOWED_LENGTHS.has(word.length) &&
      LETTERS_ONLY_PATTERN.test(word) &&
      !customBlocklist.has(word) &&
      !isBlocklistedDerivative(word, customBlocklist)
    ) {
      fullDictionary[word.length].push(word)
    }
  }
  for (const length of [...ALLOWED_LENGTHS].sort((a, b) => a - b)) {
    fullDictionary[length] = fullDictionary[length].sort((a, b) =>
      a.localeCompare(b),
    )
  }

  await mkdir(dirname(FULL_OUTPUT_PATH), { recursive: true })
  await writeFile(FULL_OUTPUT_PATH, `${JSON.stringify(fullDictionary, null, 2)}\n`, {
    encoding: "utf8",
  })

  console.log(`Answer dictionary written to ${OUTPUT_PATH}`)
  console.log(`Full dictionary written to ${FULL_OUTPUT_PATH}`)
  console.log(`Corpus candidates scanned: ${counters.totalLines}`)
  console.log(`Corpus candidates accepted: ${counters.acceptedLines}`)
  console.log(`Rejected (non A-Z): ${counters.rejectedByChars}`)
  console.log(`Rejected (unsupported length): ${counters.rejectedByLength}`)
  console.log(`Rejected (not in English dictionary): ${counters.rejectedByNonDictionary}`)
  console.log(`Rejected (custom blocklist): ${counters.rejectedByCustomBlocklist}`)
  console.log(`Rejected (domain filters): ${counters.rejectedByDomainFilter}`)
  console.log(`Rejected (low popularity): ${counters.rejectedByPopularity}`)
  for (const length of [...ALLOWED_LENGTHS].sort((a, b) => a - b)) {
    console.log(
      `${length}-letter words (answers): ${dictionary[length].length.toLocaleString()} | (valid input): ${fullDictionary[length].length.toLocaleString()}`,
    )
  }
}

buildWordGuessDictionary().catch((error) => {
  console.error("Failed to build dictionary", error)
  process.exitCode = 1
})
