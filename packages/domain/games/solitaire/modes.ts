/** Solitaire layouts exposed in launch settings (implement gameplay per mode later). */
export const SOLITAIRE_MODES = [
  "klondike",
  "pyramid",
  "tripeaks",
  "freecell",
] as const

export type SolitaireMode = (typeof SOLITAIRE_MODES)[number]

export const SOLITAIRE_MODE_DEFAULT: SolitaireMode = "klondike"

const MODE_SET = new Set<string>(SOLITAIRE_MODES)

export function isSolitaireMode(value: string): value is SolitaireMode {
  return MODE_SET.has(value)
}

export function parseSolitaireMode(
  raw: string | null | undefined,
): SolitaireMode {
  if (raw && isSolitaireMode(raw)) {
    return raw
  }
  return SOLITAIRE_MODE_DEFAULT
}

export interface SolitaireModeInfo {
  label: string
  /** One line for settings / play header. */
  tagline: string
}

export const SOLITAIRE_MODE_INFO: Record<SolitaireMode, SolitaireModeInfo> = {
  klondike: {
    label: "Klondike",
    tagline: "Classic seven-column tableau and four foundations.",
  },
  pyramid: {
    label: "Pyramid",
    tagline: "Clear the triangle by pairing cards that sum to 13.",
  },
  tripeaks: {
    label: "TriPeaks",
    tagline: "Remove peaks by playing one rank higher or lower.",
  },
  freecell: {
    label: "FreeCell",
    tagline: "All cards face up — use four free cells to win.",
  },
}

export function formatSolitaireModeLabel(mode: SolitaireMode): string {
  return SOLITAIRE_MODE_INFO[mode].label
}
