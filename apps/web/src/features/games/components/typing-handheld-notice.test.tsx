import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import type { GameDefinition } from "@pasttime/domain/games"
import { GamePageShell } from "./game-page-shell"
import {
  resetTypingHandheldNotice,
  TypingHandheldNotice,
} from "./typing-handheld-notice"

describe("TypingHandheldNotice", () => {
  beforeEach(() => {
    window.localStorage.removeItem("pasttime.typing.handheld-notice")
    window.localStorage.removeItem("pasttime.typing.handheld-notice.type-rush")
    window.localStorage.removeItem("pasttime.typing.handheld-notice.type-shield")
    window.localStorage.removeItem("pasttime.typing.handheld-notice.type-lanes")
    resetTypingHandheldNotice()
  })

  it("warns every player until they continue", () => {
    render(<TypingHandheldNotice gameId="type-rush" />)

    expect(
      screen.getByRole("dialog", { name: "Handheld Play" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("checkbox", { name: "Don't Show Again" })
    ).not.toBeChecked()
  })

  it("shows again on the next visit when the checkbox stays clear", () => {
    const { unmount } = render(<TypingHandheldNotice gameId="type-rush" />)

    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    unmount()
    resetTypingHandheldNotice()
    render(<TypingHandheldNotice gameId="type-rush" />)

    expect(
      screen.getByRole("dialog", { name: "Handheld Play" })
    ).toBeInTheDocument()
  })

  it("stays hidden after Don't Show Again is checked", () => {
    const { unmount } = render(<TypingHandheldNotice gameId="type-rush" />)

    fireEvent.click(screen.getByRole("checkbox", { name: "Don't Show Again" }))
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    unmount()
    resetTypingHandheldNotice()
    render(<TypingHandheldNotice gameId="type-rush" />)

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(
      window.localStorage.getItem("pasttime.typing.handheld-notice.type-rush")
    ).toBe("hidden")
  })

  it("keeps each typing game's Don't Show Again separate", () => {
    const rush = render(<TypingHandheldNotice gameId="type-rush" />)

    fireEvent.click(screen.getByRole("checkbox", { name: "Don't Show Again" }))
    fireEvent.click(screen.getByRole("button", { name: "Continue" }))
    rush.unmount()

    render(<TypingHandheldNotice gameId="type-lanes" />)

    expect(
      screen.getByRole("dialog", { name: "Handheld Play" })
    ).toBeInTheDocument()
    expect(
      window.localStorage.getItem("pasttime.typing.handheld-notice.type-lanes")
    ).toBeNull()
  })
})

const TYPE_LANES: GameDefinition = {
  id: "type-lanes",
  title: "Type Lanes",
  description: "Type along lanes.",
  status: "available",
  icon: "type-rush",
  tags: ["typing"],
}

const REVERSI: GameDefinition = {
  id: "reversi",
  title: "Reversi",
  description: "Flip discs.",
  status: "available",
  icon: "reversi",
  tags: ["board"],
}

describe("typing handheld notice in the shared shell", () => {
  beforeEach(() => {
    window.localStorage.removeItem("pasttime.typing.handheld-notice.type-lanes")
    resetTypingHandheldNotice()
  })

  it("shows the notice for any game tagged typing", () => {
    render(
      <GamePageShell game={TYPE_LANES}>
        <p>Lane</p>
      </GamePageShell>
    )

    expect(
      screen.getByRole("dialog", { name: "Handheld Play" })
    ).toBeInTheDocument()
  })

  it("stays off a game that is not tagged typing", () => {
    render(
      <GamePageShell game={REVERSI}>
        <p>Board</p>
      </GamePageShell>
    )

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})
