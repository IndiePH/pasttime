import { StaticPage } from "@/components/shared/static-page"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Privacy",
  description:
    "How Pasttime collects, uses, and shares information. Website games do not show ads; the Word Guess Android app uses Unity LevelPlay.",
  path: "/privacy",
})

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      description="How we collect, use, and protect information when you use Pasttime."
      sections={[
        {
          title: "Overview",
          content: [
            "Pasttime (“we”, “us”) provides free browser games and puzzles at pasttime.xyz and related subdomains. This Privacy Policy explains what information is collected when you use the site, how it is used, and the choices you have.",
            "By using Pasttime, you agree to this Privacy Policy. If you do not agree, please do not use the site.",
          ],
        },
        {
          title: "Information we collect",
          content: [
            "We do not require an account to play. Most gameplay data stays on your device.",
            "Local device storage: We store preferences and game progress in your browser’s local storage (for example theme settings, in-progress games, and local stats). This data stays on your device unless you clear site data or your browser removes it.",
            "Feedback you send: If you use the Feedback button, we receive the message you submit, the category you choose, and any email address you optionally provide. We use this only to respond to feedback and improve the service.",
            "Technical and usage data: Like most websites, our hosting and infrastructure providers may process standard request data such as IP address, browser type, device type, referring URL, and timestamps when you load pages. We use this to operate, secure, and troubleshoot the site.",
          ],
        },
        {
          title: "Advertising",
          content: (
            <div className="space-y-3">
              <p>
                The Pasttime website does not show display ads and does not use
                Google AdSense.
              </p>
              <p>
                The Word Guess Android app shows ads through Unity LevelPlay so
                that app can stay free. LevelPlay and its partners may collect
                device and advertising identifiers as described in the{" "}
                <a
                  href="/word-guess/policy"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Word Guess privacy policy
                </a>
                .
              </p>
            </div>
          ),
        },
        {
          title: "How we use information",
          content: [
            "We use information to provide and improve Pasttime, remember your preferences and progress on your device, respond to feedback, maintain security, and comply with legal obligations.",
            "We do not sell your personal information. We do not use gameplay content you enter into puzzles as a profile to market unrelated products to you.",
          ],
        },
        {
          title: "Sharing of information",
          content: [
            "We share information only as needed to operate the website: with infrastructure and email providers that process feedback or host the site, and when required by law or to protect the rights, safety, or integrity of Pasttime and its users.",
            "The Word Guess Android app shares advertising data with Unity LevelPlay as described in that app’s privacy policy. Website service providers are expected to use shared information only to perform services for us.",
          ],
        },
        {
          title: "Cookies and similar technologies",
          content: [
            "The website uses local storage for preferences and game progress. Hosting providers may process standard request logs. This site does not set advertising cookies.",
            "You can block or delete cookies and clear local storage through your browser. Doing so may reset preferences and progress. Advertising technologies in the Word Guess Android app are covered in that app’s privacy policy.",
          ],
        },
        {
          title: "Children’s privacy",
          content: [
            "Pasttime is a general-audience game hub and is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided personal information to us, contact us and we will take reasonable steps to delete it.",
            "Parents and guardians should supervise children’s use of the site and of the Word Guess Android app, which displays advertising.",
          ],
        },
        {
          title: "Your choices and rights",
          content: [
            "You can clear local storage and cookies in your browser at any time. You can decline to provide an email address when sending feedback. Where applicable law gives you rights to access, correct, delete, or restrict processing of personal information, or to object to certain processing, contact us and we will respond as required.",
          ],
        },
        {
          title: "Data retention",
          content:
            "Local storage data remains on your device until you clear it or your browser removes it. Feedback messages and optional contact emails are retained only as long as needed to handle the request and improve the product, unless a longer period is required by law. Unity LevelPlay retains Word Guess app advertising data according to its own policy, linked from the Word Guess privacy policy.",
        },
        {
          title: "International processing",
          content:
            "Pasttime may be hosted and processed in countries other than where you live. When we transfer information, we take steps appropriate to the nature of the transfer and applicable law. Unity LevelPlay may process Word Guess app advertising data in multiple countries as described in its policy.",
        },
        {
          title: "Changes to this policy",
          content:
            "We may update this Privacy Policy from time to time. When we do, we will post the revised policy on this page. Continued use of Pasttime after an update means you accept the revised policy.",
        },
        {
          title: "Contact",
          content: [
            "For privacy questions or requests, use the Feedback button in the site footer and choose General Feedback, or email feedback@pasttime.xyz.",
            "Please include enough detail for us to understand and respond to your request.",
          ],
        },
      ]}
    />
  )
}
