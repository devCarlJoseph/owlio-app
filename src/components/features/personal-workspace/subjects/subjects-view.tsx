import { useEffect, useMemo, useState } from "react"
import { ArrowRight, LayoutGrid, List, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SampleDataNotice } from "./sample-data-notice"
import { SubjectCard } from "./subject-card"
import { SubjectComposerDialog } from "./subject-composer-dialog"
import { SubjectDeleteDialog } from "./subject-delete-dialog"
import { SubjectListRow } from "./subject-list-row"
import { SubjectStudyContent } from "./subject-study-content"
import { defaultSubjectAppearance, getSubjectAppearance } from "./subject-appearance"
import { SubjectsHero } from "./subjects-hero"
import { cn } from "cn"
import {
  createSubjectId,
  defaultSubjectCoverColor,
  getDefaultSubjectCover,
  getSubjectCoverColor,
  getSubjectMilestoneState,
  loadSubjects,
  saveSubjects,
  sortSubjects,
  subjectFilterOptions,
  subjectMatchesFilter,
  subjectMatchesQuery,
  subjectsStorageNotice,
  type SubjectDraft,
  type SubjectFilter,
  type SubjectRecord,
} from "./subject-records"

const subjectsIntro =
  "Organize learning by subject whether or not your school or instructor uses Owlio. Personal subject work stays yours, separate from classroom records."

