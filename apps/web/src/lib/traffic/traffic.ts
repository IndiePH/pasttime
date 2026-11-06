import { timingSafeEqual } from "node:crypto"

export const TRAFFIC_SEEN_COOKIE = "pt_seen"
export const TRAFFIC_VISITOR_COOKIE = "pt_vid"
export const TRAFFIC_HIT_COOKIE = "pt_hit"
export const TRAFFIC_AUTH_COOKIE = "pt_traffic_auth"
export const TRAFFIC_HIT_WINDOW_MS = 30_000
export const TRAFFIC_VISITOR_MAX_AGE_SECONDS = 60 * 60 * 24 * 400
export const TRAFFIC_RANGES = [7, 30, 90] as const

const VISITOR_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type TrafficRange = (typeof TRAFFIC_RANGES)[number]

const BOT_USER_AGENT =
  /bot|crawl|spider|slurp|headless|lighthouse|preview|wget|curl|python-requests|go-http-client|scrapy/i

const REGION_NAMES = new Intl.DisplayNames(["en"], { type: "region" })

const SPECIAL_COUNTRIES: Record<string, string> = {
  A1: "Anonymous proxy",
  A2: "Satellite",
  O1: "Other",
  T1: "Tor",
  XX: "Unknown",
}

export type TrafficDecision =
  | { action: "ignore" }
  | {
      action: "record"
      day: string
      country: string
      path: string
      hit: string
    }

export function viewKey(): string | null {
  const key = process.env.TRAFFIC_VIEW_KEY?.trim()
  return key ? key : null
}

export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function trafficSinceDay(range: TrafficRange, now: Date): string {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  start.setUTCDate(start.getUTCDate() - (range - 1))
  return utcDay(start)
}

export function parseTrafficRange(value: string | string[] | undefined): TrafficRange {
  const raw = Array.isArray(value) ? value[0] : value
  const parsed = Number(raw)
  if (parsed === 7 || parsed === 30 || parsed === 90) return parsed
  return 30
}

export function normalizeCountry(raw: string | null | undefined): string {
  const code = (raw ?? "").trim().toUpperCase()
  if (/^[A-Z]{2}$/.test(code) || /^[A-Z][0-9]$/.test(code)) return code
  return "XX"
}

export function countryLabel(code: string): string {
  const special = SPECIAL_COUNTRIES[code]
  if (special) return special
  try {
    return REGION_NAMES.of(code) ?? code
  } catch {
    return code
  }
}

export function countryFlag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return ""
  const points = [...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65)
  return String.fromCodePoint(...points)
}

export function normalizeTrafficPath(input: unknown): string | null {
  if (typeof input !== "string") return null
  const trimmed = input.trim()
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null
  if (trimmed.includes("\\") || trimmed.includes("\0") || trimmed.includes("..")) {
    return null
  }

  const pathOnly = trimmed.split(/[?#]/)[0] ?? ""
  let path = pathOnly.replace(/\/{2,}/g, "/")
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1)
  if (!path.startsWith("/")) return null
  if (path.length > 120) path = path.slice(0, 120)
  if (path === "/traffic" || path.startsWith("/traffic/")) return null
  if (path === "/api" || path.startsWith("/api/")) return null
  if (/\.[a-z0-9]{1,8}$/i.test(path)) return null
  return path
}

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false
  return BOT_USER_AGENT.test(userAgent)
}

export function isSameSiteTrafficRequest(request: {
  url: string
  headers: Headers
}): boolean {
  let host: string
  try {
    host = new URL(request.url).host
  } catch {
    return false
  }

  const site = request.headers.get("sec-fetch-site")
  if (site && site !== "same-origin") return false

  const origin = request.headers.get("origin")
  if (origin) {
    try {
      return new URL(origin).host === host
    } catch {
      return false
    }
  }

  return site === "same-origin"
}

export function hitToken(path: string, now: number, windowMs = TRAFFIC_HIT_WINDOW_MS): string {
  return `${Math.floor(now / windowMs)}.${encodeURIComponent(path)}`
}

export function decideTrafficWrite(input: {
  sameSite: boolean
  userAgent: string | null
  path: unknown
  hitCookie: string | undefined
  country: string | null
  now: number
}): TrafficDecision {
  if (!input.sameSite || isBotUserAgent(input.userAgent)) {
    return { action: "ignore" }
  }

  const path = normalizeTrafficPath(input.path)
  if (!path) return { action: "ignore" }

  const hit = hitToken(path, input.now)
  if (input.hitCookie === hit) return { action: "ignore" }

  return {
    action: "record",
    day: utcDay(new Date(input.now)),
    country: normalizeCountry(input.country),
    path,
    hit,
  }
}

export function visitorId(raw: string | undefined): string | null {
  const value = raw?.trim().toLowerCase() ?? ""
  return VISITOR_ID.test(value) ? value : null
}

export function createVisitorId(): string {
  return crypto.randomUUID()
}

export async function hashVisitorId(id: string): Promise<string> {
  return sha256(`pasttime-visitor:v1:${id}`)
}

export async function digestKey(key: string): Promise<string> {
  return sha256(`pasttime-traffic:v1:${key}`)
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

export function hexTokensMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}
