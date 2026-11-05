"use client"

import { useLayoutEffect, useState } from "react"

import { SideBannerPlaceholder } from "./side-banner-placeholder"

/** Fixed left rail whose top matches the play field box, not the game title. */
export function PlaySideBanner() {
  const [top, setTop] = useState<number | null>(null)

  useLayoutEffect(() => {
    let frame = 0

    const measure = () => {
      const field = document.querySelector("[data-play-field]")
      if (!(field instanceof HTMLElement)) return
      const next = Math.round(field.getBoundingClientRect().top + window.scrollY)
      setTop((current) => (current === next ? current : next))
    }

    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    const shell = document.querySelector("[data-play-shell]")
    const resize = new ResizeObserver(schedule)
    const mutation = new MutationObserver(schedule)
    if (shell) {
      resize.observe(shell)
      mutation.observe(shell, { childList: true, subtree: true })
    }
    window.addEventListener("resize", schedule)
    schedule()

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      mutation.disconnect()
      window.removeEventListener("resize", schedule)
    }
  }, [])

  return (
    <aside
      className="play-side-banner hidden lg:block"
      style={
        top == null
          ? { visibility: "hidden" }
          : {
              top,
              height: `min(600px, calc(100dvh - ${top}px - 0.75rem))`,
            }
      }
    >
      <SideBannerPlaceholder />
    </aside>
  )
}
