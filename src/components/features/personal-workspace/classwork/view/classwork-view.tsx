import { useMemo, useState } from "react"
import { Link } from "react-router"
import { ArrowUpRight, BookOpenCheck, Info, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ClassworkCard } from "../ui/classwork-card"
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
} from "../contents/sample-classwork"

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
      <section className="rounded-2xl border border-slate-200 surface-dark:border-border bg-white surface-dark:bg-card p-6 shadow-sm sm:p-8">
        <Badge variant="secondary" className="bg-blue-50 surface-dark:bg-surface-blue-soft text-blue-700 surface-dark:text-blue-300">
          Classroom
        </Badge>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 surface-dark:text-foreground sm:text-3xl">
          Classwork
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 surface-dark:text-muted-foreground">
          Work your educator assigned to you. Activities, submissions, and released results stay in their
          classroom context.
        </p>
      </section>

      <section
        aria-label="Classwork guidance"
        className="flex flex-wrap items-start gap-3 rounded-2xl border border-blue-100 surface-dark:border-surface-blue-border bg-blue-50 surface-dark:bg-surface-blue-soft px-4 py-3"
      >
        <BookOpenCheck className="mt-1 size-4 shrink-0 text-blue-700 surface-dark:text-blue-300" aria-hidden="true" />
        <p className="flex-1 text-sm leading-6 text-blue-800 surface-dark:text-blue-300">{classworkGuidance}</p>
        <p className="flex w-full items-start gap-2 border-t border-blue-100 surface-dark:border-surface-blue-border pt-2 text-xs leading-5 text-blue-800 surface-dark:text-blue-300 sm:w-auto sm:flex-1 sm:border-t-0 sm:pt-0">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {classworkStorageNotice}
        </p>
      </section>

      <Card className="border border-slate-200 surface-dark:border-border bg-white surface-dark:bg-card shadow-sm ring-0">
        <CardContent className="grid gap-1 sm:grid-cols-2 xl:grid-cols-4">
          {classworkSummaryTiles.map(({ label, icon: Icon }, index) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl px-2 py-2 xl:border-l xl:border-slate-100 surface-dark:xl:border-border xl:first:border-l-0 xl:first:pl-0"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 surface-dark:bg-surface-blue-soft text-blue-700 surface-dark:text-blue-300">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs text-slate-500 surface-dark:text-muted-foreground">{label}</p>
                <p className="text-lg font-semibold tabular-nums text-slate-900 surface-dark:text-foreground">{summaryValues[index]}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-slate-200 surface-dark:border-border bg-white surface-dark:bg-card shadow-sm ring-0">
        <CardContent className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 surface-dark:text-foreground">Assigned activities</h3>
              <p className="mt-1 text-sm text-slate-500 surface-dark:text-muted-foreground">
                Search by activity or classroom, or filter by where each activity stands.
              </p>
            </div>
            <Badge variant="outline" className="border-slate-200 surface-dark:border-border bg-slate-50 surface-dark:bg-background text-slate-600 surface-dark:text-muted-foreground">
              {visibleClasswork.length} shown
            </Badge>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 surface-dark:text-muted-foreground"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                aria-label="Search classwork"
                placeholder="Search classwork..."
                className="h-9 rounded-lg border-slate-200 surface-dark:border-border bg-slate-50 surface-dark:bg-background pl-9"
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
                        ? "border-brand bg-brand text-brand-foreground hover:bg-brand/90"
                        : "border-slate-200 surface-dark:border-border text-slate-600 surface-dark:text-muted-foreground hover:bg-slate-50 surface-dark:hover:bg-background"
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
            <div className="rounded-xl border border-dashed border-slate-300 surface-dark:border-border bg-slate-50/60 surface-dark:bg-background/60 p-8 text-center">
              <p className="text-sm font-semibold text-slate-900 surface-dark:text-foreground">No classwork matches this view.</p>
              <p className="mt-1 text-sm leading-5 text-slate-500 surface-dark:text-muted-foreground">
                Try another status or clear the filters to see every activity.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-4 border-brand/30"
                onClick={() => {
                  setStatusFilter("all")
                  setQuery("")
                }}
              >
                Clear filters
              </Button>
            </div>
          )}

          <p className="text-xs leading-5 text-slate-500 surface-dark:text-muted-foreground">
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
            className="flex items-start gap-3 rounded-2xl border border-slate-200 surface-dark:border-border bg-white surface-dark:bg-card p-4 shadow-sm outline-none transition-colors hover:border-blue-200 surface-dark:hover:border-surface-blue-border hover:bg-blue-50/40 surface-dark:hover:bg-surface-blue-soft/40 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900 surface-dark:text-foreground">{label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500 surface-dark:text-muted-foreground">{description}</span>
            </span>
            <ArrowUpRight className="mt-1 size-4 shrink-0 text-blue-700 surface-dark:text-blue-300" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </div>
  )
}