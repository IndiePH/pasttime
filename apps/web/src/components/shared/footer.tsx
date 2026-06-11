import { PlatformLink } from "@/platform/navigation"

const footerLinks = [
  { href: "/download", label: "Download" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className="mx-auto max-w-6xl space-y-4 px-4 text-center text-sm text-muted-foreground sm:px-6">
        <nav
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          aria-label="Footer"
        >
          {footerLinks.map((link) => (
            <PlatformLink
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </PlatformLink>
          ))}
        </nav>
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} Pasttime. Play more, think sharper.</p>
          <p className="text-xs">Free to play · No download required</p>
        </div>
      </div>
    </footer>
  )
}
