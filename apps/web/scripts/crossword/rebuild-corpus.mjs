/**
 * Rebuild corpus.json from dictionary.full.enriched.json exclusively.
 *
 * Every word in the enriched dictionary that has a definition becomes a
 * crossword-pool entry with its definition as the clue. Synonyms and
 * antonyms are also stored as alternative/backup clues.
 *
 * Usage: node apps/web/scripts/crossword/rebuild-corpus.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENRICHED_PATH = resolve(__dirname, '../../../../packages/domain/games/shared/dictionary.full.enriched.json');
const CORPUS_PATH = resolve(__dirname, '../../../../packages/domain/games/crossword/corpus.json');

const enriched = JSON.parse(readFileSync(ENRICHED_PATH, 'utf-8'));

const LETTERS_ONLY = /^[A-Z]+$/;
const MIN_LEN = 3;
const MAX_LEN = 10;

const corpus = [];
let skippedNoDef = 0;
let skippedInvalid = 0;

for (const entries of Object.values(enriched)) {
  for (const entry of entries) {
    const word = entry.word.toUpperCase();
    // Basic validation
    if (!LETTERS_ONLY.test(word)) { skippedInvalid++; continue; }
    if (word.length < MIN_LEN || word.length > MAX_LEN) { skippedInvalid++; continue; }
    if (!entry.definition) { skippedNoDef++; continue; }

    corpus.push({
      answer: word,
      clue: entry.definition,
    });
  }
}

// Sort alphabetically for determinism
corpus.sort((a, b) => a.answer.localeCompare(b.answer));

writeFileSync(CORPUS_PATH, JSON.stringify(corpus, null, 2) + '\n', 'utf-8');

console.log(`Corpus rebuilt from enriched dictionary only.\n`);
console.log(`  Total entries:      ${corpus.length}`);
console.log(`  Skipped (no def):   ${skippedNoDef}`);
console.log(`  Skipped (invalid):  ${skippedInvalid}`);
console.log(`\nWritten → ${CORPUS_PATH}`);
