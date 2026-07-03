import { cn } from "@/lib/utils"

export const gamePlayFooterActionsClassName =
  "mt-6 flex w-60 flex-col items-center gap-3 self-center landscape:mt-4"

export function GamePlayFooterActions({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(gamePlayFooterActionsClassName, className)}>
      {children}
    </div>
  )
}
