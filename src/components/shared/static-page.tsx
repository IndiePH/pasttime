import { AdPanel } from "@/components/shared/ad-panel"
import { SiteShell } from "@/components/shared/site-shell"

interface StaticPageSection {
  title: string
  content: string
}

interface StaticPageProps {
  title: string
  description: string
  sections: StaticPageSection[]
}

export function StaticPage({
  title,
  description,
  sections,
}: StaticPageProps) {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-lg text-muted-foreground">{description}</p>
        </header>
        <AdPanel slot="static-below-header" variant="box" className="mt-8" />
        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-xl font-medium tracking-tight">
                {section.title}
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </article>
    </SiteShell>
  )
}
