import Script from "next/script"

import { getAdsenseClient } from "@/lib/adsense"

export function AdSenseScript() {
  const client = getAdsenseClient()
  if (!client) return null

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
