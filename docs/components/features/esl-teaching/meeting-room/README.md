# meeting-room

This directory mirrors `src/components/features/esl-teaching/meeting-room/`. For the current files, proposed component folders, and manual migration checks, use the [esl-teaching guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/esl-teaching/meeting-room/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `esl-whiteboard-canvas.tsx`

Current file: `src/components/features/esl-teaching/meeting-room/esl-whiteboard-canvas.tsx`

```tsx
import { useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"
import {
  CLIPART_SIZE,
  SHAPE_SIZE,
  STICKY_SIZE,
  getPerson,
  itemBounds,
  moveItem,
  newId,
  starPoints,
  strokePath,
  type BoardItem,
  type Person,
  type PreviewRole,
  type StrokeItem,
  type Tool,
} from "./esl-whiteboard-model"

type Props = {
  items: BoardItem[]
  me: Person
  role: PreviewRole
  tool: Tool
  color: string
  width: number
  selectedId: string | null
  editingId: string | null
  showAuthors: boolean
  onSelect: (id: string | null) => void
  onEdit: (id: string | null) => void
  mutate: (fn: (items: BoardItem[]) => BoardItem[], record: boolean) => void
  onStatus: (message: string) => void
}

const itemLabel: Record<BoardItem["kind"], string> = {
  stroke: "Drawing",
  text: "Text",
  sticky: "Sticky note",
  clipart: "Clipart",
  shape: "Shape",
}

export default function EslWhiteboardCanvas({
  items,
  me,
  role,
  tool,
  color,
  width,
  selectedId,
  editingId,
  showAuthors,
  onSelect,
  onEdit,
  mutate,
  onStatus,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ id: string; x: number; y: number; recorded: boolean } | null>(null)
  const erasingRef = useRef<{ recorded: boolean } | null>(null)
  const [draft, setDraft] = useState<StrokeItem | null>(null)

  const canEdit = (item: BoardItem) => role === "teacher" || item.authorId === me.id
  const editing = items.find((item) => item.id === editingId)

  const point = (event: { clientX: number; clientY: number }): [number, number] => {
    const rect = svgRef.current?.getBoundingClientRect()
    return [event.clientX - (rect?.left ?? 0), event.clientY - (rect?.top ?? 0)]
  }

  const eraseAt = (event: ReactPointerEvent) => {
    const hit = document.elementFromPoint?.(event.clientX, event.clientY)?.closest("[data-item-id]")
    const id = hit?.getAttribute("data-item-id")
    const target = items.find((item) => item.id === id)
    if (!target) return
    if (!canEdit(target)) {
      onStatus("Learners can only erase their own marks.")
      return
    }
    const state = erasingRef.current
    mutate((current) => current.filter((item) => item.id !== target.id), !state?.recorded)
    if (state) state.recorded = true
    if (selectedId === target.id) onSelect(null)
  }

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return
    if (tool === "pen" || tool === "highlighter") {
      event.currentTarget.setPointerCapture?.(event.pointerId)
      onSelect(null)
      setDraft({
        id: newId(),
        authorId: me.id,
        kind: "stroke",
        points: [point(event)],
        color,
        width: tool === "highlighter" ? width * 3 : width,
        opacity: tool === "highlighter" ? 0.35 : 1,
      })
    } else if (tool === "eraser") {
      event.currentTarget.setPointerCapture?.(event.pointerId)
      erasingRef.current = { recorded: false }
      eraseAt(event)
    } else if (tool === "select") {
      onSelect(null)
    }
  }

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (draft) {
      const [x, y] = point(event)
      const last = draft.points[draft.points.length - 1]
      if (Math.hypot(x - last[0], y - last[1]) < 1.5) return
      setDraft({ ...draft, points: [...draft.points, [x, y]] })
    } else if (dragRef.current) {
      const [x, y] = point(event)
      const drag = dragRef.current
      const dx = x - drag.x
      const dy = y - drag.y
      if (!dx && !dy) return
      const record = !drag.recorded
      dragRef.current = { ...drag, x, y, recorded: true }
      mutate((current) => current.map((item) => (item.id === drag.id ? moveItem(item, dx, dy) : item)), record)
    } else if (erasingRef.current && event.buttons === 1) {
      eraseAt(event)
    }
  }

  const handlePointerEnd = () => {
    if (draft) {
      mutate((current) => [...current, draft], true)
      setDraft(null)
    }
    dragRef.current = null
    erasingRef.current = null
  }

  const handleClick = (event: { clientX: number; clientY: number }) => {
    if (tool !== "text" && tool !== "sticky") return
    const [x, y] = point(event)
    const id = newId()
    const created: BoardItem = tool === "text"
      ? { id, authorId: me.id, kind: "text", x, y, text: "", color, size: 28 }
      : { id, authorId: me.id, kind: "sticky", x: x - STICKY_SIZE.w / 2, y: y - STICKY_SIZE.h / 2, text: "" }
    mutate((current) => [...current, created], true)
    onSelect(id)
    onEdit(id)
  }

  const startDrag = (event: ReactPointerEvent, item: BoardItem) => {
    if (tool !== "select") return
    event.stopPropagation()
    onSelect(item.id)
    if (!canEdit(item)) {
      onStatus("Only the teacher can move this item.")
      return
    }
    svgRef.current?.setPointerCapture?.(event.pointerId)
    const [x, y] = point(event)
    dragRef.current = { id: item.id, x, y, recorded: false }
  }

  const finishEdit = (item: BoardItem, value: string) => {
    const text = value.trim()
    if (item.kind !== "text" && item.kind !== "sticky") return
    if (!text) mutate((current) => current.filter((entry) => entry.id !== item.id), false)
    else if (text !== item.text) {
      mutate((current) => current.map((entry) => (entry.id === item.id && (entry.kind === "text" || entry.kind === "sticky") ? { ...entry, text } : entry)), true)
    }
    onEdit(null)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (editingId) return
    const selected = items.find((item) => item.id === selectedId)
    if (!selected) return
    if (event.key === "Escape") {
      onSelect(null)
      return
    }
    if (!canEdit(selected)) return
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault()
      mutate((current) => current.filter((item) => item.id !== selected.id), true)
      onSelect(null)
      onStatus("Item removed from this page.")
    } else if (event.key === "Enter" && (selected.kind === "text" || selected.kind === "sticky")) {
      event.preventDefault()
      onEdit(selected.id)
    } else if (event.key.startsWith("Arrow")) {
      event.preventDefault()
      const step = event.shiftKey ? 32 : 8
      const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0
      const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0
      mutate((current) => current.map((item) => (item.id === selected.id ? moveItem(item, dx, dy) : item)), true)
    }
  }

  const renderItem = (item: BoardItem) => {
    const author = getPerson(item.authorId)
    const common = {
      "data-item-id": item.id,
      "data-item-kind": item.kind,
      "data-author": item.authorId,
      role: "button" as const,
      tabIndex: tool === "select" ? 0 : -1,
      "aria-pressed": selectedId === item.id,
      "aria-label": `${itemLabel[item.kind]}${"label" in item ? `, ${item.label}` : ""}${"text" in item && item.text ? `, "${item.text}"` : ""}, by ${author.name}`,
      onPointerDown: (event: ReactPointerEvent) => startDrag(event, item),
      onFocus: () => onSelect(item.id),
      onDoubleClick: () => {
        if (tool === "select" && canEdit(item) && (item.kind === "text" || item.kind === "sticky")) onEdit(item.id)
      },
      className: tool === "select" ? "cursor-move outline-none" : "outline-none",
    }

    if (item.kind === "stroke") {
      return (
        <g {...common} key={item.id}>
          <path d={strokePath(item.points)} fill="none" stroke="transparent" strokeWidth={Math.max(item.width, 18)} strokeLinecap="round" strokeLinejoin="round" />
          <path
            d={strokePath(item.points)}
            data-item-id={item.id}
            data-item-kind="stroke-path"
            fill="none"
            stroke={item.color}
            strokeOpacity={item.opacity}
            strokeWidth={item.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )
    }
    if (item.kind === "text") {
      const lines = item.text.split("\n")
      return (
        <text {...common} key={item.id} x={item.x} y={item.y} fill={item.color} fontSize={item.size} fontWeight={700} dominantBaseline="hanging">
          {lines.map((line, index) => <tspan key={index} x={item.x} dy={index === 0 ? 0 : item.size * 1.3}>{line}</tspan>)}
        </text>
      )
    }
    if (item.kind === "sticky") {
      return (
        <g {...common} key={item.id} transform={`translate(${item.x} ${item.y})`}>
          <rect width={STICKY_SIZE.w} height={STICKY_SIZE.h} rx={4} fill="#fde68a" filter="url(#esl-wb-shadow)" />
          <foreignObject width={STICKY_SIZE.w} height={STICKY_SIZE.h}>
            <div className="size-full break-words p-3 text-base leading-snug whitespace-pre-wrap text-slate-700">{item.text}</div>
          </foreignObject>
        </g>
      )
    }
    if (item.kind === "clipart") {
      return item.src ? (
        <image {...common} key={item.id} href={item.src} x={item.x} y={item.y} width={CLIPART_SIZE} height={CLIPART_SIZE} preserveAspectRatio="xMidYMid meet" />
      ) : (
        <text {...common} key={item.id} x={item.x} y={item.y} fontSize={CLIPART_SIZE - 16} dominantBaseline="hanging">{item.glyph}</text>
      )
    }
    const { x, y, color: fill } = item
    return (
      <g {...common} key={item.id}>
        {item.shape === "circle" && <circle cx={x + SHAPE_SIZE / 2} cy={y + SHAPE_SIZE / 2} r={46} fill={fill} />}
        {item.shape === "square" && <rect x={x + 4} y={y + 4} width={SHAPE_SIZE - 8} height={SHAPE_SIZE - 8} rx={10} fill={fill} />}
        {item.shape === "triangle" && <polygon points={`${x + 50},${y + 4} ${x + 96},${y + 92} ${x + 4},${y + 92}`} fill={fill} strokeLinejoin="round" />}
        {item.shape === "star" && <polygon points={starPoints(x, y)} fill={fill} strokeLinejoin="round" />}
      </g>
    )
  }

  const selected = items.find((item) => item.id === selectedId && item.id !== editingId)
  const selectedBounds = selected ? itemBounds(selected) : null
  const editingBounds = editing ? itemBounds(editing) : null

  return (
    <div
      role="group"
      aria-label="Whiteboard canvas"
      onKeyDown={handleKeyDown}
      className="relative h-full min-h-[720px] min-w-[1200px]"
    >
      <svg
        ref={svgRef}
        data-testid="board-surface"
        className={`absolute inset-0 size-full touch-none select-none ${tool === "select" ? "cursor-default" : tool === "text" || tool === "sticky" ? "cursor-text" : "cursor-crosshair"}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClick={handleClick}
      >
        <defs>
          <filter id="esl-wb-shadow" x="-10%" y="-10%" width="130%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.18" />
          </filter>
        </defs>
        {items.filter((item) => item.id !== editingId).map(renderItem)}
        {draft && (
          <path d={strokePath(draft.points)} fill="none" stroke={draft.color} strokeOpacity={draft.opacity} strokeWidth={draft.width} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
        )}
        {showAuthors && items.filter((item) => item.id !== editingId && item.authorId !== "teacher").map((item) => {
          const bounds = itemBounds(item)
          return (
            <text key={`author-${item.id}`} x={bounds.x} y={bounds.y - 6} fontSize={12} fontWeight={600} fill="#0f172a" stroke="#ffffff" strokeWidth={4} paintOrder="stroke" pointerEvents="none">
              {getPerson(item.authorId).name}
            </text>
          )
        })}
        {selectedBounds && (
          <rect
            x={selectedBounds.x - 6}
            y={selectedBounds.y - 6}
            width={selectedBounds.w + 12}
            height={selectedBounds.h + 12}
            rx={6}
            fill="none"
            stroke="#2563eb"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            pointerEvents="none"
          />
        )}
      </svg>

      {editing && editingBounds && (editing.kind === "text" || editing.kind === "sticky") && (
        <textarea
          key={editing.id}
          autoFocus
          aria-label={editing.kind === "sticky" ? "Sticky note text" : "Board text"}
          defaultValue={editing.text}
          placeholder={editing.kind === "sticky" ? "Write a note" : "Type here"}
          onBlur={(event) => finishEdit(editing, event.currentTarget.value)}
          onKeyDown={(event) => {
            event.stopPropagation()
            if (event.key === "Escape" || (event.key === "Enter" && !event.shiftKey)) {
              event.preventDefault()
              event.currentTarget.blur()
            }
          }}
          style={{
            left: editingBounds.x,
            top: editingBounds.y,
            width: editing.kind === "sticky" ? STICKY_SIZE.w : Math.max(editingBounds.w + 80, 220),
            height: editing.kind === "sticky" ? STICKY_SIZE.h : Math.max(editingBounds.h + 12, 48),
            fontSize: editing.kind === "text" ? editing.size : 16,
            color: editing.kind === "text" ? editing.color : "#334155",
          }}
          className={`absolute z-10 resize-none rounded-md border-2 border-blue-500 p-2 font-semibold leading-snug outline-none ${editing.kind === "sticky" ? "bg-amber-200 shadow-lg" : "bg-white/90"}`}
        />
      )}
    </div>
  )
}
```

### `esl-whiteboard-model.ts`

Current file: `src/components/features/esl-teaching/meeting-room/esl-whiteboard-model.ts`

```ts
export type PreviewRole = "teacher" | "learner"
export type Tool = "select" | "pen" | "highlighter" | "eraser" | "text" | "sticky"
export type ShapeName = "circle" | "square" | "triangle" | "star"
export type Person = { id: string; name: string }

