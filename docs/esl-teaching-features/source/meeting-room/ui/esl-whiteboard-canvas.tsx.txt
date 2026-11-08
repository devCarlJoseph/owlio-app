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
