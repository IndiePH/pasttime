import { readFile, writeFile, rm } from "node:fs/promises"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const QUEUE_PATH = resolve(__dirname, "../../../../packages/domain/games/shared/dictionary.enrichment-queue.json")
const ENRICHED_PATH = resolve(__dirname, "../../../../packages/domain/games/shared/dictionary.full.enriched.json")
const BATCH_PATH = resolve(__dirname, "_batch-results.json")

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"))
}
async function writeJson(path, data) {
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8")
}

function getAllWords(queue) {
  const all = []
  for (const [len, words] of Object.entries(queue)) {
    for (const word of words) all.push({ word: String(word).toUpperCase(), length: Number(len) })
  }
  return all
}

async function pick(n) {
  const queue = await readJson(QUEUE_PATH)
  const all = getAllWords(queue)
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  const batch = all.slice(0, Math.min(n, all.length))
  process.stdout.write(JSON.stringify(batch))
}

// Extract a single definition string from a raw define_word response.
// Takes the first definition per part-of-speech (in order), caps at 3, joins with "; ".
function extractDefinition(defineResp) {
  if (!defineResp || defineResp.found === false || !Array.isArray(defineResp.meanings)) return null
  const seenPos = new Set()
  const parts = []
  for (const meaning of defineResp.meanings) {
    const pos = meaning.part_of_speech || ""
    if (seenPos.has(pos)) continue
    seenPos.add(pos)
    const defs = Array.isArray(meaning.definitions) ? meaning.definitions : []
    const first = defs.find((d) => d && typeof d.definition === "string" && d.definition.trim())
    if (first) parts.push(first.definition.trim())
    if (parts.length >= 3) break
  }
  return parts.length ? parts.join("; ") : null
}

function extractField(synResp, key) {
  if (!synResp || !Array.isArray(synResp[key])) return []
  return synResp[key].map((s) => String(s)).filter(Boolean)
}

async function merge() {
  const results = JSON.parse(await readFile(BATCH_PATH, "utf8"))
  const queue = await readJson(QUEUE_PATH)
  let enriched
  try {
    enriched = await readJson(ENRICHED_PATH)
  } catch {
    enriched = {}
  }

  let foundCount = 0
  let droppedCount = 0
  let skippedDupe = 0
  const processed = new Set()

  for (const r of results) {
    const word = String(r.word).toUpperCase()
    if (processed.has(word)) continue
    processed.add(word)
    const len = String(r.length)

    // remove from queue (always)
    if (Array.isArray(queue[len])) {
      queue[len] = queue[len].filter((w) => String(w).toUpperCase() !== word)
    }

    const definition = extractDefinition(r.define)
    const synonyms = extractField(r.syn, "synonyms")
    const antonyms = extractField(r.syn, "antonyms")
    const found = Boolean(definition) || synonyms.length > 0 || antonyms.length > 0

    if (!found) {
      droppedCount++
      continue
    }
    foundCount++

    if (!Array.isArray(enriched[len])) enriched[len] = []
    const existingIdx = enriched[len].findIndex((e) => String(e.word).toUpperCase() === word)
    const entry = { word, definition, synonyms, antonyms }
    if (existingIdx >= 0) {
      // only fill missing fields, prefer existing non-empty data
      const ex = enriched[len][existingIdx]
      enriched[len][existingIdx] = {
        word,
        definition: ex.definition || definition,
        synonyms: [...new Set([...(ex.synonyms || []), ...synonyms])],
        antonyms: [...new Set([...(ex.antonyms || []), ...antonyms])],
      }
      skippedDupe++
    } else {
      enriched[len].push(entry)
    }
  }

  // stable-sort enriched arrays by word for cleanliness (keep existing order otherwise)
  for (const len of Object.keys(enriched)) {
    enriched[len].sort((a, b) => a.word.localeCompare(b.word))
  }

  await writeJson(ENRICHED_PATH, enriched)
  await writeJson(QUEUE_PATH, queue)
  await rm(BATCH_PATH, { force: true })

  const queueTotal = Object.values(queue).reduce((s, w) => s + w.length, 0)
  const enrichedTotal = Object.values(enriched).reduce((s, w) => s + w.length, 0)
  process.stdout.write(
    JSON.stringify({
      processed: processed.size,
      found: foundCount,
      dropped: droppedCount,
      dupeUpdated: skippedDupe,
      queueRemaining: queueTotal,
      enrichedTotal,
    }),
  )
}

const cmd = process.argv[2]
if (cmd === "pick") {
  await pick(Number(process.argv[3] || 8))
} else if (cmd === "merge") {
  await merge()
} else {
  console.error('Usage: node enrich-from-mcp.mjs <pick <n> | merge>')
  process.exitCode = 1
}
