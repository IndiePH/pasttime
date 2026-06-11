import type { Metadata } from "next"

import { StaticPage } from "@/components/shared/static-page"

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Pasttime team.",
}

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact"
      description="Questions, feedback, or partnership inquiries — we'd like to hear from you."
      sections={[
        {
          title: "Get in touch",
          content:
            "Primary contact method will go here — email address or contact form. Placeholder until the channel is confirmed.",
        },
        {
          title: "Response time",
          content:
            "Expected turnaround for replies. Final copy will set clear expectations for support and general inquiries.",
        },
        {
          title: "Other ways to reach us",
          content:
            "Optional social or community links. Section reserved for any additional channels we add later.",
        },
      ]}
    />
  )
}
