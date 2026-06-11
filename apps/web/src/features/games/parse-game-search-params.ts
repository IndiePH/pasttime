import { getGameModule } from "@/features/games/module-registry"

type SearchParamsInput = Promise<
  Record<string, string | string[] | undefined>
>

/** Align nuqs SSR with the request URL so client hooks hydrate cleanly. */
export async function parseGameSearchParams(
  slug: string,
  searchParams: SearchParamsInput,
) {
  const gameModule = getGameModule(slug)
  if (gameModule?.parseSearchParams) {
    await gameModule.parseSearchParams(searchParams)
  }
}
