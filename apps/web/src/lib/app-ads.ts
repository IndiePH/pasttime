import { UNITY_APP_ADS_LINES } from "./app-ads-unity-list"

/**
 * Mobile app-ads.txt for Word Guess (Unity LevelPlay).
 * Served at the domain apex: https://pasttime.xyz/app-ads.txt
 * Play Console Website is pasttime.xyz — the crawler strips any path.
 *
 * The website does not sell display ads, so there is no /ads.txt.
 * Do not add a website seller line here.
 *
 * Body is Unity dashboard "Show full list" plus ownerdomain, ironSource DIRECT
 * (public Publisher ID), and a unity3d.com mirror of the Unity Ads DIRECT line.
 */
export const ADS_OWNER_DOMAIN = "pasttime.xyz"
export const APP_ADS_OWNER_DOMAIN = ADS_OWNER_DOMAIN

/** ironSource / LevelPlay certification authority ID (constant). */
export const LEVELPLAY_IRONSOURCE_TAG = "79929e88b2ba73bc"

/** Public LevelPlay Publisher ID (Account → API). Not the app key. */
export const LEVELPLAY_PUBLISHER_ID = "644195"

/** Unity Ads certification authority ID (constant). */
export const UNITY_ADS_TAG = "96cabb5fbdde37a7"

export function getLevelPlayPublisherId(): string | null {
  const value = process.env.NEXT_PUBLIC_LEVELPLAY_PUBLISHER_ID?.trim()
  return value || LEVELPLAY_PUBLISHER_ID
}

function parsedUnityLines(): string[] {
  return UNITY_APP_ADS_LINES.split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

export function buildAppAdsTxt(options?: {
  publisherId?: string | null
}): string {
  const publisherId =
    options && "publisherId" in options
      ? options.publisherId
      : getLevelPlayPublisherId()

  const unityLines = parsedUnityLines()
  const lines = [`ownerdomain=${ADS_OWNER_DOMAIN}`]

  if (
    publisherId &&
    !unityLines.some((line) => line.startsWith("ironsrc.com,"))
  ) {
    lines.push(
      `ironsrc.com, ${publisherId}, DIRECT, ${LEVELPLAY_IRONSOURCE_TAG}`,
    )
  }

  for (const line of unityLines) {
    lines.push(line)
    if (line.startsWith("unity.com,")) {
      const unity3d = line.replace(/^unity\.com,/, "unity3d.com,")
      if (!unityLines.some((existing) => existing === unity3d)) {
        lines.push(unity3d)
      }
    }
  }

  return `${lines.join("\n")}\n`
}