export const people: Person[] = [
  { id: "teacher", name: "Teacher" },
  { id: "learner-1", name: "Learner 1" },
  { id: "learner-2", name: "Learner 2" },
]

export function getMe(role: PreviewRole): Person {
  return role === "teacher" ? people[0] : people[1]
}

export function getPerson(id: string): Person {
  return people.find((person) => person.id === id) ?? people[0]
}

type Base = { id: string; authorId: string }
export type StrokeItem = Base & {
  kind: "stroke"
  points: [number, number][]
  color: string
  width: number
  opacity: number
}
export type BoardItem =
  | StrokeItem
  | (Base & { kind: "text"; x: number; y: number; text: string; color: string; size: number })
  | (Base & { kind: "sticky"; x: number; y: number; text: string })
  | (Base & { kind: "clipart"; x: number; y: number; glyph: string; src?: string; label: string })
  | (Base & { kind: "shape"; x: number; y: number; shape: ShapeName; color: string; label: string })

export type Bounds = { x: number; y: number; w: number; h: number }

export const STICKY_SIZE = { w: 176, h: 132 }
export const CLIPART_SIZE = 96
export const SHAPE_SIZE = 100

let counter = 0
export function newId() {
  counter += 1
  return `item-${counter}`
}

export const toolsByRole: Record<PreviewRole, Tool[]> = {
  teacher: ["select", "pen", "highlighter", "eraser", "text", "sticky"],
  learner: ["select", "pen", "eraser", "text"],
}

