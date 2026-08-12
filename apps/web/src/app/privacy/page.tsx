import { StaticPage } from "@/components/shared/static-page"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Privacy",
  description:
    "How Pasttime collects, uses, and shares information, including Google AdSense advertising.",
  path: "/privacy",
})

const googlePartnerSitesUrl =
  "https://policies.google.com/technologies/partner-sites"

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
          title: "Advertising and Google AdSense",
          content: (
            <div className="space-y-3">
              <p>
                Pasttime uses Google AdSense to show ads and help keep the games
                free. Google and its partners may use cookies, web beacons, IP
                addresses, or similar technologies to serve ads, measure how ads
                perform, and (where allowed) personalize advertising based on
                your browsing activity.
              </p>
              <p>
                Third parties, including Google, may be placing and reading
                cookies on your browser, or using web beacons or IP addresses to
                collect information as a result of ad serving on this site.
              </p>
              <p>
                To learn how Google uses data when you visit sites or apps that
                use Google advertising services, see{" "}
                <a
                  href={googlePartnerSitesUrl}
                  className="underline underline-offset-4 hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  How Google uses data when you use our partners’ sites or apps
                </a>
                .
              </p>
              <p>
                You can manage ad personalization and cookie preferences through
                your browser settings, Google’s ad settings, and any consent
                choices presented on this site (including Google’s consent
                message where required, such as in the EEA, UK, and Switzerland).
              </p>
            </div>
          ),
        },
        {
          title: "How we use information",
          content: [
            "We use information to provide and improve Pasttime, remember your preferences and progress on your device, show advertising, respond to feedback, maintain security, and comply with legal obligations.",
            "We do not sell your personal information. We do not use gameplay content you enter into puzzles as a profile to market unrelated products to you.",
          ],
        },
        {
          title: "Sharing of information",
          content: [
            "We share information only as needed to operate the service: with infrastructure and email providers that process feedback or host the site; with Google and advertising partners for ad serving as described above; and when required by law or to protect the rights, safety, or integrity of Pasttime and its users.",
            "Service providers are expected to use shared information only to perform services for us and not for their own unrelated purposes, except where they act as independent controllers (for example Google with respect to advertising technologies).",
          ],
        },
        {
          title: "Cookies and similar technologies",
          content: [
            "We and our partners may use cookies, local storage, pixels, and similar technologies for essential site functions, preferences, analytics related to operating the site, and advertising.",
            "You can block or delete cookies and clear local storage through your browser. Doing so may reset preferences, progress, or ad consent choices.",
          ],
        },
        {
          title: "Children’s privacy",
          content: [
            "Pasttime is a general-audience game hub and is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided personal information to us, contact us and we will take reasonable steps to delete it.",
            "Parents and guardians should supervise children’s use of websites that display advertising.",
          ],
        },
        {
          title: "Your choices and rights",
          content: [
            "You can clear local storage and cookies in your browser at any time. You can decline to provide an email address when sending feedback. Where applicable law gives you rights to access, correct, delete, or restrict processing of personal information, or to object to certain processing, contact us and we will respond as required.",
            "If you are in a region that requires consent for personalized ads, use the consent options shown on the site. You may also visit Google’s ad settings to control personalized advertising associated with your Google Account.",
          ],
        },
        {
          title: "Data retention",
          content:
            "Local storage data remains on your device until you clear it or your browser removes it. Feedback messages and optional contact emails are retained only as long as needed to handle the request and improve the product, unless a longer period is required by law. Advertising partners retain data according to their own policies.",
        },
        {
          title: "International processing",
          content:
            "Pasttime may be hosted and processed in countries other than where you live. When we transfer information, we take steps appropriate to the nature of the transfer and applicable law. Google and other partners may process advertising data in multiple countries as described in their policies.",
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
