"use client"

import Link from "next/link"

import { SiteShell } from "@/components/shared"
import { Button } from "@/components/ui/button"

type GameErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GameError({ error, reset }: GameErrorProps) {
  return (
    <SiteShell>
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-muted-foreground">
          We couldn&apos;t load this game. Please try again.
        </p>
        {process.env.NODE_ENV === "development" ? (
          <p className="mt-4 max-w-full truncate text-xs text-muted-foreground">
            {error.message}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to catalog</Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  )
}
