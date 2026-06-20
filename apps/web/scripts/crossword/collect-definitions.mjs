import { readFile, writeFile, mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const APIFY_TOKEN = process.env.APIFY_TOKEN
const RUN_ENDPOINT = "https://api.apify.com/v2/actors/moving_beacon-owner1~free-dictionary/runs"
const DATASET_URL = "https://api.apify.com/v2/actors/moving_beacon-owner1~free-dictionary/runs/last/dataset/items"

const OUTPUT_PATH = resolve(__dirname, "../../../../packages/domain/games/crossword/crossword-definitions.json")
const TARGET_DICT_PATH = resolve(__dirname, "../../../../packages/domain/games/shared/dictionary.target.json")
const PROFANITY_PATH = resolve(__dirname, "../word-guess/profanity-blocklist.txt")

const { words: popularEnglishWords } = await import("popular-english-words")
const require = (await import("module")).createRequire(import.meta.url)
const englishWordList = require("an-array-of-english-words")

if (!APIFY_TOKEN) {
  console.error("Error: APIFY_TOKEN environment variable is required")
  process.exitCode = 1
  process.exit(1)
}

async function loadProfanityBlocklist() {
  const text = await readFile(PROFANITY_PATH, "utf8")
  return new Set(
    text.split(/\r?\n/)
      .map((l) => l.trim().toUpperCase())
      .filter((l) => l.length > 0 && !l.startsWith("#")),
  )
}

function getShortWords(profanityBlocklist) {
  const englishSet = new Set(englishWordList.map((w) => w.toUpperCase()))
  const byLength = { 3: [], 4: [] }

  for (const raw of popularEnglishWords.getAll()) {
    const word = String(raw).trim().toUpperCase()
    if (!/^[A-Za-z]+$/.test(word)) continue
    if (![3, 4].includes(word.length)) continue
    if (!englishSet.has(word)) continue
    if (profanityBlocklist.has(word)) continue
    byLength[word.length].push(word)
  }

  return [...byLength[3].slice(0, 200), ...byLength[4].slice(0, 400)]
}

async function getLongWords() {
  const text = await readFile(TARGET_DICT_PATH, "utf8")
  const dict = JSON.parse(text)
  const result = []
  for (const length of [5, 6, 7, 8, 9, 10]) {
    result.push(...(dict[length] ?? []))
  }
  return result
}

async function triggerActorBatch(words) {
  const payload = {
    flattenOutput: false,
    includeAntonyms: true,
    includePhonetics: false,
    includeSynonyms: true,
    maxRetries: 1,
    words
  }

  const url = new URL(RUN_ENDPOINT)
  url.searchParams.set("token", APIFY_TOKEN)

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Failed to trigger actor: ${response.status}`)
  }

  const runData = await response.json()
  return runData.data.id
}

async function waitForCompletion(runId, timeout = 300000) {
  const startTime = Date.now()
  const checkInterval = 2000

  while (Date.now() - startTime < timeout) {
    const statusUrl = `https://api.apify.com/v2/actors/moving_beacon-owner1~free-dictionary/runs/${runId}`
    const statusResp = await fetch(`${statusUrl}?token=${APIFY_TOKEN}`)
    const statusData = await statusResp.json()
    const status = statusData.data.status

    if (status === "SUCCEEDED") {
      return true
    } else if (status === "FAILED" || status === "ABORTED") {
      throw new Error(`Run failed with status: ${status}`)
    }

    process.stdout.write(`\rWaiting... (${Math.round((Date.now() - startTime) / 1000)}s) Status: ${status}`)
    await new Promise(r => setTimeout(r, checkInterval))
  }

  throw new Error("Run timeout")
}

