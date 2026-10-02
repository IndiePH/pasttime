import { Footer } from "@/components/shared/footer"
import { Header } from "@/components/shared/header"

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  )
}
