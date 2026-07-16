const SLOT_ENV: Record<string, string> = {
  "global-top-strip": "NEXT_PUBLIC_ADSENSE_SLOT_TOP",
  "global-bottom-strip": "NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM",
  "hub-grid-card": "NEXT_PUBLIC_ADSENSE_SLOT_HUB",
}

export type AdSlotKey = keyof typeof SLOT_ENV

export function normalizeAdsenseClient(
  raw: string | undefined,
): string | null {
  const value = raw?.trim()
  if (!value) return null
  if (value.startsWith("ca-pub-")) return value
  if (value.startsWith("pub-")) return `ca-${value}`
  return null
}

export function getAdsenseClient(): string | null {
  return normalizeAdsenseClient(process.env.NEXT_PUBLIC_ADSENSE_CLIENT)
}

export function getAdsenseSlotId(slot: string): string | null {
  const envKey = SLOT_ENV[slot]
  if (!envKey) return null
  const id = process.env[envKey]?.trim()
  return id || null
}

export function isAdsenseConfigured(slot: string): boolean {
  return getAdsenseClient() !== null && getAdsenseSlotId(slot) !== null
}

export function toAdsTxtPublisherId(client: string): string {
  return client.startsWith("ca-") ? client.slice(3) : client
}
