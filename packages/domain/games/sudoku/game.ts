import { legalCandidates } from "./board"
import { createGameCellsFromPuzzle } from "./generate"
import type { SudokuRoundMode } from "./settings"
import type { SudokuCell, SudokuDigit, SudokuGameState, SudokuPuzzle } from "./types"

export interface CreateSudokuGameOptions {
  autoCandidates?: boolean
  now?: number
}

export function createSudokuGame(
  puzzle: SudokuPuzzle,
  mode: SudokuRoundMode,
  options?: CreateSudokuGameOptions,
): SudokuGameState {
  const autoCandidates = options?.autoCandidates ?? false
  const state: SudokuGameState = {
    puzzle,
    cells: createGameCellsFromPuzzle(puzzle),
    status: "playing",
    mode,
    difficulty: puzzle.difficulty,
    candidateMode: false,
    autoCandidates,
    selectedIndex: null,
    undoStack: [],
    startedAt: options?.now ?? Date.now(),
    elapsedMs: 0,
  }
  return autoCandidates ? refreshAutoCandidates(state) : state
}

export function selectSudokuCell(state: SudokuGameState, index: number): SudokuGameState {
  if (index < 0 || index > 80) return state
  if (state.selectedIndex === index) return state
  return { ...state, selectedIndex: index }
}

export function setSudokuCandidateMode(state: SudokuGameState, on: boolean): SudokuGameState {
  if (state.candidateMode === on) return state
  return { ...state, candidateMode: on }
}

export function setSudokuAutoCandidates(state: SudokuGameState, on: boolean): SudokuGameState {
  if (state.autoCandidates === on) return state
  const next = { ...state, autoCandidates: on }
  return on ? refreshAutoCandidates(next) : next
}

export function placeSudokuDigit(state: SudokuGameState, digit: SudokuDigit): SudokuGameState {
  const index = selectedMutableIndex(state)
  if (index === null) return state

  const cells = cloneCells(state.cells)
  cells[index] = { ...cells[index], value: digit, candidates: [] }
  return finishSudokuMutation(state, cells)
}

export function clearSudokuCell(state: SudokuGameState): SudokuGameState {
  const index = selectedMutableIndex(state)
  if (index === null) return state

  const cells = cloneCells(state.cells)
  cells[index] = { ...cells[index], value: 0, candidates: [] }
  return finishSudokuMutation(state, cells)
}

export function toggleSudokuCandidate(state: SudokuGameState, digit: SudokuDigit): SudokuGameState {
  const index = selectedMutableIndex(state)
  if (index === null) return state
  if (state.cells[index].value !== 0) return state

  const cells = cloneCells(state.cells)
  const cell = cells[index]
  cell.candidates = cell.candidates.includes(digit)
    ? cell.candidates.filter((d) => d !== digit)
    : [...cell.candidates, digit].sort((a, b) => a - b)

  return { ...state, cells, undoStack: pushUndoSnapshot(state) }
}

export function undoSudoku(state: SudokuGameState): SudokuGameState {
  if (state.undoStack.length === 0) return state

  const cells = state.undoStack[state.undoStack.length - 1]
  const undoStack = state.undoStack.slice(0, -1)
  const status = state.status === "won" ? "playing" : state.status
  return recomputeSudokuWin({ ...state, cells, undoStack, status })
}

export function recomputeSudokuWin(state: SudokuGameState): SudokuGameState {
  if (state.status !== "playing") return state
  const solved = state.cells.every((cell, i) => cell.value === state.puzzle.solution[i])
  return solved ? { ...state, status: "won" } : state
}

/** Index of the currently selected cell, or null if it can't be mutated
 * right now (nothing selected, round over, or the cell is a given). */
function selectedMutableIndex(state: SudokuGameState): number | null {
  if (state.status !== "playing") return null
  const index = state.selectedIndex
  if (index === null) return null
  if (state.cells[index].given) return null
  return index
}

function finishSudokuMutation(state: SudokuGameState, cells: SudokuCell[]): SudokuGameState {
  let next: SudokuGameState = { ...state, cells, undoStack: pushUndoSnapshot(state) }
  if (next.autoCandidates) next = refreshAutoCandidates(next)
  return recomputeSudokuWin(next)
}

function pushUndoSnapshot(state: SudokuGameState): SudokuCell[][] {
  return [...state.undoStack, cloneCells(state.cells)]
}

function cloneCells(cells: SudokuCell[]): SudokuCell[] {
  return cells.map((cell) => ({ ...cell, candidates: [...cell.candidates] }))
}

function refreshAutoCandidates(state: SudokuGameState): SudokuGameState {
  const cells = state.cells.map((cell, i) => {
    if (cell.value !== 0) return cell.candidates.length === 0 ? cell : { ...cell, candidates: [] }
    return { ...cell, candidates: legalCandidates(state.cells, i) as SudokuDigit[] }
  })
  return { ...state, cells }
}
