import { readFile, writeFile, mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const APIFY_DEFS_PATH = resolve(__dirname, "../../../../packages/domain/games/crossword/crossword-definitions.json")
const ENRICHED_DICT_PATH = resolve(__dirname, "../../../../packages/domain/games/shared/dictionary.full.enriched.json")
const OUTPUT_PATH = resolve(__dirname, "../../../../packages/domain/games/shared/dictionary.full.enriched.json")

async function main() {
  try {
    console.log(`\n🔄 Merging Apify definitions into enriched dictionary...\n`)

    // Load Apify definitions
    const apifyText = await readFile(APIFY_DEFS_PATH, "utf8")
    const apifyDefs = JSON.parse(apifyText)

    // Load enriched dictionary template
    const dictText = await readFile(ENRICHED_DICT_PATH, "utf8")
    const enriched = JSON.parse(dictText)

    // Create lookup map from Apify data
    const apifyByWord = new Map()
    for (const def of apifyDefs) {
      apifyByWord.set(def.word.toUpperCase(), def)
    }

    console.log(`📥 Loaded ${apifyDefs.length} Apify definitions`)
    console.log(`📋 Processing ${Object.values(enriched).flat().length} words in enriched dict...\n`)

    let merged = 0
    let withDef = 0
    let withSyn = 0
    let withAnt = 0

    // Merge definitions
    for (const [length, words] of Object.entries(enriched)) {
      for (const entry of words) {
        const apifyDef = apifyByWord.get(entry.word.toUpperCase())

        if (apifyDef && apifyDef.meanings && Array.isArray(apifyDef.meanings)) {
          merged++

          // Get first definition
          for (const meaning of apifyDef.meanings) {
            if (!entry.definition && meaning.definitions && meaning.definitions[0]) {
              entry.definition = meaning.definitions[0].definition
              withDef++
            }

            // Collect synonyms
            if (meaning.synonyms && Array.isArray(meaning.synonyms)) {
              entry.synonyms.push(...meaning.synonyms)
            }

            // Collect antonyms
            if (meaning.antonyms && Array.isArray(meaning.antonyms)) {
              entry.antonyms.push(...meaning.antonyms)
            }
          }

          if (entry.synonyms.length > 0) withSyn++
          if (entry.antonyms.length > 0) withAnt++
        }
      }
    }

    // Save merged dictionary
    await mkdir(dirname(OUTPUT_PATH), { recursive: true })
    await writeFile(OUTPUT_PATH, `${JSON.stringify(enriched, null, 2)}\n`, "utf8")

    console.log(`\n✅ MERGE COMPLETE`)
    console.log(`   Words with Apify data: ${merged}`)
    console.log(`   Words with definitions: ${withDef}`)
    console.log(`   Words with synonyms: ${withSyn}`)
    console.log(`   Words with antonyms: ${withAnt}`)
    console.log(`   Coverage: ${((merged / Object.values(enriched).flat().length) * 100).toFixed(1)}%`)

    console.log(`\n💾 Saved: ${OUTPUT_PATH}`)
    console.log(`\n🎯 Ready for clue generation!`)
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exitCode = 1
  }
}

main()
