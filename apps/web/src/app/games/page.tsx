import { HubPage } from "@/features/hub"
import { hubSearchParamsCache } from "@/features/hub/search-params"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Games",
  description:
    "Browse free Crossword, Word Guess, Sudoku, Solitaire, Reversi, Type Rush, and Type Shield on Pasttime. Instant play in the browser, no download required.",
  path: "/games",
  // Same hub as the apex. Keep this URL working; index the homepage.
  canonicalPath: "/",
})

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: PageProps) {
  await hubSearchParamsCache.parse(searchParams)
  return <HubPage />
}
