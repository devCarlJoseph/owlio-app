import { useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { CircleDashed, Eraser, Megaphone, MousePointer2, Pencil, Shapes, Smile, Trash2, Undo2, X } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  ITEM_SIZE,
  boardColors,
  boardId,
  boardObjects,
  boardShapes,
  circleAround,
  clampToBoard,
  itemBounds,
  itemName,
  moveBoardItem,
  pathFor,
  shapePoints,
  type BoardItem,
  type BoardMarkItem,
  type BoardPoint,
  type BoardShape,
  type BoardState,
} from './meeting-whiteboard-model'

type ViewAs = 'teacher' | 'student'
type Tool = 'select' | 'pen' | 'eraser'
type Library = 'shapes' | 'objects'
type BoardPerson = { id: string; name: string }

const TEACHER_INK = '#e11d48'
const STUDENT_INK = '#2563eb'

export function MeetingWhiteboard({ board, onChange, host, hostLabel, learner, names, onClose }: {
  board: BoardState
  onChange: (next: BoardState) => void
  host: BoardPerson
  hostLabel: string
  learner: BoardPerson
  names: Record<string, string>
  onClose: () => void
}) {
  const [viewAs, setViewAs] = useState<ViewAs>('teacher')
  const [tool, setTool] = useState<Tool>('select')
  const [library, setLibrary] = useState<Library | null>(null)
  const [color, setColor] = useState(boardColors[1])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<BoardMarkItem | null>(null)
  const [past, setPast] = useState<BoardState[]>([])
  const [instructionDraft, setInstructionDraft] = useState(board.instruction ?? '')
  const [status, setStatus] = useState('Practice board · not a grade or attendance · stays in this browser tab.')
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ id: string; point: BoardPoint; recorded: boolean } | null>(null)

  const teacher = viewAs === 'teacher'
  const me = teacher ? host : learner
  const ink = teacher ? TEACHER_INK : STUDENT_INK
  const visible = board.items.filter(item => teacher || item.kind !== 'mark' || item.authorId === learner.id || item.authorId === host.id)
  const selected = visible.find(item => item.id === selectedId)
  const targets = board.items.filter(item => item.kind !== 'mark')
  const learnerMarks = board.items.filter(item => item.kind === 'mark' && item.authorId !== host.id)
  const suggestions = [...new Set(targets.map(item => `Encircle the ${itemName(item)}`))]
  const canChange = (item: BoardItem) => teacher || (item.kind === 'mark' && item.authorId === learner.id)
  const nameOf = (id: string) => names[id] ?? 'Participant'

  const commit = (next: BoardState, message?: string) => {
    if (teacher) setPast(history => [...history.slice(-29), board])
    onChange(next)
    if (message) setStatus(message)
  }
  const setItems = (items: BoardItem[], message?: string) => commit({ ...board, items }, message)

  const switchView = (next: ViewAs) => {
    setViewAs(next)
    setSelectedId(null)
    setLibrary(null)
    setTool(next === 'teacher' ? 'select' : 'pen')
    setStatus(next === 'teacher' ? `${hostLabel} view: add shapes or objects, then give an instruction.` : `Student view as ${learner.name}: draw a circle around your answer.`)
  }

  const toBoard = (event: { clientX: number; clientY: number }): BoardPoint => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return [0, 0]
    const scale = Math.min(rect.width / BOARD_WIDTH, rect.height / BOARD_HEIGHT) || 1
    const offsetX = (rect.width - BOARD_WIDTH * scale) / 2
    const offsetY = (rect.height - BOARD_HEIGHT * scale) / 2
    return [(event.clientX - rect.left - offsetX) / scale, (event.clientY - rect.top - offsetY) / scale]
  }

  const erase = (item: BoardItem) => {
    if (!canChange(item)) { setStatus('You can only erase your own marks.'); return }
    setItems(board.items.filter(entry => entry.id !== item.id), `${item.kind === 'mark' ? 'Mark' : itemName(item)} removed.`)
    if (selectedId === item.id) setSelectedId(null)
  }

  const addItem = (build: (x: number, y: number) => BoardItem, message: string) => {
    const count = targets.length
    const [x, y] = clampToBoard(120 + (count % 6) * 120, 90 + (Math.floor(count / 6) % 3) * 130)
    const item = build(x, y)
    setItems([...board.items, item], message)
    setSelectedId(item.id)
    setTool('select')
    setLibrary(null)
  }

  const circleSelected = () => {
    if (!selected || selected.kind === 'mark') return
    const mark: BoardMarkItem = { id: boardId(), authorId: me.id, kind: 'mark', color: ink, points: circleAround(itemBounds(selected)) }
    setItems([...board.items, mark], `You circled the ${itemName(selected)}.`)
  }

  const undo = () => {
    if (teacher) {
      const previous = past[past.length - 1]
      if (!previous) return
      setPast(past.slice(0, -1))
      onChange(previous)
      setStatus('Undid the last change.')
      return
    }
    const last = [...board.items].reverse().find(item => item.kind === 'mark' && item.authorId === learner.id)
    if (last) setItems(board.items.filter(item => item.id !== last.id), 'Removed your last mark.')
  }

  const sendInstruction = (event?: FormEvent, text = instructionDraft) => {
    event?.preventDefault()
    const instruction = text.trim()
    if (!instruction) return
    setInstructionDraft(instruction)
    commit({ ...board, instruction }, `Instruction shown to students: “${instruction}”.`)
  }

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return
    if (tool === 'pen') {
      event.currentTarget.setPointerCapture?.(event.pointerId)
      setSelectedId(null)
      setDraft({ id: boardId(), authorId: me.id, kind: 'mark', color: ink, points: [toBoard(event)] })
    } else if (tool === 'select') setSelectedId(null)
  }

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (draft) {
      const point = toBoard(event)
      const last = draft.points[draft.points.length - 1]
      if (Math.hypot(point[0] - last[0], point[1] - last[1]) >= 2) setDraft({ ...draft, points: [...draft.points, point] })
      return
    }
    const drag = dragRef.current
    if (!drag) return
    const point = toBoard(event)
    const dx = point[0] - drag.point[0]
    const dy = point[1] - drag.point[1]
    if (!dx && !dy) return
    if (!drag.recorded) setPast(history => [...history.slice(-29), board])
    dragRef.current = { ...drag, point, recorded: true }
    onChange({ ...board, items: board.items.map(item => item.id === drag.id ? moveBoardItem(item, dx, dy) : item) })
  }

  const handlePointerEnd = () => {
    if (draft) {
      if (draft.points.length > 2) setItems([...board.items, draft], teacher ? 'Annotation added.' : 'Your mark was added. Your teacher can see it.')
      setDraft(null)
    }
    dragRef.current = null
  }

  const handleItemPointerDown = (event: ReactPointerEvent, item: BoardItem) => {
    if (tool === 'eraser') { event.stopPropagation(); erase(item); return }
    if (tool !== 'select') return
    event.stopPropagation()
    setSelectedId(item.id)
    if (!teacher || item.kind === 'mark') return
    svgRef.current?.setPointerCapture?.(event.pointerId)
    dragRef.current = { id: item.id, point: toBoard(event), recorded: false }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!selected) return
    if (event.key === 'Escape') { setSelectedId(null); return }
    if (!teacher && event.key === 'Enter' && selected.kind !== 'mark') { event.preventDefault(); circleSelected(); return }
    if (!canChange(selected)) return
    if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); erase(selected) }
    else if (teacher && event.key.startsWith('Arrow')) {
      event.preventDefault()
      const step = event.shiftKey ? 40 : 10
      const dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0
      const dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0
      setItems(board.items.map(item => item.id === selected.id ? moveBoardItem(item, dx, dy) : item))
    }
  }

  const tools: { id: Tool; label: string; icon: ReactNode }[] = [
    { id: 'select', label: teacher ? 'Select and move' : 'Select an item', icon: <MousePointer2 aria-hidden="true" /> },
    { id: 'pen', label: teacher ? 'Pen' : 'Draw a circle', icon: <Pencil aria-hidden="true" /> },
    { id: 'eraser', label: teacher ? 'Eraser' : 'Erase my marks', icon: <Eraser aria-hidden="true" /> },
  ]

  return <section aria-label="Whiteboard" className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card text-card-foreground shadow-xs">
    <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/70 px-3 py-2.5 sm:px-4">
      <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-soft-foreground"><Shapes className="size-4" /></span>
      <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">Whiteboard · Find the shape</h3><p className="truncate text-[11px] text-muted-foreground">Preview only · practice, not a grade · not shared or saved</p></div>
      <div role="group" aria-label="View board as" className="inline-flex rounded-full bg-muted p-0.5">
        {(['teacher', 'student'] as const).map(option => <button key={option} type="button" aria-pressed={viewAs === option} onClick={() => switchView(option)} className={cn('min-h-8 rounded-full px-3 text-xs font-medium focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none', viewAs === option ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')}>{option === 'teacher' ? hostLabel : 'Student'}</button>)}
      </div>
      <Button variant="ghost" size="icon-sm" aria-label="Close whiteboard" title="Close whiteboard" onClick={onClose}><X aria-hidden="true" /></Button>
    </header>

    {teacher && <form onSubmit={sendInstruction} className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/70 px-3 py-2 sm:px-4">
      <label htmlFor="board-instruction" className="sr-only">Instruction for students</label>
      <Input id="board-instruction" value={instructionDraft} maxLength={80} onChange={event => setInstructionDraft(event.target.value)} placeholder="e.g. Encircle the square" className="h-9 min-w-40 flex-1 text-sm" />
      <Button type="submit" size="sm" className="h-9 bg-brand text-brand-foreground hover:bg-brand/90" disabled={!instructionDraft.trim()}><Megaphone aria-hidden="true" />Give instruction</Button>
      <div className="flex w-full gap-1.5 overflow-x-auto pb-0.5" role="group" aria-label="Suggested instructions">
        {suggestions.map(text => <button key={text} type="button" onClick={() => sendInstruction(undefined, text)} className="shrink-0 rounded-full border border-border/70 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-brand/50 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">{text}</button>)}
      </div>
    </form>}

    <div data-theme-content className="relative min-h-64 flex-1 bg-white text-slate-900 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:22px_22px]" onKeyDown={handleKeyDown}>
      <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center px-3">
        <div role="status" aria-label="Current instruction" className="flex max-w-full items-center gap-2 rounded-full bg-slate-900/90 py-1.5 pr-4 pl-1.5 text-white shadow-lg">
          <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-white/15"><Megaphone className="size-3.5" /></span>
          <span className="min-w-0 truncate text-sm font-semibold">{board.instruction ?? (teacher ? 'No instruction yet' : `Waiting for ${host.name}`)}</span>
          {board.instruction && !teacher && <span className="hidden shrink-0 text-[11px] text-white/70 sm:inline">· Draw a circle around your answer</span>}
        </div>
      </div>

      <svg ref={svgRef} data-testid="board-surface" viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} preserveAspectRatio="xMidYMid meet" aria-label="Board items"
        className={cn('absolute inset-0 size-full touch-none select-none', tool === 'pen' ? 'cursor-crosshair' : tool === 'eraser' ? 'cursor-cell' : 'cursor-default')}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd}>
        {visible.map(item => {
          const author = nameOf(item.authorId)
          const common = {
            'data-item-id': item.id,
            'data-item-kind': item.kind,
            'data-author': item.authorId,
            role: 'button' as const,
            tabIndex: 0,
            'aria-pressed': selectedId === item.id,
            'aria-label': item.kind === 'mark' ? `Circle mark by ${item.authorId === me.id ? 'you' : author}` : `${itemName(item)}${item.kind === 'shape' ? ' shape' : ''}`,
            onPointerDown: (event: ReactPointerEvent) => handleItemPointerDown(event, item),
            onPointerEnter: (event: ReactPointerEvent) => { if (tool === 'eraser' && event.buttons === 1) erase(item) },
            onFocus: () => setSelectedId(item.id),
            className: cn('outline-none', tool === 'select' && teacher && item.kind !== 'mark' && 'cursor-move'),
          }
          if (item.kind === 'mark') {
            const bounds = itemBounds(item)
            return <g key={item.id} {...common}>
              <path d={pathFor(item.points)} fill="none" stroke="transparent" strokeWidth={18} strokeLinecap="round" />
              <path d={pathFor(item.points)} fill="none" stroke={item.color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
              {teacher && item.authorId !== host.id && <text x={bounds.x} y={bounds.y - 8} fontSize={14} fontWeight={600} fill="#0f172a" stroke="#ffffff" strokeWidth={4} paintOrder="stroke" pointerEvents="none">{author}</text>}
            </g>
          }
          if (item.kind === 'object') {
            return <g key={item.id} {...common}>
              <rect x={item.x} y={item.y} width={ITEM_SIZE} height={ITEM_SIZE} fill="transparent" />
              {item.src ? <image href={item.src} x={item.x + 6} y={item.y + 6} width={ITEM_SIZE - 12} height={ITEM_SIZE - 12} preserveAspectRatio="xMidYMid meet" />
                : <text x={item.x + ITEM_SIZE / 2} y={item.y + ITEM_SIZE / 2} fontSize={72} textAnchor="middle" dominantBaseline="central">{item.glyph}</text>}
            </g>
          }
          return <g key={item.id} {...common}><ShapeGlyph shape={item.shape} x={item.x} y={item.y} fill={item.color} /></g>
        })}
        {draft && <path d={pathFor(draft.points)} fill="none" stroke={draft.color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />}
        {selected && (() => {
          const bounds = itemBounds(selected)
          return <rect x={bounds.x - 8} y={bounds.y - 8} width={bounds.w + 16} height={bounds.h + 16} rx={10} fill="none" stroke="#6366f1" strokeWidth={2} strokeDasharray="6 5" pointerEvents="none" />
        })()}
      </svg>

      {library && teacher && <div role="dialog" aria-label={library === 'shapes' ? 'Add a shape' : 'Add an object'} className="absolute bottom-20 left-1/2 z-20 w-[min(22rem,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
        {library === 'shapes' ? <>
          <p className="mb-2 text-[11px] font-semibold text-slate-500">Color</p>
          <div className="mb-3 flex gap-1.5">{boardColors.map(option => <button key={option.value} type="button" aria-label={`${option.name} color`} aria-pressed={color.value === option.value} onClick={() => setColor(option)} className={cn('size-7 rounded-full focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:outline-none', color.value === option.value && 'ring-2 ring-slate-900 ring-offset-2')}><svg aria-hidden="true" viewBox="0 0 28 28" className="size-7"><circle cx={14} cy={14} r={14} fill={option.value} /></svg></button>)}</div>
          <div className="grid grid-cols-3 gap-2">{boardShapes.map(({ shape, label }) => <button key={shape} type="button" aria-label={`Add ${color.name} ${label.toLowerCase()}`} onClick={() => addItem((x, y) => ({ id: boardId(), authorId: host.id, kind: 'shape', shape, color: color.value, colorName: color.name, x, y }), `Added a ${color.name} ${label.toLowerCase()}.`)} className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 p-2 text-[11px] text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
            <svg aria-hidden="true" viewBox="0 0 100 100" className="size-10"><ShapeGlyph shape={shape} x={0} y={0} fill={color.value} /></svg>{label}
          </button>)}</div>
        </> : <div className="grid grid-cols-4 gap-2">{boardObjects.map(entry => <button key={entry.label} type="button" aria-label={`Add ${entry.label}`} onClick={() => addItem((x, y) => ({ id: boardId(), authorId: host.id, kind: 'object', glyph: entry.glyph, src: entry.src, label: entry.label, x, y }), `Added ${entry.label}.`)} className="flex flex-col items-center gap-0.5 rounded-xl border border-slate-200 p-1.5 text-[10px] text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none">
          {entry.src ? <img src={entry.src} alt="" className="size-8 object-contain" /> : <span aria-hidden="true" className="text-2xl leading-8">{entry.glyph}</span>}{entry.label}
        </button>)}</div>}
      </div>}

      <div role="toolbar" aria-label="Whiteboard tools" className="absolute bottom-3 left-1/2 z-10 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
        {tools.map(entry => <BoardTool key={entry.id} label={entry.label} active={tool === entry.id} onClick={() => { setTool(entry.id); setLibrary(null) }}>{entry.icon}</BoardTool>)}
        <span aria-hidden="true" className="mx-0.5 h-6 w-px shrink-0 bg-slate-200" />
        {teacher ? <>
          <BoardTool label="Add a shape" active={library === 'shapes'} onClick={() => setLibrary(library === 'shapes' ? null : 'shapes')}><Shapes aria-hidden="true" /></BoardTool>
          <BoardTool label="Add an object" active={library === 'objects'} onClick={() => setLibrary(library === 'objects' ? null : 'objects')}><Smile aria-hidden="true" /></BoardTool>
          <BoardTool label="Delete selected" disabled={!selected} onClick={() => selected && erase(selected)}><Trash2 aria-hidden="true" /></BoardTool>
          <BoardTool label="Clear student marks" disabled={!learnerMarks.length} onClick={() => setItems(board.items.filter(item => item.kind !== 'mark' || item.authorId === host.id), 'Student marks cleared. Use Undo to bring them back.')}><CircleDashed aria-hidden="true" /></BoardTool>
        </> : <BoardTool label="Circle selected item" disabled={!selected || selected.kind === 'mark'} onClick={circleSelected}><CircleDashed aria-hidden="true" /></BoardTool>}
        <BoardTool label={teacher ? 'Undo' : 'Undo my last mark'} disabled={teacher ? !past.length : !board.items.some(item => item.kind === 'mark' && item.authorId === learner.id)} onClick={undo}><Undo2 aria-hidden="true" /></BoardTool>
      </div>

      <p aria-live="polite" className="pointer-events-none absolute bottom-16 left-3 z-10 hidden max-w-64 rounded-lg bg-slate-900/80 px-2.5 py-1.5 text-[11px] leading-4 text-white sm:block">{status}</p>
    </div>
  </section>
}

function ShapeGlyph({ shape, x, y, fill }: { shape: BoardShape; x: number; y: number; fill: string }) {
  if (shape === 'circle') return <circle cx={x + 50} cy={y + 50} r={46} fill={fill} />
  if (shape === 'square') return <rect x={x + 5} y={y + 5} width={90} height={90} rx={8} fill={fill} />
  if (shape === 'rectangle') return <rect x={x + 2} y={y + 22} width={96} height={56} rx={8} fill={fill} />
  return <polygon points={shapePoints(shape, x, y)} fill={fill} strokeLinejoin="round" />
}

function BoardTool({ label, active = false, disabled = false, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" aria-label={label} title={label} aria-pressed={active} disabled={disabled} onClick={onClick}
    className={cn('grid size-10 shrink-0 place-items-center rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35 [&_svg]:size-[18px]', active ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100')}>{children}</button>
}
