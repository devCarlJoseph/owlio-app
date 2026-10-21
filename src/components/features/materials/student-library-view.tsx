import { useMemo, useState } from "react"
import { CircleHelp, FolderOpen, Info } from "lucide-react"
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
      <section className="relative isolate overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-sm sm:px-9 sm:py-10 lg:px-11">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-40 -z-10 size-96 rounded-full bg-emerald-400/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-52 left-1/3 -z-10 size-96 rounded-full bg-sky-500/10 blur-3xl"
        />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.65fr)] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              Learning library
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Study Library
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Every resource you can reach, kept with the context that owns it: the notes you wrote, a
              class you joined, or a study space you are part of.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Keep context clear
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-amber-300" aria-hidden="true" />
                Personal work stays yours
              </li>
              <li className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-sky-300" aria-hidden="true" />
                Classroom materials stay with the class
              </li>
              <li className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-emerald-300" aria-hidden="true" />
                Peer resources stay with the study space
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section
        aria-label="Study Library guidance"
        className="flex flex-wrap items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
      >
        <FolderOpen className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
        <p className="flex-1 text-sm leading-6 text-blue-800">{libraryGuidance}</p>
        <p className="flex w-full items-start gap-2 border-t border-blue-100 pt-2 text-xs leading-5 text-blue-800 sm:w-auto sm:flex-1 sm:border-t-0 sm:pt-0">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {libraryStorageNotice}
        </p>
      </section>

      <section aria-labelledby="library-contexts-heading" className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Start with the right context
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

      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardContent className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Everything you can reach</h3>
              <p className="mt-1 text-sm text-slate-500">
                Search by title, resource kind, class, space, or who shared it.
              </p>
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

      <aside className="flex items-start gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 sm:p-6">
        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
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
