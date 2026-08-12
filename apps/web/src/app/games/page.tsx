import { HubPage } from "@/features/hub"
import { hubSearchParamsCache } from "@/features/hub/search-params"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Games",
  description:
    "Browse free Crossword, Word Guess, Sudoku, and Solitaire on Pasttime. Instant play in the browser, no download required.",
  path: "/games",
})

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: PageProps) {
  await hubSearchParamsCache.parse(searchParams)
  return <HubPage />
}
