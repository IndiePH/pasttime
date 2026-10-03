import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { useWordGuessGame } from "@/features/games/word-guess/hooks/use-word-guess-game"

const TEST_ANSWERS = ["ABOUT", "APPLE", "STONE", "PLANT"]
const TEST_GUESSABLE = new Set([
  "ABOUT",
  "APPLE",
  "STONE",
  "PLANT",
  "ABIDE",
  "MAGIC",
  "ALBUM",
  "ALPHA",
  "AWARE",
])

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
    answerWords: TEST_ANSWERS,
    guessableSet: TEST_GUESSABLE,
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
      <p data-testid="current-guess">{game.currentGuess}</p>
      <p data-testid="selected-column">
        {game.selectedColumn === null ? "none" : String(game.selectedColumn)}
      </p>
      {[0, 1, 2, 3, 4].map((column) => (
        <button
          key={column}
          type="button"
          onClick={() => game.selectColumn(column)}
        >
          Select {column}
        </button>
      ))}
    </div>
  )
}

function HardModeHookHarness() {
  const game = useWordGuessGame({
    wordLength: 5,
    roundMode: "random",
    hardMode: true,
    answerWords: TEST_ANSWERS,
    guessableSet: TEST_GUESSABLE,
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

describe("current-row cell editing", () => {
  beforeEach(() => {
    storageMap.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it("replaces one selected letter and leaves the rest of the guess", () => {
    render(<HookHarness />)

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: letter }))
    }
    fireEvent.click(screen.getByRole("button", { name: "Select 1" }))
    fireEvent.click(screen.getByRole("button", { name: "O" }))

    expect(screen.getByTestId("current-guess")).toHaveTextContent("AOPLE")
    expect(screen.getByTestId("selected-column")).toHaveTextContent("2")
  })

  it("deletes only the selected letter", () => {
    render(<HookHarness />)

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: letter }))
    }
    fireEvent.click(screen.getByRole("button", { name: "Select 1" }))
    fireEvent.click(screen.getByRole("button", { name: "Remove" }))

    expect(screen.getByTestId("current-guess")).toHaveTextContent("APLE")
    expect(screen.getByTestId("selected-column")).toHaveTextContent("1")
  })

  it("still removes the last letter when no cell is selected", () => {
    render(<HookHarness />)

    fireEvent.click(screen.getByRole("button", { name: "A" }))
    fireEvent.click(screen.getByRole("button", { name: "P" }))
    fireEvent.click(screen.getByRole("button", { name: "Remove" }))

    expect(screen.getByTestId("current-guess")).toHaveTextContent("A")
    expect(screen.getByTestId("selected-column")).toHaveTextContent("none")
  })

  it("snaps a click past the typed letters onto the next empty cell", () => {
    render(<HookHarness />)

    fireEvent.click(screen.getByRole("button", { name: "A" }))
    fireEvent.click(screen.getByRole("button", { name: "P" }))
    fireEvent.click(screen.getByRole("button", { name: "Select 4" }))

    expect(screen.getByTestId("selected-column")).toHaveTextContent("2")

    fireEvent.click(screen.getByRole("button", { name: "L" }))

    expect(screen.getByTestId("current-guess")).toHaveTextContent("APL")
    expect(screen.getByTestId("selected-column")).toHaveTextContent("3")
  })

  it("moves between letters with the arrow keys and types into the selected cell", () => {
    render(<HookHarness />)

    fireEvent.click(screen.getByRole("button", { name: "A" }))
    fireEvent.click(screen.getByRole("button", { name: "P" }))
    fireEvent.click(screen.getByRole("button", { name: "P" }))
    fireEvent.keyDown(window, { key: "ArrowLeft" })

    expect(screen.getByTestId("selected-column")).toHaveTextContent("2")

    fireEvent.keyDown(window, { key: "ArrowLeft" })
    fireEvent.keyDown(window, { key: "o" })

    expect(screen.getByTestId("current-guess")).toHaveTextContent("AOP")
    expect(screen.getByTestId("selected-column")).toHaveTextContent("2")
  })

  it("keeps the last letter selected so it can be retyped", () => {
    render(<HookHarness />)

    for (const letter of ["A", "P", "P", "L", "E"]) {
      fireEvent.click(screen.getByRole("button", { name: letter }))
    }
    fireEvent.click(screen.getByRole("button", { name: "Select 4" }))
    fireEvent.click(screen.getByRole("button", { name: "T" }))

    expect(screen.getByTestId("current-guess")).toHaveTextContent("APPLT")
    expect(screen.getByTestId("selected-column")).toHaveTextContent("4")
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
