import { Footer } from "@/components/shared/footer"
import { Header } from "@/components/shared/header"
import { PageSideBanner } from "@/components/shared/page-side-banner"

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div data-site-shell className="flex min-h-svh flex-col">
      <Header />
      <PageSideBanner />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  )
}
