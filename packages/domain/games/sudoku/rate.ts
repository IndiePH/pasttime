import { indexToRowCol, legalCandidates, peerIndexes } from "./board"
import { findConflictIndexes } from "./conflicts"
import type { SudokuCell, SudokuDifficulty, SudokuGrid, SudokuTechnique } from "./types"

export interface SudokuRating {
  difficulty: SudokuDifficulty | "unrated"
  hardest: SudokuTechnique | null
  solvable: boolean
}

/**
 * Ordered human-technique ladder, easiest → hardest. Index doubles as a rank
 * for comparing which technique is "harder" without guessing/backtracking.
 */
const TECHNIQUE_ORDER: SudokuTechnique[] = [
  "naked-single",
  "hidden-single",
  "naked-pair",
  "hidden-pair",
  "locked-candidate",
  "naked-triple",
  "hidden-triple",
]

function techniqueRank(technique: SudokuTechnique): number {
  return TECHNIQUE_ORDER.indexOf(technique)
}

function difficultyForHardest(hardest: SudokuTechnique | null): SudokuDifficulty | "unrated" {
  if (hardest === null) return "easy"
  const rank = techniqueRank(hardest)
  if (rank <= techniqueRank("hidden-single")) return "easy"
  if (rank <= techniqueRank("locked-candidate")) return "medium"
  if (rank <= techniqueRank("hidden-triple")) return "hard"
  return "unrated"
}

interface Unit {
  cells: number[]
}

function buildUnits(): Unit[] {
  const units: Unit[] = []
  for (let r = 0; r < 9; r++) {
    units.push({ cells: Array.from({ length: 9 }, (_, c) => r * 9 + c) })
  }
  for (let c = 0; c < 9; c++) {
    units.push({ cells: Array.from({ length: 9 }, (_, r) => r * 9 + c) })
  }
  for (let b = 0; b < 9; b++) {
    const br = Math.floor(b / 3) * 3
    const bc = (b % 3) * 3
    const cells: number[] = []
    for (let r = br; r < br + 3; r++) for (let c = bc; c < bc + 3; c++) cells.push(r * 9 + c)
    units.push({ cells })
  }
  return units
}

const UNITS = buildUnits()
const BOX_UNITS = UNITS.slice(18)
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

function rowUnitCells(row: number): number[] {
  return Array.from({ length: 9 }, (_, c) => row * 9 + c)
}
function colUnitCells(col: number): number[] {
  return Array.from({ length: 9 }, (_, r) => r * 9 + col)
}
function boxOf(index: number): number {
  const { row, col } = indexToRowCol(index)
  return Math.floor(row / 3) * 3 + Math.floor(col / 3)
}

function pairCombinations(items: number[]): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) out.push([items[i], items[j]])
  }
  return out
}
function tripleCombinations<T>(items: T[]): [T, T, T][] {
  const out: [T, T, T][] = []
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      for (let k = j + 1; k < items.length; k++) out.push([items[i], items[j], items[k]])
    }
  }
  return out
}

/**
 * Human-technique difficulty rater. Applies naked/hidden singles, naked/hidden
 * pairs, locked candidates, and naked/hidden triples — in that order, easiest
 * technique first — until the grid is filled or no technique makes progress.
 * Never guesses or backtracks: a stuck grid is reported as unsolvable/unrated.
 */
