const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const ROOM_CODE_LENGTH = 6

export function generateRoomCode(): string {
  let code = ""
  for (let i = 0; i < ROOM_CODE_LENGTH; i += 1) {
    const index = Math.floor(Math.random() * ROOM_CODE_CHARS.length)
    code += ROOM_CODE_CHARS[index]
  }
  return code
}

export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase()
}

export function isValidRoomCode(code: string): boolean {
  const normalized = normalizeRoomCode(code)
  if (normalized.length !== ROOM_CODE_LENGTH) {
    return false
  }
  return [...normalized].every((char) => ROOM_CODE_CHARS.includes(char))
}
