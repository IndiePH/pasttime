export const TYPE_RUSH_ROUND_MODES = ["daily", "practice"] as const

export type TypeRushRoundMode = (typeof TYPE_RUSH_ROUND_MODES)[number]

export const TYPE_RUSH_ROUND_MODE_DEFAULT: TypeRushRoundMode = "daily"

export const TYPE_RUSH_CONTENT_TYPES = [
  "paragraph",
  "words",
  "numbers",
  "numbers-punctuation",
] as const

export type TypeRushContentType = (typeof TYPE_RUSH_CONTENT_TYPES)[number]

export const TYPE_RUSH_CONTENT_TYPE_DEFAULT: TypeRushContentType = "paragraph"

const MODE_SET = new Set<string>(TYPE_RUSH_ROUND_MODES)
const CONTENT_TYPE_SET = new Set<string>(TYPE_RUSH_CONTENT_TYPES)

export function isTypeRushRoundMode(value: string): value is TypeRushRoundMode {
  return MODE_SET.has(value)
}

export function isTypeRushContentType(
  value: string
): value is TypeRushContentType {
  return CONTENT_TYPE_SET.has(value)
}

export function parseTypeRushRoundMode(
  raw: string | null | undefined
): TypeRushRoundMode {
  return raw && isTypeRushRoundMode(raw) ? raw : TYPE_RUSH_ROUND_MODE_DEFAULT
}

export function formatTypeRushRoundModeLabel(mode: TypeRushRoundMode): string {
  return mode === "daily" ? "Daily Passage" : "Practice Passage"
}

export function parseTypeRushContentType(
  raw: string | null | undefined
): TypeRushContentType {
  return raw && isTypeRushContentType(raw)
    ? raw
    : TYPE_RUSH_CONTENT_TYPE_DEFAULT
}

export function formatTypeRushContentTypeLabel(
  contentType: TypeRushContentType
): string {
  switch (contentType) {
    case "words":
      return "Word Stream"
    case "numbers":
      return "Whole Numbers"
    case "numbers-punctuation":
      return "Decimal Numbers"
    default:
      return "Paragraph"
  }
}

export function formatTypeRushDailyPlayLabel(
  contentType: TypeRushContentType
): string {
  switch (contentType) {
    case "words":
      return "Play Daily Word Stream"
    case "numbers":
      return "Play Daily Whole Numbers"
    case "numbers-punctuation":
      return "Play Daily Decimal Numbers"
    default:
      return "Play Daily Paragraph"
  }
}
