import { getCloudflareContext } from "@opennextjs/cloudflare"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { recordTrafficHit } from "@/lib/traffic/store"
import {
  createVisitorId,
  decideTrafficWrite,
  hashVisitorId,
  isSameSiteTrafficRequest,
  TRAFFIC_HIT_COOKIE,
  TRAFFIC_HIT_WINDOW_MS,
  TRAFFIC_SEEN_COOKIE,
  TRAFFIC_VISITOR_COOKIE,
  TRAFFIC_VISITOR_MAX_AGE_SECONDS,
  visitorId,
} from "@/lib/traffic/traffic"

export const dynamic = "force-dynamic"

function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

async function readCountry(request: Request): Promise<string | null> {
  try {
    const { cf } = await getCloudflareContext({ async: true })
    if (typeof cf?.country === "string" && cf.country) return cf.country
  } catch {
    // `next dev` has no Cloudflare request context.
  }
  return request.headers.get("cf-ipcountry")
}

export async function POST(request: Request) {
  if (!isSameSiteTrafficRequest(request)) return noContent()

  let path: unknown
  try {
    const raw = await request.text()
    if (raw.length > 1000) return noContent()
    path = (JSON.parse(raw) as { path?: unknown }).path
  } catch {
    return noContent()
  }

  const cookieStore = await cookies()
  const decision = decideTrafficWrite({
    sameSite: true,
    userAgent: request.headers.get("user-agent"),
    path,
    hitCookie: cookieStore.get(TRAFFIC_HIT_COOKIE)?.value,
    country: await readCountry(request),
    now: Date.now(),
  })

  if (decision.action === "ignore") return noContent()

  const visitor =
    visitorId(cookieStore.get(TRAFFIC_VISITOR_COOKIE)?.value) ?? createVisitorId()

  try {
    const stored = await recordTrafficHit({
      day: decision.day,
      country: decision.country,
      path: decision.path,
      visitorHash: await hashVisitorId(visitor),
    })
    if (!stored) return noContent()
  } catch (error) {
    console.warn("traffic: count was not stored", error)
    return noContent()
  }

  const response = noContent()
  const secure = process.env.NODE_ENV === "production"
  response.cookies.set(TRAFFIC_VISITOR_COOKIE, visitor, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: TRAFFIC_VISITOR_MAX_AGE_SECONDS,
  })
  response.cookies.set(TRAFFIC_SEEN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  })
  response.cookies.set(TRAFFIC_HIT_COOKIE, decision.hit, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: Math.ceil(TRAFFIC_HIT_WINDOW_MS / 1000),
  })
  return response
}
