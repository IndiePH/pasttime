import { readFile, writeFile, mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const DEFINITIONS_PATH = resolve(__dirname, "../../../../packages/domain/games/crossword/crossword-definitions.json")
const FULL_DICT_PATH = resolve(__dirname, "../../../../packages/domain/games/shared/dictionary.full.json")
const OUTPUT_PATH = resolve(__dirname, "../../../../packages/domain/games/shared/dictionary.full.enriched.json")

async function main() {
  try {
    console.log("Loading definitions...")
    const defText = await readFile(DEFINITIONS_PATH, "utf8")
    const definitions = JSON.parse(defText)

    console.log("Loading dictionary.full...")
    const dictText = await readFile(FULL_DICT_PATH, "utf8")
    const dictionary = JSON.parse(dictText)

    // Create index of definitions by word
    const defsByWord = new Map()
    for (const def of definitions) {
      const word = def.word.toUpperCase()
      defsByWord.set(word, def)
    }

    console.log(`\nIndexed ${defsByWord.size} definitions\n`)

    // Enrich the dictionary
    const enriched = {}
    let totalEnriched = 0
    let withDefinition = 0
    let withSynonyms = 0
    let withAntonyms = 0

    for (const [length, words] of Object.entries(dictionary)) {
      enriched[length] = []

      for (const word of words) {
        const def = defsByWord.get(word.toUpperCase())

        const entry = {
          word,
          definition: null,
          synonyms: [],
          antonyms: []
        }

        if (def && def.meanings && Array.isArray(def.meanings)) {
          // Get first definition
          for (const meaning of def.meanings) {
            if (!entry.definition && meaning.definitions && meaning.definitions[0]) {
              entry.definition = meaning.definitions[0].definition
              withDefinition++
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

          if (entry.synonyms.length > 0) withSynonyms++
          if (entry.antonyms.length > 0) withAntonyms++
          totalEnriched++
        }

        enriched[length].push(entry)
      }
    }

    // Save enriched dictionary
    console.log("Saving enriched dictionary...")
    await mkdir(dirname(OUTPUT_PATH), { recursive: true })
    await writeFile(OUTPUT_PATH, `${JSON.stringify(enriched, null, 2)}\n`, "utf8")

    // Summary
    console.log(`\n=== ENRICHMENT SUMMARY ===`)
    console.log(`Total words: ${Object.values(enriched).flat().length}`)
    console.log(`Words with data: ${totalEnriched}`)
    console.log(`Words with definitions: ${withDefinition}`)
    console.log(`Words with synonyms: ${withSynonyms}`)
    console.log(`Words with antonyms: ${withAntonyms}`)
    console.log(`\nOutput: ${OUTPUT_PATH}`)
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exitCode = 1
  }
}

main()
