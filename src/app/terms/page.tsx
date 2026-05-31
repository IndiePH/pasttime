import type { Metadata } from "next"

import { StaticPage } from "@/components/shared/static-page"

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of service for using Pasttime.",
}

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms of Service"
      description="Rules and conditions for using Pasttime."
      sections={[
        {
          title: "Acceptance of terms",
          content:
            "Agreement to these terms by using the service. Full legal language will be added in a later pass.",
        },
        {
          title: "Use of the service",
          content:
            "Permitted and prohibited uses — fair play, no abuse, age requirements. Detailed rules to follow.",
        },
        {
          title: "Intellectual property",
          content:
            "Ownership of games, branding, and user-generated content. Placeholder for IP and licensing terms.",
        },
        {
          title: "Limitations of liability",
          content:
            "Disclaimers and liability caps as required. Legal review will produce the final wording.",
        },
        {
          title: "Changes to these terms",
          content:
            "How we notify users of updates and when revised terms take effect.",
        },
      ]}
    />
  )
}
