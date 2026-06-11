import { PlatformLink } from "@/platform/navigation"

import { SiteShell } from "@/components/shared"
import { Button } from "@/components/ui/button"

export default function GameNotFound() {
  return (
    <SiteShell>
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Game not found</h1>
        <p className="mt-2 text-muted-foreground">
          That game isn&apos;t in our catalog yet.
        </p>
        <Button className="mt-8" asChild>
          <PlatformLink href="/">Back to catalog</PlatformLink>
        </Button>
      </div>
    </SiteShell>
  )
}
