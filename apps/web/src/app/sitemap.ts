import type { MetadataRoute } from "next"

import { GAME_REGISTRY, gamePath } from "@pasttime/domain/games"

import { SITE_URL } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/games`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/word-guess/policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  const availableRoutes: MetadataRoute.Sitemap = GAME_REGISTRY.filter(
    (game) => game.status === "available",
  ).map((game) => ({
    url: `${SITE_URL}${gamePath(game.id)}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const comingSoonRoutes: MetadataRoute.Sitemap = GAME_REGISTRY.filter(
    (game) => game.status === "coming_soon",
  ).map((game) => ({
    url: `${SITE_URL}${gamePath(game.id)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.4,
  }))

  return [...staticRoutes, ...availableRoutes, ...comingSoonRoutes]
}
