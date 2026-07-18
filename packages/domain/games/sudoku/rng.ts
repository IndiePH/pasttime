import { hashSeed } from "../../daily"

export interface SudokuRng {
  next(): number // [0, 1)
  int(maxExclusive: number): number
  shuffle<T>(items: T[]): T[]
}

export function createSudokuRng(seed: number): SudokuRng {
  let state = hashSeed(seed) || 1
  const next = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 0x100000000
  }
  return {
    next,
    int(maxExclusive) {
      return Math.floor(next() * maxExclusive)
    },
    shuffle(items) {
      const arr = items.slice()
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    },
  }
}
