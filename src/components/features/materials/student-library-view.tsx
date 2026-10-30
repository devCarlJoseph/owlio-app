import { useMemo, useState } from "react"
import { BookOpenCheck, FolderOpen, Info, Sparkles } from "lucide-react"
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
  librarySourceMeta,
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
      <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-700 via-teal-700 to-emerald-700 px-6 py-8 text-white shadow-lg shadow-teal-950/25 sm:px-9 sm:py-10 lg:px-11">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-40 -z-10 size-96 rounded-full bg-cyan-200/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-52 left-1/3 -z-10 size-96 rounded-full bg-emerald-300/25 blur-3xl"
        />
        <div aria-hidden="true" className="absolute right-[28%] top-8 -z-10 hidden rotate-12 text-white/[0.08] lg:block">
          <BookOpenCheck className="size-56" strokeWidth={1} />
        </div>

        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-100/40 bg-teal-50/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-50">
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
            className="group/info relative inline-flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-teal-50 outline-none transition hover:bg-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
          >
            <Info aria-hidden="true" className="size-4" />
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-64 rounded-xl bg-teal-950 p-3 text-left text-xs leading-5 text-white opacity-0 shadow-lg ring-1 ring-white/15 transition-opacity group-hover/info:opacity-100 group-focus-visible/info:opacity-100"
            >
              Every resource you can reach, kept with the context that owns it: the notes you wrote, a
              class you joined, or a study space you are part of.
            </span>
          </button>
        </div>
      </section>

      <section aria-label="Study Library sources">
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
    </div>
  )
}
