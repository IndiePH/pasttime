"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import {
  getTypingCharacterStatus,
  type TypingCharacterStatus,
} from "@pasttime/domain/games/shared"
import {
  getTypeShieldCometProgress,
  getTypeShieldLockedComet,
  TYPE_SHIELD_MAX_LIVES,
  TYPE_SHIELD_SURVIVAL_MS,
  type TypeShieldComet,
  type TypeShieldState,
} from "@pasttime/domain/games/type-shield"
import { useTypeShieldPlayPreferences } from "@/features/games/type-shield/hooks/use-type-shield-play-preferences"

const STAGE_WIDTH = 1600
const STAGE_HEIGHT = 820
const DOME_WIDTH_RATIO = 0.16
const DOME_RADIUS = (STAGE_WIDTH * DOME_WIDTH_RATIO) / 2
const DOME_CENTER_X = STAGE_WIDTH / 2
const DOME_GROUND_DROP = DOME_RADIUS * 0.02
const DOME_GROUND_RY = DOME_RADIUS * 0.07
const DOME_CENTER_Y = STAGE_HEIGHT - 18 - DOME_GROUND_DROP - DOME_GROUND_RY

interface TypeShieldStageProps {
  round: TypeShieldState
  now: number
  shake: number
}

export function TypeShieldStage({ round, now, shake }: TypeShieldStageProps) {
  const reduceMotion = useReducedMotion()
  const { cometEffects } = useTypeShieldPlayPreferences()
  const effects = cometEffects && reduceMotion !== true
  const ambient = reduceMotion !== true
  const locked = getTypeShieldLockedComet(round)
  const remainingMs =
    round.mode === "survival" && round.status === "playing" && round.startedAt > 0
      ? Math.max(0, TYPE_SHIELD_SURVIVAL_MS - (now - round.startedAt))
      : null

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#07111f] shadow-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(56,120,180,0.28),_transparent_58%)]" />
      <svg
        viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
        className="relative block h-auto w-full"
        role="img"
        aria-label="Dome shield and falling comets"
      >
        <Sky ambient={ambient} />
        <motion.g
          key={shake}
          animate={
            !effects || shake === 0
              ? { x: 0 }
              : { x: [0, -14, 12, -8, 6, 0] }
          }
          transition={{ duration: 0.42 }}
        >
          <Dome />
        </motion.g>
      </svg>
      <AnimatePresence>
        {round.comets.map((comet) => (
          <CometMarker
            key={comet.id}
            comet={comet}
            now={now}
            locked={locked?.id === comet.id}
            reduceMotion={!effects}
          />
        ))}
      </AnimatePresence>
      <div className="pointer-events-none absolute inset-x-0 top-3 flex items-start justify-between px-4 text-sm text-white">
        <p>
          <span className="text-white/70">Shield </span>
          <span className="font-semibold">
            {round.lives}/{TYPE_SHIELD_MAX_LIVES}
          </span>
        </p>
        {remainingMs !== null ? (
          <p className="font-semibold tabular-nums" aria-label={`Time left ${formatRemaining(remainingMs)}`}>
            {formatRemaining(remainingMs)}
          </p>
        ) : (
          <span />
        )}
        <p>
          <span className="text-white/70">Score </span>
          <span className="font-semibold tabular-nums">{round.score}</span>
        </p>
      </div>
    </div>
  )
}

