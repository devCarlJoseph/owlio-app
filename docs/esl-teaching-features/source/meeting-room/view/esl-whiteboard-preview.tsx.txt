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
