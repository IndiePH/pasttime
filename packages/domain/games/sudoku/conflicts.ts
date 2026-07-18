import type { SudokuCell } from "./types"

export function findConflictIndexes(cells: SudokuCell[]): Set<number> {
  const conflicts = new Set<number>()
  const units: number[][] = []
  for (let r = 0; r < 9; r++) units.push(Array.from({ length: 9 }, (_, c) => r * 9 + c))
  for (let c = 0; c < 9; c++) units.push(Array.from({ length: 9 }, (_, r) => r * 9 + c))
  for (let b = 0; b < 9; b++) {
    const br = Math.floor(b / 3) * 3
    const bc = (b % 3) * 3
    const box: number[] = []
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++) box.push(r * 9 + c)
    units.push(box)
  }
  for (const unit of units) {
    const seen = new Map<number, number>()
    for (const i of unit) {
      const v = cells[i].value
      if (v < 1 || v > 9) continue
      if (seen.has(v)) {
        conflicts.add(i)
        conflicts.add(seen.get(v)!)
      } else {
        seen.set(v, i)
      }
    }
  }
  return conflicts
}
