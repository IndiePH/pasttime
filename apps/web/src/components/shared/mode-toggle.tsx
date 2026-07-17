"use client"

import * as React from "react"
import { ChevronDownIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react"

import { useTheme, type ModePreference } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { theme, setMode, resolvedTheme, modesForCurrentFamily } = useTheme()
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="gap-1.5 px-2.5" disabled>
        <SunIcon className="size-4" />
        <span className="text-sm font-normal">Theme</span>
        <ChevronDownIcon className="size-3.5 opacity-60" />
      </Button>
    )
  }

  const TriggerIcon =
    theme === "system"
      ? MonitorIcon
      : resolvedTheme === "dark"
        ? MoonIcon
        : SunIcon

  const themeLabel =
    theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light"

  const showLight = modesForCurrentFamily.includes("light")
  const showDark = modesForCurrentFamily.includes("dark")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 px-2.5"
          aria-label={`Theme: ${themeLabel}`}
        >
          <TriggerIcon className="size-4" />
          <span className="text-sm font-normal">{themeLabel}</span>
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setMode(value as ModePreference)}
        >
          {showLight ? (
            <DropdownMenuRadioItem value="light">
              <SunIcon />
              Light
            </DropdownMenuRadioItem>
          ) : null}
          {showDark ? (
            <DropdownMenuRadioItem value="dark">
              <MoonIcon />
              Dark
            </DropdownMenuRadioItem>
          ) : null}
          <DropdownMenuRadioItem value="system">
            <MonitorIcon />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
