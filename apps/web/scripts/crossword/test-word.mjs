const APIFY_TOKEN = process.env.APIFY_TOKEN
const APIFY_DATASET_URL = "https://api.apify.com/v2/actors/moving_beacon-owner1~free-dictionary/runs/last/dataset/items"

if (!APIFY_TOKEN) {
  console.error("Error: APIFY_TOKEN environment variable is required")
  process.exitCode = 1
  process.exit(1)
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
  // Try fetching with high limit to see how many items are in the dataset
  const url = new URL(APIFY_DATASET_URL)
  url.searchParams.set("token", APIFY_TOKEN)
  url.searchParams.set("limit", "100")

  console.log("Fetching from Apify (with limit=100)...\n")
  const response = await fetch(url)
  if (!response.ok) {
    console.error(`Error: ${response.status}`)
    return
  }

  const data = await response.json()
  console.log(`Got ${data.length} items from dataset\n`)

  if (data.length === 0) {
    console.log("Dataset is empty!")
    return
  }

  // Show first 5 words in the dataset
  console.log("First 5 words in dataset:")
  for (let i = 0; i < Math.min(5, data.length); i++) {
    console.log(`  ${i + 1}. ${data[i].word}`)
  }

  // Pick a random word from the dataset and show full result
  const randomIdx = Math.floor(Math.random() * data.length)
  const entry = data[randomIdx]
  const word = entry.word.toUpperCase()

  console.log(`\n\n=== TESTING WITH RANDOM WORD: ${word} ===\n`)

  const clues = generateCluesFromApify(word, entry)

  if (clues) {
    console.log(`Generated ${clues.length} clues:\n`)
    clues.forEach((clue, i) => {
      console.log(`  ${i + 1}. ${clue}`)
    })

    console.log(`\n\nFinal JSON output:`)
    console.log(JSON.stringify({ answer: word, clues }, null, 2))
  } else {
    console.log("No clues generated")
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
