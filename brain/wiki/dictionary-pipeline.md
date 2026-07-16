# Dictionary Pipeline
updated: 2026-07-03
tags: [architecture, data-pipeline, crossword, word-guess]
related: [engineering-decisions]

> **Runtime (2026-07-16):** Large lexicon JSON must not be Worker-bundled. Planned
> publish path is R2 (length shards) + D1 (definitions). Implementation handoff:
> `docs/CONTENT-STORAGE-HANDOFF.md`.

## Data Flow

```
dictionary.full.enriched.json  ──►  corpus.json  ──►  crossword generator
  (single source of truth)           (clue pool)        (generator.ts imports corpus.json)
       │
       └──► enriched-dictionary.ts  ──►  word-guess game
            (TypeScript wrapper)         (pick-target-word.ts, etc.)
```

## Files

| File | Role | Built by |
|------|------|----------|
| `packages/domain/games/shared/dictionary.full.enriched.json` | Canonical word list with definitions, synonyms, antonyms | `build-enriched.mjs` + `enrich-from-mcp.mjs` |
| `packages/domain/games/crossword/corpus.json` | Crossword clue pool (answer + clue pairs) | `rebuild-corpus.mjs` (from enriched dict only) |
| `packages/domain/games/shared/dictionary.target.json` | Canonical word universe (just word lists by length) | crossword scripts |
| `packages/domain/games/shared/dictionary.full.json` | Original raw dictionary | git history |
| `packages/domain/games/shared/manual-blocklist.txt` | Words excluded from enriched dict (definitions still contain the word) | manual |

## Enriched Dictionary Format

```json
{
  "3": [
    {
      "word": "ACE",
      "definition": "A single point or spot on a playing card or die.",
      "synonyms": ["pip", "excellent"],
      "antonyms": []
    }
  ],
  "4": [...]
}
```

Keyed by word length (strings "3"–"10"), each an array of entries sorted alphabetically by word.

## Fixing Self-Referential Definitions

1. Scan `dictionary.full.enriched.json` for entries where `definition` contains the `word` (case-insensitive).
2. Query local WordNet CLI: `wn.exe WORD -syns{pos} -g` for each POS (verb → noun → adjective → adverb).
3. Parse `words -- (definition)` lines (not `=>` hypernym lines).
4. Validate: target word must be in the synset's word list; definition must not contain the target word.
5. Pick first valid definition across all POS, capitalize first letter.

WordNet installed at: `C:\Program Files (x86)\WordNet\2.1\bin\wn.exe`

## Regenerating Crossword Corpus

```bash
node apps/web/scripts/crossword/rebuild-corpus.mjs
```

Reads every word with a definition from `dictionary.full.enriched.json` and writes `corpus.json` with `answer` + `clue` pairs. Run after any enriched dictionary update.

## Stats (as of 2026-07-03)

- Enriched dictionary entries: 15,236
- Corpus entries: 15,236 (no placeholder clues)
- Self-referential defs fixed via WordNet: 1,052
- Self-referential defs fixed manually: 515
- Words removed (blocklisted): 7 (ERG, LAC, SOC, GRAM, KANA, ROMA, NEATH)
- Remaining self-referential: 0
