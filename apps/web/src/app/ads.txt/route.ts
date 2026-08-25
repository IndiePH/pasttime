import { buildAdsTxt } from "@/lib/adsense"

export function GET() {
  return new Response(buildAdsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
