import { useMemo, useState } from "react"
import { Link } from "react-router"
import { ArrowUpRight, BookOpenCheck, Info, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ClassworkCard } from "./classwork-card"
import {
  classworkClassroomsLink,
  classworkFilterOptions,
  classworkGuidance,
  classworkStorageNotice,
  classworkSummaryTiles,
  classworkTasksLink,
  sampleClasswork,
  sortClasswork,
  type ClassworkStatus,
} from "./sample-classwork"

export function ClassworkView() {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ClassworkStatus | "all">("all")

  const visibleClasswork = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return sortClasswork(
      sampleClasswork.filter((item) => {
        const matchesStatus = statusFilter === "all" || item.status === statusFilter
        const matchesQuery =
          normalizedQuery.length === 0 ||
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.classroom.toLowerCase().includes(normalizedQuery)

        return matchesStatus && matchesQuery
      })
    )
  }, [query, statusFilter])

  const totals = useMemo(
    () => ({
      activities: sampleClasswork.length,
      waiting: sampleClasswork.filter((item) => item.status === "assigned" || item.status === "in-progress")
        .length,
      submitted: sampleClasswork.filter((item) => item.status === "submitted").length,
      released: sampleClasswork.filter((item) => item.status === "released").length,
    }),
    []
  )

  const summaryValues = [
    String(totals.activities),
    String(totals.waiting),
    String(totals.submitted),
    String(totals.released),
  ]

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          Classroom
        </Badge>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Classwork
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Work your educator assigned to you. Activities, submissions, and released results stay in their
          classroom context.
        </p>
      </section>

      <section
        aria-label="Classwork guidance"
        className="flex flex-wrap items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
      >
        <BookOpenCheck className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
        <p className="flex-1 text-sm leading-6 text-blue-800">{classworkGuidance}</p>
        <p className="flex w-full items-start gap-2 border-t border-blue-100 pt-2 text-xs leading-5 text-blue-800 sm:w-auto sm:flex-1 sm:border-t-0 sm:pt-0">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {classworkStorageNotice}
        </p>
      </section>

      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardContent className="grid gap-1 sm:grid-cols-2 xl:grid-cols-4">
          {classworkSummaryTiles.map(({ label, icon: Icon }, index) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl px-2 py-2 xl:border-l xl:border-slate-100 xl:first:border-l-0 xl:first:pl-0"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs text-slate-500">{label}</p>
                <p className="text-lg font-semibold tabular-nums text-slate-900">{summaryValues[index]}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardContent className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Assigned activities</h3>
              <p className="mt-1 text-sm text-slate-500">
                Search by activity or classroom, or filter by where each activity stands.
              </p>
            </div>
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
              {visibleClasswork.length} shown
            </Badge>
          </div>

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
                aria-label="Search classwork"
                placeholder="Search classwork..."
                className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter classwork by status">
              {classworkFilterOptions.map((option) => {
                const isActive = statusFilter === option.value

                return (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-pressed={isActive}
                    onClick={() => setStatusFilter(option.value)}
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

          {visibleClasswork.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {visibleClasswork.map((item) => (
                <li key={item.id}>
                  <ClassworkCard item={item} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
              <p className="text-sm font-semibold text-slate-900">No classwork matches this view.</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Try another status or clear the filters to see every activity.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                onClick={() => {
                  setStatusFilter("all")
                  setQuery("")
                }}
              >
                Clear filters
              </Button>
            </div>
          )}

          <p className="text-xs leading-5 text-slate-500">
            Starting an activity, submitting work, and viewing released results are not connected yet, so no
            buttons appear here. Educators control these records, not you.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {[classworkTasksLink, classworkClassroomsLink].map(({ label, description, href }) => (
          <Link
            key={href}
            to={href}
            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm outline-none transition-colors hover:border-blue-200 hover:bg-blue-50/40 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900">{label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span>
            </span>
            <ArrowUpRight className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  )
}