export const toolLabels: Record<Tool, { label: string; key: string }> = {
  select: { label: "Select and move", key: "V" },
  pen: { label: "Pen", key: "P" },
  highlighter: { label: "Highlighter", key: "H" },
  eraser: { label: "Eraser", key: "E" },
  text: { label: "Text", key: "T" },
  sticky: { label: "Sticky note", key: "N" },
}

export const palette = [
  { value: "#1e293b", name: "Black" },
  { value: "#e11d48", name: "Red" },
  { value: "#2563eb", name: "Blue" },
  { value: "#16a34a", name: "Green" },
  { value: "#f97316", name: "Orange" },
  { value: "#7c3aed", name: "Purple" },
]

export const strokeWidths = [
  { value: 3, name: "Thin" },
  { value: 6, name: "Medium" },
  { value: 10, name: "Thick" },
]

export const shapeColors: Record<ShapeName, string> = {
  circle: "#fb7185",
  square: "#38bdf8",
  triangle: "#fbbf24",
  star: "#a78bfa",
}

export type LibraryTab = "clipart" | "shapes" | "words" | "prompts"
export const libraryTabs: { id: LibraryTab; label: string }[] = [
  { id: "clipart", label: "Clipart" },
  { id: "shapes", label: "Shapes" },
  { id: "words", label: "Words" },
  { id: "prompts", label: "Prompts" },
]

