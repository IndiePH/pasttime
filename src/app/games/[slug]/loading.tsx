import { SiteShell } from "@/components/shared"

export default function GameLoading() {
  return (
    <SiteShell>
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
        <div className="size-20 animate-pulse rounded-2xl bg-muted" />
        <div className="mt-6 h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="mt-8 h-8 w-28 animate-pulse rounded-full bg-muted" />
      </div>
    </SiteShell>
  )
}
