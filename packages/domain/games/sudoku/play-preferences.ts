/**
 * In-game sudoku preferences. Mirror of the crossword/solitaire
 * play-preferences pattern: a small persisted shape for session tweaks that
 * lives separately from save state.
 *
 * Domain layer owns the type + defaults + storage key only. The web layer
 * wires it to a storage adapter in a React context.
 */

/** In-game toggles shown in the sudoku play-settings dropdown. */
export interface SudokuPlayPreferences {
  /** Auto-fill/prune candidate marks in empty cells as the board changes. */
  autoCandidates: boolean
}

export const SUDOKU_PLAY_PREFERENCES_DEFAULT: SudokuPlayPreferences = {
  autoCandidates: false,
}

export const SUDOKU_PLAY_PREFERENCES_STORAGE_KEY = "sudoku:play-prefs"

export function readSudokuPlayPreferences(
  get: <T>(key: string) => T | null,
): SudokuPlayPreferences {
  const stored = get<Partial<SudokuPlayPreferences>>(SUDOKU_PLAY_PREFERENCES_STORAGE_KEY)
  if (!stored || typeof stored !== "object") {
    return { ...SUDOKU_PLAY_PREFERENCES_DEFAULT }
  }
  return {
    autoCandidates:
      typeof stored.autoCandidates === "boolean"
        ? stored.autoCandidates
        : SUDOKU_PLAY_PREFERENCES_DEFAULT.autoCandidates,
  }
}

export function writeSudokuPlayPreferences(
  set: (key: string, value: unknown) => void,
  prefs: SudokuPlayPreferences,
): void {
  set(SUDOKU_PLAY_PREFERENCES_STORAGE_KEY, prefs)
}
