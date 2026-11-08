import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Check, ChevronDown, ChevronRight, CircleCheck, FileText, Layers3, Play, Search } from "lucide-react"
import { Link, useSearchParams } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSubjectCoverColor, subjectShortcutLinks, type SubjectMilestone, type SubjectRecord } from "./subject-records"

type SubjectStudyContentProps = {
  subject: SubjectRecord
  onStartProgress: () => void
  onCompleteMilestone: (milestoneId: string) => void
}

export function SubjectStudyContent({ subject, onStartProgress, onCompleteMilestone }: SubjectStudyContentProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [outlineOpen, setOutlineOpen] = useState(true)
  const [outlineQuery, setOutlineQuery] = useState("")
  const headingRef = useRef<HTMLHeadingElement>(null)
  const readerBodyRef = useRef<HTMLDivElement>(null)
  const readerRef = useRef<HTMLElement>(null)
  const selected = subject.milestones.find((item) => item.id === searchParams.get("topic")) ?? null
  const selectedId = selected?.id
  const currentIndex = selected ? subject.milestones.findIndex((item) => item.id === selected.id) : -1
  const completedCount = subject.milestones.filter((item) => item.status === "completed").length
  const visibleMilestones = useMemo(() => subject.milestones.filter((item) => item.title.toLowerCase().includes(outlineQuery.trim().toLowerCase())), [subject.milestones, outlineQuery])

  useEffect(() => {
    if (selectedId) {
      headingRef.current?.focus({ preventScroll: true })
      if (readerBodyRef.current) readerBodyRef.current.scrollTop = 0
      readerRef.current?.scrollIntoView?.({ block: "start" })
    }
  }, [selectedId])

  function openMilestone(milestone: SubjectMilestone) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set("topic", milestone.id)
      return next
    })
    if (!subject.progressStarted) onStartProgress()
  }

  function closeReader() {
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.delete("topic")
      return next
    })
  }

  function moveTopic(direction: -1 | 1) {
    const next = subject.milestones[currentIndex + direction]
    if (next) openMilestone(next)
  }

  if (selected) {
    return (
      <section ref={readerRef} aria-label={`${subject.name} study reader`} className="overflow-hidden rounded-xl border border-border bg-background shadow-xs lg:flex lg:h-[calc(100dvh-10rem)] lg:min-h-[28rem] lg:flex-col">
        <header className="flex min-h-16 shrink-0 flex-wrap items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
          <Button type="button" variant="ghost" size="sm" onClick={closeReader}><ArrowLeft aria-hidden="true" /> Subject overview</Button>
          <span aria-hidden="true" className="hidden h-5 border-l border-border sm:block" />
          <p className="min-w-0 flex-1 text-sm font-semibold text-foreground">{subject.name}</p>
          <a href="#topic-outline" className="rounded text-xs font-medium text-brand outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden">Topic outline</a>
        </header>

        <div className="grid lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <article className="flex min-h-0 min-w-0 flex-col">
            <p className="flex items-center gap-2 border-b border-border bg-brand-soft px-5 py-3 text-xs leading-5 text-brand-soft-foreground sm:px-8"><BookOpen aria-hidden="true" className="size-4 shrink-0" />Personal study outline · Topic completion stays in this browser.</p>
            <div ref={readerBodyRef} className="mx-auto min-h-0 w-full max-w-3xl flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground">Topic {currentIndex + 1} of {subject.milestones.length}<span aria-hidden="true" className="mx-2">·</span>{selected.status === "completed" ? "Completed" : "Personal study"}</p>
              <h1 ref={headingRef} tabIndex={-1} className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-foreground outline-none sm:text-3xl">{selected.title}</h1>
              <div className="mt-7 overflow-hidden rounded-xl border border-border bg-muted/30">
                <div className="grid min-h-56 items-center gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_8rem] sm:p-8">
                  <div>
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">{currentIndex + 1}</span>
                    <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">A little focus.<br />A new understanding.</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">Use this topic to guide your own reading, practice, and notes.</p>
                  </div>
                  <div aria-hidden="true" className={`hidden size-32 overflow-hidden rounded-xl sm:block ${getSubjectCoverColor(subject.coverColor).className}`}>
                    {subject.coverImage ? <img src={subject.coverImage} alt="" className="size-full object-cover" /> : null}
                  </div>
                </div>
              </div>
              <div className="mt-7 space-y-5 text-sm leading-7 text-muted-foreground">
                <p>This is a topic from your personal plan for <span className="font-medium text-foreground">{subject.name}</span>. Instructor lessons and course files aren’t connected here.</p>
                <div className="border-l-2 border-brand bg-muted/40 px-4 py-3"><span className="font-semibold text-foreground">Make it stick.</span> Write one question you want to answer. After studying, explain the key idea in your own words.</div>
                <div className="flex flex-wrap gap-2">
                  <Button nativeButton={false} role="link" variant="outline" size="sm" render={<Link to="/students/notes" />}>Open notes <ArrowRight aria-hidden="true" /></Button>
                  <Button nativeButton={false} role="link" variant="ghost" size="sm" render={<Link to="/students/materials/personal" />}>Find study resources <ArrowRight aria-hidden="true" /></Button>
                </div>
              </div>
            </div>
            <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-4 sm:px-6">
              <Button type="button" variant="outline" size="sm" onClick={() => moveTopic(-1)} disabled={currentIndex <= 0}><ArrowLeft aria-hidden="true" />Previous topic</Button>
              <Button type="button" size="sm" onClick={() => onCompleteMilestone(selected.id)} disabled={selected.status === "completed"}><Check aria-hidden="true" />{selected.status === "completed" ? "Completed" : "Mark complete"}</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => moveTopic(1)} disabled={currentIndex >= subject.milestones.length - 1}>Next topic<ArrowRight aria-hidden="true" /></Button>
            </footer>
          </article>

          <aside id="topic-outline" aria-label="Study sidebar" className="scroll-mt-6 border-t border-border lg:overflow-y-auto lg:border-l lg:border-t-0">
            <Tabs defaultValue="topics" className="gap-0">
              <TabsList variant="line" className="h-16 w-full justify-start border-b border-border px-4">
                <TabsTrigger value="topics" className="flex-none px-3">Topics</TabsTrigger>
                <TabsTrigger value="tools" className="flex-none px-3">Study tools</TabsTrigger>
              </TabsList>
              <TabsContent value="topics" className="p-4">
                <div className="mb-4 flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>Topic completion</span><span className="font-medium text-foreground">{completedCount}/{subject.milestones.length}</span></div>
                <div role="progressbar" aria-label="Topic completion" aria-valuemin={0} aria-valuemax={subject.milestones.length} aria-valuenow={completedCount} className="mb-5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${completedCount / subject.milestones.length * 100}%` }} /></div>
                <label className="relative block"><span className="sr-only">Search topics</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={outlineQuery} onChange={(event) => setOutlineQuery(event.currentTarget.value)} placeholder="Search topics…" className="h-9 pl-9" /></label>
                <ul aria-label="Topic outline" className="mt-4 space-y-1">
                  {visibleMilestones.map((milestone) => (
                    <li key={milestone.id}>
                      <button type="button" onClick={() => openMilestone(milestone)} aria-current={selected.id === milestone.id ? "step" : undefined} className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected.id === milestone.id ? "bg-brand-soft text-brand" : "text-muted-foreground hover:bg-muted"}`}>
                        {milestone.status === "completed" ? <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
                        <span><span className="block text-[10px] text-muted-foreground">Topic {subject.milestones.findIndex((item) => item.id === milestone.id) + 1}{milestone.status === "completed" ? " · Completed" : ""}</span><span className="mt-0.5 block font-medium">{milestone.title}</span></span>
                      </button>
                    </li>
                  ))}
                  {visibleMilestones.length === 0 ? <li role="status" className="px-3 py-5 text-sm text-muted-foreground">No topics match your search.</li> : null}
                </ul>
              </TabsContent>
              <TabsContent value="tools" className="space-y-5 p-5">
                <p className="text-sm leading-6 text-muted-foreground">Keep learning in your personal workspace. These tools open your notes, resources, and tasks.</p>
                {subjectShortcutLinks.map(({ label, href, icon: Icon }) => <Link key={href} to={href} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"><Icon aria-hidden="true" className="size-4 text-brand" />{label}<ArrowRight aria-hidden="true" className="ml-auto size-4" /></Link>)}
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      </section>
    )
  }

  return (
    <section id="study-outline" aria-label="Subject study plan" className="grid scroll-mt-6 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-xl font-semibold tracking-tight text-foreground">Study outline</h2><p className="mt-1 text-xs text-muted-foreground">{subject.milestones.length} topics · {completedCount} completed</p></div>
          {subject.milestones.length > 0 ? <Button type="button" size="sm" variant="outline" onClick={() => openMilestone(subject.milestones.find((item) => item.status !== "completed") ?? subject.milestones[0])}><Play aria-hidden="true" />Open study view</Button> : null}
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
          <button type="button" aria-expanded={outlineOpen} onClick={() => setOutlineOpen((open) => !open)} className="flex w-full items-center justify-between gap-3 bg-muted/50 px-5 py-4 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
            <span className="flex min-w-0 items-center gap-2.5 text-sm font-semibold"><Layers3 aria-hidden="true" className="size-4 shrink-0 text-brand" /><span className="truncate">{subject.name}</span></span>
            <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">{subject.milestones.length} topics{outlineOpen ? <ChevronDown aria-hidden="true" className="size-4" /> : <ChevronRight aria-hidden="true" className="size-4" />}</span>
          </button>
          {outlineOpen ? <ul aria-label="Study topics" className="divide-y divide-border">{subject.milestones.map((milestone, index) => <li key={milestone.id}><button type="button" onClick={() => openMilestone(milestone)} className="flex w-full items-center gap-3 px-5 py-4 text-left outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"><FileText aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1"><span className="text-[10px] text-muted-foreground">Topic {index + 1}</span><span className="block text-sm font-medium">{milestone.title}</span></span>{milestone.status === "completed" ? <CircleCheck aria-label="Completed" className="size-4 shrink-0 text-emerald-600" /> : <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />}</button></li>)}</ul> : null}
          {subject.milestones.length === 0 ? <p className="p-8 text-center text-sm leading-6 text-muted-foreground">Add milestones below to build your personal study outline.</p> : null}
        </div>
        <a href="#manage-milestones" className="mt-3 inline-flex items-center gap-1 rounded text-xs font-medium text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">Manage your milestones<ArrowRight aria-hidden="true" className="size-3.5" /></a>
      </div>
      <aside aria-label="Subject details" className="space-y-5 rounded-xl border border-border bg-background p-5 shadow-xs">
        <h3 className="text-sm font-semibold">Subject details</h3>
        <ul className="space-y-4 text-xs text-muted-foreground">
          <li className="flex items-center gap-2.5"><CircleCheck aria-hidden="true" className="size-4 text-emerald-600" />{completedCount} of {subject.milestones.length} topics complete</li>
          <li className="flex items-center gap-2.5"><CalendarDays aria-hidden="true" className="size-4" />Added {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(subject.createdAt))}</li>
          {subject.code ? <li className="flex items-center gap-2.5"><BookOpen aria-hidden="true" className="size-4" />{subject.code}</li> : null}
        </ul>
        <div className="border-t border-border pt-4"><p className="text-xs font-medium">Study plan owner</p><p className="mt-1 text-xs text-muted-foreground">You · Personal workspace</p></div>
        <p className="text-xs leading-5 text-muted-foreground">Topics and completion stay in this browser. They are not classroom grades or official records.</p>
      </aside>
    </section>
  )
}
