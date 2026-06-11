import type { Metadata } from "next"

import { SiteShell } from "@/components/shared"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PlatformLink } from "@/platform/navigation"

export const metadata: Metadata = {
  title: "Download",
  description: "Get Pasttime for desktop and mobile.",
}

const GITHUB_RELEASES_URL =
  "https://github.com/pasttime/pasttime/releases/latest"

export default function DownloadPage() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Download</h1>
        <p className="mt-3 text-muted-foreground">
          Play in your browser anytime, or install Pasttime for a dedicated app
          experience on desktop and mobile.
        </p>

        <div className="mt-10 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desktop</CardTitle>
              <CardDescription>
                Windows and macOS — loads the same hub and games as the web app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a
                  href={GITHUB_RELEASES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download for desktop
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mobile</CardTitle>
              <CardDescription>
                iOS and Android apps — coming to TestFlight and Play Store soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use the web app on mobile for now, or check back for store links.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Web</CardTitle>
              <CardDescription>
                No install — open the catalog in any modern browser.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <PlatformLink href="/">Open web app</PlatformLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </SiteShell>
  )
}
