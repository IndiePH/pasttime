import { readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

const DEFINITIONS_PATH = resolve(__dirname, "../../../../packages/domain/games/crossword/crossword-definitions.json")

// Note: PipeworxMCP integration would be done via the MCP server
// For now, this script serves as a placeholder to document the backup strategy

async function main() {
  try {
    const text = await readFile(DEFINITIONS_PATH, "utf8")
    const definitions = JSON.parse(text)

    const definedWords = new Set(definitions.map(d => d.word.toUpperCase()))

    console.log(`\n📊 Current definition coverage:`)
    console.log(`   Words with definitions: ${definedWords.size}`)

    console.log(`\n💡 PipeworxMCP Backup Strategy:`)
    console.log(`   For any words that failed to fetch via Apify, you can use:`)
    console.log(`   - mcp__PipeworxMCP__define_word(word)`)
    console.log(`   - mcp__PipeworxMCP__get_synonyms(word)`)
    console.log(`\n   These tools provide alternative definitions and synonyms`)
    console.log(`   when Apify fails or exceeds budget limits.`)

    console.log(`\n📌 To use PipeworxMCP backup:`)
    console.log(`   1. Identify failed words from collect-definitions output`)
    console.log(`   2. Call PipeworxMCP for each word`)
    console.log(`   3. Format response to match Apify structure`)
    console.log(`   4. Add to crossword-definitions.json`)
    console.log(`   5. Re-run 'npm run crossword:enrich-dictionary'`)
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exitCode = 1
  }
}

main()
