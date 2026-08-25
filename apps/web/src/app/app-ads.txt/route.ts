import { buildAppAdsTxt } from "@/lib/app-ads"

/**
 * LevelPlay app-ads.txt (mobile apps). Must be served at the domain apex:
 * https://pasttime.xyz/app-ads.txt
 * Play Console store listing Website should use pasttime.xyz (path is stripped).
 * Website AdSense remains on /ads.txt — do not mix the two files.
 */
export function GET() {
  return new Response(buildAppAdsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
