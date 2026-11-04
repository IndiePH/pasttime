"use client"

import * as React from "react"
import { useQueryState } from "nuqs"

import {
  formatTypeRushContentTypeLabel,
  TYPE_RUSH_CONTENT_TYPE_DEFAULT,
  TYPE_RUSH_CONTENT_TYPES,
  type TypeRushContentType,
} from "@pasttime/domain/games/type-rush"
import { Button } from "@/components/ui/button"
import { GameSettingsWidget } from "@/features/games/components/game-settings-widget"
import { typeRushSearchParams } from "@/features/games/type-rush/search-params"

interface TypeRushSettingsWidgetProps {
  className?: string
}

export function TypeRushSettingsWidget({
  className,
}: TypeRushSettingsWidgetProps) {
  const [contentParam, setContentParam] = useQueryState(
    "content",
    typeRushSearchParams.content
  )
  const [draftContentType, setDraftContentType] =
    React.useState<TypeRushContentType>(TYPE_RUSH_CONTENT_TYPE_DEFAULT)
  const contentType = contentParam as TypeRushContentType

  const handleOpen = React.useCallback(() => {
    setDraftContentType(contentType)
  }, [contentType])

  const handleApply = React.useCallback(() => {
    void setContentParam(
      draftContentType === TYPE_RUSH_CONTENT_TYPE_DEFAULT
        ? null
        : draftContentType
    )
  }, [draftContentType, setContentParam])

  return (
    <GameSettingsWidget
      className={className}
      panelId="type-rush-settings-panel"
      description="Choose what to type in this session."
      summary={formatTypeRushContentTypeLabel(contentType)}
      onOpen={handleOpen}
      onApply={handleApply}
      applyDisabled={draftContentType === contentType}
    >
      <fieldset className="space-y-2">
        <legend className="text-xs font-medium text-muted-foreground">
          Content Type
        </legend>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Content Type"
        >
          {TYPE_RUSH_CONTENT_TYPES.map((option) => (
            <Button
              key={option}
              type="button"
              size="sm"
              variant={draftContentType === option ? "default" : "outline"}
              aria-pressed={draftContentType === option}
              onClick={() => setDraftContentType(option)}
            >
              {formatTypeRushContentTypeLabel(option)}
            </Button>
          ))}
        </div>
      </fieldset>
    </GameSettingsWidget>
  )
}
