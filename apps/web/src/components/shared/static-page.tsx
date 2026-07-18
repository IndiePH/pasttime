import type { ReactNode } from "react"

import { SiteShell } from "@/components/shared/site-shell"

interface StaticPageSection {
  title: string
  content: ReactNode
}

interface StaticPageProps {
  title: string
  description: string
  sections: StaticPageSection[]
  lastUpdated?: string
}

function renderContent(content: ReactNode) {
  if (typeof content === "string") {
    return (
      <p className="leading-relaxed text-muted-foreground">{content}</p>
    )
  }

  if (Array.isArray(content)) {
    return (
      <div className="space-y-3">
        {content.map((paragraph, index) =>
          typeof paragraph === "string" ? (
            <p
              key={index}
              className="leading-relaxed text-muted-foreground"
            >
              {paragraph}
            </p>
          ) : (
            <div key={index} className="leading-relaxed text-muted-foreground">
              {paragraph}
            </div>
          ),
        )}
      </div>
    )
  }

  return (
    <div className="leading-relaxed text-muted-foreground">{content}</div>
  )
}

export function StaticPage({
  title,
  description,
  sections,
  lastUpdated,
}: StaticPageProps) {
  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="text-lg text-muted-foreground">{description}</p>
          {lastUpdated ? (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          ) : null}
        </header>
        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-xl font-medium tracking-tight">
                {section.title}
              </h2>
              {renderContent(section.content)}
            </section>
          ))}
        </div>
      </article>
    </SiteShell>
  )
}
