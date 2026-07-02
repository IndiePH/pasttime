# Classic Game Conventions — Solitaire & Word Guess
updated: 2026-07-01
tags: [games, solitaire, word-guess, conventions, design]
related: [nyt-engagement-patterns, engineering-decisions]

## Solitaire Klondike — Original Conventions

### Standard Rules
- **Deck**: 52 cards, standard French-suited
- **Layout**: 7 columns — 1st has 1 card (face-up), 2nd has 2 (1 face-up), ... 7th has 7 (1 face-up)
- **Stock**: Remaining 24 cards face-down, draw 1 or 3 at a time
- **Foundation**: 4 piles (A→K, one per suit) — win when all 52 cards are there
- **Tableau**: Build descending, alternating colors (e.g. red 7 on black 8)
- **Empty column**: Can only start with a King (or sequence starting with King)
- **Move**: Drag cards between columns, or tap to auto-move to foundation

### Scoring (Microsoft Solitaire style)
- Moving to foundation: 10 points
- Turning over a tableau card: 5 points
- Stock cycle (draw 1): 0 points
- Stock cycle (draw 3): −20 points (penalty for cycling without progress)
- Timer bonus: if won, (700,000 − elapsed_seconds) / 10,000 points

### Conventional UX
- Three-tab draw or one-card draw (toggle in settings)
- Right-click / double-click to auto-send to foundation
- Highlight valid moves (optional)
- Timer visible
- Win animation (cascading cards)

### Common Variations
- **Draw 1 vs Draw 3**: Draw 1 is easier (more options per turn)
- **Vegas scoring**: Bet $52, earn $5 per card on foundation
- **Timed vs untimed**: Classic has no timer (MS added it)
- **Auto-complete**: After all face-down cards revealed, remaining cards auto-move to foundation

### What Pasttime Can Do Differently
- Remove the timer pressure from the main mode (engagement layer handles optional timer)
- Focus on clean, satisfying drag + tap interaction
- Daily Solitaire puzzle: seeded deterministic deal (same seed → same layout)
  → Reuses existing `@pasttime/domain/daily` infrastructure!
- Streak tracking for daily solitaire solves
- Comparative rankings: "Your 47% win rate is higher than 60% of players"

---

## Word Guess (Wordle-inspired) — Original Conventions

### Standard Rules (Wordle)
- **Goal**: Guess a 5-letter word in 6 tries
- **Feedback per guess**:
  - 🟩 Green: Letter is correct and in the right position
  - 🟨 Yellow: Letter is in the word but wrong position
  - ⬜ Gray: Letter is not in the word
- **Keyboard feedback**: On-screen keyboard updates color per letter
- **One puzzle per day, shared globally** (the original Wordle model)
- **Hard mode**: Once you find a correct letter, you must use it in subsequent guesses

### Wordle's Engagement Pattern (The Blueprint)
- **Single daily puzzle** — creates shared experience, water-cooler effect
- **No timer** — low pressure, play at your own pace
- **Shareable result grid** — colored squares only (no spoilers)
- **Streak tracking** — current streak + max streak
- **Guess distribution** — show how your attempts compare to others
- **Stats**: Games played, win %, current streak, max streak

### Conventional UX
- 6 rows × 5 columns grid
- On-screen keyboard
- Submit with Enter key
- Delete/backspace
- Animations: tile flip (reveal), shake (invalid word), bounce (completed row)
- Results reveal sequentially (not all at once) — dramatic tension per tile

### Word Guess Variants
- **Word size variations**: 4-letter (easy), 6-letter (hard), 7-letter (expert)
- **Timed mode**: Race against the clock
- **Infinite mode**: Random words, not daily
- **Multiplayer**: Compare guesses with friends in real-time
- **Themed dictionaries**: Categories (movies, geography, etc.)

### What Pasttime Can Do Differently
- Already supports daily + endless modes (reuses crosswords pattern)
- Daily seeded word: use `getDailySeed` to pick a deterministic target word
- **Comparative rankings**: "Solved in 3 tries — better than 85% of players today"
- Share card: emoji grid just like Wordle (already the gold standard)
- Streak + stats in the shared engagement layer
- Hard mode toggle
- Word size selection in endless mode (mirrors crossword size selection)

---

## Shared Innovation Opportunities

### Daily Mode (All 3 Games)
- All 3 games use `getDailySeed` for deterministic daily puzzles
- Show a unified daily progress view on the hub: "Today's Games" with checkmarks
- Single "daily streak" counter across all games (or per-game)

### Cross-Game Engagement Hooks
- **Hub page**: Show daily completion status for all 3 games at a glance
- **Stats dashboard**: Per-game and cross-game stats
- **Streak calendar**: Monthly view showing which daily puzzles you solved each day
- **Comparative rankings**: "You've solved 28 daily puzzles — top 20% of players"

### No Login Required
- Anonymous device ID (`crypto.randomUUID()` in localStorage) persists stats
- Comparative rankings use pre-computed distribution data
- Stats survive browser via localStorage, not cross-device

### Solitaire-Specific Innovation
- Daily Klondike: seeded deterministic deal (reuses crossword daily seed infra)
- Stats: win rate, avg time, streak (daily mode only)
- "Auto-complete" after all face-down cards revealed (classic feature)
- Clean, responsive card interactions (drag + tap)

### Word Guess-Specific Innovation
- Daily + endless mode (same pattern as crossword)
- Word size selection in endless mode
- Hard mode toggle
- Share card (emoji grid — Wordle standard)
- Stats: guess distribution, win rate, streak
