import type { Metadata } from "next"

import { StaticPage } from "@/components/shared/static-page"

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Pasttime handles your data and privacy.",
}

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      description="How we collect, use, and protect information when you use Pasttime."
      sections={[
        {
          title: "Overview",
          content:
            "High-level summary of our privacy practices. Full legal policy text will replace this placeholder.",
        },
        {
          title: "Information we collect",
          content:
            "Types of data collected — usage, device, optional account data. Specific categories to be documented here.",
        },
        {
          title: "How we use information",
          content:
            "Purposes for processing data: service delivery, improvements, analytics. Final policy will detail each use case.",
        },
        {
          title: "Your rights",
          content:
            "Access, deletion, and opt-out options. Placeholder for jurisdiction-specific rights and how to exercise them.",
        },
        {
          title: "Contact",
          content:
            "Privacy-related inquiries contact details. Will link to the contact page or a dedicated privacy email.",
        },
      ]}
    />
  )
}