async function fetchDataset() {
  const url = new URL(DATASET_URL)
  url.searchParams.set("token", APIFY_TOKEN)

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch dataset: ${response.status}`)
  }

  return response.json()
}

async function main() {
  try {
    const profanityBlocklist = await loadProfanityBlocklist()
    const shortWords = getShortWords(profanityBlocklist)
    const longWords = await getLongWords()

    const allWords = [...shortWords, ...longWords]
    const uniqueWords = [...new Set(allWords)].sort()

    console.log(`📊 Total words to fetch: ${uniqueWords.length}`)
    console.log(`  Short (3-4 letters): ${shortWords.length}`)
    console.log(`  Long (5-10 letters): ${longWords.length}`)
    console.log(`\n💰 Budget: $4.86/5.00 (already used $0.14)`)
    console.log(`⚠️  Estimated cost: ~${(uniqueWords.length * 0.01).toFixed(2)} points (assuming 0.01 per word)\n`)

    const BATCH_SIZE = 100
    const totalBatches = Math.ceil(uniqueWords.length / BATCH_SIZE)

    console.log(`🔄 Processing ${totalBatches} batches of ${BATCH_SIZE} words each...\n`)

    const allDefinitions = []
    const failedBatches = []

    for (let i = 0; i < uniqueWords.length; i += BATCH_SIZE) {
      const batchNum = Math.floor(i / BATCH_SIZE) + 1
      const batch = uniqueWords.slice(i, i + BATCH_SIZE)

      try {
        console.log(`\n[Batch ${batchNum}/${totalBatches}] Triggering actor for ${batch.length} words...`)
        const runId = await triggerActorBatch(batch)
        console.log(`✓ Run ID: ${runId}`)

        console.log(`⏳ Waiting for completion...`)
        await waitForCompletion(runId)

        console.log(`\n📥 Fetching dataset...`)
        const data = await fetchDataset()
        console.log(`✓ Got ${data.length} definition(s)`)

        allDefinitions.push(...data)
      } catch (err) {
        console.error(`\n❌ Batch ${batchNum} failed: ${err.message}`)
        console.log(`⚠️  This batch may have exceeded cost limits or had other issues`)
        console.log(`🔄 These words will be retrieved via PipeworxMCP as backup`)
        failedBatches.push({
          batchNum,
          words: batch,
          error: err.message
        })
      }

      // Rate limiting between batches
      if (i + BATCH_SIZE < uniqueWords.length) {
        console.log(`⏱️  Waiting before next batch...`)
        await new Promise(r => setTimeout(r, 2000))
      }
    }

    // Save to file
    console.log(`\n\n💾 Saving ${allDefinitions.length} definitions to file...`)
    await mkdir(dirname(OUTPUT_PATH), { recursive: true })
    await writeFile(OUTPUT_PATH, `${JSON.stringify(allDefinitions, null, 2)}\n`, "utf8")

    console.log(`✓ Saved to ${OUTPUT_PATH}`)

    // Summary
    console.log(`\n${'='.repeat(50)}`)
    console.log(`📈 COLLECTION SUMMARY`)
    console.log(`${'='.repeat(50)}`)
    console.log(`✓ Total definitions collected: ${allDefinitions.length}`)
    const wordSet = new Set(allDefinitions.map(d => d.word.toUpperCase()))
    console.log(`✓ Unique words: ${wordSet.size}`)
    console.log(`✓ Coverage: ${((wordSet.size / uniqueWords.length) * 100).toFixed(1)}%`)

    if (failedBatches.length > 0) {
      console.log(`\n⚠️  FAILED BATCHES: ${failedBatches.length}`)
      failedBatches.forEach(({ batchNum, words }) => {
        console.log(`   Batch ${batchNum}: ${words.length} words (will use PipeworxMCP backup)`)
      })
      console.log(`\n💡 Next step: Run 'npm run crossword:backup-pipeworx' to fetch missing definitions`)
    }

    console.log(`\n✅ Next step: Run 'npm run crossword:build-enriched' to build the enriched dictionary`)
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`)
    process.exitCode = 1
  }
}

main()
