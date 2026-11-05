import { hashSeed } from "../../daily/seed"

import type { TypeShieldDifficulty } from "./difficulty"

/** Lengths 3–4 were not profanity-screened, so every difficulty starts here. */
export const TYPE_SHIELD_MIN_LENGTH = 5
const EASY_MAX_LENGTH = 6
const MEDIUM_MAX_LENGTH = 8
const FALLBACK_WORD = "comet"

/** Longest word Easy will spawn. Medium stops at 8. Hard and Nightmare use every length. */
export function typeShieldLengthCap(
  difficulty: TypeShieldDifficulty,
): number | null {
  if (difficulty === "easy") return EASY_MAX_LENGTH
  if (difficulty === "medium") return MEDIUM_MAX_LENGTH
  return null
}

/**
 * Relative chance of a word length.
 * Easy and Medium make longer words rarer. Hard is even. Nightmare favors longer words.
 */
export function typeShieldLengthWeight(
  difficulty: TypeShieldDifficulty,
  length: number,
  shortest: number,
): number {
  if (difficulty === "hard") return 1
  if (difficulty === "nightmare") return length - shortest + 1
  const cap = difficulty === "easy" ? EASY_MAX_LENGTH : MEDIUM_MAX_LENGTH
  return cap - length + 1
}

function playableWord(word: string): string | null {
  const normalized = word.trim().toLowerCase()
  if (!/^[a-z]+$/.test(normalized)) return null
  if (normalized.length < TYPE_SHIELD_MIN_LENGTH) return null
  return normalized
}

export function pickTypeShieldWord({
  difficulty,
  words,
  active,
  seed,
}: {
  difficulty: TypeShieldDifficulty
  words: readonly string[]
  active: ReadonlySet<string>
  seed: number
}): string {
  const cap = typeShieldLengthCap(difficulty)
  const normalized = words.flatMap((word) => {
    const playable = playableWord(word)
    if (!playable) return []
    if (cap !== null && playable.length > cap) return []
    return [playable]
  })
  const pool = normalized.length > 0 ? normalized : words.flatMap((word) => {
    const playable = playableWord(word)
    return playable ? [playable] : []
  })
  const busy = new Set([...active].map((word) => word.toLowerCase()))
  const available = pool.filter((word) => !busy.has(word))
  const candidates = available.length > 0 ? available : pool
  if (candidates.length === 0) return FALLBACK_WORD

  const byLength = new Map<number, string[]>()
  for (const word of candidates) {
    const bucket = byLength.get(word.length) ?? []
    bucket.push(word)
    byLength.set(word.length, bucket)
  }

  const lengths = [...byLength.keys()].sort((left, right) => left - right)
  const shortest = lengths[0] ?? 1
  const weighted = lengths.map((length) => ({
    length,
    weight: Math.max(1, typeShieldLengthWeight(difficulty, length, shortest)),
  }))
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = hashSeed(seed) % total
  let chosenLength = weighted[0]?.length ?? shortest
  for (const entry of weighted) {
    if (roll < entry.weight) {
      chosenLength = entry.length
      break
    }
    roll -= entry.weight
  }

  const bucket = byLength.get(chosenLength) ?? []
  const index = hashSeed(seed + 29) % Math.max(1, bucket.length)
  return bucket[index] ?? FALLBACK_WORD
}
