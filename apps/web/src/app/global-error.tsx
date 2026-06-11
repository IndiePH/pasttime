"use client"

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">
            An unexpected error occurred. You can try again.
          </p>
          <button
            type="button"
            className="rounded-lg bg-foreground px-4 py-2 text-sm text-background"
            onClick={() => reset()}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
