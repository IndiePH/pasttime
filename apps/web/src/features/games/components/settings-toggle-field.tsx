"use client"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

interface SettingsToggleFieldProps {
  className?: string
  label: string
  description?: string
  value: boolean
  onValueChange: (value: boolean) => void
}

export function SettingsToggleField({
  className,
  label,
  description,
  value,
  onValueChange,
}: SettingsToggleFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          {description ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Switch
          checked={value}
          onCheckedChange={onValueChange}
          className="shrink-0"
        />
      </div>
    </div>
  )
}
