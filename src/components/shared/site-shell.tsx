import { AdPanel } from "@/components/shared/ad-panel"
import { FeedbackWidget } from "@/components/shared/feedback-widget"
import { Footer } from "@/components/shared/footer"
import { Header } from "@/components/shared/header"

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <div className="border-b border-border/40 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <AdPanel slot="global-top-strip" variant="strip" />
        </div>
      </div>
      <main className="flex-1">{children}</main>
      <div className="mx-auto flex w-full max-w-6xl justify-end px-4 pb-2 sm:px-6">
        <FeedbackWidget />
      </div>
      <Footer />
    </div>
  )
}
