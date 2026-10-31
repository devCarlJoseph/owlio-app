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
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${item.kind === "document" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}><Icon aria-hidden="true" className="size-5" /></span>
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
