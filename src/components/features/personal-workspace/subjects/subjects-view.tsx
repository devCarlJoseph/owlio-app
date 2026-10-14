import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SampleDataNotice } from "./sample-data-notice"
import { SubjectCard } from "./subject-card"
import { SubjectWorkspace } from "./subject-workspace"
import { SubjectsSummary } from "./subjects-summary"
import { sampleSubjects, subjectFilterOptions, type SubjectFilter } from "./sample-subjects"

function filterSubjects(subjects: typeof sampleSubjects, filter: SubjectFilter, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  return subjects.filter((subject) => {
    const matchesFilter = filter === "all" || subject.status === filter
    const matchesQuery =
      normalizedQuery.length === 0 ||
      subject.name.toLowerCase().includes(normalizedQuery) ||
      subject.code.toLowerCase().includes(normalizedQuery)

    return matchesFilter && matchesQuery
  })
}

export function SubjectsView() {
  const [filter, setFilter] = useState<SubjectFilter>("all")
  const [query, setQuery] = useState("")

  const visibleSubjects = useMemo(
    () => filterSubjects(sampleSubjects, filter, query),
    [filter, query]
  )

  const totals = useMemo(() => {
    const chapters = sampleSubjects.reduce((total, subject) => total + subject.chaptersCompleted, 0)
    const lessons = sampleSubjects.reduce((total, subject) => total + subject.lessonCount, 0)
    const progress = Math.round(
      sampleSubjects.reduce((total, subject) => total + subject.progress, 0) / sampleSubjects.length
    )

    return { subjects: sampleSubjects.length, chapters, lessons, averageProgress: progress }
  }, [])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          Personal workspace
        </Badge>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          My subjects
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Organize learning by subject whether or not your school or instructor uses Owlio. Personal subject
          work stays yours, separate from classroom records.
        </p>
      </section>

      <SampleDataNotice />

      <div className="grid gap-5 lg:grid-cols-2">
        <SubjectsSummary totals={totals} />

        <SubjectWorkspace />
      </div>

      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>
                  <h3 className="text-base font-semibold text-slate-900">Your subjects</h3>
                </CardTitle>
                <CardDescription className="mt-1 text-slate-500">
                  Filter the list or search by subject name and code.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                {visibleSubjects.length} shown
              </Badge>
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
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter subjects by status">
                {subjectFilterOptions.map((option) => {
                  const isActive = filter === option.value

                  return (
                    <Button
                      key={option.value}
                      type="button"
                      size="sm"
                      aria-pressed={isActive}
                      onClick={() => setFilter(option.value)}
                      variant="outline"
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
              <ul className="grid gap-4 sm:grid-cols-2">
                {visibleSubjects.map((subject) => (
                  <li key={subject.id}>
                    <SubjectCard subject={subject} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
                <p className="text-sm font-semibold text-slate-900">No subjects match this view.</p>
                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Try another status, or clear the search to see every subject.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                  onClick={() => {
                    setFilter("all")
                    setQuery("")
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}

            <p className="text-xs leading-5 text-slate-500">
              Subject records are not connected yet. Creating and editing subjects are not available on this
              page.
            </p>
          </CardContent>
      </Card>
    </div>
  )
}