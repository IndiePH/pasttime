"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
        <div
          className="flex shrink-0 gap-1"
          role="group"
          aria-label={label}
        >
          <Button
            type="button"
            size="sm"
            variant={value ? "outline" : "default"}
            className="min-w-12"
            aria-pressed={!value}
            onClick={() => onValueChange(false)}
          >
            Off
          </Button>
          <Button
            type="button"
            size="sm"
            variant={value ? "default" : "outline"}
            className="min-w-12"
            aria-pressed={value}
            onClick={() => onValueChange(true)}
          >
            On
          </Button>
        </div>
      </div>
    </div>
  )
}
