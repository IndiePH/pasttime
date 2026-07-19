# Game Catalog

Internal planning catalog for game IDs, display titles, and legal/gameplay checks.
This is not legal advice.

## Naming rules

- Use permanent kebab-case IDs (for routes and internal references)
- Keep display titles trademark-safe
- Never use third-party brand names in `title`, hub cards, or marketing copy
- Add legal review notes before promoting a game to live

## Adding a new game checklist

1. Choose a permanent internal `id` in kebab-case.
2. Choose a trademark-safe display `title`.
3. Check trademark status for both game title and close variants.
4. Record `legalStatus`: `ok`, `caution`, or `blocked`.
5. Confirm gameplay can be built with minimal assets (words, cards, simple grid/tokens).
6. Record mode support (solo, multiplayer, co-op) and player limits.
7. Add registry entry, icon ID, and card header color.
8. Add or wire feature module for the game route.
9. Verify launch/play routes use module registry (no hard-coded slug checks).
10. Re-check legal status before release.

## Planned game list (requested)

| # | id | title | Inspiration | legalStatus | Gameplay viability note | Reconsider for launch? |
|---|---|---|---|---|---|---|
| 1 | `word-guess` | Word Guess | Wordle-style | caution | Strong fit. Word list + letter grid only. Solo + multiplayer + co-op planned. | No |
| 2 | `solitaire` | Solitaire | Klondike + other layouts | caution | Available. Klondike Draw 1/3 are playable; Pyramid, TriPeaks, and FreeCell remain preview modes (see `docs/SOLITAIRE.md`). | No |
| 3 | `tongits` | Tongits | Tongits | caution | Strong fit. Standard 52-card rules and simple card UI. Multiplayer. | Maybe (trademark check first) |
| 4 | `pusoy-dos` | Pusoy Dos | Pusoy dos | caution | Strong fit. Standard card-game mechanics and simple UI. Multiplayer. | Maybe (trademark check first) |
| 5 | `crossword` | Crossword | Crossword puzzle | caution | Fit for solo with text/grid assets only. | Maybe (content pipeline complexity) |
| 6 | `sudoku` | Sudoku | Sudoku puzzle | caution | Available. Classic 9×9 with Easy/Medium/Hard, daily/random play, candidates, undo, timer, and stats. | No |
| 7 | `reversi` | Reversi | Reversi/Othello-style | caution | Great fit. 8x8 board + two token colors. Solo or multiplayer. | Maybe (rules polish) |
| 8 | `fleet-grid` | Fleet Grid | Battleship-style | caution | Fit with grid + markers only. Solo practice or multiplayer. | Maybe (avoid trademarked wording) |
| 9 | `spades` | Spades | Spades | caution | Strong card game candidate for multiplayer. | Maybe (trademark check first) |
| 10 | `word-factory` | Word Factory | Word-build/word-search style | caution | Good fit. Letters and dictionary only. Solo or multiplayer. | Maybe |
| 11 | `type-rush` | Type Rush | Type racing | caution | Strong fit. Text-only gameplay for solo/multiplayer. | Maybe (name trademark check) |
| 12 | `type-shield` | Type Shield | Typing defense co-op | caution | Strong fit. Words as falling enemies, minimal art required. Co-op focused. | Maybe |
| 13 | `tile-words` | Tile Words | Tile word strategy | caution | Good fit with tile letters and scoring UI. Solo or multiplayer. | Maybe (name trademark check) |

## Additional low-asset game ideas

| id | title | Modes | Why it fits minimal assets |
|---|---|---|---|
| `word-chain` | Word Chain | Solo, Multiplayer | Text-only turn flow using last-letter rule |
| `word-categories` | Word Categories | Solo, Multiplayer | Prompt + text input only |
| `word-clues` | Word Clues | Multiplayer | Team clue/guess flow with words only |
| `word-teams` | Word Teams | Multiplayer | Grid of words + clue system |
| `hangman` | Hangman | Solo, Multiplayer | Classic letter guessing with simple text UI |
| `word-search` | Word Search | Solo | Letter grid generation and list only |
| `letter-swap` | Letter Swap | Solo, Multiplayer | Anagram gameplay with letter tiles |
| `four-in-a-row` | Four in a Row | Solo, Multiplayer | Simple grid + token colors |
| `mines-grid` | Mines Grid | Solo | Numbered grid logic with zero art needs |
| `twenty-one` | Twenty One | Solo, Multiplayer | Card values + basic table layout |
| `hearts` | Hearts | Multiplayer | Standard card game with minimal visuals |
| `checkers` | Checkers | Solo, Multiplayer | Board + two token sets only |
