# workspace

This directory mirrors `src/components/features/materials/workspace/`. For the current files, proposed component folders, and manual migration checks, use the [materials guide](../README.md) and its [source index](../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/materials/workspace/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `document-editor.tsx`

Current file: `src/components/features/materials/workspace/document-editor.tsx`

```tsx
import { useState } from "react"
import { AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, Bold, Italic, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createBlock, type BlockKind, type LibraryWork, type WorkBlock } from "./work-records"

export const editorSelectClass = "h-9 max-w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function DocumentEditor({ work, onChange }: { work: LibraryWork; onChange: (next: LibraryWork) => void }) {
  const [activeId, setActiveId] = useState(work.blocks[0].id)
  const active = work.blocks.find(block => block.id === activeId) ?? work.blocks[0]
  const activeIndex = work.blocks.indexOf(active)
  function patch(value: Partial<WorkBlock>) {
    onChange({ ...work, blocks: work.blocks.map(block => block.id === active.id ? { ...block, ...value } : block) })
  }
  function move(offset: number) {
    const blocks = [...work.blocks]
    const target = activeIndex + offset
    if (target < 0 || target >= blocks.length) return
    ;[blocks[activeIndex], blocks[target]] = [blocks[target], blocks[activeIndex]]
    onChange({ ...work, blocks })
  }
  return <div className="space-y-4">
    <div role="group" aria-label="Document formatting" className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-2">
      <select aria-label="Block style" className={editorSelectClass} value={active.kind} onChange={event => patch({ kind: event.target.value as BlockKind })}>
        <option value="paragraph">Paragraph</option><option value="heading">Heading</option><option value="bullets">Bullet list</option>
      </select>
      <Button variant="ghost" size="icon" aria-label="Bold block" aria-pressed={active.bold} onClick={() => patch({ bold: !active.bold })}><Bold aria-hidden="true" /></Button>
      <Button variant="ghost" size="icon" aria-label="Italic block" aria-pressed={active.italic} onClick={() => patch({ italic: !active.italic })}><Italic aria-hidden="true" /></Button>
      {([{ value: "left", icon: AlignLeft }, { value: "center", icon: AlignCenter }, { value: "right", icon: AlignRight }] as const).map(({ value, icon: Icon }) => <Button key={value} variant="ghost" size="icon" aria-label={`Align ${value}`} aria-pressed={active.align === value} onClick={() => patch({ align: value })}><Icon aria-hidden="true" /></Button>)}
      <span aria-hidden="true" className="mx-1 h-5 border-l border-border" />
      <Button variant="ghost" size="icon" aria-label="Move block up" disabled={activeIndex === 0} onClick={() => move(-1)}><ArrowUp aria-hidden="true" /></Button>
      <Button variant="ghost" size="icon" aria-label="Move block down" disabled={activeIndex === work.blocks.length - 1} onClick={() => move(1)}><ArrowDown aria-hidden="true" /></Button>
      <Button variant="ghost" size="icon" aria-label="Delete block" disabled={work.blocks.length === 1} onClick={() => onChange({ ...work, blocks: work.blocks.filter(block => block.id !== active.id) })}><Trash2 aria-hidden="true" /></Button>
      <Button variant="outline" className="ml-auto" onClick={() => { const block = createBlock(); setActiveId(block.id); onChange({ ...work, blocks: [...work.blocks, block] }) }}><Plus aria-hidden="true" /> Add block</Button>
    </div>
    <p className="text-xs text-muted-foreground">Select a block to format it. For a bullet list, write one item per line.</p>
    <div className="rounded-2xl border border-border bg-muted/35 p-3 sm:p-8">
      <article aria-label="Document canvas" className="mx-auto min-h-[540px] max-w-3xl space-y-2 rounded-sm border border-border bg-card px-4 py-8 shadow-sm sm:px-12 sm:py-12">
        <h2 className="mb-8 break-words text-3xl font-semibold tracking-tight">{work.title || "Untitled document"}</h2>
        {work.blocks.map((block, index) => <div key={block.id} className={`rounded-lg border p-2 ${block.id === active.id ? "border-ring/40 bg-muted/20" : "border-transparent"}`}>
          <label htmlFor={`block-${block.id}`} className="mb-1 block text-[10px] font-medium tracking-wider text-muted-foreground uppercase">{index + 1} · {block.kind === "bullets" ? "Bullet list" : block.kind}</label>
          <Textarea id={`block-${block.id}`} value={block.text} onFocus={() => setActiveId(block.id)} onChange={event => onChange({ ...work, blocks: work.blocks.map(item => item.id === block.id ? { ...item, text: event.target.value } : item) })} placeholder={block.kind === "heading" ? "Section heading…" : block.kind === "bullets" ? "First idea\nNext idea" : "Start writing…"} rows={Math.max(2, Math.min(18, block.text.split("\n").length + 1))} style={{ textAlign: block.align, fontWeight: block.bold || block.kind === "heading" ? 600 : 400, fontStyle: block.italic ? "italic" : "normal" }} className={`resize-y border-0 bg-transparent shadow-none ${block.kind === "heading" ? "text-xl md:text-xl" : "text-base md:text-base"}`} />
        </div>)}
      </article>
    </div>
  </div>
}

export function DocumentPreview({ work }: { work: LibraryWork }) {
  return <article className="space-y-5 break-words rounded-xl bg-card p-5 text-card-foreground sm:p-8">
    <h2 className="text-3xl font-semibold">{work.title || "Untitled document"}</h2>
    {work.blocks.map(block => <div key={block.id} style={{ textAlign: block.align, fontWeight: block.bold ? 700 : undefined, fontStyle: block.italic ? "italic" : undefined }}>
      {block.kind === "heading" ? <h3 className="whitespace-pre-wrap text-xl font-semibold">{block.text}</h3> : block.kind === "bullets" ? <ul className="list-inside list-disc space-y-1">{block.text.split("\n").map((line, i) => <li key={i}>{line}</li>)}</ul> : <p className="whitespace-pre-wrap leading-7">{block.text}</p>}
    </div>)}
  </article>
}
```

### `library-workspace-view.tsx`

Current file: `src/components/features/materials/workspace/library-workspace-view.tsx`

```tsx
import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Check, Download, FileText, Play, Presentation, Redo2, Trash2, Undo2 } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loadPersonalTasks } from "@/components/features/personal-workspace/tasks/task-records"
import { DocumentEditor, DocumentPreview, editorSelectClass } from "./document-editor"
import { PresentationEditor, SlidePreview } from "./presentation-editor"
import { createWorkId, loadWork, reviseWork, saveWork, workHref, workStoragePrefix, type LibraryWork } from "./work-records"
import { forgetUnsavedWork, getUnsavedWork, retainUnsavedWork } from "./work-drafts"

function readWork(id: string) {
  const draft = getUnsavedWork(id)
  if (draft) return { ...draft, error: false, unsaved: true }
  try { const work = loadWork(id); return { work, savedRevision: work?.updatedAt ?? "", error: false, unsaved: false } }
  catch { return { work: null, savedRevision: "", error: true, unsaved: false } }
}

export function LibraryWorkspaceView({ resourceId }: { resourceId: string }) {
  const [loaded, setLoaded] = useState(() => readWork(resourceId))
  if (!loaded.work) return <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-border bg-card p-8">
    <FileText aria-hidden="true" className="size-8 text-muted-foreground" />
    <h2 className="text-xl font-semibold">{loaded.error ? "This file couldn’t be read" : "File not found in this browser"}</h2>
    <p className="text-sm leading-6 text-muted-foreground">{loaded.error ? "Local storage may be unavailable or the saved file may be unreadable. The saved data hasn’t been replaced." : "Personal files stay in the browser where you created them. This link may belong to another browser, or the local file may have been removed."}</p>
    <div className="flex flex-wrap gap-2"><Link to="/students/materials/personal" className={buttonVariants({ variant: "outline" })}>Back to personal library</Link>{loaded.error && <Button onClick={() => setLoaded(readWork(resourceId))}>Retry</Button>}</div>
  </div>
  return <WorkEditor initial={loaded.work} savedRevision={loaded.savedRevision} unsaved={loaded.unsaved} />
}

function WorkEditor({ initial, savedRevision, unsaved }: { initial: LibraryWork; savedRevision: string; unsaved: boolean }) {
  const [work, setWork] = useState(initial)
  const [past, setPast] = useState<LibraryWork[]>([])
  const [future, setFuture] = useState<LibraryWork[]>([])
  const [saveError, setSaveError] = useState(unsaved)
  const [preview, setPreview] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteError, setDeleteError] = useState(false)
  const [tasks] = useState(() => loadPersonalTasks().tasks)
  const revision = useRef(savedRevision)
  const navigate = useNavigate()

  useEffect(() => {
    if (!saveError) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = "" }
    const checkNavigation = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest("a[href]")) return
      if (!window.confirm("Your latest changes aren’t saved. Leave the editor? Unsaved changes may be lost if the app is reloaded; export a backup first to keep them.")) { event.preventDefault(); event.stopPropagation() }
    }
    window.addEventListener("beforeunload", warn)
    document.addEventListener("click", checkNavigation, true)
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", checkNavigation, true) }
  }, [saveError])

  function persist(next: LibraryWork) {
    const revised = reviseWork({ ...next, updatedAt: work.updatedAt })
    setWork(revised)
    try { saveWork(revised, revision.current); revision.current = revised.updatedAt; forgetUnsavedWork(work.id); setSaveError(false) }
    catch { retainUnsavedWork(revised, revision.current); setSaveError(true) }
  }
  function change(next: LibraryWork) {
    setPast(items => [...items.slice(-49), work])
    setFuture([])
    persist(next)
  }
  function undo() {
    if (!past.length) return
    setPast(past.slice(0, -1)); setFuture([work, ...future]); persist(past[past.length - 1])
  }
  function redo() {
    if (!future.length) return
    setPast([...past, work]); setFuture(future.slice(1)); persist(future[0])
  }
  function saveCopy() {
    const copy = reviseWork({ ...work, id: createWorkId(), title: `${work.title || "Untitled"} (copy)` })
    try { saveWork(copy, null); forgetUnsavedWork(work.id); setSaveError(false); navigate(workHref(copy.id), { replace: true }) }
    catch { setSaveError(true) }
  }
  function exportBackup() {
    const blob = new Blob([JSON.stringify(work, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    const filename = Array.from(work.title || "Owlio file", char => char.charCodeAt(0) < 32 || '<>:"/\\|?*'.includes(char) ? "_" : char).join("")
    anchor.href = url; anchor.download = `${filename}.owlio.json`
    anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  function remove() {
    try {
      if (loadWork(work.id)?.updatedAt !== revision.current) { setDeleteError(true); return }
      localStorage.removeItem(workStoragePrefix + work.id)
      forgetUnsavedWork(work.id)
      setSaveError(false); navigate("/students/materials/personal")
    } catch { setDeleteError(true) }
  }
  const Icon = work.kind === "document" ? FileText : Presentation
  const task = tasks.find(item => item.id === work.taskId)
  const wordCount = work.blocks.map(block => block.text).join(" ").trim().split(/\s+/).filter(Boolean).length
  return <div className="mx-auto w-full max-w-7xl space-y-4">
    <header className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
      <Link to="/students/materials/personal" className="inline-flex items-center gap-1 rounded text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft aria-hidden="true" className="size-3.5" /> Personal library</Link>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${work.kind === "document" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}><Icon aria-hidden="true" className="size-5" /></span>
        <div className="min-w-0 flex-1"><Label htmlFor="editor-title" className="text-[10px] tracking-wider text-muted-foreground uppercase">Personal {work.kind} · Owlio workspace</Label><Input id="editor-title" aria-label="File title" value={work.title} onChange={event => change({ ...work, title: event.target.value })} className="mt-1 h-9 border-transparent px-0 text-lg font-semibold shadow-none md:text-xl" /></div>
        <div className="flex flex-wrap gap-1">
          <Button variant="ghost" size="icon" aria-label="Undo" disabled={!past.length} onClick={undo}><Undo2 aria-hidden="true" /></Button><Button variant="ghost" size="icon" aria-label="Redo" disabled={!future.length} onClick={redo}><Redo2 aria-hidden="true" /></Button>
          <Button variant="outline" onClick={exportBackup}><Download aria-hidden="true" /> Export backup</Button>
          <Button onClick={() => { setPreviewIndex(0); setPreview(true) }}><Play aria-hidden="true" />{work.kind === "document" ? "Preview" : "Present"}</Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <p role="status" className={`flex items-center gap-1.5 ${saveError ? "text-destructive" : ""}`}>{!saveError && <Check aria-hidden="true" className="size-3.5" />}{saveError ? "Latest changes aren’t saved" : "Saved in this browser"} · {work.kind === "document" ? `${wordCount} ${wordCount === 1 ? "word" : "words"}` : `${work.slides.length} ${work.slides.length === 1 ? "slide" : "slides"}`}</p>
        <span>Local files only · No account sync</span>
      </div>
      {saveError && <div role="alert" className="space-y-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm"><p>Your draft is still open here. Storage may be full, unavailable, or changed in another tab. Keep this page open and retry, save a copy, or export a backup before leaving.</p><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => persist(work)}>Retry save</Button><Button size="sm" variant="outline" onClick={saveCopy}>Save a copy</Button></div></div>}
    </header>
    <section aria-label="Personal task context" className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
      <Label htmlFor="work-task" className="text-xs">Personal task</Label>
      <select id="work-task" className={`${editorSelectClass} min-w-40 flex-1 sm:max-w-sm`} value={work.taskId} onChange={event => change({ ...work, taskId: event.target.value })}>
        <option value="">No linked task</option>{work.taskId && !task && <option value={work.taskId}>Linked task no longer available</option>}{tasks.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select>
      <Link to="/students/tasks" className="rounded text-xs font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring">{task ? "Open personal tasks" : "Manage personal tasks"}</Link>
      {task && <p className="w-full break-words text-sm text-muted-foreground">{task.subject && `${task.subject} · `}{task.notes || task.title}</p>}
    </section>
    {work.kind === "document" ? <DocumentEditor work={work} onChange={change} /> : <PresentationEditor work={work} onChange={change} />}
    <footer className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><p>Personal work stays separate from classroom submissions and shared resources.</p><Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setDeleteError(false); setDeleteOpen(true) }}><Trash2 aria-hidden="true" /> Delete file</Button></footer>
    <Dialog open={preview} onOpenChange={setPreview}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-4xl" onKeyDown={event => {
        if (work.kind !== "presentation") return
        if (event.key === "ArrowRight") { event.preventDefault(); setPreviewIndex(index => Math.min(work.slides.length - 1, index + 1)) }
        if (event.key === "ArrowLeft") { event.preventDefault(); setPreviewIndex(index => Math.max(0, index - 1)) }
      }}><DialogHeader><DialogTitle>{work.title || "Untitled"}</DialogTitle><DialogDescription>{work.kind === "document" ? "Document preview" : `Slide ${previewIndex + 1} of ${work.slides.length}. Speaker notes stay hidden. Use arrow keys to navigate.`}</DialogDescription></DialogHeader>
        {work.kind === "document" ? <DocumentPreview work={work} /> : <><SlidePreview slide={work.slides[previewIndex]} /><div className="flex justify-between"><Button variant="outline" disabled={previewIndex === 0} onClick={() => setPreviewIndex(previewIndex - 1)}>Previous slide</Button><Button disabled={previewIndex === work.slides.length - 1} onClick={() => setPreviewIndex(previewIndex + 1)}>Next slide</Button></div></>}
      </DialogContent>
    </Dialog>
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}><DialogContent><DialogHeader><DialogTitle>Delete this personal file?</DialogTitle><DialogDescription>This removes “{work.title || "Untitled"}” from this browser. Export a backup first if you need to keep it. This cannot be undone.</DialogDescription></DialogHeader>{deleteError && <p role="alert" className="text-sm text-destructive">The file couldn’t be removed. It may have changed in another tab or storage may be unavailable.</p>}<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="destructive" onClick={remove}>Delete file</Button></div></DialogContent></Dialog>
  </div>
}
```

### `library-workspace.test.tsx`

Current file: `src/components/features/materials/workspace/library-workspace.test.tsx`

```tsx
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { LibraryWorkspaceView } from "./library-workspace-view"
import { PersonalLibraryWork } from "./personal-library-work"
import { createWork, isLibraryWork, listWork, loadWork, reviseWork, saveWork, workHref, workStoragePrefix } from "./work-records"
import { tasksStorageKey } from "@/components/features/personal-workspace/tasks/task-records"

beforeEach(() => localStorage.clear())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

function openEditor(kind: "document" | "presentation") {
  const work = createWork(kind, kind === "document" ? "Research draft" : "Research deck")
  saveWork(work, null)
  const view = render(<MemoryRouter><LibraryWorkspaceView resourceId={work.id} /></MemoryRouter>)
  return { ...view, work }
}

describe("Owlio personal editor storage", () => {
  it("keeps files separate and refuses to overwrite another tab’s newer revision", () => {
    const first = createWork("document", "First")
    const second = createWork("presentation", "Second")
    saveWork(first, null); saveWork(second, null)
    const newer = reviseWork({ ...first, title: "Changed elsewhere" })
    saveWork(newer, first.updatedAt)
    expect(() => saveWork(reviseWork({ ...first, title: "Stale" }), first.updatedAt)).toThrow()
    expect(loadWork(first.id)?.title).toBe("Changed elsewhere")
    expect(loadWork(second.id)).toEqual(second)
  })

  it("reports unreadable storage without replacing the saved content", () => {
    localStorage.setItem(workStoragePrefix + "broken", "not json")
    expect(listWork()).toEqual({ items: [], error: true })
    expect(localStorage.getItem(workStoragePrefix + "broken")).toBe("not json")
    expect(isLibraryWork({ ...createWork("presentation", "Empty"), slides: [] })).toBe(false)
  })
})

describe("Owlio document and slide workspaces", () => {
  it("creates a personal file and opens its own workspace in the same router", async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><Routes><Route path="/" element={<PersonalLibraryWork />} /><Route path="/students/materials/workspace/:id" element={<p>Editor route opened</p>} /></Routes></MemoryRouter>)
    await user.click(screen.getByRole("button", { name: "New document" }))
    await user.type(screen.getByLabelText("File title"), "My essay")
    await user.click(screen.getByRole("button", { name: "Create document" }))
    expect(screen.getByText("Editor route opened")).toBeTruthy()
    expect(listWork().items[0].title).toBe("My essay")
  })

  it("imports a backup as a new personal file without retaining another browser’s task link", async () => {
    const user = userEvent.setup()
    const original = { ...createWork("document", "Restored research"), taskId: "another-browser-task" }
    const file = new File([JSON.stringify(original)], "research.owlio.json", { type: "application/json" })
    Object.defineProperty(file, "text", { value: async () => JSON.stringify(original) })
    render(<MemoryRouter><PersonalLibraryWork /></MemoryRouter>)
    await user.upload(screen.getByLabelText("Import Owlio backup file"), file)
    const imported = listWork().items[0]
    expect(imported.id).not.toBe(original.id)
    expect(imported.taskId).toBe("")
    expect(imported.blocks).toEqual(original.blocks)
  })

  it("rejects an invalid backup without creating a local file", async () => {
    const user = userEvent.setup()
    const file = new File(["{}"], "wrong.json", { type: "application/json" })
    Object.defineProperty(file, "text", { value: async () => "{}" })
    render(<MemoryRouter><PersonalLibraryWork /></MemoryRouter>)
    await user.upload(screen.getByLabelText("Import Owlio backup file"), file)
    expect(screen.getByRole("alert").textContent).toContain("Owlio .owlio.json backup")
    expect(listWork().items).toHaveLength(0)
  })

  it("saves document text, block formatting, undo/redo, and reloads the saved work", async () => {
    const user = userEvent.setup()
    const { work, unmount } = openEditor("document")
    fireEvent.change(screen.getByRole("textbox", { name: /1 · paragraph/i }), { target: { value: "My first paragraph" } })
    await user.click(screen.getByRole("button", { name: "Bold block" }))
    expect(loadWork(work.id)?.blocks[0]).toMatchObject({ text: "My first paragraph", bold: true })
    await user.click(screen.getByRole("button", { name: "Undo" }))
    expect(loadWork(work.id)?.blocks[0].bold).toBe(false)
    await user.click(screen.getByRole("button", { name: "Redo" }))
    await user.click(screen.getByRole("button", { name: "Add block" }))
    await user.selectOptions(screen.getByRole("combobox", { name: "Block style" }), "heading")
    expect(loadWork(work.id)?.blocks[1].kind).toBe("heading")
    unmount()
    render(<MemoryRouter><LibraryWorkspaceView resourceId={work.id} /></MemoryRouter>)
    expect((screen.getByRole("textbox", { name: /1 · paragraph/i }) as HTMLTextAreaElement).value).toBe("My first paragraph")
    expect(screen.getByRole("status").textContent).toContain("Saved in this browser")
  })

  it("retains an unsaved draft when storage fails and saves it after retry", async () => {
    const user = userEvent.setup()
    const { work } = openEditor("document")
    const setter = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota") })
    fireEvent.change(screen.getByRole("textbox", { name: /1 · paragraph/i }), { target: { value: "Keep my draft" } })
    expect(screen.getByRole("status").textContent).toContain("aren’t saved")
    expect((screen.getByRole("textbox", { name: /1 · paragraph/i }) as HTMLTextAreaElement).value).toBe("Keep my draft")
    expect(loadWork(work.id)?.blocks[0].text).toBe("")
    setter.mockRestore()
    await user.click(screen.getByRole("button", { name: "Retry save" }))
    expect(loadWork(work.id)?.blocks[0].text).toBe("Keep my draft")
    expect(screen.getByRole("status").textContent).toContain("Saved in this browser")
  })

  it("recovers a failed draft after in-app navigation back to the editor", () => {
    const { work, unmount } = openEditor("document")
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota") })
    fireEvent.change(screen.getByRole("textbox", { name: /1 · paragraph/i }), { target: { value: "Draft before navigation" } })
    unmount()
    render(<MemoryRouter><LibraryWorkspaceView resourceId={work.id} /></MemoryRouter>)
    expect((screen.getByRole("textbox", { name: /1 · paragraph/i }) as HTMLTextAreaElement).value).toBe("Draft before navigation")
    expect(screen.getByRole("status").textContent).toContain("aren’t saved")
  })

  it("builds, reorders, duplicates, and presents slides without exposing speaker notes", async () => {
    const user = userEvent.setup()
    const { work } = openEditor("presentation")
    fireEvent.change(screen.getByLabelText(/Title$/, { selector: "textarea" }), { target: { value: "Opening" } })
    await user.click(screen.getByRole("button", { name: "Add slide" }))
    fireEvent.change(screen.getByLabelText(/Title$/, { selector: "textarea" }), { target: { value: "Evidence" } })
    fireEvent.change(screen.getByLabelText("Speaker notes"), { target: { value: "Private reminder" } })
    await user.selectOptions(screen.getByRole("combobox", { name: "Slide theme" }), "midnight")
    await user.click(screen.getByRole("button", { name: "Move slide earlier" }))
    expect(loadWork(work.id)?.slides.map(slide => slide.title)).toEqual(["Evidence", "Opening"])
    await user.click(screen.getByRole("button", { name: "Duplicate slide" }))
    expect(loadWork(work.id)?.slides).toHaveLength(3)
    await user.click(screen.getByRole("button", { name: "Present" }))
    const preview = within(screen.getByRole("dialog"))
    expect(preview.getByRole("heading", { name: "Evidence" })).toBeTruthy()
    expect(preview.queryByText("Private reminder")).toBeNull()
    await user.click(preview.getByRole("button", { name: "Next slide" }))
    expect(preview.getByText(/Slide 2 of 3/)).toBeTruthy()
  })

  it("links only actual personal tasks and does not change their status", async () => {
    const user = userEvent.setup()
    const task = { id: "my-task", title: "Write an essay", subject: "English", notes: "Use two sources", dueDate: "", priority: "medium", status: "todo", createdAt: new Date().toISOString() }
    localStorage.setItem(tasksStorageKey, JSON.stringify([task]))
    const { work } = openEditor("document")
    await user.selectOptions(screen.getByLabelText("Personal task"), "my-task")
    expect(loadWork(work.id)?.taskId).toBe("my-task")
    expect(JSON.parse(localStorage.getItem(tasksStorageKey)!)[0].status).toBe("todo")
    expect(screen.getByText("English · Use two sources")).toBeTruthy()
    expect(screen.queryByRole("option", { name: "Finish wave problem set" })).toBeNull()
  })

  it("discovers personal work without placing it in classroom resources", () => {
    const work = createWork("document", "My personal draft")
    saveWork(work, null)
    render(<MemoryRouter><PersonalLibraryWork /></MemoryRouter>)
    expect(screen.getByRole("link", { name: /My personal draft/ }).getAttribute("href")).toBe(workHref(work.id))
  })

  it("provides a safe state for a missing local file", () => {
    render(<MemoryRouter><LibraryWorkspaceView resourceId="missing" /></MemoryRouter>)
    expect(screen.getByRole("heading", { name: "File not found in this browser" })).toBeTruthy()
    expect(screen.queryByRole("textbox")).toBeNull()
  })
})
```

### `personal-library-work.tsx`

Current file: `src/components/features/materials/workspace/personal-library-work.tsx`

```tsx
import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, FileText, Plus, Presentation, Upload } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createWork, createWorkId, isLibraryWork, listWork, saveWork, workHref, type WorkKind } from "./work-records"
import type { LibraryResourceKind } from "../library-types"

export function PersonalLibraryWork({ query = "", kinds = [] }: { query?: string; kinds?: LibraryResourceKind[] }) {
  const [collection, setCollection] = useState(listWork)
  const [kind, setKind] = useState<WorkKind | null>(null)
  const [title, setTitle] = useState("")
  const [error, setError] = useState("")
  const [importError, setImportError] = useState("")
  const importInput = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  useEffect(() => {
    const refresh = () => setCollection(listWork())
    window.addEventListener("storage", refresh)
    window.addEventListener("focus", refresh)
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("focus", refresh) }
  }, [])
  const visible = collection.items.filter(item => item.title.toLowerCase().includes(query.trim().toLowerCase()) &&
    (kinds.length === 0 || kinds.includes(item.kind === "document" ? "Document" : "Slides")))

  function create() {
    if (!kind) return
    const item = createWork(kind, title)
    try { saveWork(item, null); navigate(workHref(item.id)) }
    catch { setError("This browser couldn’t save your new file. Check available storage or browser settings, then try again.") }
  }

  async function importBackup(file: File) {
    setImportError("")
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!isLibraryWork(parsed)) { setImportError("Choose an Owlio .owlio.json backup exported from an editor."); return }
      const item = { ...parsed, id: createWorkId(), taskId: "", updatedAt: new Date().toISOString() }
      saveWork(item, null)
      navigate(workHref(item.id))
    } catch { setImportError("The backup couldn’t be opened or saved. Check the file and this browser’s available storage, then try again.") }
  }

  return (
    <section aria-labelledby="personal-work-heading" className="space-y-4 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">Your personal workspace</p>
          <h3 id="personal-work-heading" className="mt-1 text-lg font-semibold">Create something of your own</h3>
          <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">Write a document or build a presentation inside Owlio. Saved only in this browser; clearing browser data removes these files.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => { setKind("document"); setTitle(""); setError("") }}><FileText aria-hidden="true" /> New document</Button>
          <Button onClick={() => { setKind("presentation"); setTitle(""); setError("") }}><Plus aria-hidden="true" /> New presentation</Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><button type="button" onClick={() => importInput.current?.click()} className="inline-flex items-center gap-1 rounded underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring"><Upload aria-hidden="true" className="size-3" /> Import Owlio backup</button><span>· .owlio.json files only</span><input ref={importInput} type="file" accept=".json,application/json" aria-label="Import Owlio backup file" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) void importBackup(file); event.target.value = "" }} /></div>
      {importError && <p role="alert" className="text-sm text-destructive">{importError}</p>}
      {collection.error && <p role="alert" className="text-sm text-destructive">Some local files couldn’t be read. <button className="rounded underline focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setCollection(listWork())}>Retry</button></p>}
      {visible.length > 0 ? <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map(item => {
          const Icon = item.kind === "document" ? FileText : Presentation
          return <li key={item.id}><Link to={workHref(item.id)} className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground"><Icon aria-hidden="true" className="size-5" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.title || "Untitled"}</p><p className="mt-1 text-xs text-muted-foreground">{item.kind === "document" ? "Document" : `${item.slides.length} ${item.slides.length === 1 ? "slide" : "slides"}`} · Personal · {new Date(item.updatedAt).toLocaleDateString()}</p></div>
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          </Link></li>
        })}
      </ul> : <p className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">{collection.items.length > 0 ? "No personal files match your filters." : "Your next idea starts here. Create your first document or presentation."}</p>}
      <Dialog open={kind !== null} onOpenChange={open => { if (!open) setKind(null) }}>
        <DialogContent><DialogHeader><DialogTitle>New {kind}</DialogTitle><DialogDescription>Your own file, saved in this browser. You can link a personal task from the editor.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={event => { event.preventDefault(); create() }}>
            <div className="space-y-2"><Label htmlFor="work-title">File title</Label><Input id="work-title" value={title} onChange={event => setTitle(event.target.value)} placeholder={kind === "document" ? "e.g. My research draft" : "e.g. Biology presentation"} autoFocus /></div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setKind(null)}>Cancel</Button><Button type="submit">Create {kind}</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
```

### `presentation-editor.tsx`

Current file: `src/components/features/materials/workspace/presentation-editor.tsx`

```tsx
import { useState } from "react"
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { editorSelectClass } from "./document-editor"
import { createSlide, createWorkId, type LibraryWork, type WorkSlide } from "./work-records"

const themes = { paper: "bg-white text-slate-900", sage: "bg-emerald-50 text-emerald-950", midnight: "bg-slate-900 text-white" }

export function SlidePreview({ slide }: { slide: WorkSlide }) {
  return <div data-theme-content className={`flex aspect-video flex-col justify-center overflow-y-auto rounded-lg border border-black/10 p-5 sm:p-10 ${themes[slide.theme]}`}>
    <h2 className="whitespace-pre-wrap break-words text-2xl font-semibold leading-tight sm:text-4xl">{slide.title || "Untitled slide"}</h2>
    <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-relaxed opacity-80 sm:text-xl">{slide.body}</p>
  </div>
}

export function PresentationEditor({ work, onChange }: { work: LibraryWork; onChange: (next: LibraryWork) => void }) {
  const [activeId, setActiveId] = useState(work.slides[0].id)
  const active = work.slides.find(slide => slide.id === activeId) ?? work.slides[0]
  const index = work.slides.indexOf(active)
  function patch(value: Partial<WorkSlide>) { onChange({ ...work, slides: work.slides.map(slide => slide.id === active.id ? { ...slide, ...value } : slide) }) }
  function insert(duplicate = false) {
    const slide = duplicate ? { ...active, id: createWorkId() } : createSlide()
    const slides = [...work.slides]
    slides.splice(index + 1, 0, slide)
    setActiveId(slide.id)
    onChange({ ...work, slides })
  }
  function move(offset: number) {
    const slides = [...work.slides]
    const target = index + offset
    if (target < 0 || target >= slides.length) return
    ;[slides[index], slides[target]] = [slides[target], slides[index]]
    onChange({ ...work, slides })
  }
  return <div className="space-y-4">
    <div role="group" aria-label="Slide controls" className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2">
      <Button variant="outline" onClick={() => insert()}><Plus aria-hidden="true" /> Add slide</Button>
      <Button variant="ghost" size="icon" aria-label="Duplicate slide" onClick={() => insert(true)}><Copy aria-hidden="true" /></Button>
      <Button variant="ghost" size="icon" aria-label="Move slide earlier" disabled={index === 0} onClick={() => move(-1)}><ArrowUp aria-hidden="true" /></Button>
      <Button variant="ghost" size="icon" aria-label="Move slide later" disabled={index === work.slides.length - 1} onClick={() => move(1)}><ArrowDown aria-hidden="true" /></Button>
      <Button variant="ghost" size="icon" aria-label="Delete slide" disabled={work.slides.length === 1} onClick={() => onChange({ ...work, slides: work.slides.filter(slide => slide.id !== active.id) })}><Trash2 aria-hidden="true" /></Button>
      <select aria-label="Slide theme" className={`${editorSelectClass} sm:ml-auto`} value={active.theme} onChange={event => patch({ theme: event.target.value as WorkSlide["theme"] })}><option value="paper">Paper</option><option value="sage">Sage</option><option value="midnight">Midnight</option></select>
    </div>
    <div className="grid gap-4 lg:grid-cols-[176px_minmax(0,1fr)]">
      <nav aria-label="Slides" className="flex gap-2 overflow-x-auto rounded-xl border border-border bg-card p-2 lg:flex-col lg:overflow-x-visible">
        {work.slides.map((slide, i) => <button key={slide.id} type="button" aria-label={`Slide ${i + 1}: ${slide.title || "Untitled"}`} aria-current={slide.id === active.id ? "step" : undefined} onClick={() => setActiveId(slide.id)} className={`w-36 shrink-0 rounded-lg border p-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring lg:w-full ${slide.id === active.id ? "border-primary ring-1 ring-primary" : "border-border hover:bg-muted"}`}>
          <span data-theme-content className={`flex aspect-video items-center justify-center overflow-hidden rounded p-2 text-center text-[10px] font-semibold ${themes[slide.theme]}`}><span className="line-clamp-3 break-words">{slide.title || "Untitled slide"}</span></span>
          <span className="mt-1.5 block truncate text-[11px] text-muted-foreground">{i + 1}. {slide.title || "Untitled slide"}</span>
        </button>)}
      </nav>
      <div className="min-w-0 space-y-4">
        <section data-theme-content aria-label="Slide canvas" className={`flex min-h-72 flex-col justify-center gap-4 rounded-xl border border-border p-5 shadow-sm sm:aspect-video sm:p-10 ${themes[active.theme]}`}>
          <label htmlFor="slide-title" className="text-[10px] font-semibold tracking-wider uppercase opacity-60">Slide {index + 1} · Title</label>
          <Textarea id="slide-title" value={active.title} onChange={event => patch({ title: event.target.value })} placeholder="Give your idea a title" rows={2} className="resize-y border-current/15 bg-transparent text-2xl font-semibold text-inherit shadow-none placeholder:text-current/40 md:text-3xl" />
          <label htmlFor="slide-body" className="text-[10px] font-semibold tracking-wider uppercase opacity-60">Content</label>
          <Textarea id="slide-body" value={active.body} onChange={event => patch({ body: event.target.value })} placeholder="Bring your ideas together…" rows={4} className="resize-y border-current/15 bg-transparent text-base text-inherit shadow-none placeholder:text-current/40 md:text-lg" />
        </section>
        <div className="space-y-2 rounded-xl border border-border bg-card p-4"><Label htmlFor="slide-notes">Speaker notes</Label><Textarea id="slide-notes" value={active.notes} onChange={event => patch({ notes: event.target.value })} placeholder="Your reminders while presenting. Hidden in presentation view." /></div>
      </div>
    </div>
  </div>
}
```

### `work-drafts.ts`

Current file: `src/components/features/materials/workspace/work-drafts.ts`

```ts
import type { LibraryWork } from "./work-records"

type UnsavedWork = { work: LibraryWork; savedRevision: string }
const unsavedWork = new Map<string, UnsavedWork>()

export const getUnsavedWork = (id: string) => unsavedWork.get(id)
export const retainUnsavedWork = (work: LibraryWork, savedRevision: string) => unsavedWork.set(work.id, { work, savedRevision })
export const forgetUnsavedWork = (id: string) => unsavedWork.delete(id)
```

### `work-records.ts`

Current file: `src/components/features/materials/workspace/work-records.ts`

```ts
export type WorkKind = "document" | "presentation"
export type BlockKind = "paragraph" | "heading" | "bullets"
export type WorkBlock = {
  id: string
  kind: BlockKind
  text: string
  bold: boolean
  italic: boolean
  align: "left" | "center" | "right"
}
export type WorkSlide = { id: string; title: string; body: string; notes: string; theme: "paper" | "sage" | "midnight" }
export type LibraryWork = {
  version: 1
  id: string
  kind: WorkKind
  title: string
  taskId: string
  updatedAt: string
  blocks: WorkBlock[]
  slides: WorkSlide[]
}

export const workStoragePrefix = "owlio.study-library-work.v1."
export const workHref = (id: string) => `/students/materials/workspace/${encodeURIComponent(id)}`
export const createWorkId = () => crypto.randomUUID()
export const createBlock = (): WorkBlock => ({ id: createWorkId(), kind: "paragraph", text: "", bold: false, italic: false, align: "left" })
export const createSlide = (): WorkSlide => ({ id: createWorkId(), title: "", body: "", notes: "", theme: "paper" })

export function createWork(kind: WorkKind, title: string): LibraryWork {
  return { version: 1, id: createWorkId(), kind, title: title.trim() || (kind === "document" ? "Untitled document" : "Untitled presentation"), taskId: "", updatedAt: new Date().toISOString(), blocks: kind === "document" ? [createBlock()] : [], slides: kind === "presentation" ? [createSlide()] : [] }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function isLibraryWork(value: unknown): value is LibraryWork {
  if (!isObject(value)) return false
  return value.version === 1 && typeof value.id === "string" && value.id.length > 0 &&
    (value.kind === "document" || value.kind === "presentation") && typeof value.title === "string" &&
    typeof value.taskId === "string" && typeof value.updatedAt === "string" && Number.isFinite(Date.parse(value.updatedAt)) &&
    Array.isArray(value.blocks) && value.blocks.every(block => isObject(block) && typeof block.id === "string" && block.id.length > 0 &&
      ["paragraph", "heading", "bullets"].includes(String(block.kind)) && typeof block.text === "string" &&
      typeof block.bold === "boolean" && typeof block.italic === "boolean" && ["left", "center", "right"].includes(String(block.align))) &&
    Array.isArray(value.slides) && value.slides.every(slide => isObject(slide) && typeof slide.id === "string" && slide.id.length > 0 &&
      typeof slide.title === "string" && typeof slide.body === "string" && typeof slide.notes === "string" &&
      ["paper", "sage", "midnight"].includes(String(slide.theme))) &&
    new Set(value.blocks.map(block => block.id)).size === value.blocks.length &&
    new Set(value.slides.map(slide => slide.id)).size === value.slides.length &&
    (value.kind === "document" ? value.blocks.length > 0 && value.slides.length === 0 : value.slides.length > 0 && value.blocks.length === 0)
}

export function loadWork(id: string): LibraryWork | null {
  const raw = localStorage.getItem(workStoragePrefix + id)
  if (!raw) return null
  const value: unknown = JSON.parse(raw)
  if (!isLibraryWork(value) || value.id !== id) throw new Error("Unreadable local work")
  return value
}

export function listWork(): { items: LibraryWork[]; error: boolean } {
  const items: LibraryWork[] = []
  let error = false
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(workStoragePrefix)) continue
      try {
        const item = loadWork(key.slice(workStoragePrefix.length))
        if (item) items.push(item)
      } catch { error = true }
    }
  } catch { error = true }
  return { items: items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), error }
}

export function saveWork(work: LibraryWork, expectedRevision: string | null): void {
  const current = loadWork(work.id)
  if ((current?.updatedAt ?? null) !== expectedRevision) throw new Error("Local work changed elsewhere")
  localStorage.setItem(workStoragePrefix + work.id, JSON.stringify(work))
}

export function reviseWork(work: LibraryWork): LibraryWork {
  return { ...work, updatedAt: new Date(Math.max(Date.now(), Date.parse(work.updatedAt) + 1)).toISOString() }
}
```

<!-- END GENERATED CURRENT SOURCE -->
