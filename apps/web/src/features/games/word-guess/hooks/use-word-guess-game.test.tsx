import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useWordGuessGame } from "@/features/games/word-guess/hooks/use-word-guess-game"

const storageMap = new Map<string, unknown>()

vi.mock("@/infrastructure/storage", () => {
  return {
    useStorage: () => ({
      get: <T,>(key: string) => (storageMap.get(key) as T) ?? null,
      set: <T,>(key: string, value: T) => {
        storageMap.set(key, value)
      },
      remove: (key: string) => {
        storageMap.delete(key)
      },
      clear: () => {
        storageMap.clear()
      },
    }),
  }
})

function HookHarness() {
  const game = useWordGuessGame({
    wordLength: 5,
    roundMode: "random",
  })

  return (
    <div>
      <p data-testid="guess-count">{game.round.guesses.length}</p>
      <p data-testid="feedback">{game.feedback ?? ""}</p>
      <button type="button" onClick={() => game.addLetter("A")}>
        A
      </button>
      <button type="button" onClick={() => game.addLetter("P")}>
        P
      </button>
      <button type="button" onClick={() => game.addLetter("L")}>
        L
      </button>
      <button type="button" onClick={() => game.addLetter("E")}>
        E
      </button>
      <button type="button" onClick={() => game.addLetter("B")}>
        B
      </button>
      <button type="button" onClick={() => game.addLetter("O")}>
        O
      </button>
      <button type="button" onClick={() => game.addLetter("U")}>
        U
      </button>
      <button type="button" onClick={() => game.addLetter("T")}>
        T
      </button>
      <button type="button" onClick={() => game.addLetter("Z")}>
        Z
      </button>
      <button type="button" onClick={game.submitGuess}>
        Submit
      </button>
      <button type="button" onClick={game.removeLetter}>
        Remove
      </button>
    </div>
  )
}

function HardModeHookHarness() {
  const game = useWordGuessGame({
    wordLength: 5,
    roundMode: "random",
    hardMode: true,
  })

  return (
    <div>
      <p data-testid="guess-count">{game.round.guesses.length}</p>
      <p data-testid="feedback">{game.feedback ?? ""}</p>
      <p data-testid="hard-mode">{game.round.hardMode ? "true" : "false"}</p>
      <button type="button" onClick={() => game.addLetter("A")}>
        A
      </button>
      <button type="button" onClick={() => game.addLetter("P")}>
        P
      </button>
      <button type="button" onClick={() => game.addLetter("P")}>
        P
      </button>
      <button type="button" onClick={() => game.addLetter("L")}>
        L
      </button>
      <button type="button" onClick={() => game.addLetter("E")}>
        E
      </button>
      <button type="button" onClick={() => game.addLetter("X")}>
        X
      </button>
      <button type="button" onClick={() => game.addLetter("Z")}>
        Z
      </button>
      <button type="button" onClick={game.submitGuess}>
        Submit
      </button>
      <button type="button" onClick={game.removeLetter}>
        Remove
      </button>
    </div>
  )
}

describe("useWordGuessGame", () => {
  beforeEach(() => {
    storageMap.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it("submits a valid dictionary guess", () => {
    render(<HookHarness />)

    fireEvent.click(screen.getByRole("button", { name: "A" }))
    fireEvent.click(screen.getByRole("button", { name: "B" }))
    fireEvent.click(screen.getByRole("button", { name: "O" }))
    fireEvent.click(screen.getByRole("button", { name: "U" }))
    fireEvent.click(screen.getByRole("button", { name: "T" }))
    fireEvent.click(screen.getByRole("button", { name: "Submit" }))

    expect(screen.getByTestId("guess-count").textContent).toBe("1")
    expect(screen.getByTestId("feedback").textContent).not.toBe("Word not in dictionary.")
  })

  it("shows feedback for invalid dictionary guess", () => {
    render(<HookHarness />)

    fireEvent.click(screen.getByRole("button", { name: "Z" }))
    fireEvent.click(screen.getByRole("button", { name: "Z" }))
    fireEvent.click(screen.getByRole("button", { name: "Z" }))
    fireEvent.click(screen.getByRole("button", { name: "Z" }))
    fireEvent.click(screen.getByRole("button", { name: "Z" }))
    fireEvent.click(screen.getByRole("button", { name: "Submit" }))

    expect(screen.getByTestId("guess-count").textContent).toBe("0")
    expect(screen.getByTestId("feedback").textContent).toBe("Word not in dictionary.")
  })
})

describe("hard mode", () => {
  beforeEach(() => {
    storageMap.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it("propagates hardMode through the hook to round state", () => {
    render(<HardModeHookHarness />)

    const feedbackEl = screen.getByTestId("hard-mode")
    expect(feedbackEl.textContent).toBe("true")
  })
})
