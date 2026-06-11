import type { Metadata } from "next"

import { StaticPage } from "@/components/shared/static-page"

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Pasttime — daily puzzles and games in one hub.",
}

export default function AboutPage() {
  return (
    <StaticPage
      title="About Pasttime"
      description="Who we are and why we built a home for daily puzzles and party-style games."
      sections={[
        {
          title: "What we are",
          content:
            "Brief overview of Pasttime as a free, instant-play game hub. Final copy will describe the product in plain language.",
        },
        {
          title: "Our mission",
          content:
            "Mission statement and values — play more, think sharper. Placeholder for the guiding principles behind the platform.",
        },
        {
          title: "What we offer",
          content:
            "Summary of game types, daily puzzles, and the no-download experience. Content will expand as the catalog grows.",
        },
      ]}
    />
  )
}
