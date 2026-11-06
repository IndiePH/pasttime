import { buildAppAdsTxt } from "@/lib/app-ads"

/**
 * LevelPlay app-ads.txt (Word Guess on Android). Must be served at the domain apex:
 * https://pasttime.xyz/app-ads.txt
 * Play Console store listing Website should use pasttime.xyz (path is stripped).
 * Website display-ad sellers are served separately at /ads.txt.
 */
export function GET() {
  return new Response(buildAppAdsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
