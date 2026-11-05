/**
 * JSON-LD for crawlers. Uses application/ld+json (not executable JS).
 * Documented Next.js pattern: https://nextjs.org/docs/app/guides/json-ld
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}
