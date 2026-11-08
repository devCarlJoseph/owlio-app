import { useEffect, useMemo, useRef, useState } from "react"
import { LayoutGrid, List, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ContinueLearning } from "./continue-learning"
import { SampleDataNotice } from "./sample-data-notice"
import { SubjectCard } from "./subject-card"
import { SubjectComposerDialog } from "./subject-composer-dialog"
import { SubjectDeleteDialog } from "./subject-delete-dialog"
import { SubjectListRow } from "./subject-list-row"
import { SubjectsHero } from "./subjects-hero"
import {
  createSubjectId, defaultSubjectCoverColor, getDefaultSubjectCover,
  loadSubjects, saveSubjects, sortSubjects, subjectFilterOptions,
  subjectMatchesFilter, subjectMatchesQuery, subjectsStorageNotice,
  type SubjectDraft, type SubjectFilter, type SubjectRecord,
} from "./subject-records"

export function SubjectsView() {
  const pageRef = useRef<HTMLDivElement>(null)
  const [subjects, setSubjects] = useState<SubjectRecord[]>(() => loadSubjects())
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<SubjectFilter>("all")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [sort, setSort] = useState("recent")
  const [composerOpen, setComposerOpen] = useState(false)
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubjectRecord | null>(null)

  useEffect(() => { saveSubjects(subjects) }, [subjects])
  useEffect(() => { pageRef.current?.scrollIntoView?.({ block: "start" }) }, [])

  const visibleSubjects = useMemo(() => {
    const matches = subjects.filter((subject) => subjectMatchesFilter(subject, filter) && subjectMatchesQuery(subject, query))
    return sort === "name" ? [...matches].sort((a, b) => a.name.localeCompare(b.name)) : sortSubjects(matches)
  }, [subjects, filter, query, sort])
  const editingSubject = subjects.find((subject) => subject.id === editingSubjectId) ?? null

  function openCreateDialog() {
    setEditingSubjectId(null)
    setComposerOpen(true)
  }

  function openCustomizeDialog(subject: SubjectRecord) {
    setEditingSubjectId(subject.id)
    setComposerOpen(true)
  }

  function handleSubmit(draft: SubjectDraft) {
    const timestamp = new Date().toISOString()
    if (editingSubjectId) {
      setSubjects((current) => current.map((subject) => subject.id === editingSubjectId
        ? { ...subject, ...draft, updatedAt: timestamp } : subject))
    } else {
      const id = createSubjectId()
      setSubjects((current) => [...current, {
        id, ...draft, coverColor: defaultSubjectCoverColor, coverImage: getDefaultSubjectCover(id).file,
        milestones: [], progressStarted: false, createdAt: timestamp, updatedAt: timestamp, seeded: false,
      }])
    }
    setComposerOpen(false)
    setEditingSubjectId(null)
  }

  function handleCoverChange(cover: { coverColor: string; coverImage: string | null }) {
    if (!editingSubjectId) return
    setSubjects((current) => current.map((subject) => subject.id === editingSubjectId
      ? { ...subject, ...cover, updatedAt: new Date().toISOString() } : subject))
  }

  function clearFilters() { setQuery(""); setFilter("all") }

  return (
    <div ref={pageRef} className="mx-auto w-full max-w-7xl space-y-8 pb-6">
      <SubjectsHero intro="Your own space for subjects, notes, and study plans. Learn at your pace, with or without a class." onCreate={openCreateDialog} />
      <SampleDataNotice hasExamples={subjects.some((subject) => subject.seeded)} />
      <ContinueLearning subjects={subjects} />

      <section id="subject-library" aria-labelledby="subject-library-heading" className="space-y-5 scroll-mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 id="subject-library-heading" className="text-xl font-semibold tracking-tight text-foreground">All subjects</h2>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{subjects.length}</span>
          </div>
          <span role="status" className="text-xs text-muted-foreground">{visibleSubjects.length} of {subjects.length} shown</span>
        </div>

        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter subjects by status">
            {subjectFilterOptions.map((option) => (
              <Button key={option.value} type="button" variant="ghost" size="sm" aria-pressed={filter === option.value} onClick={() => setFilter(option.value)}
                className={`rounded-full px-3.5 ${filter === option.value ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background" : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                {option.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-40 flex-1 sm:w-44 sm:flex-none">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} aria-label="Search subjects" placeholder="Search subjects…" className="h-9 rounded-lg bg-background pl-9" />
            </div>
            <label>
              <span className="sr-only">Sort subjects</span>
              <select value={sort} onChange={(event) => setSort(event.currentTarget.value)} className="h-9 max-w-full rounded-lg border border-input bg-background px-2 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="recent">Recently updated</option><option value="name">Name A–Z</option>
              </select>
            </label>
            <div role="group" aria-label="Subject layout" className="inline-flex rounded-lg bg-muted p-0.5">
              {([{ value: "grid", label: "Grid view", icon: LayoutGrid }, { value: "list", label: "List view", icon: List }] as const).map(({ value, label, icon: Icon }) => (
                <Button key={value} type="button" variant="ghost" size="icon-sm" aria-label={label} aria-pressed={view === value} onClick={() => setView(value)} className={`rounded-md ${view === value ? "bg-background text-foreground shadow-xs" : "text-muted-foreground"}`}>
                  <Icon aria-hidden="true" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {visibleSubjects.length > 0 ? (view === "grid" ? (
          <ul aria-label="Subject library" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {visibleSubjects.map((subject) => <li key={subject.id}><SubjectCard subject={subject} href={`/students/subjects/${subject.id}`} onCustomize={openCustomizeDialog} onDelete={setDeleteTarget} /></li>)}
          </ul>
        ) : (
          <ul aria-label="Subject library" className="space-y-2">
            {visibleSubjects.map((subject) => <SubjectListRow key={subject.id} subject={subject} href={`/students/subjects/${subject.id}`} />)}
          </ul>
        )) : (
          <div className="rounded-xl border border-dashed border-border bg-background px-6 py-14 text-center">
            <h3 className="font-semibold text-foreground">{subjects.length === 0 ? "Your learning starts here" : "No subjects match this view"}</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{subjects.length === 0 ? "Add a subject, give it a few study topics, and make it your own. You don’t need to join a class." : "Try another status or search term to find what you’re looking for."}</p>
            <Button type="button" variant="outline" className="mt-5" onClick={subjects.length === 0 ? openCreateDialog : clearFilters}>
              {subjects.length === 0 ? <><Plus aria-hidden="true" /> Create a subject</> : "Clear search"}
            </Button>
          </div>
        )}
        <p className="text-xs leading-5 text-muted-foreground">{subjectsStorageNotice}</p>
      </section>

      <SubjectComposerDialog open={composerOpen} subject={editingSubject} onOpenChange={(open) => { setComposerOpen(open); if (!open) setEditingSubjectId(null) }} onSubmit={handleSubmit} onCoverChange={handleCoverChange} />
      <SubjectDeleteDialog open={deleteTarget !== null} subject={deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }} onConfirm={(subject) => { setSubjects((current) => current.filter((item) => item.id !== subject.id)); setDeleteTarget(null) }} />
    </div>
  )
}
