export const SUDOKU_SIZE = 9
export const SUDOKU_CELL_COUNT = 81

export function indexToRowCol(i: number): { row: number; col: number } {
  return { row: Math.floor(i / 9), col: i % 9 }
}
export function rowColToIndex(row: number, col: number): number {
  return row * 9 + col
}
export function boxIndex(row: number, col: number): number {
  return Math.floor(row / 3) * 3 + Math.floor(col / 3)
}
export function peerIndexes(index: number): number[] {
  const { row, col } = indexToRowCol(index)
  const peers = new Set<number>()
  for (let c = 0; c < 9; c++) peers.add(rowColToIndex(row, c))
  for (let r = 0; r < 9; r++) peers.add(rowColToIndex(r, col))
  const br = Math.floor(row / 3) * 3
  const bc = Math.floor(col / 3) * 3
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++) peers.add(rowColToIndex(r, c))
  peers.delete(index)
  return [...peers]
}

/** Legal candidates for an empty cell given current placed digits (peer constraints). */
export function legalCandidates(cells: { value: number }[], index: number): number[] {
  if (cells[index].value !== 0) return []
  const used = new Set<number>()
  for (const p of peerIndexes(index)) {
    const v = cells[p].value
    if (v >= 1 && v <= 9) used.add(v)
  }
  const out: number[] = []
  for (let d = 1; d <= 9; d++) if (!used.has(d)) out.push(d)
  return out
}
