import { SiteShell } from "@/components/shared"
import { cn } from "@/lib/utils"

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-muted", className)} />
}

export default function Loading() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
        <div className="space-y-4">
          <SkeletonBlock className="mx-auto h-10 max-w-md sm:mx-0" />
          <SkeletonBlock className="mx-auto h-6 max-w-lg sm:mx-0" />
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-6 w-24 rounded-full" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SkeletonBlock className="h-5 w-20" />
          <SkeletonBlock className="h-7 w-52" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-36" />
          ))}
        </div>
      </div>
    </SiteShell>
  )
}
