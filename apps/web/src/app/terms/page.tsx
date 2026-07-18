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
          content: [
            "These Terms of Service (“Terms”) govern your access to and use of Pasttime websites, games, and related services (the “Service”). By using the Service, you agree to these Terms and our Privacy Policy.",
            "If you do not agree, do not use the Service.",
          ],
        },
        {
          title: "The Service",
          content: [
            "Pasttime provides free browser-based games and puzzles. Features may change, and availability is not guaranteed. We may add, modify, or discontinue games or features at any time.",
            "Some experiences may use local storage on your device. Multiplayer or room features, when available, may depend on a separate server connection and may be interrupted or unavailable.",
          ],
        },
        {
          title: "Eligibility and acceptable use",
          content: [
            "You must be able to form a binding agreement under the laws of your jurisdiction. If you are under the age of digital consent in your region, you may use the Service only with permission from a parent or guardian.",
            "You agree not to misuse the Service, including by attempting to disrupt servers or other players; cheating, abusing multiplayer features, or interfering with fair play; scraping, reverse engineering, or copying the Service except as allowed by law; using the Service for unlawful, harmful, or fraudulent purposes; or attempting to interfere with advertising, analytics, or security systems.",
          ],
        },
        {
          title: "Accounts and local data",
          content:
            "Most gameplay does not require an account. Progress and preferences stored in your browser may be lost if you clear site data, switch devices, or use private browsing. You are responsible for backing up anything important to you; we are not obligated to restore local data.",
        },
        {
          title: "Intellectual property",
          content: [
            "Pasttime, its branding, site design, game implementations, puzzles, and related materials are owned by Pasttime or its licensors and are protected by intellectual property laws. You receive a limited, non-exclusive, non-transferable license to use the Service for personal, non-commercial play.",
            "You may not copy, redistribute, or create derivative works from our games or site content except as expressly permitted by us or by applicable law. Feedback you send may be used by us without obligation to you.",
          ],
        },
        {
          title: "Advertising and third-party services",
          content: [
            "The Service may display advertisements and use third-party services such as Google AdSense. Those parties may have their own terms and privacy practices. Your interactions with ads and third-party sites are between you and those parties.",
            "We are not responsible for third-party content, offers, or websites linked from ads or elsewhere on the Service.",
          ],
        },
        {
          title: "Disclaimer of warranties",
          content:
            "The Service is provided “as is” and “as available” without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components.",
        },
        {
          title: "Limitation of liability",
          content: [
            "To the fullest extent permitted by law, Pasttime and its operators will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of data, profits, or goodwill, arising from your use of the Service.",
            "To the fullest extent permitted by law, our total liability for any claim arising out of or relating to the Service will not exceed the greater of (a) the amount you paid us for the Service in the twelve months before the claim (if any) or (b) USD $50. Some jurisdictions do not allow certain limitations; in those cases, our liability is limited to the maximum extent permitted.",
          ],
        },
        {
          title: "Indemnity",
          content:
            "You agree to defend and indemnify Pasttime and its operators against claims, damages, losses, and expenses (including reasonable legal fees) arising from your misuse of the Service or your violation of these Terms.",
        },
        {
          title: "Changes to these terms",
          content:
            "We may update these Terms from time to time. When we do, we will post the revised Terms on this page. Continued use of the Service after an update means you accept the revised Terms. If you do not agree, stop using the Service.",
        },
        {
          title: "Contact",
          content:
            "Questions about these Terms: use the Feedback button in the site footer, or email feedback@pasttime.xyz.",
        },
      ]}
    />
  )
}
