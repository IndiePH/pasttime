/**
 * In-game crossword preferences. Mirror of the solitaire play-preferences
 * pattern: a small persisted shape for session tweaks (errors visibility,
 * auto-check) that lives separately from save state.
 *
 * Domain layer owns the type + defaults + storage key only. The web layer
 * wires it to a storage adapter in a React context.
 */

/** In-game toggles shown in the crossword play-settings dropdown. */
export interface CrosswordPlayPreferences {
  /** Highlight cells whose input differs from the answer. */
  showErrors: boolean
  /** Mark the round won automatically when every letter is correct. */
  autoCheck: boolean
}

export const CROSSWORD_PLAY_PREFERENCES_DEFAULT: CrosswordPlayPreferences = {
  showErrors: true,
  autoCheck: false,
}

export const CROSSWORD_PLAY_PREFERENCES_STORAGE_KEY = "crossword:play-prefs"

export function readCrosswordPlayPreferences(
  get: <T>(key: string) => T | null,
): CrosswordPlayPreferences {
  const stored = get<Partial<CrosswordPlayPreferences>>(
    CROSSWORD_PLAY_PREFERENCES_STORAGE_KEY,
  )
  if (!stored || typeof stored !== "object") {
    return { ...CROSSWORD_PLAY_PREFERENCES_DEFAULT }
  }
  return {
    showErrors:
      typeof stored.showErrors === "boolean"
        ? stored.showErrors
        : CROSSWORD_PLAY_PREFERENCES_DEFAULT.showErrors,
    autoCheck:
      typeof stored.autoCheck === "boolean"
        ? stored.autoCheck
        : CROSSWORD_PLAY_PREFERENCES_DEFAULT.autoCheck,
  }
}

export function writeCrosswordPlayPreferences(
  set: (key: string, value: unknown) => void,
  prefs: CrosswordPlayPreferences,
): void {
  set(CROSSWORD_PLAY_PREFERENCES_STORAGE_KEY, prefs)
}
