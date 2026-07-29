/**
 * Slot → env readers. Next.js only inlines `process.env.NEXT_PUBLIC_*` when
 * the property name is a static string literal — dynamic `process.env[key]`
 * works on the server but is undefined in the client bundle, which caused
 * AdPanel to SSR live `<ins>` units and hydrate as placeholders.
 */
const SLOT_READERS: Record<string, () => string | undefined> = {
  "global-top-strip": () => process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP,
  "global-bottom-strip": () => process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM,
  "hub-grid-card": () => process.env.NEXT_PUBLIC_ADSENSE_SLOT_HUB,
}

export type AdSlotKey = keyof typeof SLOT_READERS

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
  const read = SLOT_READERS[slot]
  if (!read) return null
  const id = read()?.trim()
  return id || null
}

export function isAdsenseConfigured(slot: string): boolean {
  return getAdsenseClient() !== null && getAdsenseSlotId(slot) !== null
}

export function toAdsTxtPublisherId(client: string): string {
  return client.startsWith("ca-") ? client.slice(3) : client
}