export const clipart: { glyph: string; label: string; src?: string }[] = [
  { glyph: "🦉", label: "Owlio owl", src: "/mascot/owlio-owl.png" },
  { glyph: "☀️", label: "Sun" },
  { glyph: "🌱", label: "Grass" },
  { glyph: "🐶", label: "Dog" },
  { glyph: "🐱", label: "Cat" },
  { glyph: "🕐", label: "Clock" },
  { glyph: "🧸", label: "Teddy bear" },
  { glyph: "🍎", label: "Apple" },
  { glyph: "🌍", label: "Globe" },
  { glyph: "📚", label: "Books" },
  { glyph: "✏️", label: "Pencil" },
  { glyph: "🏠", label: "House" },
  { glyph: "🚌", label: "Bus" },
  { glyph: "⚽", label: "Ball" },
  { glyph: "🎂", label: "Cake" },
  { glyph: "🌧️", label: "Rain" },
]

export const shapeLibrary: { shape: ShapeName; label: string }[] = [
  { shape: "circle", label: "Circle" },
  { shape: "square", label: "Square" },
  { shape: "triangle", label: "Triangle" },
  { shape: "star", label: "Star" },
]

export const words = ["apple", "happy", "run", "big", "small", "teacher", "morning", "because", "always", "yesterday"]

export const prompts = [
  "Find the circle",
  "Find the blue shape",
  "Choose the shape with three sides",
  "What do you see?",
  "Say it in a full sentence",
]

export function itemBounds(item: BoardItem): Bounds {
  if (item.kind === "stroke") {
    const xs = item.points.map(([x]) => x)
    const ys = item.points.map(([, y]) => y)
    const pad = item.width / 2 + 4
    const x = Math.min(...xs) - pad
    const y = Math.min(...ys) - pad
    return { x, y, w: Math.max(...xs) - x + pad, h: Math.max(...ys) - y + pad }
  }
  if (item.kind === "text") {
    const lines = item.text.split("\n")
    const longest = Math.max(...lines.map((line) => line.length), 1)
    return { x: item.x, y: item.y, w: longest * item.size * 0.58 + 12, h: lines.length * item.size * 1.3 + 4 }
  }
  if (item.kind === "sticky") return { x: item.x, y: item.y, ...STICKY_SIZE }
  if (item.kind === "clipart") return { x: item.x, y: item.y, w: CLIPART_SIZE, h: CLIPART_SIZE }
  return { x: item.x, y: item.y, w: SHAPE_SIZE, h: SHAPE_SIZE }
}

export function moveItem(item: BoardItem, dx: number, dy: number): BoardItem {
  if (item.kind === "stroke") {
    return { ...item, points: item.points.map(([x, y]) => [x + dx, y + dy] as [number, number]) }
  }
  return { ...item, x: item.x + dx, y: item.y + dy }
}

export function strokePath(points: [number, number][]) {
  const [first, ...rest] = points
  if (!first) return ""
  if (!rest.length) return `M ${first[0]} ${first[1]} l 0.01 0`
  return `M ${first[0]} ${first[1]} ${rest.map(([x, y]) => `L ${x} ${y}`).join(" ")}`
}

export function starPoints(x: number, y: number) {
  const cx = x + SHAPE_SIZE / 2
  const cy = y + SHAPE_SIZE / 2 + 3
  return Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? 48 : 20
    const angle = (Math.PI / 5) * index - Math.PI / 2
    return `${(cx + radius * Math.cos(angle)).toFixed(1)},${(cy + radius * Math.sin(angle)).toFixed(1)}`
  }).join(" ")
}

function ellipse(cx: number, cy: number, rx: number, ry: number): [number, number][] {
  return Array.from({ length: 33 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 32
    return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)] as [number, number]
  })
}

export function createSeedPages(): BoardItem[][] {
  const shapes: ShapeName[] = ["circle", "square", "triangle", "star"]
  return [
    [
      { id: "seed-prompt", authorId: "teacher", kind: "text", x: 90, y: 70, text: "Find the circle", color: "#1e3a8a", size: 44 },
      {
        id: "seed-underline",
        authorId: "teacher",
        kind: "stroke",
        points: [[90, 132], [200, 138], [330, 132], [420, 136]],
        color: "#e11d48",
        width: 5,
        opacity: 1,
      },
      ...shapes.map((shape, index): BoardItem => ({
        id: `seed-${shape}`,
        authorId: "teacher",
        kind: "shape",
        x: 110 + index * 200,
        y: 230,
        shape,
        color: shapeColors[shape],
        label: `${shape} shape`,
      })),
      { id: "seed-sticky", authorId: "teacher", kind: "sticky", x: 880, y: 90, text: "How are you today?" },
      {
        id: "seed-learner-circle",
        authorId: "learner-2",
        kind: "stroke",
        points: ellipse(160, 280, 78, 78),
        color: "#16a34a",
        width: 5,
        opacity: 1,
      },
    ],
    [],
  ]
}
```

### `esl-whiteboard-preview-route.ts`

Current file: `src/components/features/esl-teaching/meeting-room/esl-whiteboard-preview-route.ts`

```ts
export function shouldShowEslWhiteboardPreview(role: string, flag: string | null) {
  return role === "esl" && flag === "1"
}
```

### `esl-whiteboard-preview.test.tsx`

Current file: `src/components/features/esl-teaching/meeting-room/esl-whiteboard-preview.test.tsx`

```tsx
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it } from "vitest"
import EslWhiteboardPreview from "./esl-whiteboard-preview"
import { shouldShowEslWhiteboardPreview } from "./esl-whiteboard-preview-route"

