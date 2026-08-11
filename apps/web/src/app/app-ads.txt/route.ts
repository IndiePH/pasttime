import { getAdsenseClient, toAdsTxtPublisherId } from "@/lib/adsense"

/**
 * AdMob app-ads.txt (mobile apps). Same publisher ID as AdSense ads.txt.
 * Must be served at the domain apex: https://pasttime.xyz/app-ads.txt
 * Play Console store listing Website should use pasttime.xyz (path is stripped by the crawler).
 */
export function GET() {
  const client = getAdsenseClient()
  if (!client) {
    return new Response("# AdMob / AdSense not configured\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }

  const pub = toAdsTxtPublisherId(client)
  const body = `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
