import type { Metadata } from "next"

import { HubPage } from "@/features/hub"
import { hubSearchParamsCache } from "@/features/hub/search-params"

export const metadata: Metadata = {
  title: "Games — Pasttime",
  description:
    "Daily puzzles and games in one hub. Instant play, no download required.",
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: PageProps) {
  await hubSearchParamsCache.parse(searchParams)
  return <HubPage />
}
