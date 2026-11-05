import {
  isTypeShieldDifficulty,
  isTypeShieldMode,
  TYPE_SHIELD_MODE_DEFAULT,
  type TypeShieldDifficulty,
  type TypeShieldMode,
} from "@pasttime/domain/games/type-shield"

export const TYPE_SHIELD_COMET_EFFECTS_KEY = "type-shield:comet-effects"
export const TYPE_SHIELD_DIFFICULTY_KEY = "type-shield:difficulty"
export const TYPE_SHIELD_MODE_KEY = "type-shield:mode"

export function readCometEffects(
  get: <T>(key: string) => T | null,
): boolean {
  return get<boolean>(TYPE_SHIELD_COMET_EFFECTS_KEY) !== false
}

export function writeCometEffects(
  set: (key: string, value: unknown) => void,
  enabled: boolean,
): void {
  set(TYPE_SHIELD_COMET_EFFECTS_KEY, enabled)
}

export function readDifficulty(
  get: <T>(key: string) => T | null,
): TypeShieldDifficulty {
  const value = get<string>(TYPE_SHIELD_DIFFICULTY_KEY)
  return isTypeShieldDifficulty(value) ? value : "easy"
}

export function writeDifficulty(
  set: (key: string, value: unknown) => void,
  difficulty: TypeShieldDifficulty,
): void {
  set(TYPE_SHIELD_DIFFICULTY_KEY, difficulty)
}

export function readMode(get: <T>(key: string) => T | null): TypeShieldMode {
  const value = get<string>(TYPE_SHIELD_MODE_KEY)
  return isTypeShieldMode(value) ? value : TYPE_SHIELD_MODE_DEFAULT
}

export function writeMode(
  set: (key: string, value: unknown) => void,
  mode: TypeShieldMode,
): void {
  set(TYPE_SHIELD_MODE_KEY, mode)
}
