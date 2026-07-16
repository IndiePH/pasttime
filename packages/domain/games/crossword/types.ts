export type CrosswordCellType = "block" | "letter"

export interface CrosswordCell {
  type: CrosswordCellType
  row: number
  col: number
  clueNumber?: number
  answerLetter?: string
}

export interface CrosswordClue {
  id: string
  number: number
  direction: "across" | "down"
  text: string
  answer: string
  row: number
  col: number
}

export type CrosswordGrid = CrosswordCell[][]

export interface CrosswordPuzzle {
  id: string
  grid: CrosswordGrid
  across: CrosswordClue[]
  down: CrosswordClue[]
}

export type CrosswordInput = {
  row: number
  col: number
  letter: string
}

export type CrosswordStatus = "playing" | "won" | "lost" | "abandoned"

export interface CrosswordGameState {
  puzzle: CrosswordPuzzle
  inputs: Record<string, string>
  activeClue?: { direction: "across" | "down"; number: number }
  activeCell?: { row: number; col: number }
  status: CrosswordStatus
}

const GRID_SIZES = [15] as const
export type CrosswordGridSize = (typeof GRID_SIZES)[number]

export const CROSSWORD_DEFAULT_SIZE: CrosswordGridSize = 15

const ROUND_MODES = ["daily", "random"] as const
export type CrosswordRoundMode = (typeof ROUND_MODES)[number]

const CELL_KEY = (row: number, col: number) => `${row},${col}`

export function getCellKey(row: number, col: number): string {
  return CELL_KEY(row, col)
}

export function parseCellKey(key: string): { row: number; col: number } | null {
  const [row, col] = key.split(",").map(Number)
  if (isNaN(row) || isNaN(col)) {
    return null
  }
  return { row, col }
}

export function isCellFilled(
  puzzle: CrosswordPuzzle,
  row: number,
  col: number,
): boolean {
  const cell = puzzle.grid[row]?.[col]
  return cell?.type === "letter"
}

export function getGridSize(puzzle: CrosswordPuzzle): number {
  let maxSize = 0
  for (const row of puzzle.grid) {
    for (const cell of row) {
      if (cell.type === "letter") {
        const check = cell.row + 1
        if (check > maxSize) maxSize = check
      }
    }
  }
  return maxSize
}