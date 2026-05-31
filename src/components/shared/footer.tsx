export function Footer() {
  return (
    <footer className="border-t border-border/60 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-muted-foreground sm:flex-row sm:px-6 sm:text-left">
        <p>© {new Date().getFullYear()} Pasttime. Play more, think sharper.</p>
        <p className="text-xs">Free to play · No download required</p>
      </div>
    </footer>
  )
}
