import { useEffect, useRef, useState } from "react"
import { ArrowLeft, Check, Download, FileText, Play, Presentation, Redo2, Trash2, Undo2 } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loadTasks, sampleTasks } from "@/components/features/personal-workspace/tasks/task-records"
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
  const [tasks] = useState(() => loadTasks().filter(task => !sampleTasks.some(sample => sample.id === task.id)))
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
