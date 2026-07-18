import { afterEach, describe, expect, it, vi } from "vitest"

import { generateSudoku } from "@pasttime/domain/games/sudoku"
import type { SudokuPuzzle } from "@pasttime/domain/games/sudoku"

import { generateSudokuInWorker } from "./generate-sudoku.client"

/** Minimal `Worker` stand-in: real message/error dispatch, controllable reply timing. */
class MockWorker extends EventTarget {
  static instances: MockWorker[] = []
  terminate = vi.fn()
  postMessage = vi.fn()

  constructor(public url: URL) {
    super()
    MockWorker.instances.push(this)
  }

  static latest(): MockWorker {
    const worker = MockWorker.instances.at(-1)
    if (!worker) throw new Error("no MockWorker was constructed")
    return worker
  }

  replyWith(data: unknown) {
    this.dispatchEvent(new MessageEvent("message", { data }))
  }

  failWith(message: string) {
    this.dispatchEvent(new ErrorEvent("error", { message }))
  }
}

describe("generateSudokuInWorker", () => {
  const originalWorker = globalThis.Worker

  afterEach(() => {
    globalThis.Worker = originalWorker
    MockWorker.instances = []
    vi.useRealTimers()
  })

  it("falls back to main-thread generation when Worker is unavailable", async () => {
    // jsdom does not implement Worker, so this exercises the default test environment.
    expect(typeof globalThis.Worker).toBe("undefined")

    const puzzle = await generateSudokuInWorker("easy", 20260718)

    expect(puzzle).toEqual(generateSudoku({ difficulty: "easy", seed: 20260718 }))
  })

  it("resolves with the puzzle from a successful worker reply", async () => {
    globalThis.Worker = MockWorker as unknown as typeof Worker

    const puzzle = generateSudoku({ difficulty: "medium", seed: 42 })
    const promise = generateSudokuInWorker("medium", 42)
    const worker = MockWorker.latest()

    worker.replyWith({ ok: true, puzzle } satisfies { ok: true; puzzle: SudokuPuzzle })

    await expect(promise).resolves.toEqual(puzzle)
    expect(worker.terminate).toHaveBeenCalledTimes(1)
  })

  it("rejects with the worker error message on an ok:false reply", async () => {
    globalThis.Worker = MockWorker as unknown as typeof Worker

    const promise = generateSudokuInWorker("hard", 7)
    const worker = MockWorker.latest()

    worker.replyWith({ ok: false, error: "generate failed" })

    await expect(promise).rejects.toThrow("generate failed")
    expect(worker.terminate).toHaveBeenCalledTimes(1)
  })

  it("rejects when the worker dispatches an error event", async () => {
    globalThis.Worker = MockWorker as unknown as typeof Worker

    const promise = generateSudokuInWorker("easy", 1)
    const worker = MockWorker.latest()

    worker.failWith("worker crashed")

    await expect(promise).rejects.toThrow("worker crashed")
    expect(worker.terminate).toHaveBeenCalledTimes(1)
  })

  it("rejects and terminates the worker after the timeout elapses", async () => {
    vi.useFakeTimers()
    globalThis.Worker = MockWorker as unknown as typeof Worker

    const promise = generateSudokuInWorker("easy", 1)
    const worker = MockWorker.latest()
    const assertion = expect(promise).rejects.toThrow("timed out")

    await vi.advanceTimersByTimeAsync(8000)
    await assertion

    expect(worker.terminate).toHaveBeenCalledTimes(1)
  })
})
