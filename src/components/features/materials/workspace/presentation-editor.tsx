import { useState } from "react"
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { editorSelectClass } from "./document-editor"
import { createSlide, createWorkId, type LibraryWork, type WorkSlide } from "./work-records"

const themes = { paper: "bg-white text-slate-900", sage: "bg-emerald-50 text-emerald-950", midnight: "bg-slate-900 text-white" }

export function SlidePreview({ slide }: { slide: WorkSlide }) {
  return <div className={`flex aspect-video flex-col justify-center overflow-y-auto rounded-lg border border-black/10 p-5 sm:p-10 ${themes[slide.theme]}`}>
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
          <span className={`flex aspect-video items-center justify-center overflow-hidden rounded p-2 text-center text-[10px] font-semibold ${themes[slide.theme]}`}><span className="line-clamp-3 break-words">{slide.title || "Untitled slide"}</span></span>
          <span className="mt-1.5 block truncate text-[11px] text-muted-foreground">{i + 1}. {slide.title || "Untitled slide"}</span>
        </button>)}
      </nav>
      <div className="min-w-0 space-y-4">
        <section aria-label="Slide canvas" className={`flex min-h-72 flex-col justify-center gap-4 rounded-xl border border-border p-5 shadow-sm sm:aspect-video sm:p-10 ${themes[active.theme]}`}>
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
