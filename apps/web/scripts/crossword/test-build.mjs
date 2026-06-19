const APIFY_TOKEN = process.env.APIFY_TOKEN
const APIFY_DATASET_URL = "https://api.apify.com/v2/actors/moving_beacon-owner1~free-dictionary/runs/last/dataset/items"

async function testFetch() {
  const url = new URL(APIFY_DATASET_URL)
  url.searchParams.set("token", APIFY_TOKEN)
  url.searchParams.set("limit", "1")

  console.log("Fetching from Apify...")
  console.log(`URL: ${url.toString()}\n`)

  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`)
      return
    }

    const data = await response.json()
    console.log(`Got ${Array.isArray(data) ? data.length : "1"} items`)
    console.log("\nFirst few entries:")
    console.log(JSON.stringify(data.slice(0, 3), null, 2))

    // Test clue generation
    console.log("\n\n=== TESTING CLUE GENERATION ===\n")

    const entry = data[0]
    const word = entry.word.toUpperCase()
    console.log(`Word: ${word}`)
    console.log(`Found: ${entry.found}`)
    console.log(`Meanings: ${entry.meanings.length}`)

    const clues = []
    const seen = new Set()

    // Process each meaning
    for (const meaning of entry.meanings) {
      console.log(`\n  Part of speech: ${meaning.partOfSpeech}`)

      // Definitions
      for (const def of meaning.definitions) {
        if (def.definition) {
          const words = def.definition.split(/\s+/).slice(0, 12).join(" ")
          if (!seen.has(words)) {
            clues.push(words)
            seen.add(words)
            console.log(`    ✓ Definition: ${words}`)
          }
        }
      }

      // Synonyms
      if (meaning.synonyms && meaning.synonyms.length > 0) {
        for (const syn of meaning.synonyms.slice(0, 2)) {
          if (syn && !seen.has(syn)) {
            clues.push(syn)
            seen.add(syn)
            console.log(`    ✓ Synonym: ${syn}`)
          }
        }
      }

      // Antonyms
      if (meaning.antonyms && meaning.antonyms.length > 0) {
        for (const ant of meaning.antonyms.slice(0, 1)) {
          if (ant) {
            const antClue = `Opposite of ${ant}`
            if (!seen.has(antClue)) {
              clues.push(antClue)
              seen.add(antClue)
              console.log(`    ✓ Antonym: ${antClue}`)
            }
          }
        }
      }

      if (clues.length >= 3) break
    }

    console.log(`\n\nGenerated ${clues.length} clues:`)
    clues.forEach((clue, i) => {
      console.log(`  ${i + 1}. ${clue}`)
    })

    console.log(`\n\nFinal output:`)
    console.log(JSON.stringify({ answer: word, clues }, null, 2))
  } catch (err) {
    console.error(`Fetch failed: ${err.message}`)
  }
}

testFetch()