function formatRemaining(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

const STARS: ReadonlyArray<{ x: number; y: number; r: number; delay: number }> = [
  { x: 90, y: 70, r: 1.4, delay: 0.4 },
  { x: 180, y: 210, r: 1.1, delay: 1.6 },
  { x: 340, y: 96, r: 1.8, delay: 0 },
  { x: 470, y: 180, r: 1.2, delay: 2.2 },
  { x: 610, y: 64, r: 1.3, delay: 1.1 },
  { x: 780, y: 150, r: 1.6, delay: 3.4 },
  { x: 940, y: 86, r: 1.2, delay: 0.8 },
  { x: 1080, y: 190, r: 1.5, delay: 2.8 },
  { x: 1240, y: 72, r: 1.1, delay: 1.4 },
  { x: 1380, y: 160, r: 1.7, delay: 0.2 },
  { x: 1510, y: 110, r: 1.2, delay: 2.4 },
  { x: 560, y: 280, r: 1, delay: 3.1 },
  { x: 1320, y: 250, r: 1, delay: 1.9 },
]

const MOTES: ReadonlyArray<{ x: number; y: number; delay: number; duration: number }> = [
  { x: 240, y: 460, delay: 0, duration: 19 },
  { x: 690, y: 390, delay: 5, duration: 23 },
  { x: 1120, y: 510, delay: 2, duration: 17 },
  { x: 1460, y: 360, delay: 8, duration: 21 },
]

function Sky({ ambient }: { ambient: boolean }) {
  return (
    <>
      <defs>
        <radialGradient id="type-shield-sky" cx="50%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#163456" />
          <stop offset="55%" stopColor="#0b1b33" />
          <stop offset="100%" stopColor="#050910" />
        </radialGradient>
        <linearGradient id="type-shield-dome" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#9ad7ff" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#3d7eb8" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#12304d" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="type-shield-ground" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1d4d3a" />
          <stop offset="100%" stopColor="#0c2418" />
        </linearGradient>
        <filter id="type-shield-haze" x="-40%" y="-80%" width="180%" height="260%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>
      <rect width={STAGE_WIDTH} height={STAGE_HEIGHT} fill="url(#type-shield-sky)" />
      <Drift ambient={ambient} />
      <Moon ambient={ambient} />
      {STARS.map((star) => (
        <motion.circle
          key={`${star.x}-${star.y}`}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="#d7e7ff"
          initial={false}
          animate={
            ambient
              ? { opacity: [0.28, 0.9, 0.28] }
              : { opacity: 0.62 }
          }
          transition={
            ambient
              ? { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: star.delay }
              : { duration: 0 }
          }
        />
      ))}
      {MOTES.map((mote) => (
        <motion.circle
          key={`${mote.x}-${mote.y}`}
          cx={mote.x}
          cy={mote.y}
          r="1.3"
          fill="#c5d8ef"
          initial={false}
          animate={
            ambient
              ? { y: [0, -70], opacity: [0, 0.45, 0] }
              : { opacity: 0.2 }
          }
          transition={
            ambient
              ? {
                  duration: mote.duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: mote.delay,
                }
              : { duration: 0 }
          }
        />
      ))}
      <Horizon ambient={ambient} />
    </>
  )
}

function Drift({ ambient }: { ambient: boolean }) {
  return (
    <>
      <motion.ellipse
        cx="480"
        cy="210"
        rx="300"
        ry="36"
        fill="#8eb7e8"
        filter="url(#type-shield-haze)"
        initial={false}
        animate={
          ambient
            ? { x: [-60, 90, -60], opacity: [0.16, 0.28, 0.16] }
            : { opacity: 0.2 }
        }
        transition={
          ambient
            ? { duration: 36, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
      />
      <motion.ellipse
        cx="1180"
        cy="300"
        rx="220"
        ry="28"
        fill="#9ec4ff"
        filter="url(#type-shield-haze)"
        initial={false}
        animate={
          ambient
            ? { x: [40, -80, 40], opacity: [0.12, 0.22, 0.12] }
            : { opacity: 0.16 }
        }
        transition={
          ambient
            ? { duration: 44, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
      />
      <PassingLight ambient={ambient} y={168} length={64} duration={26} delay={1} />
      <PassingLight ambient={ambient} y={286} length={48} duration={34} delay={12} />
    </>
  )
}

function PassingLight({
  ambient,
  y,
  length,
  duration,
  delay,
}: {
  ambient: boolean
  y: number
  length: number
  duration: number
  delay: number
}) {
  return (
    <motion.g
      initial={false}
      animate={
        ambient
          ? {
              x: [-160, -20, STAGE_WIDTH * 0.72, STAGE_WIDTH + 120],
              opacity: [0, 0.5, 0.5, 0],
            }
          : { opacity: 0 }
      }
      transition={
        ambient
          ? {
              duration,
              repeat: Infinity,
              ease: "linear",
              delay,
              times: [0, 0.08, 0.78, 1],
            }
          : { duration: 0 }
      }
    >
      <line
        x1="0"
        y1={y}
        x2={length}
        y2={y + length * 0.22}
        stroke="#e7f1ff"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </motion.g>
  )
}

function Moon({ ambient }: { ambient: boolean }) {
  return (
    <g>
      <motion.circle
        cx="250"
        cy="128"
        r="42"
        fill="#9ec4ff"
        initial={false}
        animate={ambient ? { opacity: [0.08, 0.16, 0.08] } : { opacity: 0.1 }}
        transition={
          ambient
            ? { duration: 9, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
      />
      <circle cx="250" cy="128" r="16" fill="#f3f7fb" opacity="0.82" />
    </g>
  )
}

function Horizon({ ambient }: { ambient: boolean }) {
  return (
    <g>
      <path
        d="M0 820 L0 752 C160 708 340 768 520 742 C680 720 740 792 860 804 C980 792 1120 714 1300 746 C1440 770 1520 724 1600 738 L1600 820 Z"
        fill="#08140f"
      />
      <g stroke="#c5ddd2" strokeOpacity="0.45" fill="none" strokeLinecap="round">
        <line x1="128" y1="738" x2="112" y2="692" strokeWidth="1.4" />
        <path d="M96 688 C108 714 132 714 144 688" strokeWidth="1.3" />
      </g>
      <motion.circle
        cx="120"
        cy="684"
        r="2.2"
        fill="#d7f2ff"
        initial={false}
        animate={ambient ? { opacity: [0.35, 0.9, 0.35] } : { opacity: 0.7 }}
        transition={
          ambient
            ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
      />
      <g fill="#163528" stroke="#3d6a52" strokeOpacity="0.7" strokeWidth="1">
        <ellipse cx="1472" cy="744" rx="18" ry="8" />
        <ellipse cx="1496" cy="736" rx="12" ry="6.5" />
        <ellipse cx="1452" cy="740" rx="9" ry="5" />
      </g>
    </g>
  )
}

function Dome() {
  const left = DOME_CENTER_X - DOME_RADIUS
  const right = DOME_CENTER_X + DOME_RADIUS
  const highlightInset = DOME_RADIUS * 0.115
  const highlightDrop = DOME_RADIUS * 0.02
  const highlightRadius = DOME_RADIUS * 0.865
  return (
    <>
      <ellipse
        cx={DOME_CENTER_X}
        cy={DOME_CENTER_Y + DOME_GROUND_DROP}
        rx={DOME_RADIUS + DOME_RADIUS * 0.07}
        ry={DOME_GROUND_RY}
        fill="url(#type-shield-ground)"
      />
      <path
        d={`M ${left} ${DOME_CENTER_Y} A ${DOME_RADIUS} ${DOME_RADIUS} 0 0 1 ${right} ${DOME_CENTER_Y} Z`}
        fill="url(#type-shield-dome)"
        stroke="#d7f2ff"
        strokeOpacity="0.85"
        strokeWidth={DOME_RADIUS * 0.01}
      />
      <path
        d={`M ${left + highlightInset} ${DOME_CENTER_Y - highlightDrop} A ${highlightRadius} ${highlightRadius} 0 0 1 ${right - highlightInset} ${DOME_CENTER_Y - highlightDrop}`}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth={DOME_RADIUS * 0.005}
      />
    </>
  )
}

function CometMarker({
  comet,
  now,
  locked,
  reduceMotion,
}: {
  comet: TypeShieldComet
  now: number
  locked: boolean
  reduceMotion: boolean
}) {
  const point = cometPoint(comet, now)
  const angle = cometAngleDeg(comet)

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${(point.x / STAGE_WIDTH) * 100}%`,
        top: `${(point.y / STAGE_HEIGHT) * 100}%`,
      }}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={
        reduceMotion
          ? { opacity: 0 }
          : { opacity: 0, scale: 1.7, filter: "blur(8px)" }
      }
      transition={{ duration: 0.28 }}
    >
      <div
        className="flex flex-col items-center"
        style={{
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        }}
      >
        <div
          className="-mb-2 h-10 w-3 rounded-full bg-gradient-to-b from-transparent via-orange-300/80 to-amber-100"
          aria-hidden
        />
        <div
          className={`flex min-w-16 items-center justify-center rounded-full border px-3 py-2 shadow-[0_0_24px_rgba(251,191,36,0.45)] ${
            locked
              ? "border-amber-100 bg-amber-500/90"
              : "border-orange-200/80 bg-orange-500/80"
          }`}
        >
          <span className="font-mono text-base font-semibold tracking-wide">
            {Array.from(comet.word).map((character, index) => (
              <span
                key={`${comet.id}-${index}`}
                className={cometCharacterClass(
                  getTypingCharacterStatus(comet.typing, index),
                )}
              >
                {character}
              </span>
            ))}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

function cometCharacterClass(status: TypingCharacterStatus): string {
  switch (status) {
    case "correct":
      return "text-white"
    case "incorrect":
      return "rounded bg-red-950/50 text-white underline decoration-red-100 decoration-wavy"
    case "current":
      return "rounded bg-slate-950 px-0.5 text-amber-100 underline decoration-amber-200 decoration-2 underline-offset-4"
    default:
      return "text-slate-950/45"
  }
}

function cometFlight(comet: TypeShieldComet): {
  spawnX: number
  spawnY: number
  impactX: number
  impactY: number
} {
  const margin = 180
  const spawnX = margin + comet.lane * (STAGE_WIDTH - margin * 2)
  const impactX = DOME_CENTER_X + (comet.lane - 0.5) * DOME_RADIUS * 1.5
  const dx = impactX - DOME_CENTER_X
  const inside = DOME_RADIUS * DOME_RADIUS - dx * dx
  const surface =
    inside > 0 ? DOME_CENTER_Y - Math.sqrt(inside) : DOME_CENTER_Y
  const spawnY = 54
  const impactY = Math.max(spawnY + 40, surface - DOME_RADIUS * 0.08)
  return { spawnX, spawnY, impactX, impactY }
}

function cometPoint(comet: TypeShieldComet, now: number): { x: number; y: number } {
  const flight = cometFlight(comet)
  const progress = getTypeShieldCometProgress(comet, now)
  return {
    x: flight.spawnX + (flight.impactX - flight.spawnX) * progress,
    y: flight.spawnY + (flight.impactY - flight.spawnY) * progress,
  }
}

/** Lean off a straight fall, in degrees. Side paths bank; a center path stays flat. */
function cometAngleDeg(comet: TypeShieldComet): number {
  const flight = cometFlight(comet)
  const dx = flight.impactX - flight.spawnX
  const dy = flight.impactY - flight.spawnY
  return (Math.atan2(dx, dy) * 180) / Math.PI
}
