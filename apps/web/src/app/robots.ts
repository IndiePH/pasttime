import type { MetadataRoute } from "next"

import {
  AI_CRAWLER_AGENTS,
  AI_ROBOT_DISALLOW,
  PRIVATE_ROBOT_PATHS,
  SITE_URL,
} from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_ROBOT_PATHS],
      },
      {
        userAgent: [...AI_CRAWLER_AGENTS],
        allow: "/",
        disallow: [...AI_ROBOT_DISALLOW],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    // Hostname only (Yandex-style Host); Google ignores this but some tools expect it.
    host: "pasttime.xyz",
  }
}
