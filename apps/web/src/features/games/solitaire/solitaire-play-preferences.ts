export const AUTO_STACK_STORAGE_KEY = "solitaire:klondike:auto-stack"

export function readAutoStackEnabled(
  get: <T>(key: string) => T | null,
): boolean {
  return get<boolean>(AUTO_STACK_STORAGE_KEY) === true
}

export function writeAutoStackEnabled(
  set: (key: string, value: unknown) => void,
  enabled: boolean,
): void {
  set(AUTO_STACK_STORAGE_KEY, enabled)
}
