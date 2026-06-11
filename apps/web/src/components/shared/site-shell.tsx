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
      <main className="flex flex-1 flex-col">{children}</main>
      <div className="border-t border-border/40 bg-muted/20">
        <div className="mx-auto max-w-6xl space-y-3 px-4 py-3 sm:px-6">
          <AdPanel slot="global-bottom-strip" variant="strip" />
          <div className="flex justify-end">
            <FeedbackWidget />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
