"use client"

import { useLayoutEffect, useState } from "react"

import { AdsterraBanner, useAdsAllowed } from "./adsterra-banner"

const RAIL_WIDTH = 160
const RAIL_GAP = 16
const MIN_HEIGHT = 160

type Placement = {
  top: number
  height: number
}

function rootFontSize(): number {
  const size = parseFloat(getComputedStyle(document.documentElement).fontSize)
  return Number.isFinite(size) ? size : 16
}

function isInFlowBox(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  if (rect.width < 8 || rect.height < 8) return false
  const position = getComputedStyle(element).position
  return position !== "fixed" && position !== "absolute"
}

function columnLeft(main: HTMLElement): number {
  let left = Infinity
  for (const child of main.children) {
    if (!(child instanceof HTMLElement) || !isInFlowBox(child)) continue
    left = Math.min(left, child.getBoundingClientRect().left)
  }
  return left
}

function contentAnchor(main: HTMLElement): HTMLElement | null {
  const heading = main.querySelector("h1")
  if (heading instanceof HTMLElement && isInFlowBox(heading)) return heading
  for (const child of main.children) {
    if (child instanceof HTMLElement && isInFlowBox(child)) return child
  }
  return null
}

function placementFor(anchor: HTMLElement, shell: HTMLElement): Placement | null {
  const rect = anchor.getBoundingClientRect()
  const top = Math.round(rect.top + window.scrollY)
  let room = window.innerHeight - rect.top - 12
  const footer = shell.querySelector("footer")
  if (footer instanceof HTMLElement) {
    const footerTop = footer.getBoundingClientRect().top + window.scrollY
    room = Math.min(room, footerTop - top - 12)
  }
  if (room < MIN_HEIGHT) return null
  return { top, height: Math.round(Math.min(600, room)) }
}

/**
 * Fixed 160×600 rail, 1.5rem from the left edge.
 * Play screens align it to the board. Other pages align it to the title.
 * A column that would run under the rail leaves the rail off.
 */
export function PageSideBanner() {
  const allowed = useAdsAllowed()
  const [placement, setPlacement] = useState<Placement | null>(null)

  useLayoutEffect(() => {
    let frame = 0
    let cancelled = false

    const measure = () => {
      if (cancelled) return
      const shell = document.querySelector("[data-site-shell]")
      if (!(shell instanceof HTMLElement)) return

      const hide = () => {
        setPlacement((current) => (current === null ? current : null))
      }

      const wide = window.matchMedia("(min-width: 1024px)").matches
      if (!wide || shell.querySelector("[data-side-banner='off']")) {
        hide()
        return
      }

      const playField = shell.querySelector("[data-play-field]")
      if (playField instanceof HTMLElement) {
        const next = placementFor(playField, shell)
        setPlacement((current) =>
          current && next && current.top === next.top && current.height === next.height
            ? current
            : next,
        )
        return
      }

      if (shell.querySelector("[data-play-shell]")) {
        hide()
        return
      }

      const main = shell.querySelector("main")
      if (!(main instanceof HTMLElement)) {
        hide()
        return
      }

      const left = columnLeft(main)
      const railRight = 1.5 * rootFontSize() + RAIL_WIDTH
      if (!Number.isFinite(left) || left < railRight + RAIL_GAP) {
        hide()
        return
      }

      const anchor = contentAnchor(main)
      const next = anchor ? placementFor(anchor, shell) : null
      setPlacement((current) =>
        current && next && current.top === next.top && current.height === next.height
          ? current
          : next,
      )
    }

    const schedule = () => {
      if (cancelled) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    const resize = new ResizeObserver(schedule)
    const mutation = new MutationObserver(schedule)
    const shell = document.querySelector("[data-site-shell]")
    const main = shell?.querySelector("main")
    const playShell = shell?.querySelector("[data-play-shell]")
    if (main) resize.observe(main)
    if (playShell) resize.observe(playShell)
    if (shell) {
      mutation.observe(shell, { childList: true, subtree: true })
    }
    window.addEventListener("resize", schedule)
    document.fonts?.ready.then(schedule).catch(() => {})
    schedule()

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      resize.disconnect()
      mutation.disconnect()
      window.removeEventListener("resize", schedule)
    }
  }, [])

  if (allowed !== true || !placement) return null

  return (
    <aside
      className="side-banner"
      style={{ top: placement.top, height: placement.height }}
    >
      <AdsterraBanner unit="skyscraper" />
    </aside>
  )
}
