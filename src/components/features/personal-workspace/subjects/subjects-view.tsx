import { useEffect, useMemo, useState } from "react"
import { LayoutGrid, List, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SampleDataNotice } from "./sample-data-notice"
import { SubjectCard } from "./subject-card"
import { SubjectComposerDialog } from "./subject-composer-dialog"
import { SubjectDeleteDialog } from "./subject-delete-dialog"
import { SubjectListRow } from "./subject-list-row"
import { SubjectsHero } from "./subjects-hero"
import {
  createSubjectId,
  defaultSubjectCoverColor,
  getDefaultSubjectCover,
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
    setDeleteTarget(null)
  }

  function clearFilters() {
    setQuery("")
    setFilter("all")
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <SubjectsHero intro={subjectsIntro} onCreate={openCreateDialog} />

      <SampleDataNotice />

      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>
                <h3 className="text-base font-semibold text-slate-900">Subjects</h3>
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Search by subject name, code, or instructor.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                {visibleSubjects.length} shown
              </Badge>

              <div
                role="group"
                aria-label="Subject layout"
                className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1"
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
                      className={`inline-flex size-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        isActive
                          ? "bg-white text-slate-900 shadow-sm"
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
                className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9"
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
                        ? "border-blue-700 bg-blue-700 text-white hover:bg-blue-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
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
                  className="mt-4 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
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
                  className="mt-4 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
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
