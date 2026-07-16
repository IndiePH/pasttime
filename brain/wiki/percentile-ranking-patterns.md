# Percentile Ranking Patterns
updated: 2026-07-01
tags: [engagement, ranking, leaderboard, patterns, design]
related: [nyt-engagement-patterns]

## Overview

Traditional leaderboards (1st, 2nd, 3rd ranked list) are replaced by a
**percentile-based comparison** — "You're better than X% of players."
This is anonymous, less competitive-pressure, and works without login.

## Common Styles

### 1. Wordle-Style Distribution Bar
**Format:** After solving, a vertical bar chart showing how many solves at each
metric (tries, time, streak length). "You" marker highlighted on the bar.
**Best for:** Post-solve results card. Instant gratification + comparison.

```
    ┌─────┐
    │  ██ │  1  (42 solves)
    │████│  2  (156 solves)
    │ ██ │  3  (88 solves)
    │ ░░ │  4  ← You (12 solves)
    │    │  5  (3 solves)
    └─────┘
```

### 2. "Top X%" Single Stat
**Format:** One-line comparison per metric. Popularized by Spotify Wrapped.
**Best for:** Stats dashboard, streak milestones.

- "Your 12-day streak is longer than 90% of players"
- "You solved 42 daily puzzles — top 15% of all players"

### 3. Strava-Style "Faster Than"
**Format:** Blended comparison across multiple dimensions.
**Best for:** Per-game stats page.

- "Average solve time: 4:12 — faster than 68% of players"
- "Win rate: 94% — higher than 82% of players"

### 4. Duolingo-Style League / Tier
**Format:** You're placed in a tier/league (Bronze → Diamond) and shown your
standing within that tier. Not an explicit percentile but achieves the same goal.
**Best for:** Ongoing engagement, weekly reset.

### 5. GitHub-Style Percentile Badge
**Format:** Small badge/chip showing percentile for a specific stat.
**Best for:** Profile cards, hub page summary.

- "🏆 Top 5% streak" badge

## Implementation Approaches

### Anonymous-only (no server)
Percentiles are pre-computed from aggregate data stored client-side or
fetched from a lightweight endpoint. "You" is always the local player.

### With server (optional for Pasttime)
Periodic batch upload of anonymized stats → server computes percentiles →
returns your position. No personal data, no accounts.

```
Stats snapshot (batch, anonymized)      Aggregate percentile data
┌──────────────┐   ┌───────────────┐   ┌──────────────────────┐
│ Crossword    │ → │ D1 / KV       │ → │ Percentile lookup    │
│ Solitaire    │    │ (aggregates)  │    │ (periodic batch)    │
│ Word Guess   │    │              │    │ "top 15%"           │
└──────────────┘   └───────────────┘   └──────────────────────┘
```

### Recommendation for Pasttime v1.1
**Client-side only for now.** Show comparative stats using pre-computed
distribution data bundled with the app or fetched as a static JSON.
No server needed. Percentiles are estimates, not live — good enough for
the initial engagement layer. Add server-side percentile computation
when multiplayer ships and the playerbase justifies it.

## Terms
- **Percentile Ranking** — Most technically accurate
- **Comparative Stats** — More user-friendly
- **Skill Rating Distribution** — Good for skill-based metrics
- **Standing** — Wordle-style ("Your standing among players today")
