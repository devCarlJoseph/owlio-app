import { useMemo, useState } from "react"
import { BookOpenCheck, CircleHelp, FolderOpen, Info, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { LibraryCategoryRow } from "./library-category-row"
import { LibraryContextCards } from "./library-context-cards"
import { LibrarySearchField } from "./library-search-field"
import { ResourceList } from "./resource-list"
import { ResourceListRow } from "./resource-list-row"
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
import type { LibraryResourceKind } from "./library-types"

const filterOptions: { value: LibraryFilter; label: string }[] = [
  { value: "all", label: "All sources" },
  { value: "personal", label: "Personal" },
  { value: "classroom", label: "Classroom" },
  { value: "study-space", label: "Study spaces" },
]

export function StudentLibraryView() {
  const [filter, setFilter] = useState<LibraryFilter>("all")
  const [query, setQuery] = useState("")
  const [selectedKinds, setSelectedKinds] = useState<LibraryResourceKind[]>([])
  const [layout, setLayout] = useState<"grid" | "list">("grid")

  const counts = useMemo(
    () => ({
      all: countLibraryResources(previewLibraryResources, "all"),
      personal: countLibraryResources(previewLibraryResources, "personal"),
      classroom: countLibraryResources(previewLibraryResources, "classroom"),
      "study-space": countLibraryResources(previewLibraryResources, "study-space"),
    }),
    []
  )

  const isFiltered =
    filter !== "all" || query.trim().length > 0 || selectedKinds.length > 0

  function toggleKind(kind: LibraryResourceKind) {
    setSelectedKinds((current) =>
      current.includes(kind)
        ? current.filter((item) => item !== kind)
        : [...current, kind]
    )
  }

  function clearFilters() {
    setFilter("all")
    setQuery("")
    setSelectedKinds([])
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

        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
            <Sparkles aria-hidden="true" className="size-3" />
            Learning library
          </span>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Study Library
          </h2>
        </div>

        <div className="absolute bottom-5 right-5 sm:bottom-7 sm:right-8">
          <button
            type="button"
            aria-label="About the Study Library"
            className="group/info relative inline-flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-200 outline-none transition hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
          >
            <Info aria-hidden="true" className="size-4" />
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-64 rounded-xl bg-slate-950 p-3 text-left text-xs leading-5 text-white opacity-0 shadow-lg ring-1 ring-white/15 transition-opacity group-hover/info:opacity-100 group-focus-visible/info:opacity-100"
            >
              Every resource you can reach, kept with the context that owns it: the notes you wrote, a
              class you joined, or a study space you are part of.
            </span>
          </button>
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
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
            Pick up where you left off
          </p>
          <h3 id="library-contexts-heading" className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            Where are you learning?
          </h3>
        </div>

        <LibraryContextCards />
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
                query,
                selectedKinds
              )
              const sourceMeta = option.value === "all" ? null : librarySourceMeta[option.value]

              return (
                <TabsContent key={option.value} value={option.value} className="space-y-4">
                  <LibraryCategoryRow
                    selectedKinds={selectedKinds}
                    onToggleKind={toggleKind}
                    onClearKinds={() => setSelectedKinds([])}
                    layout={layout}
                    onLayoutChange={setLayout}
                  />

                  <p className="text-xs text-slate-500" role="status">
                    {visibleResources.length}{" "}
                    {visibleResources.length === 1 ? "resource" : "resources"} shown
                    {sourceMeta ? ` in ${sourceMeta.shortLabel.toLowerCase()} resources` : " across every source"}
                  </p>

                  {layout === "grid" ? (
                    <ResourceList
                      resources={visibleResources}
                      isFiltered={isFiltered}
                      onClearFilters={clearFilters}
                      emptyTitle="No resources match this view"
                      emptyDescription="Try another source, clear the search, or open the context that owns the resources you are looking for."
                      emptyActionLabel="Open My Classes"
                      emptyActionHref="/students/classrooms"
                    />
                  ) : visibleResources.length > 0 ? (
                    <ul className="space-y-2">
                      {visibleResources.map((resource) => (
                        <ResourceListRow key={resource.id} resource={resource} />
                      ))}
                    </ul>
                  ) : (
                    <ResourceList
                      resources={visibleResources}
                      isFiltered={isFiltered}
                      onClearFilters={clearFilters}
                      emptyTitle="No resources match this view"
                      emptyDescription="Try another source, clear the search, or open the context that owns the resources you are looking for."
                      emptyActionLabel="Open My Classes"
                      emptyActionHref="/students/classrooms"
                    />
                  )}
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
