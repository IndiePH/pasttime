/**
 * Reserved banner under the site header. One slot for every page, including play.
 * Desktop is 728×90. A narrow portrait screen uses 320×50. Short landscape hides it.
 */
export function BannerPlaceholder() {
  return (
    <div className="px-4 pb-3 [@media(max-height:500px)]:hidden">
      <div className="mx-auto flex h-[50px] w-full max-w-[320px] items-center justify-center rounded-md border border-dashed border-border/80 bg-muted text-xs text-muted-foreground md:h-[90px] md:max-w-[728px]">
        <span className="md:hidden">Banner · 320×50</span>
        <span className="hidden md:inline">Banner · 728×90</span>
      </div>
    </div>
  )
}