export function rateSudoku(givens: SudokuGrid): SudokuRating {
  if (givens.length !== 81) {
    return { difficulty: "unrated", hardest: null, solvable: false }
  }

  const conflictCells: SudokuCell[] = givens.map((value) => ({
    given: value !== 0,
    value,
    candidates: [],
  }))
  if (findConflictIndexes(conflictCells).size > 0) {
    return { difficulty: "unrated", hardest: null, solvable: false }
  }

  const values = givens.slice()
  const candidates: number[][] = new Array(81).fill(null).map(() => [])
  const valueCells = values.map((value) => ({ value }))
  for (let i = 0; i < 81; i++) {
    if (values[i] === 0) candidates[i] = legalCandidates(valueCells, i)
  }

  let hardest: SudokuTechnique | null = null
  const recordTechnique = (technique: SudokuTechnique) => {
    if (hardest === null || techniqueRank(technique) > techniqueRank(hardest)) hardest = technique
  }

  const emptiesIn = (cells: number[]) => cells.filter((i) => values[i] === 0)

  function place(index: number, digit: number): void {
    values[index] = digit
    candidates[index] = []
    for (const peer of peerIndexes(index)) {
      if (values[peer] === 0) {
        candidates[peer] = candidates[peer].filter((d) => d !== digit)
      }
    }
  }

  function tryNakedSingle(): boolean {
    for (let i = 0; i < 81; i++) {
      if (values[i] === 0 && candidates[i].length === 1) {
        place(i, candidates[i][0])
        recordTechnique("naked-single")
        return true
      }
    }
    return false
  }

  function tryHiddenSingle(): boolean {
    for (const unit of UNITS) {
      for (const digit of DIGITS) {
        let where = -1
        let count = 0
        for (const i of unit.cells) {
          if (values[i] === 0 && candidates[i].includes(digit)) {
            count++
            where = i
          }
        }
        if (count === 1) {
          place(where, digit)
          recordTechnique("hidden-single")
          return true
        }
      }
    }
    return false
  }

  function tryNakedPair(): boolean {
    for (const unit of UNITS) {
      const pairCells = emptiesIn(unit.cells).filter((i) => candidates[i].length === 2)
      for (const [a, b] of pairCombinations(pairCells)) {
        if (candidates[a][0] !== candidates[b][0] || candidates[a][1] !== candidates[b][1]) continue
        const [d1, d2] = candidates[a]
        let changed = false
        for (const i of emptiesIn(unit.cells)) {
          if (i === a || i === b) continue
          const before = candidates[i].length
          candidates[i] = candidates[i].filter((d) => d !== d1 && d !== d2)
          if (candidates[i].length !== before) changed = true
        }
        if (changed) {
          recordTechnique("naked-pair")
          return true
        }
      }
    }
    return false
  }

  function tryHiddenPair(): boolean {
    for (const unit of UNITS) {
      const empties = emptiesIn(unit.cells)
      for (const [d1, d2] of pairCombinations(DIGITS)) {
        const cellsWithD1 = empties.filter((i) => candidates[i].includes(d1))
        const cellsWithD2 = empties.filter((i) => candidates[i].includes(d2))
        if (
          cellsWithD1.length === 2 &&
          cellsWithD2.length === 2 &&
          cellsWithD1[0] === cellsWithD2[0] &&
          cellsWithD1[1] === cellsWithD2[1]
        ) {
          let changed = false
          for (const i of cellsWithD1) {
            const before = candidates[i].length
            candidates[i] = candidates[i].filter((d) => d === d1 || d === d2)
            if (candidates[i].length !== before) changed = true
          }
          if (changed) {
            recordTechnique("hidden-pair")
            return true
          }
        }
      }
    }
    return false
  }

  function eliminateFrom(cellIndexes: number[], digit: number, exclude: number[]): boolean {
    let changed = false
    for (const i of cellIndexes) {
      if (exclude.includes(i)) continue
      if (values[i] !== 0 || !candidates[i].includes(digit)) continue
      candidates[i] = candidates[i].filter((d) => d !== digit)
      changed = true
    }
    return changed
  }

  function tryLockedCandidate(): boolean {
    // Pointing: digit confined to one row/col within a box → eliminate outside the box.
    for (const box of BOX_UNITS) {
      for (const digit of DIGITS) {
        const withDigit = box.cells.filter((i) => values[i] === 0 && candidates[i].includes(digit))
        if (withDigit.length < 2) continue
        const rows = new Set(withDigit.map((i) => indexToRowCol(i).row))
        const cols = new Set(withDigit.map((i) => indexToRowCol(i).col))
        if (rows.size === 1) {
          const [row] = rows
          if (eliminateFrom(rowUnitCells(row), digit, box.cells)) {
            recordTechnique("locked-candidate")
            return true
          }
        }
        if (cols.size === 1) {
          const [col] = cols
          if (eliminateFrom(colUnitCells(col), digit, box.cells)) {
            recordTechnique("locked-candidate")
            return true
          }
        }
      }
    }
    // Claiming: digit confined to one box within a row/col → eliminate elsewhere in the box.
    for (let line = 0; line < 9; line++) {
      for (const lineCells of [rowUnitCells(line), colUnitCells(line)]) {
        for (const digit of DIGITS) {
          const withDigit = lineCells.filter((i) => values[i] === 0 && candidates[i].includes(digit))
          if (withDigit.length < 2) continue
          const boxes = new Set(withDigit.map(boxOf))
          if (boxes.size === 1) {
            const [box] = boxes
            if (eliminateFrom(BOX_UNITS[box].cells, digit, lineCells)) {
              recordTechnique("locked-candidate")
              return true
            }
          }
        }
      }
    }
    return false
  }

  function tryNakedTriple(): boolean {
    for (const unit of UNITS) {
      const candidateCells = emptiesIn(unit.cells).filter(
        (i) => candidates[i].length === 2 || candidates[i].length === 3,
      )
      for (const combo of tripleCombinations(candidateCells)) {
        const union = new Set<number>()
        for (const i of combo) for (const d of candidates[i]) union.add(d)
        if (union.size !== 3) continue
        let changed = false
        for (const i of emptiesIn(unit.cells)) {
          if ((combo as number[]).includes(i)) continue
          const before = candidates[i].length
          candidates[i] = candidates[i].filter((d) => !union.has(d))
          if (candidates[i].length !== before) changed = true
        }
        if (changed) {
          recordTechnique("naked-triple")
          return true
        }
      }
    }
    return false
  }

  function tryHiddenTriple(): boolean {
    for (const unit of UNITS) {
      const empties = emptiesIn(unit.cells)
      for (const combo of tripleCombinations(DIGITS)) {
        const cellsUnion = new Set<number>()
        let valid = true
        for (const digit of combo) {
          const withDigit = empties.filter((i) => candidates[i].includes(digit))
          if (withDigit.length === 0 || withDigit.length > 3) {
            valid = false
            break
          }
          for (const i of withDigit) cellsUnion.add(i)
        }
        if (!valid || cellsUnion.size !== 3) continue
        let changed = false
        for (const i of cellsUnion) {
          const before = candidates[i].length
          candidates[i] = candidates[i].filter((d) => (combo as number[]).includes(d))
          if (candidates[i].length !== before) changed = true
        }
        if (changed) {
          recordTechnique("hidden-triple")
          return true
        }
      }
    }
    return false
  }

  const techniquePasses = [
    tryNakedSingle,
    tryHiddenSingle,
    tryNakedPair,
    tryHiddenPair,
    tryLockedCandidate,
    tryNakedTriple,
    tryHiddenTriple,
  ]

  while (values.some((v) => v === 0)) {
    if (values.some((v, i) => v === 0 && candidates[i].length === 0)) {
      // Contradiction: some empty cell has no legal digit left. Grid is unsolvable.
      return { difficulty: "unrated", hardest, solvable: false }
    }
    const progressed = techniquePasses.some((pass) => pass())
    if (!progressed) {
      return { difficulty: "unrated", hardest, solvable: false }
    }
  }

  return { difficulty: difficultyForHardest(hardest), hardest, solvable: true }
}
