export type ColorMode = "light" | "dark"
export type ModePreference = ColorMode | "system"

export type ThemePreset = {
  id: string
  family: string
  mode: ColorMode
  label: string
}

export type ThemeFamily = {
  id: string
  label: string
  /** When false, skin is kept in code but hidden from the UI. */
  available: boolean
}

export type ThemePreference = {
  family: string
  mode: ModePreference
}

export const STORAGE_KEY = "pasttime-theme"
export const LEGACY_STORAGE_KEY = "theme"

export const THEME_PRESETS: readonly ThemePreset[] = [
  {
    id: "default-light",
    family: "default",
    mode: "light",
    label: "Default",
  },
  {
    id: "default-dark",
    family: "default",
    mode: "dark",
    label: "Default",
  },
  {
    id: "retro-light",
    family: "retro",
    mode: "light",
    label: "Retro",
  },
  {
    id: "retro-dark",
    family: "retro",
    mode: "dark",
    label: "Retro",
  },
] as const

export const THEME_FAMILIES: readonly ThemeFamily[] = [
  { id: "default", label: "Default", available: true },
  // Hidden for now — re-enable by setting available: true
  { id: "retro", label: "Retro", available: false },
] as const

export const DEFAULT_PREFERENCE: ThemePreference = {
  family: "default",
  mode: "system",
}

export function availableThemeFamilies(): ThemeFamily[] {
  return THEME_FAMILIES.filter((family) => family.available)
}

/** Stable list for React context — recompute only when THEME_FAMILIES changes. */
export const AVAILABLE_THEME_FAMILIES: readonly ThemeFamily[] =
  availableThemeFamilies()

export function isFamilyAvailable(family: string): boolean {
  return THEME_FAMILIES.some((entry) => entry.id === family && entry.available)
}

export function presetsForFamily(family: string): ThemePreset[] {
  return THEME_PRESETS.filter((preset) => preset.family === family)
}

export function modesForFamily(family: string): ColorMode[] {
  const modes = new Set<ColorMode>()
  for (const preset of presetsForFamily(family)) {
    modes.add(preset.mode)
  }
  return [...modes]
}

export function getSystemMode(): ColorMode {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function resolveFromPresets(
  pool: readonly ThemePreset[],
  preference: ThemePreference,
  systemMode: ColorMode,
): ThemePreset {
  const desiredMode: ColorMode =
    preference.mode === "system" ? systemMode : preference.mode

  return (
    pool.find((preset) => preset.mode === desiredMode) ??
    pool[0] ??
    THEME_PRESETS[0]!
  )
}

export function resolvePreset(
  preference: ThemePreference,
  systemMode: ColorMode = getSystemMode(),
): ThemePreset {
  const familyPresets = presetsForFamily(preference.family)
  const fallbackFamily = presetsForFamily(DEFAULT_PREFERENCE.family)
  const pool = familyPresets.length > 0 ? familyPresets : fallbackFamily
  return resolveFromPresets(pool, preference, systemMode)
}

export function parseStoredPreference(raw: string | null): ThemePreference {
  if (!raw) return DEFAULT_PREFERENCE

  try {
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed &&
      typeof parsed === "object" &&
      "family" in parsed &&
      "mode" in parsed &&
      typeof (parsed as ThemePreference).family === "string" &&
      isModePreference((parsed as ThemePreference).mode)
    ) {
      const preference = parsed as ThemePreference
      if (
        presetsForFamily(preference.family).length === 0 ||
        !isFamilyAvailable(preference.family)
      ) {
        return { family: DEFAULT_PREFERENCE.family, mode: preference.mode }
      }
      return preference
    }
  } catch {
    /* legacy or invalid */
  }

  return migrateLegacyTheme(raw)
}

export function migrateLegacyTheme(raw: string): ThemePreference {
  if (raw === "light" || raw === "dark" || raw === "system") {
    return { family: "default", mode: raw }
  }
  return DEFAULT_PREFERENCE
}

export function isModePreference(value: unknown): value is ModePreference {
  return value === "light" || value === "dark" || value === "system"
}

export function applyResolvedPreset(preset: ThemePreset): void {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.dataset.theme = preset.id
  root.classList.remove("light", "dark")
  root.classList.add(preset.mode)
  root.style.colorScheme = preset.mode
}