afterEach(cleanup)

function renderBoard() {
  return render(
    <MemoryRouter>
      <EslWhiteboardPreview />
    </MemoryRouter>,
  )
}

describe("ESL whiteboard preview", () => {
  it("is only enabled for the ESL workspace preview flag", () => {
    expect(shouldShowEslWhiteboardPreview("esl", "1")).toBe(true)
    expect(shouldShowEslWhiteboardPreview("esl", null)).toBe(false)
    expect(shouldShowEslWhiteboardPreview("educators", "1")).toBe(false)
  })

  it("labels the board as a local preview and shows the teaching layout", () => {
    renderBoard()

    expect(screen.getByRole("heading", { name: "ESL Meeting Room" })).toBeTruthy()
    expect(screen.getByRole("status").textContent).toContain("not shared or saved")
    expect(screen.getByRole("complementary", { name: "Library" })).toBeTruthy()
    expect(screen.getByRole("toolbar", { name: "Whiteboard tools" })).toBeTruthy()
    expect(screen.getByText("1 / 2")).toBeTruthy()
  })

  it("adds library content to the board and supports undo and redo", () => {
    renderBoard()

    fireEvent.click(screen.getByRole("button", { name: "Add Sun clipart" }))
    expect(screen.getByRole("button", { name: /^Clipart.*by Teacher$/ })).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: /^Undo/ }))
    expect(screen.queryByRole("button", { name: /^Clipart.*by Teacher$/ })).toBeNull()

    fireEvent.click(screen.getByRole("button", { name: /^Redo/ }))
    expect(screen.getByRole("button", { name: /^Clipart.*by Teacher$/ })).toBeTruthy()
  })

  it("lets the teacher add and navigate pages", () => {
    renderBoard()

    fireEvent.click(screen.getByRole("button", { name: "Add page" }))
    expect(screen.getByText("3 / 3")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "Previous page" }))
    expect(screen.getByText("2 / 3")).toBeTruthy()
  })

  it("lets the teacher delete a selected item with the keyboard", () => {
    renderBoard()
    const sticky = screen.getByRole("button", { name: /Sticky note.*How are you today\?/ })

    fireEvent.focus(sticky)
    fireEvent.keyDown(sticky, { key: "Delete" })

    expect(screen.queryByRole("button", { name: /Sticky note.*How are you today\?/ })).toBeNull()
  })

  it("limits learners to their own tools and cannot remove teacher content", () => {
    renderBoard()

    fireEvent.click(screen.getByRole("button", { name: "learner" }))

    expect(screen.queryByRole("complementary", { name: "Library" })).toBeNull()
    expect(screen.queryByRole("button", { name: /^Sticky note \(N\)/ })).toBeNull()
    expect(screen.getByRole("button", { name: /^Text \(T\)/ })).toBeTruthy()
    expect(screen.queryByRole("button", { name: /^Highlighter/ })).toBeNull()
    expect(screen.queryByRole("button", { name: "Clear page" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Add page" })).toBeNull()

    const sticky = screen.getByRole("button", { name: /Sticky note.*How are you today\?/ })
    fireEvent.focus(sticky)
    fireEvent.keyDown(sticky, { key: "Delete" })

    expect(screen.getByRole("button", { name: /Sticky note.*How are you today\?/ })).toBeTruthy()
  })

  it("draws attributed pen strokes on the surface", () => {
    const { container } = renderBoard()
    const surface = screen.getByTestId("board-surface")
    const strokes = () => container.querySelectorAll('g[data-item-kind="stroke"]').length
    const before = strokes()

    fireEvent.click(screen.getByRole("button", { name: /^Pen/ }))
    fireEvent.pointerDown(surface, { button: 0, buttons: 1, pointerId: 1, clientX: 300, clientY: 500 })
    fireEvent.pointerMove(surface, { buttons: 1, pointerId: 1, clientX: 340, clientY: 520 })
    fireEvent.pointerMove(surface, { buttons: 1, pointerId: 1, clientX: 380, clientY: 540 })
    fireEvent.pointerUp(surface, { pointerId: 1, clientX: 380, clientY: 540 })

    expect(strokes()).toBe(before + 1)
    expect(container.querySelector('g[data-item-kind="stroke"][data-author="teacher"]:last-of-type')).toBeTruthy()
  })
})
```

### `esl-whiteboard-preview.tsx`

Current file: `src/components/features/esl-teaching/meeting-room/esl-whiteboard-preview.tsx`

```tsx
import { useState, type KeyboardEvent } from "react"
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Highlighter,
  Mic,
  MicOff,
  MousePointer2,
  Pencil,
  Plus,
  Redo2,
  Search,
  Shapes,
  Smile,
  StickyNote,
  Trash2,
  Type,
  Undo2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"
import { Link } from "react-router"
import EslWhiteboardCanvas from "./esl-whiteboard-canvas"
import {
  clipart,
  createSeedPages,
  getMe,
  getPerson,
  libraryTabs,
  newId,
  palette,
  people,
  prompts,
  shapeColors,
  shapeLibrary,
  strokeWidths,
  toolLabels,
  toolsByRole,
  words,
  type BoardItem,
  type LibraryTab,
  type PreviewRole,
  type Tool,
} from "./esl-whiteboard-model"

const toolIcons: Record<Tool, LucideIcon> = {
  select: MousePointer2,
  pen: Pencil,
  highlighter: Highlighter,
  eraser: Eraser,
  text: Type,
  sticky: StickyNote,
}

const tabIcons: Record<LibraryTab, LucideIcon> = {
  clipart: Smile,
  shapes: Shapes,
  words: BookOpen,
  prompts: Type,
}

const shortcutTools: Record<string, Tool> = { v: "select", p: "pen", h: "highlighter", e: "eraser", t: "text", n: "sticky" }
const defaultStatus = "Preview only. Changes stay in this browser tab and are not shared or saved."

export default function EslWhiteboardPreview() {
  const [role, setRole] = useState<PreviewRole>("teacher")
  const [pages, setPages] = useState<BoardItem[][]>(createSeedPages)
  const [past, setPast] = useState<BoardItem[][][]>([])
  const [future, setFuture] = useState<BoardItem[][][]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [tool, setTool] = useState<Tool>("select")
  const [color, setColor] = useState(palette[2].value)
  const [width, setWidth] = useState(strokeWidths[1].value)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [libraryTab, setLibraryTab] = useState<LibraryTab | null>("clipart")
  const [search, setSearch] = useState("")
  const [showAuthors, setShowAuthors] = useState(true)
  const [status, setStatus] = useState(defaultStatus)

  const me = getMe(role)
  const items = pages[pageIndex] ?? []
  const allowedTools = toolsByRole[role]
  const isTeacher = role === "teacher"
  const query = search.trim().toLowerCase()
  const matches = (label: string) => !query || label.toLowerCase().includes(query)

  const mutate = (fn: (current: BoardItem[]) => BoardItem[], record: boolean) => {
    if (record) {
      setPast((history) => [...history.slice(-49), pages])
      setFuture([])
    }
    setPages((current) => current.map((page, index) => (index === pageIndex ? fn(page) : page)))
  }

  const restore = (next: BoardItem[][]) => {
    setPages(next)
    setPageIndex((index) => Math.min(index, next.length - 1))
    setSelectedId(null)
    setEditingId(null)
  }

  const undo = () => {
    const previous = past[past.length - 1]
    if (!previous) return
    setPast(past.slice(0, -1))
    setFuture([pages, ...future])
    restore(previous)
    setStatus("Undid the last change.")
  }

  const redo = () => {
    const [next, ...rest] = future
    if (!next) return
    setFuture(rest)
    setPast([...past, pages])
    restore(next)
    setStatus("Redid the change.")
  }

  const changeRole = (next: PreviewRole) => {
    setRole(next)
    setSelectedId(null)
    setEditingId(null)
    if (!toolsByRole[next].includes(tool)) setTool("select")
    setStatus(next === "learner" ? "Learner preview: you can draw, write, and erase your own marks." : defaultStatus)
  }

  const goToPage = (index: number) => {
    setPageIndex(index)
    setSelectedId(null)
    setEditingId(null)
  }

  const addPage = () => {
    setPast((history) => [...history.slice(-49), pages])
    setFuture([])
    setPages([...pages, []])
    goToPage(pages.length)
    setStatus(`Added page ${pages.length + 1}.`)
  }

  const clearPage = () => {
    mutate(() => [], true)
    setSelectedId(null)
    setStatus("Page cleared. Use Undo to bring it back.")
  }

  const addItem = (build: (x: number, y: number) => BoardItem, message: string) => {
    const x = 160 + (items.length % 6) * 48
    const y = 330 + (items.length % 5) * 36
    const item = build(x, y)
    mutate((current) => [...current, item], true)
    setSelectedId(item.id)
    setTool("select")
    setStatus(message)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable) return
    const key = event.key.toLowerCase()
    if ((event.ctrlKey || event.metaKey) && key === "z") {
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
    } else if ((event.ctrlKey || event.metaKey) && key === "y") {
      event.preventDefault()
      redo()
    } else if (!event.ctrlKey && !event.metaKey && !event.altKey && shortcutTools[key] && allowedTools.includes(shortcutTools[key])) {
      setTool(shortcutTools[key])
    }
  }

  const showProps = tool === "pen" || tool === "highlighter" || tool === "text"
  const counts = people.map((person) => ({ person, count: items.filter((item) => item.authorId === person.id).length }))

  return (
    <section aria-label="ESL whiteboard preview" onKeyDown={handleKeyDown} className="relative flex h-[calc(100dvh-12rem)] min-h-128 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-slate-100 text-slate-900">
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link to="/esl/classrooms/meeting-room" aria-label="Back to Meeting Room" className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <ArrowLeft aria-hidden="true" className="size-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">ESL Meeting Room</h1>
            <p className="truncate text-[11px] text-slate-500">Interactive whiteboard</p>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800 md:inline-flex">
            <span className="size-1.5 rounded-full bg-amber-500" />Preview only - not live
          </span>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1 py-1 shadow-sm" role="group" aria-label="Pages">
          <button type="button" onClick={() => goToPage(pageIndex - 1)} disabled={pageIndex === 0} aria-label="Previous page" className="flex size-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <ChevronLeft aria-hidden="true" className="size-4" />
          </button>
          <span className="min-w-16 text-center text-xs font-semibold tabular-nums" aria-live="polite">{pageIndex + 1} / {pages.length}</span>
          <button type="button" onClick={() => goToPage(pageIndex + 1)} disabled={pageIndex >= pages.length - 1} aria-label="Next page" className="flex size-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <ChevronRight aria-hidden="true" className="size-4" />
          </button>
          {isTeacher && (
            <button type="button" onClick={addPage} aria-label="Add page" title="Add page" className="flex size-8 items-center justify-center rounded-full text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <Plus aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5" role="group" aria-label="Preview as">
            {(["teacher", "learner"] as const).map((option) => (
              <button key={option} type="button" aria-pressed={role === option} onClick={() => changeRole(option)} className={`min-h-8 rounded-full px-3 text-xs font-semibold capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${role === option ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                {option}
              </button>
            ))}
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 sm:inline-flex">
            <Users aria-hidden="true" className="size-3.5" />{people.length}
          </span>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {isTeacher && (
          <>
            <nav aria-label="Board library" className="z-30 flex w-16 shrink-0 flex-col items-center gap-1 border-r border-slate-200 bg-white py-3">
              {libraryTabs.map(({ id, label }) => {
                const Icon = tabIcons[id]
                const active = libraryTab === id
                return (
                  <button key={id} type="button" aria-pressed={active} onClick={() => setLibraryTab(active ? null : id)} className={`flex w-14 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active ? "bg-amber-100 text-amber-900" : "text-slate-500 hover:bg-slate-100"}`}>
                    <Icon aria-hidden="true" className="size-5" />{label}
                  </button>
                )
              })}
            </nav>

            {libraryTab && (
              <aside aria-label="Library" className="absolute inset-y-0 left-16 z-20 flex w-72 flex-col border-r border-slate-200 bg-white shadow-xl md:static md:shadow-none">
                <div className="flex h-14 shrink-0 items-center justify-between px-4">
                  <h2 className="text-lg font-semibold">Library</h2>
                  <button type="button" onClick={() => setLibraryTab(null)} aria-label="Close library" className="flex size-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </div>
                <div className="px-4 pb-3">
                  <label htmlFor="library-search" className="sr-only">Search library</label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:ring-2 focus-within:ring-blue-500">
                    <Search aria-hidden="true" className="size-4 text-slate-400" />
                    <input id="library-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="min-h-10 min-w-0 flex-1 bg-transparent text-sm outline-none" />
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                  {libraryTab === "clipart" && (
                    <div className="grid grid-cols-2 gap-3">
                      {clipart.filter(({ label }) => matches(label)).map(({ glyph, label, src }) => (
                        <button key={label} type="button" aria-label={`Add ${label} clipart`} onClick={() => addItem((x, y) => ({ id: newId(), authorId: me.id, kind: "clipart", x, y, glyph, src, label }), `${label} added. Drag it, or use arrow keys to move it.`)} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white p-2 hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                          {src ? <img src={src} alt="" className="size-14 object-contain" /> : <span aria-hidden="true" className="text-5xl leading-none">{glyph}</span>}
                          <span className="max-w-full truncate text-[10px] text-slate-500">{label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {libraryTab === "shapes" && (
                    <div className="grid grid-cols-2 gap-3">
                      {shapeLibrary.filter(({ label }) => matches(label)).map(({ shape, label }) => (
                        <button key={shape} type="button" aria-label={`Add ${label} shape`} onClick={() => addItem((x, y) => ({ id: newId(), authorId: me.id, kind: "shape", x, y, shape, color: shapeColors[shape], label: `${shape} shape` }), `${label} added.`)} className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                          <Shapes aria-hidden="true" className="size-9" style={{ color: shapeColors[shape] }} />
                          <span className="text-[11px] text-slate-600">{label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {libraryTab === "words" && (
                    <ul className="grid grid-cols-2 gap-2">
                      {words.filter(matches).map((word) => (
                        <li key={word}>
                          <button type="button" aria-label={`Add word ${word}`} onClick={() => addItem((x, y) => ({ id: newId(), authorId: me.id, kind: "sticky", x, y, text: word }), `Word card "${word}" added.`)} className="min-h-12 w-full rounded-lg bg-amber-100 px-3 text-sm font-semibold text-amber-900 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{word}</button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {libraryTab === "prompts" && (
                    <ul className="space-y-2">
                      {prompts.filter(matches).map((prompt) => (
                        <li key={prompt}>
                          <button type="button" aria-label={`Add prompt ${prompt}`} onClick={() => addItem((x, y) => ({ id: newId(), authorId: me.id, kind: "text", x, y, text: prompt, color: "#1e3a8a", size: 36 }), "Prompt added to the board.")} className="min-h-12 w-full rounded-lg border border-slate-200 px-3 text-left text-sm font-medium hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{prompt}</button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-4 text-[10px] leading-4 text-slate-400">Built-in teaching content only. File uploads are not part of this preview.</p>
                </div>
              </aside>
            )}
          </>
        )}

        <section data-theme-content aria-label="Whiteboard" className="relative min-w-0 flex-1 bg-white text-slate-900 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]">
          <div className="absolute inset-0 overflow-auto">
            <EslWhiteboardCanvas
              items={items}
              me={me}
              role={role}
              tool={tool}
              color={color}
              width={width}
              selectedId={selectedId}
              editingId={editingId}
              showAuthors={showAuthors}
              onSelect={setSelectedId}
              onEdit={setEditingId}
              mutate={mutate}
              onStatus={setStatus}
            />
          </div>

          {showProps && (
            <div role="group" aria-label="Tool options" className="absolute left-3 top-3 z-10 w-44 space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
              <div>
                <p className="mb-1.5 text-[11px] font-semibold text-slate-500">Color</p>
                <div className="flex flex-wrap gap-1.5">
                  {palette.map(({ value, name }) => (
                    <button key={value} type="button" aria-label={name} aria-pressed={color === value} onClick={() => setColor(value)} style={{ backgroundColor: value }} className={`size-7 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${color === value ? "ring-2 ring-slate-900 ring-offset-1" : ""}`} />
                  ))}
                </div>
              </div>
              {tool !== "text" && (
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold text-slate-500">Stroke</p>
                  <div className="flex gap-1.5">
                    {strokeWidths.map(({ value, name }) => (
                      <button key={value} type="button" aria-label={`${name} stroke`} aria-pressed={width === value} onClick={() => setWidth(value)} className={`flex h-8 flex-1 items-center justify-center rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${width === value ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}>
                        <span className="w-6 rounded-full bg-slate-700" style={{ height: value / 2 + 1 }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <p role="status" className="pointer-events-none absolute bottom-20 left-3 z-10 max-w-[18rem] rounded-lg bg-slate-900/85 px-3 py-2 text-[11px] leading-4 text-white sm:bottom-4">{status}</p>

          <div role="toolbar" aria-label="Whiteboard tools" className="absolute bottom-4 left-1/2 z-10 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
            <ToolButton icon={Undo2} label="Undo (Ctrl+Z)" onClick={undo} disabled={!past.length} />
            <ToolButton icon={Redo2} label="Redo (Ctrl+Y)" onClick={redo} disabled={!future.length} />
            <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-slate-200" />
            {allowedTools.map((id) => (
              <ToolButton key={id} icon={toolIcons[id]} label={`${toolLabels[id].label} (${toolLabels[id].key})`} active={tool === id} onClick={() => { setTool(id); setStatus(`${toolLabels[id].label} tool selected.`) }} accent={id === "sticky"} />
            ))}
            {isTeacher && (
              <>
                <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-slate-200" />
                <ToolButton icon={Trash2} label="Clear page" onClick={clearPage} disabled={!items.length} />
              </>
            )}
          </div>
        </section>

        <aside aria-label="Room participants" className="hidden w-60 shrink-0 flex-col gap-3 overflow-y-auto border-l border-slate-200 bg-slate-50 p-3 lg:flex">
          {people.map((person) => {
            const you = person.id === me.id
            return (
              <article key={person.id} className="relative flex aspect-video items-end overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-200 to-slate-100">
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-12 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-lg font-semibold text-blue-700">{person.name.slice(0, 1)}</span>
                </span>
                <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold text-slate-500">Demo</span>
                <span className="relative flex w-full items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2 text-[11px] font-medium text-white">
                  <span className="truncate">{person.name}{you ? " (you)" : ""}</span>
                  {person.id === "teacher" ? <Mic aria-label="Microphone on" className="size-3.5" /> : <MicOff aria-label="Microphone off" className="size-3.5" />}
                </span>
              </article>
            )
          })}

          <section aria-label="Authors on this page" className="rounded-xl border border-slate-200 bg-white p-3">
            <h2 className="text-xs font-semibold">Marks on this page</h2>
            <ul className="mt-2 space-y-1.5">
              {counts.map(({ person, count }) => (
                <li key={person.id} className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>{person.name}{person.id === me.id ? " (you)" : ""}</span>
                  <span className="tabular-nums text-slate-500">{count}</span>
                </li>
              ))}
            </ul>
            <label className="mt-3 flex items-center gap-2 text-[11px] text-slate-600">
              <input type="checkbox" checked={showAuthors} onChange={(event) => setShowAuthors(event.target.checked)} className="size-3.5 accent-blue-600" />
              Show learner names on marks
            </label>
          </section>

          <p className="text-[10px] leading-4 text-slate-500">
            {isTeacher
              ? `${getPerson("teacher").name} controls prompts and can clear the page. Learners can only change their own marks.`
              : "Library and sticky notes are teacher-only. You can draw, write, and erase your own marks."}
            {" "}Nothing here is attendance, a grade, or a saved record.
          </p>
        </aside>
      </div>
    </section>
  )
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  disabled = false,
  accent = false,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  accent?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-35 ${active ? (accent ? "bg-amber-400 text-white" : "bg-blue-100 text-blue-700") : "text-slate-600 hover:bg-slate-100"}`}
    >
      <Icon aria-hidden="true" className="size-[18px]" />
    </button>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
