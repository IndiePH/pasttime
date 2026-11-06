import { act, cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { AdsterraBanner } from "./adsterra-banner"

async function flushMountQueue() {
  await act(async () => {
    await Promise.resolve()
  })
}

describe("AdsterraBanner", () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    document.body.innerHTML = ""
  })

  it("retries once when the loader finishes without rendering an iframe", async () => {
    vi.useFakeTimers()
    const { container } = render(<AdsterraBanner unit="leaderboard" />)
    await flushMountQueue()

    const slot = container.firstElementChild as HTMLElement
    const firstScript = slot.querySelector("script")
    expect(firstScript).not.toBeNull()

    await act(async () => {
      firstScript?.dispatchEvent(new Event("load"))
      await Promise.resolve()
    })
    expect(slot.querySelector("script")).toBe(firstScript)

    await act(async () => {
      vi.advanceTimersByTime(1_500)
      await Promise.resolve()
    })

    const retryScript = slot.querySelector("script")
    expect(retryScript).not.toBeNull()
    expect(retryScript).not.toBe(firstScript)

    await act(async () => {
      retryScript?.dispatchEvent(new Event("load"))
      await Promise.resolve()
    })
  })

  it("does not retry more than once for a unit", async () => {
    vi.useFakeTimers()
    const { container } = render(<AdsterraBanner unit="leaderboard" />)
    await flushMountQueue()

    const slot = container.firstElementChild as HTMLElement
    const firstScript = slot.querySelector("script")
    expect(firstScript).not.toBeNull()

    await act(async () => {
      firstScript?.dispatchEvent(new Event("load"))
      vi.advanceTimersByTime(1_500)
      await Promise.resolve()
    })

    const retryScript = slot.querySelector("script")
    expect(retryScript).not.toBeNull()

    await act(async () => {
      retryScript?.dispatchEvent(new Event("load"))
      vi.advanceTimersByTime(1_500)
      await Promise.resolve()
    })

    expect(slot.querySelector("script")).toBe(retryScript)
  })

  it("keeps a late-rendered iframe instead of replacing it with a retry", async () => {
    vi.useFakeTimers()
    const { container } = render(<AdsterraBanner unit="leaderboard" />)
    await flushMountQueue()

    const slot = container.firstElementChild as HTMLElement
    const firstScript = slot.querySelector("script")
    expect(firstScript).not.toBeNull()

    await act(async () => {
      firstScript?.dispatchEvent(new Event("load"))
      vi.advanceTimersByTime(1_000)
      const iframe = document.createElement("iframe")
      slot.appendChild(iframe)
      vi.advanceTimersByTime(500)
      await Promise.resolve()
    })

    expect(slot.querySelector("iframe")).not.toBeNull()
    expect(slot.querySelector("script")).toBe(firstScript)
  })
})
