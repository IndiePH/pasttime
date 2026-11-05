export const TYPE_SHIELD_DIFFICULTIES = [
  "easy",
  "medium",
  "hard",
  "nightmare",
] as const

export type TypeShieldDifficulty = (typeof TYPE_SHIELD_DIFFICULTIES)[number]

/** Inclusive WPM band a player needs once several comets are in the air. */
export const TYPE_SHIELD_DIFFICULTY_WPM = {
  easy: { min: 15, max: 35 },
  medium: { min: 36, max: 55 },
  hard: { min: 56, max: 75 },
  nightmare: { min: 76, max: 150 },
} as const

/** Most comets one spawn may release together. Easy stays a single comet. */
export const TYPE_SHIELD_BURST_LIMIT = {
  easy: 1,
  medium: 2,
  hard: 3,
  nightmare: 3,
} as const

/**
 * Chance a spawn releases more than one comet.
 * Medium and Hard are rare. Nightmare is more frequent.
 */
export const TYPE_SHIELD_BURST_CHANCE = {
  easy: 0,
  medium: 1 / 8,
  hard: 1 / 8,
  nightmare: 1 / 3,
} as const

/** Nightmare steps from the bottom of its band to the top on this interval. */
export const TYPE_SHIELD_NIGHTMARE_RAMP_MS = 6_500

const NIGHTMARE_RAMP_STEPS = 7
/** Extra time beyond raw typing, so one comet can overlap the next. */
const FALL_GRACE = 2.5

export function isTypeShieldDifficulty(
  value: unknown,
): value is TypeShieldDifficulty {
  return (
    typeof value === "string" &&
    (TYPE_SHIELD_DIFFICULTIES as readonly string[]).includes(value)
  )
}

export function formatTypeShieldDifficultyLabel(
  difficulty: TypeShieldDifficulty,
): string {
  switch (difficulty) {
    case "easy":
      return "Easy"
    case "medium":
      return "Medium"
    case "hard":
      return "Hard"
    case "nightmare":
      return "Nightmare"
  }
}

/**
 * How many comets this spawn releases.
 * `roll` is any integer. `room` is how many more comets the field can hold.
 * A group larger than one shares the typing pace, so each comet is given the
 * combined letter time.
 */
export function typeShieldBurstSize(
  difficulty: TypeShieldDifficulty,
  roll: number,
  room: number,
): number {
  if (room <= 0) return 0
  const limit = Math.min(TYPE_SHIELD_BURST_LIMIT[difficulty], room)
  if (limit <= 1) return 1

  const normalized = ((roll % 10_000) + 10_000) % 10_000
  const threshold = TYPE_SHIELD_BURST_CHANCE[difficulty] * 10_000
  if (normalized >= threshold) return 1
  if (limit === 2) return 2
  return 2 + (normalized % (limit - 1))
}

export function getTypeShieldWpm(
  difficulty: TypeShieldDifficulty,
  elapsedMs: number,
): number {
  const band = TYPE_SHIELD_DIFFICULTY_WPM[difficulty]
  if (difficulty !== "nightmare") {
    return Math.round((band.min + band.max) / 2)
  }

  const steps = Math.min(
    NIGHTMARE_RAMP_STEPS,
    Math.max(0, Math.floor(Math.max(0, elapsedMs) / TYPE_SHIELD_NIGHTMARE_RAMP_MS)),
  )
  return Math.round(band.min + ((band.max - band.min) * steps) / NIGHTMARE_RAMP_STEPS)
}

/** Milliseconds per character at a typing speed. One word is five characters. */
export function getTypeShieldMsPerChar(wpm: number): number {
  return 60_000 / (Math.max(1, wpm) * 5)
}

export function getTypeShieldFallMs(wordLength: number, wpm: number): number {
  const length = Math.max(1, wordLength)
  return Math.round(length * getTypeShieldMsPerChar(wpm) * FALL_GRACE)
}

export function getTypeShieldSpawnGap(wordLength: number, wpm: number): number {
  const length = Math.max(1, wordLength)
  return Math.round(length * getTypeShieldMsPerChar(wpm))
}
