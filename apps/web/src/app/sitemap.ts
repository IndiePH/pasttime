import type { MetadataRoute } from "next"

import { GAME_REGISTRY, gamePath } from "@pasttime/domain/games"

import { SITE_CONTENT_UPDATED, SITE_URL } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  // Stable lastmod. `new Date()` on every request makes every URL look freshly edited.
  const lastModified = new Date(SITE_CONTENT_UPDATED)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/word-guess/policy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  const availableRoutes: MetadataRoute.Sitemap = GAME_REGISTRY.filter(
    (game) => game.status === "available",
  ).map((game) => ({
    url: `${SITE_URL}${gamePath(game.id)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const comingSoonRoutes: MetadataRoute.Sitemap = GAME_REGISTRY.filter(
    (game) => game.status === "coming_soon",
  ).map((game) => ({
    url: `${SITE_URL}${gamePath(game.id)}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.4,
  }))

  return [...staticRoutes, ...availableRoutes, ...comingSoonRoutes]
}
