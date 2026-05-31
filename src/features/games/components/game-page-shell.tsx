import { cn } from "@/lib/utils"

export const gamePageShellClassName =
  "mx-auto flex max-w-lg flex-col items-center px-4 pt-10 pb-16 text-center sm:px-6 sm:pt-14 sm:pb-24"

export function GamePageShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(gamePageShellClassName, className)}>{children}</div>
  )
}
