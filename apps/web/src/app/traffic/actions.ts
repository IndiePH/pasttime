"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  digestKey,
  hexTokensMatch,
  TRAFFIC_AUTH_COOKIE,
  viewKey,
} from "@/lib/traffic/traffic"

function authCookieOptions(maxAge = 60 * 60 * 24 * 30) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/traffic",
    maxAge,
  }
}

export async function unlockTraffic(formData: FormData) {
  const expected = viewKey()
  if (!expected) redirect("/traffic?status=unconfigured")

  const submitted = String(formData.get("key") ?? "")
  const expectedDigest = await digestKey(expected)
  const submittedDigest = await digestKey(submitted)
  if (!hexTokensMatch(submittedDigest, expectedDigest)) {
    redirect("/traffic?status=denied")
  }

  const cookieStore = await cookies()
  cookieStore.set(TRAFFIC_AUTH_COOKIE, expectedDigest, authCookieOptions())
  redirect("/traffic")
}

export async function lockTraffic() {
  const cookieStore = await cookies()
  cookieStore.set(TRAFFIC_AUTH_COOKIE, "", authCookieOptions(0))
  redirect("/traffic")
}
