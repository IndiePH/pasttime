import { HubPage } from "@/features/hub"
import { hubSearchParamsCache } from "@/features/hub/search-params"
import { pageMetadata, SITE_DESCRIPTION } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Pasttime | Play more. Think sharper.",
  description: SITE_DESCRIPTION,
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
