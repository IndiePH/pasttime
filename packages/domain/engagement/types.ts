export interface DailyCompletion {
  readonly date: string // YYYY-MM-DD, UTC
  readonly game: string // "crossword" | "solitaire" | "word-guess"
  readonly variant: string // e.g. "7" (crossword size), "5" (word length), "klondike" (solitaire mode)
  readonly status: "won" | "lost"
  readonly timestamp: number // ISO timestamp of completion
  readonly time?: number // Seconds — nullable, timer deferred from v1.1
  readonly moves?: number // For solitaire (moves to win)
  readonly guessDistribution?: number[] // For word guess (tries per solve)
}

export interface StreakRecord {
  readonly current: number // Current consecutive streak
  readonly longest: number // All-time maximum streak
}

export interface ComparativeRanking {
  readonly metric: string // e.g. "streak", "winRate", "solveTime"
  readonly percentile: number // 0-100, your position vs distribution
  readonly label: string // Human-readable: "You're in the top X%"
}

export interface StatsSnapshot {
  readonly totalSolves?: number
  readonly totalGames?: number // Solitaire only (games played !== wins)
  readonly totalWins?: number // Solitaire only
  readonly winRate?: number // 0-1 decimal
  readonly averageTime?: number | null
  readonly lowestMovesOnWin?: number
  readonly highestMovesOnWin?: number
  readonly averageMovesOnWin?: number
  readonly guessDistribution?: number[] // Word Guess: array length=maxTries, values=solve counts
  readonly dailyStreak?: StreakRecord
  readonly comparativeRankings?: ComparativeRanking[]
}
