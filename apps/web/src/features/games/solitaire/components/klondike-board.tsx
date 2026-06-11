"use client"

import * as React from "react"

import { isCardDragEnabled } from "@pasttime/domain/games"
import type {
  KlondikeFoundationIndex,
  KlondikePileRef,
  KlondikeTableauIndex,
} from "@pasttime/domain/games/solitaire"

import { useTheme } from "@/components/theme-provider"
import { KlondikeDragOverlay } from "@/features/games/solitaire/components/klondike-drag-overlay"
import { KlondikeFlyOverlay } from "@/features/games/solitaire/components/klondike-fly-overlay"
import { useSolitairePlayPreferencesContext } from "@/features/games/solitaire/context/solitaire-play-preferences-context"
import type { KlondikeSelection } from "@/features/games/solitaire/hooks/use-klondike-game"
import { useKlondikeDrag } from "@/features/games/solitaire/hooks/use-klondike-drag"
import { cn } from "@/lib/utils"

import { CardSlot, PlayingCard } from "./playing-card"
import type { useKlondikeGame } from "../hooks/use-klondike-game"

type KlondikeBoardProps = Pick<
  ReturnType<typeof useKlondikeGame>,
  | "state"
  | "selection"
  | "drawOrRecycle"
  | "autoFoundation"
  | "handleTableauCardClick"
  | "handleWasteClick"
  | "handleFoundationClick"
  | "handleEmptyTableauClick"
  | "moveCards"
  | "selectFrom"
  | "clearSelection"
  | "foundationFly"
>

const CARD_WIDTH_CLASS = "w-[var(--game-card-w)]"
const CARD_HEIGHT = "calc(var(--game-card-w) * 4 / 3)"
const TOP_ROW_MIN_HEIGHT = `calc(${CARD_HEIGHT} + 0.25rem)`
const STACK_OFFSET_CLASS = "top-[calc(var(--game-stack-step)*var(--stack-index))]"
const SOLITAIRE_GAME_ID = "solitaire"

function isSelected(
  selection: KlondikeSelection | null,
  pile: KlondikeSelection["from"]["pile"],
  index?: number,
): boolean {
  if (!selection || selection.from.pile !== pile) {
    return false
  }

  if (pile === "foundation" || pile === "tableau") {
    const selectedIndex =
      selection.from.pile === pile ? selection.from.index : undefined
    return selectedIndex === index
  }

  return true
}

function dropTargetClassName(isActive: boolean) {
  return cn(isActive && "rounded-md ring-2 ring-primary/60")
}

