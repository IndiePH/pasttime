const APIFY_TOKEN = process.env.APIFY_TOKEN
const RUN_ENDPOINT = "https://api.apify.com/v2/actors/moving_beacon-owner1~free-dictionary/runs"
const DATASET_URL = "https://api.apify.com/v2/actors/moving_beacon-owner1~free-dictionary/runs/last/dataset/items"

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

async function triggerActor(word) {
  const payload = {
    flattenOutput: false,
    includeAntonyms: true,
    includePhonetics: false,
    includeSynonyms: true,
    maxRetries: 1,
    words: [word]
  }

  const url = new URL(RUN_ENDPOINT)
  url.searchParams.set("token", APIFY_TOKEN)

  console.log(`Triggering Apify actor for word: ${word}...`)
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Failed to trigger actor: ${response.status} ${response.statusText}`)
  }

  const runData = await response.json()
  console.log(`Run started: ${runData.data.id}`)
  console.log(`Status: ${runData.data.status}\n`)

  // Poll for completion
  const runId = runData.data.id
  let completed = false
  let attempts = 0
  const maxAttempts = 60 // 2 minutes with 2 second intervals

  while (!completed && attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 2000))
    attempts++

    const statusUrl = `https://api.apify.com/v2/actors/moving_beacon-owner1~free-dictionary/runs/${runId}`
    const statusResp = await fetch(`${statusUrl}?token=${APIFY_TOKEN}`)
    const statusData = await statusResp.json()
    const status = statusData.data.status

    process.stdout.write(`\rWaiting for completion... (${attempts * 2}s) Status: ${status}`)

    if (status === "SUCCEEDED") {
      completed = true
    } else if (status === "FAILED" || status === "ABORTED") {
      throw new Error(`Run failed with status: ${status}`)
    }
  }

  console.log("\n\nRun completed!\n")
  return runId
}

async function fetchResults() {
  const url = new URL(DATASET_URL)
  url.searchParams.set("token", APIFY_TOKEN)

  console.log("Fetching results from dataset...\n")
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch results: ${response.status}`)
  }

  return response.json()
}

async function main() {
  const testWord = "MONITOR"

  try {
    // Trigger the actor
    await triggerActor(testWord)

    // Fetch results
    const data = await fetchResults()
    console.log(`Got ${data.length} item(s) from dataset\n`)

    if (data.length === 0) {
      console.log("No results in dataset")
      return
    }

    // Process the word
    const entry = data.find(item => item.word.toUpperCase() === testWord)

    if (!entry) {
      console.log(`${testWord} not found in results`)
      console.log("\nResults:")
      data.forEach(item => {
        console.log(`  - ${item.word}`)
      })
      return
    }

    const word = entry.word.toUpperCase()
    console.log(`=== RESULTS FOR: ${word} ===\n`)

    const clues = generateCluesFromApify(word, entry)

    if (clues) {
      console.log(`Generated ${clues.length} clues:\n`)
      clues.forEach((clue, i) => {
        console.log(`  ${i + 1}. ${clue}`)
      })

      console.log(`\n\nFinal JSON output:`)
      console.log(JSON.stringify({ answer: word, clues }, null, 2))
    } else {
      console.log("No clues could be generated from this entry")
      console.log("\nEntry structure:")
      console.log(JSON.stringify(entry, null, 2))
    }
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exitCode = 1
  }
}

main()
