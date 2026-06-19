import { hashSeed } from "../../daily"

import corpusData from "./corpus.json"
import type {
  CrosswordCell,
  CrosswordClue,
  CrosswordGrid,
  CrosswordGridSize,
  CrosswordPuzzle,
} from "./types"

type Direction = "across" | "down"

interface PoolWord {
  answer: string
  clue: string
}

interface PlacedWord extends PoolWord {
  row: number
  col: number
  direction: Direction
}

const MIN_WORD_LENGTH = 3
const MAX_WORD_LENGTH = 10
const LETTERS_ONLY = /^[A-Z]+$/

/**
 * Curated corpus — hand-written clues. Answers here are the only words the
 * generator may place (the test suite enforces this), keeping clue quality
 * high. Each word keeps a single clue chosen up front so output is stable.
 */
const POOL: readonly PoolWord[] = (
  corpusData as Array<{ answer: string; clue: string }>
)
  .map((entry) => ({
    answer: entry.answer.toUpperCase(),
    clue: entry.clue ?? "",
  }))
  .filter(
    (w) =>
      LETTERS_ONLY.test(w.answer) &&
      w.answer.length >= MIN_WORD_LENGTH &&
      w.answer.length <= MAX_WORD_LENGTH &&
      w.clue.length > 0,
  )

/** Deterministic LCG seeded through the shared daily-seed hash. */
function makeRng(seed: number): () => number {
  let state = hashSeed(seed) & 0x7fffffff
  if (state === 0) state = 1
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff
    return state / 0x7fffffff
  }
}

/** Seeded Fisher–Yates — same seed yields the same ordering. */
function shuffled<T>(items: readonly T[], rand: () => number): T[] {
  const arr = items.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

/**
 * True when `word` can be placed at (row,col) in `dir` without violating
 * crossword adjacency rules:
 *   - fully in bounds
 *   - the cells immediately before the start and after the end are empty/edge
 *     (so we never extend an existing word)
 *   - existing letters along the path must match (a real crossing)
 *   - newly filled cells must not sit beside another word on the perpendicular
 *     axis (no run-on or accidental parallel words)
 * `requireCrossing` is false only for the very first (seed) word.
 */
function canPlace(
  letters: (string | null)[][],
  size: number,
  word: string,
  row: number,
  col: number,
  dir: Direction,
  requireCrossing: boolean,
): boolean {
  const dr = dir === "down" ? 1 : 0
  const dc = dir === "across" ? 1 : 0
  const len = word.length
  const endR = row + dr * (len - 1)
  const endC = col + dc * (len - 1)
  if (row < 0 || col < 0 || endR >= size || endC >= size) return false

  const beforeR = row - dr
  const beforeC = col - dc
  if (
    beforeR >= 0 &&
    beforeC >= 0 &&
    beforeR < size &&
    beforeC < size &&
    letters[beforeR][beforeC] !== null
  ) {
    return false
  }
  const afterR = endR + dr
  const afterC = endC + dc
  if (afterR < size && afterC < size && letters[afterR][afterC] !== null) {
    return false
  }

  let crossings = 0
  for (let i = 0; i < len; i++) {
    const r = row + dr * i
    const c = col + dc * i
    const existing = letters[r][c]
    if (existing !== null) {
      if (existing !== word[i]) return false
      crossings++
    } else {
      // Perpendicular neighbours of a newly filled cell must be empty.
      const n1r = r - dc
      const n1c = c - dr
      const n2r = r + dc
      const n2c = c + dr
      if (
        n1r >= 0 &&
        n1c >= 0 &&
        n1r < size &&
        n1c < size &&
        letters[n1r][n1c] !== null
      ) {
        return false
      }
      if (
        n2r >= 0 &&
        n2c >= 0 &&
        n2r < size &&
        n2c < size &&
        letters[n2r][n2c] !== null
      ) {
        return false
      }
    }
  }
  return requireCrossing ? crossings >= 1 : true
}

/**
 * Build a crossword by placing real interlocking words from the corpus onto an
 * empty grid, all driven by `seed`. Deterministic: identical seed and size
 * always yield an identical puzzle.
 */
export function generateCrosswordPuzzle(
  size: CrosswordGridSize,
  seed: number,
): CrosswordPuzzle {
  const rand = makeRng(seed)
  const maxLen = Math.min(MAX_WORD_LENGTH, size)
  const pool = shuffled(
    POOL.filter((w) => w.answer.length <= maxLen),
    rand,
  )

  const letters: (string | null)[][] = Array.from({ length: size }, () =>
    new Array<string | null>(size).fill(null),
  )
  const cellsByLetter = new Map<string, Array<[number, number]>>()
  const placed: PlacedWord[] = []
  const used = new Set<string>()

  const place = (word: string, row: number, col: number, dir: Direction) => {
    const dr = dir === "down" ? 1 : 0
    const dc = dir === "across" ? 1 : 0
    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i
      const c = col + dc * i
      if (letters[r][c] === null) {
        letters[r][c] = word[i]
        const list = cellsByLetter.get(word[i]) ?? []
        list.push([r, c])
        cellsByLetter.set(word[i], list)
      }
    }
  }

  // Seed word: longest pooled word that fits, placed across near the centre.
  const first = pool.reduce<PoolWord | null>(
    (best, w) =>
      w.answer.length <= size && (!best || w.answer.length > best.answer.length)
        ? w
        : best,
    null,
  )
  if (first) {
    const row = Math.floor(size / 2)
    const col = Math.floor((size - first.answer.length) / 2)
    place(first.answer, row, col, "across")
    placed.push({ ...first, row, col, direction: "across" })
    used.add(first.answer)
  }

  // Grow by crossing words into existing letters until a full pass adds none.
  let progress = true
  while (progress) {
    progress = false
    for (const w of pool) {
      if (used.has(w.answer)) continue
      if (tryPlaceCrossing(letters, size, w, cellsByLetter, place, placed)) {
        used.add(w.answer)
        progress = true
      }
    }
  }

  return finalize(letters, size, placed, seed)
}

