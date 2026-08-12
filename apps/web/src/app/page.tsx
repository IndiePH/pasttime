import { HubPage } from "@/features/hub"
import { hubSearchParamsCache } from "@/features/hub/search-params"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Pasttime — Play more. Think sharper.",
  description:
    "Free daily puzzles and classic games in one hub — Crossword, Word Guess, Sudoku, and Solitaire. Instant play, no download required.",
  path: "/",
  absoluteTitle: true,
})

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: PageProps) {
  await hubSearchParamsCache.parse(searchParams)
  return <HubPage />
}
