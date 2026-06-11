import {
  DEFAULT_PLAYING_CARD_VARIANT,
  isPlayingCardVariant,
  type PlayingCardVariant,
} from "@pasttime/domain/games"

export const CARD_VARIANT_STORAGE_KEY = "games:cards:variant"

export function readCardVariant(
  get: <T>(key: string) => T | null,
): PlayingCardVariant {
  const stored = get<string>(CARD_VARIANT_STORAGE_KEY)
  return stored && isPlayingCardVariant(stored)
    ? stored
    : DEFAULT_PLAYING_CARD_VARIANT
}

export function writeCardVariant(
  set: (key: string, value: unknown) => void,
  variant: PlayingCardVariant,
): void {
  set(CARD_VARIANT_STORAGE_KEY, variant)
}