/** Attempt to cross `w` over any existing matching letter. */
function tryPlaceCrossing(
  letters: (string | null)[][],
  size: number,
  w: PoolWord,
  cellsByLetter: Map<string, Array<[number, number]>>,
  place: (word: string, row: number, col: number, dir: Direction) => void,
  placed: PlacedWord[],
): boolean {
  const word = w.answer
  for (let i = 0; i < word.length; i++) {
    const targets = cellsByLetter.get(word[i])
    if (!targets) continue
    for (const [r, c] of targets) {
      // Cross with `word` running across (start col = c - i).
      if (canPlace(letters, size, word, r, c - i, "across", true)) {
        place(word, r, c - i, "across")
        placed.push({ ...w, row: r, col: c - i, direction: "across" })
        return true
      }
      // Cross with `word` running down (start row = r - i).
      if (canPlace(letters, size, word, r - i, c, "down", true)) {
        place(word, r - i, c, "down")
        placed.push({ ...w, row: r - i, col: c, direction: "down" })
        return true
      }
    }
  }
  return false
}

/** Turn the filled letter grid + placements into a numbered puzzle. */
function finalize(
  letters: (string | null)[][],
  size: number,
  placed: PlacedWord[],
  seed: number,
): CrosswordPuzzle {
  const grid: CrosswordGrid = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      const ch = letters[r][c]
      const cell: CrosswordCell =
        ch !== null
          ? { type: "letter", row: r, col: c, answerLetter: ch }
          : { type: "block", row: r, col: c }
      return cell
    }),
  )

  // Number cells that start an across or down run, in reading order.
  const startNumber = new Map<string, number>()
  let n = 1
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].type !== "letter") continue
      const startsAcross =
        (c === 0 || grid[r][c - 1].type === "block") &&
        c + 1 < size &&
        grid[r][c + 1].type === "letter"
      const startsDown =
        (r === 0 || grid[r - 1][c].type === "block") &&
        r + 1 < size &&
        grid[r + 1][c].type === "letter"
      if (startsAcross || startsDown) {
        grid[r][c].clueNumber = n
        startNumber.set(`${r},${c}`, n)
        n++
      }
    }
  }

  const across: CrosswordClue[] = []
  const down: CrosswordClue[] = []
  for (const p of placed) {
    const number = startNumber.get(`${p.row},${p.col}`)
    if (number === undefined) continue
    const clue: CrosswordClue = {
      id: `${p.direction}-${number}`,
      number,
      direction: p.direction,
      text: p.clue,
      answer: p.answer,
      row: p.row,
      col: p.col,
    }
    if (p.direction === "across") across.push(clue)
    else down.push(clue)
  }
  across.sort((a, b) => a.number - b.number)
  down.sort((a, b) => a.number - b.number)

  return { id: `crossword-${size}-${seed}`, grid, across, down }
}
