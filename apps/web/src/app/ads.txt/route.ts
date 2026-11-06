const ADS_TXT = "ownerdomain=pasttime.xyz\nadsterra.com, htfw-3915, DIRECT\n"

/**
 * Website display-ad seller file for Adsterra.
 * This is separate from /app-ads.txt, which belongs to the Android app.
 */
export function GET() {
  return new Response(ADS_TXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
