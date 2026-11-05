export const TYPE_SHIELD_MODES = ["survival", "endless"] as const

export type TypeShieldMode = (typeof TYPE_SHIELD_MODES)[number]

export const TYPE_SHIELD_MODE_DEFAULT: TypeShieldMode = "survival"

/** Survival is won by lasting this long. */
export const TYPE_SHIELD_SURVIVAL_MS = 120_000

export function isTypeShieldMode(value: unknown): value is TypeShieldMode {
  return (
    typeof value === "string" &&
    (TYPE_SHIELD_MODES as readonly string[]).includes(value)
  )
}

export function formatTypeShieldModeLabel(mode: TypeShieldMode): string {
  switch (mode) {
    case "survival":
      return "Survival"
    case "endless":
      return "Endless"
  }
}
