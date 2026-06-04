import { solitaireSearchParamsCache } from "@/features/games/solitaire/search-params"
import { wordGuessSearchParamsCache } from "@/features/games/word-guess/search-params"

type SearchParamsInput = Promise<
  Record<string, string | string[] | undefined>
>

/** Align nuqs SSR with the request URL so client hooks hydrate cleanly. */
export async function parseGameSearchParams(
  slug: string,
  searchParams: SearchParamsInput,
) {
  if (slug === "word-guess") {
    await wordGuessSearchParamsCache.parse(searchParams)
    return
  }

  if (slug === "solitaire") {
    await solitaireSearchParamsCache.parse(searchParams)
  }
}
