/**
 * Distribution data for comparative rankings.
 *
 * Structure: Record<gameId, Record<metric, sortedNumberArray>>
 *
 * For v1.1, these are plausible stubs. Replace with real data
 * collected from actual play in a future update.
 */

export interface DistributionData {
  [gameId: string]: {
    [metric: string]: number[]
  }
}

export const DISTRIBUTION_DATA: DistributionData = {
  crossword: {
    streak: [
      0, 0, 0, 1, 1, 1, 2, 2, 3, 3,
      4, 5, 5, 6, 7, 8, 10, 12, 15, 18,
      21, 25, 30, 35, 40, 45, 50, 60, 75, 100,
    ],
    winRate: [
      0.1, 0.2, 0.3, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7,
      0.72, 0.75, 0.78, 0.8, 0.82, 0.85, 0.88, 0.9, 0.92, 0.94,
      0.95, 0.96, 0.97, 0.98, 0.99, 1.0,
    ],
  },
  solitaire: {
    winRate: [
      0.05, 0.08, 0.1, 0.12, 0.15, 0.18, 0.2, 0.22, 0.25, 0.28,
      0.3, 0.32, 0.35, 0.38, 0.4, 0.42, 0.45, 0.48, 0.5, 0.52,
      0.55, 0.58, 0.6, 0.65, 0.7, 0.75, 0.8,
    ],
    moves: [
      60, 65, 70, 72, 75, 78, 80, 82, 85, 88,
      90, 92, 95, 98, 100, 102, 105, 108, 110, 112,
      115, 118, 120, 125, 130, 135, 140, 145, 150, 160,
    ],
  },
  "word-guess": {
    streak: [
      0, 0, 0, 1, 1, 1, 2, 2, 3, 3,
      4, 5, 5, 6, 7, 8, 10, 12, 15, 18,
      20, 22, 25, 28, 30, 35, 40, 45, 50, 60,
    ],
    winRate: [
      0.4, 0.45, 0.5, 0.55, 0.6, 0.62, 0.65, 0.68, 0.7, 0.72,
      0.75, 0.78, 0.8, 0.82, 0.85, 0.88, 0.9, 0.92, 0.94, 0.95,
      0.96, 0.97, 0.98, 0.99, 1.0,
    ],
  },
}
