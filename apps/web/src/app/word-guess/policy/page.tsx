import { StaticPage } from "@/components/shared/static-page"
import { pageMetadata } from "@/lib/seo"

export const metadata = pageMetadata({
  title: "Word Guess Privacy Policy",
  description:
    "Privacy policy for the Word Guess Android app by Vorith Studio, including AdMob, Play Games, and Firebase.",
  path: "/word-guess/policy",
})

const linkClass = "underline underline-offset-4 hover:text-foreground"

export default function WordGuessPolicyPage() {
  return (
    <StaticPage
      title="Word Guess Privacy Policy"
      description="How the Word Guess Android app collects, uses, and protects information."
      lastUpdated="2026-07-14"
      sections={[
        {
          title: "Overview",
          content: [
            "Word Guess (“the App”) is developed by Vorith Studio (“we,” “us,” or “our”). This Privacy Policy explains what information the App collects, how it is used, and the choices you have.",
            "By installing or using the App, you agree to the terms of this Privacy Policy.",
          ],
        },
        {
          title: "Information you provide",
          content: [
            "The App is fully playable without creating an account or signing in. If you choose to sign in via Google Play Games (Android) to enable cloud sync and global leaderboards, we may collect: display name, account email address (when provided by Play Games), profile photo URL (if available), and a player identifier used for leaderboard ranking and cloud sync.",
            "If you do not sign in, the App stores your game history and statistics only on your device. We do not transmit your gameplay data to any server until you sign in.",
          ],
        },
        {
          title: "Gameplay and statistics data",
          content: [
            "When you play, the App generates and stores game results (wins, losses, guesses used, word length, mode, timestamp), aggregate statistics (win rate, streaks, guess distribution), and settings preferences.",
            "If you are signed in, this gameplay data is synced to Firebase Firestore so it is available across your devices. If you are not signed in, this data remains only on your device.",
          ],
        },
        {
          title: "Advertising (Google AdMob)",
          content: (
            <div className="space-y-3">
              <p>
                The App displays ads served by Google AdMob. AdMob may collect,
                on its own behalf: Advertising ID, device information, IP
                address, ad interaction events, and app-identifier information
                (AdMob app/unit IDs).
              </p>
              <p>
                AdMob&apos;s data collection is governed by{" "}
                <a
                  href="https://policies.google.com/privacy"
                  className={linkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google&apos;s Privacy Policy
                </a>{" "}
                and{" "}
                <a
                  href="https://support.google.com/admob/answer/6128543"
                  className={linkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  AdMob privacy information
                </a>
                . You may reset your Advertising ID or opt out of personalized
                advertising in your device&apos;s Google settings.
              </p>
            </div>
          ),
        },
        {
          title: "How we use information",
          content: [
            "We use this information to operate the App, provide cloud features when you are signed in, display advertising via AdMob, and diagnose issues.",
            "We do not sell your personal information to third parties. We do not use your gameplay data for advertising profiling or cross-app tracking.",
          ],
        },
        {
          title: "Third-party services",
          content: (
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                Google AdMob (advertising) —{" "}
                <a
                  href="https://support.google.com/admob/answer/6128543"
                  className={linkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  privacy info
                </a>
              </li>
              <li>
                Google Play Games Services (optional Android auth) —{" "}
                <a
                  href="https://policies.google.com/privacy"
                  className={linkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Privacy Policy
                </a>
              </li>
              <li>
                Firebase Authentication, Firestore, and Remote Config —{" "}
                <a
                  href="https://firebase.google.com/support/privacy"
                  className={linkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Firebase privacy
                </a>
              </li>
              <li>
                Google Play Billing and Play Services —{" "}
                <a
                  href="https://policies.google.com/privacy"
                  className={linkClass}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Privacy Policy
                </a>
              </li>
            </ul>
          ),
        },
        {
          title: "Children's privacy",
          content: [
            "The App is not directed to children under the age of 13 (or such higher age as required by applicable law). We do not knowingly collect personal information from children under 13.",
            "Because the App integrates Google AdMob, we configure ad requests in line with Google Play's Families Policy and do not knowingly allow children under 13 to create accounts or sign in. Contact us if you believe we inadvertently collected information from a child under 13.",
          ],
        },
        {
          title: "Data storage, choices, and contact",
          content: (
            <div className="space-y-3">
              <p>
                On-device data uses standard Android storage until you uninstall.
                Cloud data (if signed in) is stored in Firebase Firestore. You
                may sign out in Settings, purchase Pro to remove interstitial
                ads, opt out of ads personalization in Google settings, or
                contact us to request access or deletion of cloud data.
              </p>
              <p>
                Cloud features may involve international transfers to countries
                where Google operates Firebase. We may update this policy and
                revise the last-updated date above.
              </p>
              <p>
                <strong className="font-medium text-foreground">
                  Vorith Studio
                </strong>
                <br />
                Email:{" "}
                <a href="mailto:vorithstudio@gmail.com" className={linkClass}>
                  vorithstudio@gmail.com
                </a>
                <br />
                Package:{" "}
                <code className="text-sm text-foreground">
                  com.vorithstudio.wordguess
                </code>
              </p>
            </div>
          ),
        },
      ]}
    />
  )
}
