import type {
  KlondikeFoundationIndex,
  KlondikePileRef,
} from "@pasttime/domain/games/solitaire"

export interface KlondikePileRect {
  x: number
  y: number
  width: number
  height: number
}

const BOARD_SELECTOR = ".klondike-board"

function getBoardRoot(): Element | null {
  if (typeof document === "undefined") {
    return null
  }

  return document.querySelector(BOARD_SELECTOR)
}

function pileSelector(ref: KlondikePileRef): string | null {
  switch (ref.pile) {
    case "waste":
      return '[data-klondike-pile="waste"]'
    case "tableau":
      return `[data-klondike-pile="tableau-${ref.index}"]`
    case "foundation":
      return `[data-klondike-pile="foundation-${ref.index}"]`
    case "stock":
      return null
  }
}

function readPileRect(selector: string): KlondikePileRect | null {
  const board = getBoardRoot()
  const element = board?.querySelector(selector)
  if (!element) {
    return null
  }

  const rect = element.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) {
    return null
  }

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    width: rect.width,
    height: rect.height,
  }
}

export function getKlondikePileRect(ref: KlondikePileRef): KlondikePileRect | null {
  const selector = pileSelector(ref)
  if (!selector) {
    return null
  }

  return readPileRect(selector)
}

export function getKlondikeFoundationRect(
  index: KlondikeFoundationIndex,
): KlondikePileRect | null {
  return readPileRect(`[data-klondike-pile="foundation-${index}"]`)
}

export function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}