export function SubjectsView() {
  const [subjects, setSubjects] = useState<SubjectRecord[]>(() => loadSubjects())
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<SubjectFilter>("all")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [composerOpen, setComposerOpen] = useState(false)
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubjectRecord | null>(null)
  const [featuredSubjectId, setFeaturedSubjectId] = useState<string | null>(null)

  useEffect(() => {
    saveSubjects(subjects)
  }, [subjects])

  const visibleSubjects = useMemo(
    () =>
      sortSubjects(
        subjects.filter(
          (subject) =>
            subjectMatchesFilter(subject, filter) && subjectMatchesQuery(subject, query)
        )
      ),
    [subjects, filter, query]
  )

  const editingSubject = useMemo(
    () => subjects.find((subject) => subject.id === editingSubjectId) ?? null,
    [subjects, editingSubjectId]
  )

  const featuredSubject = useMemo(
    () =>
      subjects.find((subject) => subject.id === featuredSubjectId) ??
      sortSubjects(subjects)[0] ??
      null,
    [subjects, featuredSubjectId]
  )
  const featuredProgress = featuredSubject ? getSubjectMilestoneState(featuredSubject) : null
  const featuredTheme = featuredSubject ? getSubjectAppearance(featuredSubject) : defaultSubjectAppearance

  function openCreateDialog() {
    setEditingSubjectId(null)
    setComposerOpen(true)
  }

  function openCustomizeDialog(subject: SubjectRecord) {
    setEditingSubjectId(subject.id)
    setComposerOpen(true)
  }

  function handleSubmit(draft: SubjectDraft) {
    if (editingSubjectId) {
      setSubjects((current) =>
        current.map((subject) =>
          subject.id === editingSubjectId
            ? {
                ...subject,
                name: draft.name,
                code: draft.code,
                instructor: draft.instructor,
                updatedAt: new Date().toISOString(),
              }
            : subject
        )
      )
    } else {
      const timestamp = new Date().toISOString()
      const id = createSubjectId()
      setSubjects((current) => [
        ...current,
        {
          id,
          name: draft.name,
          code: draft.code,
          instructor: draft.instructor,
          coverColor: defaultSubjectCoverColor,
          coverImage: getDefaultSubjectCover(id).file,
          milestones: [],
          progressStarted: false,
          createdAt: timestamp,
          updatedAt: timestamp,
          seeded: false,
        },
      ])
    }

    setComposerOpen(false)
    setEditingSubjectId(null)
  }

  function handleCoverChange(cover: { coverColor: string; coverImage: string | null }) {
    if (!editingSubjectId) return

    setSubjects((current) =>
      current.map((subject) =>
        subject.id === editingSubjectId
          ? { ...subject, ...cover, updatedAt: new Date().toISOString() }
          : subject
      )
    )
  }

  function handleDelete(subject: SubjectRecord) {
    setSubjects((current) => current.filter((item) => item.id !== subject.id))
    if (featuredSubjectId === subject.id) setFeaturedSubjectId(null)
    setDeleteTarget(null)
  }

  function startFeaturedProgress() {
    if (!featuredSubject) return

    setSubjects((current) =>
      current.map((subject) => {
        if (subject.id !== featuredSubject.id) return subject
        const nextIndex = subject.milestones.findIndex((item) => item.status === "not-started")
        return {
          ...subject,
          progressStarted: true,
          milestones: subject.milestones.map((item, index) =>
            index === nextIndex ? { ...item, status: "in-progress" } : item
          ),
          updatedAt: new Date().toISOString(),
        }
      })
    )
  }

  function completeFeaturedMilestone(milestoneId: string) {
    if (!featuredSubject) return

    setSubjects((current) =>
      current.map((subject) =>
        subject.id === featuredSubject.id
          ? {
              ...subject,
              progressStarted: true,
              milestones: subject.milestones.map((item) =>
                item.id === milestoneId ? { ...item, status: "completed" } : item
              ),
              updatedAt: new Date().toISOString(),
            }
          : subject
      )
    )
  }

  function clearFilters() {
    setQuery("")
    setFilter("all")
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {featuredSubject ? (
        <>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <li><a href="#subject-library" className="rounded-sm transition-colors hover:text-[#6842c5] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8a60f1]">My Learning</a></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-slate-900">{featuredSubject.name}</li>
            </ol>
          </nav>

          <section
            className="relative isolate grid items-center gap-7 overflow-hidden rounded-[1.75rem] border p-5 shadow-xl ring-1 ring-white/80 transition-colors duration-500 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)] motion-reduce:transition-none"
            style={{ borderColor: featuredTheme.border, background: `linear-gradient(120deg, ${featuredTheme.background}, #ffffff 58%, ${featuredTheme.background})`, boxShadow: `0 24px 60px -32px ${featuredTheme.glow}99` }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-28 z-0 size-80 rounded-full bg-white/60 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 left-[28%] z-0 size-80 rounded-full blur-3xl" style={{ backgroundColor: `${featuredTheme.glow}55` }} />
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-8 left-0 z-0 w-1 rounded-r-full" style={{ background: `linear-gradient(to bottom, ${featuredTheme.glow}, ${featuredTheme.accent}, ${featuredTheme.border})` }} />
            <div className="relative z-10 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                <span className="rounded-full border bg-white/85 px-3 py-1 shadow-sm" style={{ borderColor: featuredTheme.border, color: featuredTheme.accent }}>Current focus</span>
                {featuredSubject.code ? <span className="rounded-md border border-slate-200/80 bg-white/80 px-2.5 py-1">{featuredSubject.code}</span> : null}
                <span className="rounded-md border border-slate-200/80 bg-white/80 px-2.5 py-1">{featuredSubject.milestones.length} study topics</span>
              </div>
              <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#1b1a21] sm:text-4xl">
                {featuredSubject.name}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Pick up where you left off in your personal learning plan.
              </p>
              {featuredSubject.instructor ? (
                <p className="mt-4 text-sm text-slate-700">
                  Instructor reference: <span className="font-medium text-[#1b1a21]">{featuredSubject.instructor}</span>
                </p>
              ) : null}
              {featuredProgress && featuredProgress.total > 0 ? (
                <div className="mt-5 max-w-lg">
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-[#1b1a21]">{featuredProgress.active?.title ?? (featuredProgress.allDone ? "All topics complete" : "Ready for your next topic")}</span>
                    <span className="shrink-0 text-slate-500">{featuredProgress.completed} of {featuredProgress.total} complete</span>
                  </div>
                  <div role="progressbar" aria-label={`${featuredSubject.name} topic progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={featuredProgress.progress} className="h-2.5 overflow-hidden rounded-full bg-white/80 shadow-inner" style={{ boxShadow: `inset 0 0 0 1px ${featuredTheme.border}` }}>
                    <div className="h-full rounded-full transition-[width]" style={{ width: `${featuredProgress.progress}%`, backgroundColor: featuredTheme.accent }} />
                  </div>
                </div>
              ) : null}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a href="#study-outline" className={cn(buttonVariants(), "rounded-lg text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-95 hover:shadow-md focus-visible:ring-2 motion-reduce:transform-none motion-reduce:transition-none")} style={{ backgroundColor: featuredTheme.accent, boxShadow: `0 4px 12px ${featuredTheme.glow}88` }}>
                  Continue studying <ArrowRight aria-hidden="true" />
                </a>
                <a href="#subject-library" className={cn(buttonVariants({ variant: "outline" }), "rounded-lg bg-white/90 text-[#1b1a21] shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none")} style={{ borderColor: featuredTheme.border }}>
                  Browse subjects
                </a>
              </div>
            </div>

            <div className="relative z-10 mx-auto h-52 w-full max-w-lg overflow-hidden rounded-2xl shadow-xl ring-4 ring-white/80 sm:h-64" style={{ backgroundColor: featuredTheme.background, boxShadow: `0 20px 35px -22px ${featuredTheme.glow}` }}>
              {featuredSubject.coverImage ? (
                <img src={featuredSubject.coverImage} alt="" aria-hidden="true" className="size-full object-cover" />
              ) : (
                <div aria-hidden="true" className={`absolute inset-0 ${getSubjectCoverColor(featuredSubject.coverColor).className}`} />
              )}
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-[#1b1a21]/10 to-transparent" />
              <label className="absolute bottom-3 right-3">
                <span className="sr-only">Choose subject to feature</span>
                <select
                  value={featuredSubject.id}
                  onChange={(event) => setFeaturedSubjectId(event.currentTarget.value)}
                  className="max-w-52 rounded-xl border border-white/80 bg-white/95 px-3 py-2 text-sm font-medium text-[#1b1a21] shadow-md shadow-violet-900/10 outline-none focus-visible:ring-2 focus-visible:ring-[#8a60f1]"
                >
                  {sortSubjects(subjects).map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </select>
              </label>
            </div>
          </section>

          <SubjectStudyContent
            subject={featuredSubject}
            onStartProgress={startFeaturedProgress}
            onCompleteMilestone={completeFeaturedMilestone}
          />
        </>
      ) : (
        <SubjectsHero intro={subjectsIntro} onCreate={openCreateDialog} />
      )}

      <SampleDataNotice />

      <Card id="subject-library" className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-lg shadow-violet-100/50 ring-0">
        <CardHeader className="border-b border-violet-100/80 bg-gradient-to-r from-violet-50/80 via-white to-white">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>
                <h3 className="text-lg font-semibold tracking-tight text-[#1b1a21]">Your learning library</h3>
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Find a subject and continue building your own study plan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full border-violet-200 bg-violet-50/70 px-2.5 text-[#6842c5]">
                {visibleSubjects.length} shown
              </Badge>

              <div
                role="group"
                aria-label="Subject layout"
                className="inline-flex rounded-xl border border-violet-100 bg-violet-50/60 p-1"
              >
                {(
                  [
                    { value: "grid" as const, label: "Grid view", icon: LayoutGrid },
                    { value: "list" as const, label: "List view", icon: List },
                  ] as const
                ).map((option) => {
                  const OptionIcon = option.icon
                  const isActive = view === option.value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={isActive}
                      aria-label={option.label}
                      onClick={() => setView(option.value)}
                      className={`inline-flex size-8 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#8a60f1] ${
                        isActive
                        ? "bg-white text-[#6842c5] shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <OptionIcon aria-hidden="true" className="size-4" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                aria-label="Search subjects"
                placeholder="Search subjects..."
                className="h-11 rounded-xl border-slate-200 bg-slate-50/80 pl-9 shadow-sm focus-visible:border-[#8a60f1] focus-visible:bg-white focus-visible:ring-[#8a60f1]/25"
              />
            </div>

            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter subjects by status"
            >
              {subjectFilterOptions.map((option) => {
                const isActive = filter === option.value

                return (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-pressed={isActive}
                    onClick={() => setFilter(option.value)}
                    className={
                      isActive
                        ? "rounded-full border-[#8a60f1] bg-[#8a60f1] px-4 text-white shadow-sm shadow-violet-200 hover:border-[#7447dc] hover:bg-[#7447dc]"
                        : "rounded-full border-slate-200 bg-white px-4 text-slate-600 hover:border-violet-200 hover:bg-violet-50/60 hover:text-[#6842c5]"
                    }
                  >
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {visibleSubjects.length > 0 ? (
            view === "grid" ? (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleSubjects.map((subject) => (
                  <li key={subject.id}>
                    <SubjectCard
                      subject={subject}
                      href={`/students/subjects/${subject.id}`}
                      onCustomize={openCustomizeDialog}
                      onDelete={setDeleteTarget}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2">
                {visibleSubjects.map((subject) => (
                  <SubjectListRow
                    key={subject.id}
                    subject={subject}
                    href={`/students/subjects/${subject.id}`}
                  />
                ))}
              </ul>
            )
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
              <p className="text-sm font-semibold text-slate-900">
                {subjects.length === 0 ? "No subjects yet." : "No subjects match this view."}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {subjects.length === 0
                  ? "Create a subject to start organising your own study work."
                  : "Try another category, or clear the search to see every subject."}
              </p>
              {subjects.length === 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 border-[#dfd4f7] bg-[#f7f3ff] text-[#6842c5] hover:bg-[#eee8ff] hover:text-[#52349d]"
                  onClick={openCreateDialog}
                >
                  <Plus aria-hidden="true" />
                  Create a subject
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 border-[#dfd4f7] bg-[#f7f3ff] text-[#6842c5] hover:bg-[#eee8ff] hover:text-[#52349d]"
                  onClick={clearFilters}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}

          <p className="text-xs leading-5 text-slate-500">{subjectsStorageNotice}</p>
        </CardContent>
      </Card>

      <SubjectComposerDialog
        open={composerOpen}
        subject={editingSubject}
        onOpenChange={(open) => {
          setComposerOpen(open)
          if (!open) setEditingSubjectId(null)
        }}
        onSubmit={handleSubmit}
        onCoverChange={handleCoverChange}
      />

      <SubjectDeleteDialog
        open={deleteTarget !== null}
        subject={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
      />
    </div>
  )
}
