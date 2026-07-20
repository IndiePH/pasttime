# Dictionary Pipeline
updated: 2026-07-20
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
       ├──► listEnrichedAnswerWords()  ──►  Word Guess answer pool
       │    (entries with non-empty definition)   (R2 `answers/{length}.json` + dev file read)
       │
       ├──► D1 `word_definitions` seed  ──►  post-solve definition API
       │
       └──► enriched-dictionary.ts  ──►  lookup / validation helpers
```

**Word Guess answer pool (2026-07-20):** Answers come from enriched entries that
have a definition — not `dictionary.target.json`. Guarantees every daily target has
a definition in D1/local fallback. Tradeoff: smaller pool (~2,540 five-letter words
vs ~3,019 in target). Words like LAURA (in target + blocklist, no enriched entry)
cannot be picked.

**Publish:** `npm run lexicon:publish -w @pasttime/web` uploads R2 answer shards from
enriched and seeds D1 definitions from the same file. Use full publish (not `--d1-only`)
after changing the answer pool. D1-only redo is unnecessary if enriched content is unchanged.

Guessable shards still come from `dictionary.full.json` keyed by `String(length)` —
not a bare `key` variable (that typo crashed publish mid-run after answers/5 uploaded).

**Last successful full publish (2026-07-20):** R2 answers + guessable for lengths 5–10,
crossword answers pack, and D1 `word_definitions` reseeded (15,236 rows).

## Files

| File | Role | Built by |
|------|------|----------|
| `packages/domain/games/shared/dictionary.full.enriched.json` | Definitions + **Word Guess answer pool** (entries with definitions); crossword corpus source | `build-enriched.mjs` + `enrich-from-mcp.mjs` |
| `packages/domain/games/crossword/corpus.json` | Crossword clue pool (answer + clue pairs) | `rebuild-corpus.mjs` (from enriched dict only) |
| `packages/domain/games/shared/dictionary.target.json` | Legacy filtered universe from `build-dictionary.mjs` (crossword bootstrap scripts) | `build-dictionary.mjs` |
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

## Selective sync from word-guess (2026-07-17)

Word-guess mobile added a Play Console policy blocklist (~163 words beyond Pastime).
Pastime did **not** blind-copy those dictionaries (would drop 3–4 letter words and
over-filter crossword vocabulary).

Synced recommendation A only (48 words): slurs/hate variants, crude sexual/porn
slang, hard-drug slang. Added to `manual-blocklist.txt` + `profanity-blocklist.txt`
and stripped from `dictionary.full.json` (guessable). None were in enriched/target.

Explicitly **not** synced: everyday/medical English (`DRUNK`, `HOLOCAUST`,
`GENOCIDE`, `URINE`, `VAGINAL`, `TOBACCO`, `SEXISM`, `CRIPPLE*`, etc.) and mild
body/alcohol terms.
