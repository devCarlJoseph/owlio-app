import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { Link } from "react-router"
import { Lock, Minus, Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { kindLabel, metaLine } from "./space-format"
import { SpaceMapArt } from "./space-map-art"
import {
  layoutMap,
  pointsAttr,
  TILE_ART_CX,
  TILE_ART_CY,
  TILE_H,
  TILE_W,
  type MapRole,
  type MapTile,
} from "./space-map-layout"
import {
  studySpacesLockedTooltip,
  type StudySpaceRecord,
} from "./study-spaces-records"

const MIN_SCALE = 0.35
const MAX_SCALE = 1.8
const ZOOM_STEP = 1.25
const PAN_MARGIN = 80
const DRAG_THRESHOLD = 4

type View = { x: number; y: number; s: number }

type SpaceMapProps = {
  created: StudySpaceRecord[]
  joined: StudySpaceRecord[]
  locked: StudySpaceRecord[]
  onUnlock: (space: StudySpaceRecord) => void
}

const ZONE_STYLE: Record<MapRole, { fill: string; stroke: string; text: string; dash?: string }> = {
  owner: { fill: "#2f6b4f", stroke: "#2f6b4f", text: "#2f6b4f" },
  member: { fill: "#33415c", stroke: "#33415c", text: "#33415c" },
  visitor: { fill: "#64748b", stroke: "#64748b", text: "#475569", dash: "10 8" },
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function tileAriaLabel(tile: MapTile): string {
  return tile.role === "visitor"
    ? `${tile.space.name} — locked preview, needs a space code`
    : `Open ${tile.space.name}`
}

function stateLabel(role: MapRole): string {
  if (role === "owner") return "Yours"
  if (role === "member") return "Joined"
  return "Locked — needs code"
}

export function SpaceMap({ created, joined, locked, onUnlock }: SpaceMapProps) {
  const layout = useMemo(
    () =>
      layoutMap([
        {
          role: "owner",
          label: "Your desk row",
          emptyMessage: "No spaces created yet. Use Create space to start one.",
          spaces: created,
        },
        {
          role: "member",
          label: "Shared tables",
          emptyMessage: "No joined spaces yet. Use Join space to add one.",
          spaces: joined,
        },
        {
          role: "visitor",
          label: "Locked wing",
          emptyMessage: "All preview spaces have been unlocked in this browser.",
          spaces: locked,
        },
      ]),
    [created, joined, locked]
  )
  const { bounds } = layout
  const origin = { x: bounds.minX, y: bounds.minY }

  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [view, setView] = useState<View>({ x: 0, y: 0, s: 1 })
  const drag = useRef({ pointers: new Map<number, { x: number; y: number }>(), moved: false, pinch: 0 })

  const viewportSize = useCallback(() => {
    const el = viewportRef.current
    return { w: el?.clientWidth ?? 0, h: el?.clientHeight ?? 0 }
  }, [])

  const clampView = useCallback(
    (next: View): View => {
      const { w, h } = viewportSize()
      if (!w || !h) return next
      const range = (viewport: number, content: number) => {
        const a = PAN_MARGIN
        const b = viewport - content - PAN_MARGIN
        return [Math.min(a, b), Math.max(a, b)] as const
      }
      const [minX, maxX] = range(w, bounds.width * next.s)
      const [minY, maxY] = range(h, bounds.height * next.s)
      return { s: next.s, x: clamp(next.x, minX, maxX), y: clamp(next.y, minY, maxY) }
    },
    [bounds.width, bounds.height, viewportSize]
  )

  const fitView = useCallback((): View => {
    const { w } = viewportSize()
    if (!w) return { x: 0, y: 0, s: 1 }
    const s = clamp(w / 1000, 0.5, 0.9)
    return clampView({
      s,
      x: w / 2 - (layout.focus.x - bounds.minX) * s,
      y: 16 - (layout.focus.y - bounds.minY) * s,
    })
  }, [bounds.minX, bounds.minY, clampView, layout.focus.x, layout.focus.y, viewportSize])

  const fitted = useRef(false)
  const attachViewport = useCallback(
    (el: HTMLDivElement | null) => {
      viewportRef.current = el
      if (el && !fitted.current) {
        fitted.current = true
        setView(fitView())
      }
    },
    [fitView]
  )

  const zoomBy = useCallback(
    (factor: number, point?: { x: number; y: number }) => {
      setView((current) => {
        const s = clamp(current.s * factor, MIN_SCALE, MAX_SCALE)
        const size = viewportSize()
        const px = point?.x ?? size.w / 2
        const py = point?.y ?? size.h / 2
        const ratio = s / current.s
        return clampView({ s, x: px - (px - current.x) * ratio, y: py - (py - current.y) * ratio })
      })
    },
    [clampView, viewportSize]
  )

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return

    function onWheel(event: WheelEvent) {
      event.preventDefault()
      const rect = el!.getBoundingClientRect()
      zoomBy(Math.exp(-event.deltaY * 0.0015), { x: event.clientX - rect.left, y: event.clientY - rect.top })
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [zoomBy])

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    drag.current.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (drag.current.pointers.size === 1) drag.current.moved = false
    if (drag.current.pointers.size === 2) {
      const [a, b] = [...drag.current.pointers.values()]
      drag.current.pinch = Math.hypot(a.x - b.x, a.y - b.y)
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const pointers = drag.current.pointers
    const previous = pointers.get(event.pointerId)
    if (!previous) return
    const next = { x: event.clientX, y: event.clientY }

    if (pointers.size === 2) {
      pointers.set(event.pointerId, next)
      const [a, b] = [...pointers.values()]
      const distance = Math.hypot(a.x - b.x, a.y - b.y)
      const rect = viewportRef.current!.getBoundingClientRect()
      if (drag.current.pinch > 0 && distance > 0) {
        zoomBy(distance / drag.current.pinch, {
          x: (a.x + b.x) / 2 - rect.left,
          y: (a.y + b.y) / 2 - rect.top,
        })
      }
      drag.current.pinch = distance
      drag.current.moved = true
      return
    }

    const dx = next.x - previous.x
    const dy = next.y - previous.y
    if (!drag.current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return

    if (!drag.current.moved) {
      drag.current.moved = true
      viewportRef.current?.setPointerCapture?.(event.pointerId)
    }
    pointers.set(event.pointerId, next)
    setView((current) => clampView({ ...current, x: current.x + dx, y: current.y + dy }))
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    drag.current.pointers.delete(event.pointerId)
    drag.current.pinch = 0
  }

  function revealTile(target: HTMLElement) {
    const viewport = viewportRef.current
    if (!viewport) return
    const box = viewport.getBoundingClientRect()
    const rect = target.getBoundingClientRect()
    if (!box.width || !rect.width) return
    const pad = 24
    const dx = rect.left < box.left + pad ? box.left + pad - rect.left : rect.right > box.right - pad ? box.right - pad - rect.right : 0
    const dy = rect.top < box.top + pad ? box.top + pad - rect.top : rect.bottom > box.bottom - pad ? box.bottom - pad - rect.bottom : 0
    if (dx || dy) setView((current) => clampView({ ...current, x: current.x + dx, y: current.y + dy }))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const arrows: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    }
    const target = event.target as HTMLElement

    if (event.key === "+" || event.key === "=") return zoomBy(ZOOM_STEP)
    if (event.key === "-") return zoomBy(1 / ZOOM_STEP)
    if (event.key === "0") return setView(fitView())

    const direction = arrows[event.key]
    if (!direction) return
    event.preventDefault()

    if (target === viewportRef.current) {
      setView((current) =>
        clampView({ ...current, x: current.x - direction[0] * 60, y: current.y - direction[1] * 60 })
      )
      return
    }

    if (!target.hasAttribute("data-map-tile")) return
    const from = target.getBoundingClientRect()
    const fromX = from.left + from.width / 2
    const fromY = from.top + from.height / 2
    let best: HTMLElement | null = null
    let bestScore = Infinity

    viewportRef.current?.querySelectorAll<HTMLElement>("[data-map-tile]").forEach((candidate) => {
      if (candidate === target) return
      const rect = candidate.getBoundingClientRect()
      const dx = rect.left + rect.width / 2 - fromX
      const dy = rect.top + rect.height / 2 - fromY
      const along = dx * direction[0] + dy * direction[1]
      if (along <= 0) return
      const score = along + 2 * Math.abs(dx * direction[1] + dy * direction[0])
      if (score < bestScore) {
        bestScore = score
        best = candidate
      }
    })

    ;(best as HTMLElement | null)?.focus()
  }

  const percent = Math.round(view.s * 100)

  return (
    <div className="relative h-[60vh] min-h-[420px] overflow-hidden rounded-3xl bg-[#ece3cf] sm:h-[68vh] lg:h-[72vh]">
      <div
        ref={attachViewport}
        aria-hidden="true"
        data-zoom={view.s.toFixed(3)}
        className="absolute inset-0 cursor-grab touch-none select-none outline-none active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={onKeyDown}
        onFocusCapture={(event) => {
          if ((event.target as HTMLElement).hasAttribute("data-map-tile")) revealTile(event.target as HTMLElement)
        }}
        onClickCapture={(event) => {
          if (drag.current.moved) {
            event.preventDefault()
            event.stopPropagation()
            drag.current.moved = false
          }
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: bounds.width,
            height: bounds.height,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`,
          }}
        >
          <svg
            width={bounds.width}
            height={bounds.height}
            viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
            aria-hidden="true"
            focusable="false"
            className="absolute left-0 top-0"
          >
            <polygon points={pointsAttr(layout.floor)} fill="#f3ead9" stroke="#d8cdb8" strokeWidth={4} />
            {layout.walkways.map((walkway, index) => (
              <g key={index}>
                <polygon points={pointsAttr(walkway.strip)} fill="#e8dec7" />
                <line
                  x1={walkway.line[0].x}
                  y1={walkway.line[0].y}
                  x2={walkway.line[1].x}
                  y2={walkway.line[1].y}
                  stroke="#b9a57a"
                  strokeWidth={3}
                  strokeDasharray="14 12"
                  strokeLinecap="round"
                />
              </g>
            ))}
            {layout.zones.map((zone) => {
              const style = ZONE_STYLE[zone.role]
              return (
                <g key={zone.role}>
                  <polygon
                    points={pointsAttr(zone.rug)}
                    fill={style.fill}
                    fillOpacity={zone.role === "visitor" ? 0.1 : 0.16}
                    stroke={style.stroke}
                    strokeOpacity={0.5}
                    strokeWidth={3}
                    strokeDasharray={style.dash}
                    strokeLinejoin="round"
                  />
                  <text
                    x={zone.labelAt.x}
                    y={zone.labelAt.y - 14}
                    textAnchor="middle"
                    fill={style.text}
                    fontSize={18}
                    fontWeight={700}
                    letterSpacing={2}
                  >
                    {zone.label.toUpperCase()}
                  </text>
                </g>
              )
            })}
          </svg>

          {layout.zones.map((zone) =>
            zone.tiles.length === 0 ? (
              <p
                key={`${zone.role}-empty`}
                className="pointer-events-none absolute w-56 -translate-x-1/2 -translate-y-1/2 text-center text-sm leading-5 text-slate-600"
                style={{ left: zone.center.x - origin.x, top: zone.center.y - origin.y }}
              >
                {zone.emptyMessage}
              </p>
            ) : null
          )}

          {layout.zones
            .flatMap((zone) => zone.tiles)
            .sort((a, b) => a.center.y - b.center.y)
            .map((tile) => (
              <MapTileView
                key={tile.space.id}
                tile={tile}
                left={tile.center.x - origin.x - TILE_ART_CX}
                top={tile.center.y - origin.y - TILE_ART_CY}
                zoom={view.s}
                onUnlock={onUnlock}
              />
            ))}
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-2 left-3 right-28 text-[11px] leading-4 text-slate-600">
        Drag to move, pinch or use the buttons to zoom · open a space or enter a code on a locked tile
      </p>

      <div className="absolute bottom-3 right-3 flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white/95 p-1 shadow-sm">
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={() => zoomBy(ZOOM_STEP)}>
          <Plus aria-hidden="true" />
        </Button>
        <span aria-label="Zoom level" className="text-[10px] font-medium tabular-nums text-slate-600">
          {percent}%
        </span>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={() => zoomBy(1 / ZOOM_STEP)}>
          <Minus aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Reset view" onClick={() => setView(fitView())}>
          <RotateCcw aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

function MapTileView({
  tile,
  left,
  top,
  zoom,
  onUnlock,
}: {
  tile: MapTile
  left: number
  top: number
  zoom: number
  onUnlock: (space: StudySpaceRecord) => void
}) {
  const { space, role } = tile
  const isLocked = role === "visitor"
  const tooltipId = `space-map-tip-${space.id}`
  const hitClass =
    "absolute inset-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3ead9]"

  const body = (
    <>
      <SpaceMapArt
        kind={space.kind}
        capacity={space.capacity}
        locked={isLocked}
        className={isLocked ? "opacity-55 grayscale" : "motion-safe:transition-transform motion-safe:group-hover:-translate-y-1"}
      />
      {isLocked && (
        <span className="absolute left-1/2 top-[88px] flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-slate-300 bg-white/95 text-slate-700 shadow-sm">
          <Lock className="size-4" aria-hidden="true" />
        </span>
      )}
      <span className="absolute inset-x-0 top-[178px] flex flex-col items-center px-3 text-center">
        <span className="max-w-full truncate text-[13px] font-semibold leading-4 text-slate-900">{space.name}</span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] leading-4 text-slate-600">
          <span className="flex gap-0.5" aria-hidden="true">
            {Array.from({ length: space.capacity }, (_, index) => (
              <span key={index} className="size-1.5 rounded-[2px] bg-slate-500" />
            ))}
          </span>
          {space.capacity} seats
        </span>
        {isLocked && <span className="text-[11px] font-medium leading-4 text-slate-700">Needs a space code</span>}
      </span>
    </>
  )

  return (
    <div
      className="group absolute focus-within:z-30 hover:z-30"
      style={{ left, top, width: TILE_W, height: TILE_H }}
    >
      {isLocked ? (
        <button
          type="button"
          data-map-tile=""
          tabIndex={-1}
          aria-label={tileAriaLabel(tile)}
          aria-describedby={tooltipId}
          className={hitClass}
          onClick={() => onUnlock(space)}
        >
          {body}
        </button>
      ) : (
        <Link
          to={`/students/study-spaces/${space.id}`}
          data-map-tile=""
          tabIndex={-1}
          aria-label={tileAriaLabel(tile)}
          aria-describedby={tooltipId}
          className={hitClass}
        >
          {body}
        </Link>
      )}

      <span
        className={`pointer-events-none absolute left-1 top-[58px] z-10 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-4 ${
          isLocked
            ? "border-slate-300 bg-white/90 text-slate-700"
            : role === "owner"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
        }`}
      >
        {isLocked ? (
          <>
            <Lock className="size-2.5" aria-hidden="true" />
            Locked
          </>
        ) : role === "owner" ? (
          "Yours"
        ) : (
          "Joined"
        )}
      </span>

      <div
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-2 z-40 w-52 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left opacity-0 shadow-md transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
        style={{ transform: `translateX(-50%) scale(${1 / zoom})`, transformOrigin: "50% 0" }}
      >
        <p className="text-xs font-semibold text-slate-900">{space.name}</p>
        <p className="text-[11px] leading-4 text-slate-600">
          {kindLabel(space.kind)} · {space.capacity} seats
        </p>
        <p className="text-[11px] font-medium leading-4 text-slate-800">
          {isLocked ? studySpacesLockedTooltip : stateLabel(role)}
        </p>
        <p className="text-[11px] leading-4 text-slate-500">
          {isLocked ? "Preview only — not opened" : `${metaLine(space)} · browser only`}
        </p>
      </div>
    </div>
  )
}