export function KlondikeBoard({
  state,
  selection,
  drawOrRecycle,
  autoFoundation,
  handleTableauCardClick,
  handleWasteClick,
  handleFoundationClick,
  handleEmptyTableauClick,
  moveCards,
  selectFrom,
  clearSelection,
  foundationFly,
}: KlondikeBoardProps) {
  const dragEnabled = isCardDragEnabled(SOLITAIRE_GAME_ID)
  const {
    isAutoCompleting,
    flySessions,
    hiddenCardIds,
    flyDurationMs,
    handleFlyComplete,
    handleFlyMeasureFailed,
  } = foundationFly
  const { cardVariant } = useSolitairePlayPreferencesContext()
  const { resolvedTheme } = useTheme()
  const backVariant = resolvedTheme === "dark" ? "light" : "dark"
  const stockTop = state.stock[state.stock.length - 1]
  const wasteTop = state.waste[state.waste.length - 1]
  const columnGapClass = "gap-[var(--game-card-gap)]"

  const {
    dragSession,
    getDragSourceProps,
    getDropTargetProps,
    consumeSuppressedClick,
    isDragSourceHidden,
  } = useKlondikeDrag({
    enabled: dragEnabled && !isAutoCompleting,
    state,
    selectFrom,
    moveCards,
    clearSelection,
  })

  const tallestColumn = Math.max(
    1,
    ...state.tableau.map((column) => column.length),
  )
  const boardMinHeight = `calc(
    var(--game-card-w) * 4 / 3 * 2 +
    (${tallestColumn} - 1) * var(--game-stack-step) +
    var(--game-card-w) * 0.35 +
    0.625rem
  )`

  const wasteFrom: KlondikePileRef = { pile: "waste" }

  return (
    <>
      <div
        className={cn(
          "klondike-board",
          isAutoCompleting && "pointer-events-none select-none",
        )}
        style={
          {
            "--stack-index": 0,
            width: "var(--klondike-board-w)",
            minHeight: boardMinHeight,
          } as React.CSSProperties
        }
      >
        <div className={cn("space-y-[calc(var(--game-card-w)*0.35)]")}>
          <div
            className="flex items-start justify-between pt-1"
            style={{
              width: "var(--klondike-board-w)",
              minHeight: TOP_ROW_MIN_HEIGHT,
            }}
          >
            <div className={cn("flex items-start", columnGapClass)}>
              <div className={cn("relative overflow-visible", CARD_WIDTH_CLASS)}>
                {stockTop ? (
                  <PlayingCard
                    card={stockTop}
                    variant={cardVariant}
                    backVariant={backVariant}
                    onClick={drawOrRecycle}
                    ariaLabel={
                      state.stock.length > 0
                        ? "Draw from stock"
                        : "Recycle waste pile"
                    }
                  />
                ) : (
                  <CardSlot
                    onClick={
                      state.waste.length > 0 ? drawOrRecycle : undefined
                    }
                    ariaLabel="Recycle waste pile"
                  />
                )}
                {state.stock.length > 1 ? (
                  <span className="pointer-events-none absolute top-1 right-1 z-10 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] leading-none font-medium text-primary-foreground">
                    {state.stock.length}
                  </span>
                ) : null}
              </div>

              <div className={CARD_WIDTH_CLASS}>
                {wasteTop ? (
                  <div data-klondike-pile="waste">
                    <PlayingCard
                      card={wasteTop}
                      variant={cardVariant}
                      backVariant={backVariant}
                      selected={isSelected(selection, "waste")}
                      dragSourceHidden={
                        isDragSourceHidden(wasteFrom) ||
                        hiddenCardIds.has(wasteTop.id)
                      }
                    onClick={() => {
                      if (consumeSuppressedClick()) {
                        return
                      }
                      handleWasteClick()
                    }}
                    onDoubleClick={() => autoFoundation({ pile: "waste" })}
                    ariaLabel="Waste pile top card"
                    {...getDragSourceProps(wasteFrom, 1)}
                  />
                  </div>
                ) : (
                  <CardSlot ariaLabel="Empty waste pile" />
                )}
              </div>
            </div>

            <div className={cn("flex items-start", columnGapClass)}>
              {state.foundations.map((pile, index) => {
                const foundationIndex = index as KlondikeFoundationIndex
                const top = pile[pile.length - 1]
                const dropId = `foundation-${index}`
                const dropProps = getDropTargetProps(dropId)

                return (
                  <div
                    key={`foundation-${index}`}
                    className={cn(
                      CARD_WIDTH_CLASS,
                      dropTargetClassName(dropProps["data-drop-active"] === "true"),
                    )}
                    data-klondike-pile={`foundation-${index}`}
                    {...dropProps}
                  >
                    {top ? (
                      <PlayingCard
                        card={top}
                        variant={cardVariant}
                        backVariant={backVariant}
                        onClick={() =>
                          handleFoundationClick({
                            pile: "foundation",
                            index: foundationIndex,
                          })
                        }
                        ariaLabel={`Foundation pile ${index + 1}`}
                      />
                    ) : (
                      <CardSlot
                        onClick={() =>
                          handleFoundationClick({
                            pile: "foundation",
                            index: foundationIndex,
                          })
                        }
                        ariaLabel={`Empty foundation slot ${index + 1}`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div
            className={cn("grid grid-cols-7 pb-2.5", columnGapClass)}
            style={{ width: "var(--klondike-board-w)" }}
          >
            {state.tableau.map((column, columnIndex) => {
              const tableauIndex = columnIndex as KlondikeTableauIndex
              const columnSelected = isSelected(selection, "tableau", tableauIndex)
              const stackStep = "var(--game-stack-step)"
              const columnHeight =
                column.length > 0
                  ? `calc(var(--game-card-w) * 4 / 3 + (${column.length - 1}) * ${stackStep})`
                  : undefined
              const dropId = `tableau-${columnIndex}`
              const dropProps = getDropTargetProps(dropId)
              const tableauFrom: KlondikePileRef = {
                pile: "tableau",
                index: tableauIndex,
              }

              return (
                <div
                  key={`tableau-${columnIndex}`}
                  className={cn(
                    "relative",
                    CARD_WIDTH_CLASS,
                    dropTargetClassName(dropProps["data-drop-active"] === "true"),
                  )}
                  style={{ minHeight: columnHeight }}
                  {...dropProps}
                >
                  {column.length === 0 ? (
                    <CardSlot
                      onClick={() => handleEmptyTableauClick(tableauIndex)}
                      ariaLabel={`Empty tableau column ${columnIndex + 1}`}
                    />
                  ) : (
                    column.map((card, cardIndex) => {
                      const selectedStartIndex =
                        column.length - (selection?.cardCount ?? 0)
                      const isInSelectedStack =
                        columnSelected &&
                        selection !== null &&
                        cardIndex >= selectedStartIndex
                      const cardCount = column.length - cardIndex
                      const isTopCard = cardIndex === column.length - 1

                      return (
                        <div
                          key={card.id}
                          className={cn(
                            "absolute left-0 right-0",
                            STACK_OFFSET_CLASS,
                          )}
                          style={
                            {
                              "--stack-index": cardIndex,
                            } as React.CSSProperties
                          }
                          {...(isTopCard
                            ? { "data-klondike-pile": `tableau-${columnIndex}` }
                            : {})}
                        >
                          <PlayingCard
                            card={card}
                            variant={cardVariant}
                            backVariant={backVariant}
                            selected={isInSelectedStack}
                            dragSourceHidden={
                              card.faceUp
                                ? isDragSourceHidden(tableauFrom, cardIndex) ||
                                  hiddenCardIds.has(card.id)
                                : false
                            }
                            onClick={() => {
                              if (consumeSuppressedClick()) {
                                return
                              }
                              handleTableauCardClick(tableauIndex, cardIndex)
                            }}
                            onDoubleClick={() => {
                              if (card.faceUp) {
                                autoFoundation({
                                  pile: "tableau",
                                  index: tableauIndex,
                                })
                              }
                            }}
                            ariaLabel={`Tableau card ${card.suit} ${card.rank}`}
                            {...(card.faceUp
                              ? getDragSourceProps(tableauFrom, cardCount)
                              : {})}
                          />
                        </div>
                      )
                    })
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <KlondikeDragOverlay session={dragSession} />
      <KlondikeFlyOverlay
        sessions={flySessions}
        durationMs={flyDurationMs}
        onComplete={handleFlyComplete}
        onMeasureFailed={handleFlyMeasureFailed}
      />
    </>
  )
}
