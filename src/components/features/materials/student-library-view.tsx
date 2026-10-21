import { useMemo, useState } from "react"
import { BookOpenCheck, CircleHelp, FolderOpen, Info, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { LibraryContextCards } from "./library-context-cards"
import { LibrarySearchField } from "./library-search-field"
import { ResourceList } from "./resource-list"
import { ResourceSourceFilter } from "./resource-source-filter"
import {
  countLibraryResources,
  filterLibraryResources,
  libraryGuidance,
  librarySourceMeta,
  librarySourceNotice,
  libraryStorageNotice,
  previewLibraryResources,
  type LibraryFilter,
} from "./library-records"

const filterOptions: { value: LibraryFilter; label: string }[] = [
  { value: "all", label: "All sources" },
  { value: "personal", label: "Personal" },
  { value: "classroom", label: "Classroom" },
  { value: "study-space", label: "Study spaces" },
]

export function StudentLibraryView() {
  const [filter, setFilter] = useState<LibraryFilter>("all")
  const [query, setQuery] = useState("")

  const counts = useMemo(
    () => ({
      all: countLibraryResources(previewLibraryResources, "all"),
      personal: countLibraryResources(previewLibraryResources, "personal"),
      classroom: countLibraryResources(previewLibraryResources, "classroom"),
      "study-space": countLibraryResources(previewLibraryResources, "study-space"),
    }),
    []
  )

  const isFiltered = filter !== "all" || query.trim().length > 0

  function clearFilters() {
    setFilter("all")
    setQuery("")
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-8 text-white shadow-lg shadow-sky-950/10 sm:px-9 sm:py-10 lg:px-11">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-40 -z-10 size-96 rounded-full bg-emerald-400/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-52 left-1/3 -z-10 size-96 rounded-full bg-cyan-400/15 blur-3xl"
        />
        <div aria-hidden="true" className="absolute right-[28%] top-8 -z-10 hidden rotate-12 text-white/[0.04] lg:block">
          <BookOpenCheck className="size-56" strokeWidth={1} />
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.65fr)] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Learning library
            </span>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Study Library
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Every resource you can reach, kept with the context that owns it: the notes you wrote, a
              class you joined, or a study space you are part of.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 shadow-inner shadow-white/[0.04] backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                Three learning spaces
              </p>
              <BookOpenCheck aria-hidden="true" className="size-4 text-cyan-200" />
            </div>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-100">
              <li className="flex items-center gap-3 rounded-xl bg-amber-300/10 px-3 py-2.5">
                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-amber-300/20 text-xs font-bold text-amber-200" aria-hidden="true">01</span>
                Your personal resources
              </li>
              <li className="flex items-center gap-3 rounded-xl bg-sky-300/10 px-3 py-2.5">
                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-sky-300/20 text-xs font-bold text-sky-200" aria-hidden="true">02</span>
                Classroom materials
              </li>
              <li className="flex items-center gap-3 rounded-xl bg-emerald-300/10 px-3 py-2.5">
                <span className="inline-flex size-7 items-center justify-center rounded-lg bg-emerald-300/20 text-xs font-bold text-emerald-200" aria-hidden="true">03</span>
                Peer-shared resources
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section
        aria-label="Study Library guidance"
        className="flex flex-wrap items-start gap-3 rounded-2xl border border-cyan-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 px-4 py-3"
      >
        <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
          <FolderOpen className="size-4" aria-hidden="true" />
        </span>
        <p className="flex-1 text-sm leading-6 text-sky-950">{libraryGuidance}</p>
        <p className="flex w-full items-start gap-2 border-t border-cyan-100 pt-2 text-xs leading-5 text-slate-600 sm:w-auto sm:flex-1 sm:border-t-0 sm:pt-0">
          <Info className="mt-0.5 size-3.5 shrink-0 text-emerald-700" aria-hidden="true" />
          {libraryStorageNotice}
        </p>
      </section>

      <section aria-labelledby="library-contexts-heading" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Pick up where you left off
            </p>
            <h3 id="library-contexts-heading" className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              Where are you learning?
            </h3>
          </div>
          <p className="max-w-lg text-sm leading-6 text-slate-500">
            Each source has its own library page, so personal notes, class files, and peer-shared
            resources never get mixed together.
          </p>
        </div>

        <LibraryContextCards resources={previewLibraryResources} />
      </section>

      <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm ring-0">
        <CardContent className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 text-sky-800">
                <FolderOpen aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Everything you can reach</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Search by title, resource kind, class, space, or who shared it.
                </p>
              </div>
            </div>

            <LibrarySearchField
              value={query}
              onValueChange={setQuery}
              label="Search study library resources"
              placeholder="Search resources..."
            />
          </div>

          <Tabs
            value={filter}
            onValueChange={(value) => setFilter((value ?? "all") as LibraryFilter)}
            className="gap-4"
          >
            <ResourceSourceFilter counts={counts} />

            {filterOptions.map((option) => {
              const visibleResources = filterLibraryResources(
                previewLibraryResources,
                option.value,
                query
              )
              const sourceMeta = option.value === "all" ? null : librarySourceMeta[option.value]

              return (
                <TabsContent key={option.value} value={option.value} className="space-y-4">
                  <p className="text-xs text-slate-500" role="status">
                    {visibleResources.length}{" "}
                    {visibleResources.length === 1 ? "resource" : "resources"} shown
                    {sourceMeta ? ` in ${sourceMeta.shortLabel.toLowerCase()} resources` : " across every source"}
                  </p>

                  <ResourceList
                    resources={visibleResources}
                    isFiltered={isFiltered}
                    onClearFilters={clearFilters}
                    emptyTitle="No resources match this view"
                    emptyDescription="Try another source, clear the search, or open the context that owns the resources you are looking for."
                    emptyActionLabel="Open My Classes"
                    emptyActionHref="/students/classrooms"
                  />
                </TabsContent>
              )
            })}
          </Tabs>
        </CardContent>
      </Card>

      <aside className="flex items-start gap-3 rounded-2xl border border-dashed border-amber-300 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-5 sm:p-6">
        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
          <CircleHelp aria-hidden="true" className="size-4" />
        </span>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">Your material library is not connected yet</h3>
          <p className="text-sm leading-6 text-slate-600">{librarySourceNotice}</p>
          <p className="text-sm leading-6 text-slate-600">
            Resource browsing, uploads, and sharing will appear here once the materials service is in
            place.
          </p>
        </div>
      </aside>
    </div>
  )
}
