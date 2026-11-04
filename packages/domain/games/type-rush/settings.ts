export const TYPE_RUSH_ROUND_MODES = ["daily", "practice"] as const

export type TypeRushRoundMode = (typeof TYPE_RUSH_ROUND_MODES)[number]

export const TYPE_RUSH_ROUND_MODE_DEFAULT: TypeRushRoundMode = "daily"

const MODE_SET = new Set<string>(TYPE_RUSH_ROUND_MODES)

export function isTypeRushRoundMode(value: string): value is TypeRushRoundMode {
  return MODE_SET.has(value)
}

export function parseTypeRushRoundMode(
  raw: string | null | undefined
): TypeRushRoundMode {
  return raw && isTypeRushRoundMode(raw) ? raw : TYPE_RUSH_ROUND_MODE_DEFAULT
}

export function formatTypeRushRoundModeLabel(mode: TypeRushRoundMode): string {
  return mode === "daily" ? "Daily passage" : "Practice passage"
}
