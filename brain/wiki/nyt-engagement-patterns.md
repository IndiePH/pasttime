# NYT Games Engagement Patterns
updated: 2026-07-20
tags: [engagement, nyt, patterns, games, reference]
related: [engineering-decisions]

## Core Patterns

NYT Games (Crossword, Spelling Bee, Wordle/Connections, Sudoku, Tiles) drives
engagement through a shared cross-game layer. Key patterns relevant to Pasttime:

### Streaks
- **Current streak**: Consecutive days solving the daily puzzle
- **Longest streak**: All-time best, displayed on stats page
- **Streak calendar**: Monthly grid view with colored dots — green (solved), yellow (incomplete), gray (missed)
- **Cross-game aggregate**: "Games played today" count across all daily puzzles
- **Streak freeze**: Premium feature to skip a day without losing streak

### Stats Dashboard (Per-Game)
- Total puzzles solved
- Win rate (%)
- Average solve time
- Best time
- Current streak / longest streak
- Solve time distribution (histogram)

### Share Cards
- Visual summary after solve: puzzle name/date, time, streak info
- Emoji grid representation (for crosswords — mini grid showing filled/empty cells)
- No answer spoilers in share cards
- Social share targets: Messages, WhatsApp, Twitter, clipboard

**Shipped (Phase 8, 2026-07-20):**
- `GamePostSolveDialog` on daily terminal states (WG win/loss, crossword win, sudoku win)
- Spoiler-free visuals: `WordGuessShareVisual` (colored tiles, no letters), `CrosswordShareVisual` (emoji grid)
- `GameShareCopyButton` copies formatted share text to clipboard (no raw preview)
- Word Guess loss still shows definition + rankings; share copy on win only
- Compact share tiles (~14–16px) in modal; crossword emoji grid at ~0.25–0.3125rem

### Notifications
- Daily puzzle available (at puzzle release time ~10pm ET / midnight UTC)
- Streak at risk (reminder if daily not yet solved)
- Cross-game: one notification service for all games

### Key Insight for Pasttime
**Engagement must be cross-game, not per-game.** A unified profile/stats/layer
that all games (crossword, solitaire, word-guess, and future games) contribute to.
This prevents siloed engagement and builds daily habit.

## Priority Matrix for Pasttime

| Priority | Feature | Rationale |
|----------|---------|-----------|
| P0 | Auth + cross-device persistence | Needed for streaks/stats beyond localStorage |
| P0 | Daily completion tracking (exists: useDailyCompleted) | Already partially built |
| P0 | Streak tracking (current + longest) | Core habit loop |
| P0 | Per-game stats page | Player value |
| P1 | Timer (optional, during play) | Needed for stats |
| P1 | Share cards | Viral loop |
| P1 | Streak calendar | FOMO + retention |
| P2 | Achievements / badges | Milestone engagement |
| P2 | Push notifications | Re-engagement |
| P2 | Friends leaderboard | Social competition |

## Cross-Game Architecture Implications

All engagement tracking should be:
- Game-agnostic (domain engagement package, not per-game)
- Backed by persistent storage (D1 or similar for cross-device)
- Integrated with existing daily seed infrastructure
- Extensible for future games (solitaire, word-guess, sudoku, etc.)
