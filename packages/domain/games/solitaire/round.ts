/** Daily puzzle versus an unseeded deal. Layout stays a separate choice. */
export const SOLITAIRE_ROUND_MODES = ["daily", "random"] as const

export type SolitaireRoundMode = (typeof SOLITAIRE_ROUND_MODES)[number]

export const SOLITAIRE_ROUND_MODE_DEFAULT: SolitaireRoundMode = "daily"
