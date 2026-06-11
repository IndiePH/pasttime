import { TrustBadges } from "@/components/shared"

export function HubHero() {
  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Play more. Think sharper.
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Daily puzzles and party-style games — jump in instantly, no downloads.
        </p>
        <TrustBadges className="mt-6" />
      </div>
    </section>
  )
}
