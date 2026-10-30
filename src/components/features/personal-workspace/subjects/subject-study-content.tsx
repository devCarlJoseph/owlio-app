import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  FileText,
  GraduationCap,
  Layers3,
  Play,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { SubjectMilestone, SubjectRecord } from "./subject-records"

type SubjectStudyContentProps = {
  subject: SubjectRecord
  onStartProgress: () => void
  onCompleteMilestone: (milestoneId: string) => void
}

export function SubjectStudyContent({ subject, onStartProgress, onCompleteMilestone }: SubjectStudyContentProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [outlineOpen, setOutlineOpen] = useState(true)
  const [outlineQuery, setOutlineQuery] = useState("")
  const selected = subject.milestones.find((item) => item.id === selectedId) ?? null
  const currentIndex = selected ? subject.milestones.findIndex((item) => item.id === selected.id) : -1
  const completedCount = useMemo(() => subject.milestones.filter((item) => item.status === "completed").length, [subject.milestones])
  const visibleMilestones = useMemo(
    () => subject.milestones.filter((item) => item.title.toLowerCase().includes(outlineQuery.trim().toLowerCase())),
    [subject.milestones, outlineQuery],
  )

  function openMilestone(milestone: SubjectMilestone) {
    setSelectedId(milestone.id)
    if (!subject.progressStarted) onStartProgress()
  }

  function moveChapter(direction: -1 | 1) {
    const next = subject.milestones[currentIndex + direction]
    if (next) openMilestone(next)
  }

  if (selected) {
    return (
      <section aria-label={`${subject.name} study reader`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-16 flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedId(null)} className="gap-2">
            <ArrowLeft aria-hidden="true" className="size-4" /> Course overview
          </Button>
          <span aria-hidden="true" className="hidden h-5 border-l border-slate-200 sm:block" />
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{subject.name}</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0eafe] px-2.5 py-1 text-xs font-medium text-[#6842c5]"><GraduationCap aria-hidden="true" className="size-3.5" /> Personal study</span>
        </div>

        <div className="grid min-h-[34rem] lg:grid-cols-[minmax(0,1fr)_19rem]">
          <article className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2 border-b border-[#e9e2fa] bg-[#f7f3ff] px-5 py-3 text-sm text-[#393044] sm:px-8">
              <BookOpen aria-hidden="true" className="size-4 shrink-0 text-[#8a60f1]" />
              This is your personal study outline. Instructor lessons and course files are not connected.
            </div>
            <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-10 sm:py-10">
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                <span>Topic {currentIndex + 1} of {subject.milestones.length}</span>
                <span aria-hidden="true" className="size-1 rounded-full bg-slate-300" />
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Personal outline</span>
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{selected.title}</h2>
              <div className="relative mt-7 flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-[#ebe6f2] bg-gradient-to-br from-[#f3effb] via-white to-[#f8f6fa] px-6 py-10 text-center sm:min-h-72">
                <div aria-hidden="true" className="absolute -right-10 -top-12 size-48 rounded-full bg-[#eee8ff]/80" />
                <div aria-hidden="true" className="absolute -bottom-20 -left-12 size-56 rounded-full bg-[#f3edf3]/80" />
                <div className="relative max-w-sm">
                  <div aria-hidden="true" className="relative mx-auto flex h-20 w-24 items-center justify-center rounded-xl border border-indigo-200 bg-white shadow-lg shadow-indigo-100/70">
                    <div className="absolute -left-2 top-2 h-16 w-20 -rotate-6 rounded-lg border border-[#e4d9fc] bg-[#f7f3ff]" />
                    <div className="relative flex size-12 items-center justify-center rounded-full bg-[#8a60f1] text-white shadow-md shadow-[#d9cafc]"><FileText aria-hidden="true" className="size-5" /></div>
                  </div>
                  <h3 className="mt-5 font-semibold text-slate-900">Make this topic your own</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Course lesson content isn’t connected. Use this space to guide your own reading, examples, and notes.</p>
                </div>
              </div>
              <p className="mt-6 rounded-lg border-l-2 border-[#8a60f1] bg-[#f8f6fb] px-4 py-3 text-sm leading-6 text-slate-700">
                <span className="font-semibold">Study tip:</span> Write one question you want to answer, then capture the key idea in your own words.
              </p>
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 sm:px-8">
              <Button type="button" variant="ghost" size="sm" onClick={() => moveChapter(-1)} disabled={currentIndex <= 0}>
                <ArrowLeft aria-hidden="true" /> Previous topic
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => onCompleteMilestone(selected.id)} disabled={selected.status === "completed"}>
                <Check aria-hidden="true" /> {selected.status === "completed" ? "Completed" : "Mark complete"}
              </Button>
              <Button type="button" size="sm" onClick={() => moveChapter(1)} disabled={currentIndex >= subject.milestones.length - 1}>
                Next topic <ArrowRight aria-hidden="true" />
              </Button>
            </footer>
          </article>

          <aside aria-label="Topic outline" className="border-t border-slate-200 bg-[#fcfbfd] p-4 sm:p-5 lg:border-l lg:border-t-0">
            <div className="flex items-start justify-between gap-2">
              <div><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Your study plan</p><h3 className="mt-1 font-semibold text-slate-900">Course content</h3></div>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">{completedCount}/{subject.milestones.length}</span>
            </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eae6f0]" role="progressbar" aria-label="Topic completion" aria-valuemin={0} aria-valuemax={subject.milestones.length} aria-valuenow={completedCount}>
              <div className="h-full rounded-full bg-[#8a60f1] transition-[width]" style={{ width: `${subject.milestones.length === 0 ? 0 : (completedCount / subject.milestones.length) * 100}%` }} />
            </div>
            <label className="relative mt-4 block">
              <span className="sr-only">Search topics</span>
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input value={outlineQuery} onChange={(event) => setOutlineQuery(event.currentTarget.value)} placeholder="Search topics..." className="h-9 pl-9" />
            </label>
            <ul className="mt-3 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {visibleMilestones.map((milestone) => {
                const index = subject.milestones.findIndex((item) => item.id === milestone.id)
                return (
                  <li key={milestone.id}>
                    <button type="button" onClick={() => openMilestone(milestone)} aria-current={selected.id === milestone.id ? "step" : undefined} className={`flex w-full items-start gap-2.5 px-3 py-3 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8a60f1] ${selected.id === milestone.id ? "bg-[#f0eafe] text-[#39256b]" : "text-slate-700 hover:bg-[#f7f5f9]"}`}>
                      {milestone.status === "completed" ? <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-400" />}
                      <span className="min-w-0"><span className="block text-[11px] text-slate-500">Topic {index + 1}</span><span className="mt-0.5 block line-clamp-2 font-medium">{milestone.title}</span></span>
                    </button>
                  </li>
                )
              })}
              {visibleMilestones.length === 0 ? <li role="status" className="px-2 py-3 text-sm text-slate-500">No topics match your search.</li> : null}
            </ul>
          </aside>
        </div>
      </section>
    )
  }

  return (
    <section id="study-outline" aria-label="Subject study plan" className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a60f1]">Your learning plan</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#1b1a21]">Course content</h2>
            <p className="mt-1 text-sm text-slate-600">{subject.milestones.length} {subject.milestones.length === 1 ? "topic" : "topics"} · {completedCount} completed</p>
          </div>
          {subject.milestones.length > 0 ? <Button type="button" onClick={() => openMilestone(subject.milestones.find((item) => item.status !== "completed") ?? subject.milestones[0])} className="bg-[#8a60f1] text-white hover:bg-[#7447dc] focus-visible:ring-[#8a60f1]"><Play aria-hidden="true" /> Continue studying</Button> : null}
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#e8e6eb] bg-white shadow-md shadow-slate-200/35">
          <button type="button" aria-expanded={outlineOpen} onClick={() => setOutlineOpen((open) => !open)} className="flex w-full items-center justify-between gap-3 bg-[#f8f7f9] px-4 py-4 text-left outline-none hover:bg-[#f1eff4] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8a60f1] sm:px-5">
            <span className="flex min-w-0 items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f0eafe] text-[#6842c5]"><Layers3 aria-hidden="true" className="size-4" /></span><span className="truncate font-semibold text-[#1b1a21]">{subject.name}</span></span>
            <span className="flex shrink-0 items-center gap-3 text-sm text-slate-600"><span>{subject.milestones.length} {subject.milestones.length === 1 ? "topic" : "topics"}</span>{outlineOpen ? <ChevronDown aria-hidden="true" className="size-4" /> : <ChevronRight aria-hidden="true" className="size-4" />}</span>
          </button>
          {outlineOpen ? <ul className="divide-y divide-slate-200">{subject.milestones.map((milestone, index) => <li key={milestone.id}><button type="button" onClick={() => openMilestone(milestone)} className="flex w-full items-center gap-3 px-4 py-4 text-left outline-none transition-colors hover:bg-[#faf8fd] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8a60f1] sm:px-5"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><FileText aria-hidden="true" className="size-4" /></span><span className="min-w-0 flex-1"><span className="text-xs text-slate-500">Topic {index + 1}</span><span className="block font-medium text-[#1b1a21]">{milestone.title}</span></span>{milestone.status === "completed" ? <CircleCheck aria-label="Completed" className="size-4 shrink-0 text-emerald-600" /> : <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-slate-400" />}</button></li>)}</ul> : null}
          {subject.milestones.length === 0 ? <CardContent className="py-8 text-center text-sm text-slate-600">Add topics to your personal study plan to build an outline here.</CardContent> : null}
        </div>
      </div>
      <Card className="rounded-2xl border border-[#e8e6eb] bg-[#fcfbfd] shadow-md shadow-slate-200/35 ring-0 lg:sticky lg:top-6">
        <CardContent className="gap-5 p-5">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">At a glance</p><h3 className="mt-1 font-semibold text-slate-900">Subject details</h3><p className="mt-1 text-xs leading-5 text-slate-500">Personal workspace information</p></div>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-[#f0eafe] text-[#6842c5]"><CircleCheck aria-hidden="true" className="size-4" /></span><span>{completedCount} of {subject.milestones.length} topics complete</span></li>
            <li className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><CalendarDays aria-hidden="true" className="size-4" /></span><span>Added {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(subject.createdAt))}</span></li>
            {subject.code ? <li className="flex items-center gap-3"><span className="flex size-8 items-center justify-center rounded-lg bg-[#f0eafe] text-[#6842c5]"><BookOpen aria-hidden="true" className="size-4" /></span><span>{subject.code}</span></li> : null}
          </ul>
          <div className="border-t border-slate-200 pt-4"><h4 className="text-sm font-semibold text-slate-900">Study plan owner</h4><div className="mt-3 flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-[#f0eafe] text-[#6842c5]"><GraduationCap aria-hidden="true" className="size-4" /></span><span><span className="block text-sm font-medium text-slate-800">You</span><span className="block text-xs text-slate-500">Personal subject</span></span></div></div>
          <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-500">Topics and completion are saved in this browser. Instructor lessons and course files are not connected.</p>
        </CardContent>
      </Card>
    </section>
  )
}
