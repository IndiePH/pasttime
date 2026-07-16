import { getAdsenseClient, toAdsTxtPublisherId } from "@/lib/adsense"

export function GET() {
  const client = getAdsenseClient()
  if (!client) {
    return new Response("# AdSense not configured\n", {
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
