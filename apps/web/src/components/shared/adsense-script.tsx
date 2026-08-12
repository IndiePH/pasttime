import { getAdsenseClient } from "@/lib/adsense"

/**
 * Loads the AdSense library with a plain script tag.
 * Prefer this over `next/script`: Next injects `data-nscript`, which AdSense
 * logs as "head tag doesn't support data-nscript attribute" (noise only).
 */
export function AdSenseScript() {
  const client = getAdsenseClient()
  if (!client) return null

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
    />
  )
}
