import { useMemo, useState } from "react"
import { ArrowRight, BookOpen, Info, Sparkles } from "lucide-react"
import { Link } from "react-router"
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
  librarySources,
  previewLibraryResources,
  type LibraryFilter,
} from "./library-records"
import type { LibraryResourceKind, LibrarySource } from "./library-types"

const collections: Record<LibrarySource, { title: string; description: string }> = {
  personal: { title: "Made for your next study session", description: "Your personal notes, references, and a little head start." },
  classroom: { title: "From the classroom", description: "Educator-published materials, connected to their class." },
  "study-space": { title: "Better when shared", description: "Peer resources from the spaces where you learn together." },
}

function LibraryBannerPaper({ side }: { side: "left" | "right" }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute top-9 hidden h-56 w-40 rounded-lg border border-border/70 bg-white p-5 shadow-lg shadow-slate-900/5 xl:block ${side === "left" ? "-left-6 -rotate-12" : "-right-4 rotate-12"}`}>
      <span className={`mb-4 flex size-8 items-center justify-center rounded-lg ${side === "left" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}><BookOpen className="size-4" /></span>
      <div className="h-2 w-3/4 rounded bg-slate-200" />
      <div className="mt-2 h-1 w-1/2 rounded bg-slate-100" />
      <div className="mt-5 space-y-2">
        {["w-full", "w-4/5", "w-full", "w-3/5", "w-4/5"].map((width, index) => <div key={index} className={`h-1 rounded bg-slate-100 ${width}`} />)}
      </div>
      <div className={`mt-4 h-8 rounded ${side === "left" ? "bg-amber-50" : "bg-emerald-50"}`} />
    </div>
  )
}

export function StudentLibraryView() {
  const [filter, setFilter] = useState<LibraryFilter>("all")
  const [query, setQuery] = useState("")
  const [selectedKinds, setSelectedKinds] = useState<LibraryResourceKind[]>([])
  const [layout, setLayout] = useState<"grid" | "list">("grid")
  const counts = useMemo(() => ({
    all: countLibraryResources(previewLibraryResources, "all"),
    personal: countLibraryResources(previewLibraryResources, "personal"),
    classroom: countLibraryResources(previewLibraryResources, "classroom"),
    "study-space": countLibraryResources(previewLibraryResources, "study-space"),
  }), [])
  const isFiltered = filter !== "all" || query.trim().length > 0 || selectedKinds.length > 0
  const showCollections = !isFiltered && layout === "grid"

  function toggleKind(kind: LibraryResourceKind) {
    setSelectedKinds((current) => current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind])
  }

  function clearFilters() {
    setFilter("all")
    setQuery("")
    setSelectedKinds([])
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 rounded-2xl border border-border/70 bg-card p-4 sm:p-6 lg:p-7">
      <section aria-labelledby="study-library-heading" className="relative isolate overflow-hidden rounded-xl border border-border/40 bg-gradient-to-r from-orange-50 via-stone-50 to-emerald-50 px-5 py-6 sm:px-8 sm:py-7">
        <LibraryBannerPaper side="left" />
        <LibraryBannerPaper side="right" />
        <div className="relative mx-auto max-w-xl text-center">
          <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><Sparkles aria-hidden="true" className="size-3" /> A little curiosity goes a long way</p>
          <h2 id="study-library-heading" className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Welcome to your Study Library</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">A place for your notes, classroom discoveries, and ideas worth sharing. Find your next starting point.</p>
          <div className="mx-auto mt-4 max-w-md [&>div]:w-full [&_input]:h-10 [&_input]:border-white [&_input]:bg-white [&_input]:shadow-sm">
            <LibrarySearchField value={query} onValueChange={setQuery} label="Search study library resources" placeholder="Search by title, subject, or source…" />
          </div>
        </div>
      </section>

      <Tabs value={filter} onValueChange={(value) => setFilter((value ?? "all") as LibraryFilter)} className="gap-4">
        <div className="space-y-3">
          <ResourceSourceFilter counts={counts} />
          <LibraryCategoryRow selectedKinds={selectedKinds} onToggleKind={toggleKind} onClearKinds={() => setSelectedKinds([])} layout={layout} onLayoutChange={setLayout} />
        </div>

        {(["all", ...librarySources] as LibraryFilter[]).map((source) => {
          const resources = filterLibraryResources(previewLibraryResources, source, query, selectedKinds)
          const shownCount = showCollections ? librarySources.reduce((sum, item) => sum + Math.min(4, counts[item]), 0) : resources.length
          const renderResources = (items: typeof resources) => layout === "list" && items.length > 0 ? (
            <ul className="space-y-2">
              {items.map((resource) => <ResourceListRow key={resource.id} resource={resource} />)}
            </ul>
          ) : (
            <ResourceList resources={items} presentation="gallery" isFiltered={isFiltered} onClearFilters={clearFilters} emptyTitle="No resources match this view" emptyDescription="Try another source, resource kind, or search term." emptyActionLabel="Open My Classes" emptyActionHref="/students/classrooms" />
          )

          return (
            <TabsContent key={source} value={source} className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 text-xs leading-5 text-muted-foreground">
                <p className="flex max-w-xl items-start gap-1.5"><Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" /><span><strong className="font-medium text-foreground">Sample collection.</strong> Illustrative covers and example resources. Files, uploads, and sync aren’t connected.</span></p>
                <p role="status">{shownCount} {shownCount === 1 ? "resource" : "resources"} shown{showCollections ? ` of ${counts.all}` : ""}</p>
              </div>
              {showCollections ? librarySources.map((item) => (
                <section key={item} aria-labelledby={`collection-${item}`} className="space-y-3">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h3 id={`collection-${item}`} className="text-base font-semibold tracking-tight text-foreground">{collections[item].title}</h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{collections[item].description}</p>
                    </div>
                    <Link to={librarySourceMeta[item].libraryHref} className="inline-flex shrink-0 items-center gap-1 rounded text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`View all ${librarySourceMeta[item].label.toLowerCase()}`}>View all <ArrowRight aria-hidden="true" className="size-3.5" /></Link>
                  </div>
                  {renderResources(filterLibraryResources(previewLibraryResources, item, "").slice(0, 4))}
                </section>
              )) : (
                <section aria-label="Library results" className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">{source === "all" ? "Search results" : librarySourceMeta[source].label}</h3>
                  {renderResources(resources)}
                </section>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      <section aria-labelledby="library-contexts-heading" className="space-y-3 border-t border-border pt-5">
        <h3 id="library-contexts-heading" className="text-base font-semibold tracking-tight">Explore your learning spaces</h3>
        <LibraryContextCards />
      </section>
    </div>
  )
}
