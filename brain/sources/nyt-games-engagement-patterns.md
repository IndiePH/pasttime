# NYT Games — Engagement Feature Analysis
source: nytimes.com/crosswords and nytimes.com/games (2025–2026)
captured: 2026-07-01
tags: [research, engagement, nyt, games, reference]
related: []

---

## Overview

NYT Games (formerly NYT Crossword) is the gold standard for puzzle-game engagement.
Their app spans crosswords, Spelling Bee, Wordle, Connections, Sudoku, Tiles, and more,
all connected by a shared engagement layer. Below are the patterns applicable to Pasttime.

---

## Core Engagement Patterns

### 1. Streaks

- **Current streak**: Consecutive days solving the daily puzzle (per game and overall)
- **Longest streak**: All-time best, prominently displayed
- **Streak freeze / saved streak**: Paywalled (NYT subscription) — skip a day without losing streak
- **Visual streak calendar**: Month grid showing completed/streak days (colored dots/circles)
- **Cross-game streak**: Some platforms show an aggregate "Games played today" streak

### 2. Stats Dashboard

**Per-game stats:**
- Total puzzles solved
- Win rate (%)
- Average time
- Best time
- Current streak
- Longest streak
- Distribution of solve times (histogram/buckets)

**Cross-game hub stats:**
- "Today's Games" — which dailies you've completed today
- Overall activity summary
- Games played this week/month

### 3. Timer

- Elapsed time shown during play (toggleable)
- Timer pauses when app backgrounded (some implementations)
- Time shown in results/share card
- No countdown — NYT doesn't do timed pressure for crosswords

### 4. Result/Share Cards

After solving:
- **Shareable card**: Visual summary (puzzle name/date, time, streak info)
- **Emoji grid**: For crosswords — mini grid showing filled/empty cells
- **No spoilers**: Cards don't reveal answers
- **Social share**: Direct to Messages, WhatsApp, Twitter, copy text

### 5. Daily Puzzle Calendar

- "How you're doing this month" — calendar grid with colored dots
- Green = solved, yellow = incomplete, gray = missed
- Tap a date to replay that day's puzzle
- Creates FOMO and habit formation

### 6. Notifications

- Daily puzzle available (push notification at puzzle release time, usually 10pm ET / midnight UTC)
- Streak at risk (push if you haven't completed today's puzzle by evening)
- New feature / game announcements

### 7. Difficulty & Progression

- Crossword difficulty: Monday (easiest) → Saturday (hardest), Sunday (large, medium-hard)
- Mini crossword: Quick daily warm-up
- No leveling system — natural difficulty curve

### 8. Achievement / Badge System (NYT not heavy on this)

- NYT itself is sparse — but other platforms use:
  - "First Solve" badge
  - Streak milestones (7-day, 30-day, 365-day)
  - Speed demon (solve under X minutes)
  - Completionist (100% all puzzles in a month)

### 9. Social / Competitive

- **Friends leaderboard**: Compare streaks and solve times with friends
- **No global leaderboard** (NYT avoids this — keeps it friendly)
- **Group stats**: Some third-party apps show how you rank among friends

### 10. Subscription / Progression Gating

- Free users: Current day's puzzle + archive limited
- Paid subscribers: Full archive, streak freeze, premium puzzles
- Pasttime could use: free tier = daily puzzles, paid/registered = stats and streaks

---

## Cross-Game Unified Engagement

NYT's key insight: **engagement is cross-game, not per-game**.

Streaks, stats, and notifications work across ALL daily puzzles:
- Solve crossword → updates your "today completed" count
- Solve Connections → same
- The overall "NYT Games" profile tracks everything

This is the model Pasttime should follow: a shared engagement/user profile layer
that all games (existing and future) contribute to.

---

## Priority Features for Pasttime

Based on what's achievable and impactful for a web-first multi-game hub:

### Must-have (core engagement loop):
1. **Daily streak tracking** — per-game and overall ("Games completed today")
2. **Solve tracking** — track completions, persist per game
3. **Timer** — optional, per puzzle
4. **Stats display** — per-game stats page with streak, win rate, times
5. **Auth** — needed for cross-device streak persistence

### Should-have (social):
6. **Share cards** — share solve results after completion
7. **Streak calendar** — visual monthly calendar view

### Nice-to-have (advanced):
8. **Notifications** — PWA push for daily puzzle available
9. **Achievements** — milestone badges
10. **Friend streaks/leaderboard** — compare with friends
