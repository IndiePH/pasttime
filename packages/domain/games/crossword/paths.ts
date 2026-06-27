import { gameLaunchPath, gamePlayPath } from "../paths"

export function crosswordLaunchPath(size?: number): string {
  const path = gameLaunchPath("crossword")
  return size ? `${path}?size=${size}` : path
}

export function crosswordPlayPath(
  size?: number,
  mode?: "daily" | "random",
): string {
  const path = gamePlayPath("crossword")
  const searchParams = new URLSearchParams()
  if (size) searchParams.set("size", String(size))
  if (mode) searchParams.set("mode", mode)
  const query = searchParams.toString()
  return query ? `${path}?${query}` : path
}