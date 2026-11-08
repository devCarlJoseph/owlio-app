import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, FolderOpen } from "lucide-react"
import { Link } from "react-router"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LibrarySearchField } from "./library-search-field"
import { ResourceCard } from "./resource-card"
import { ResourceList } from "./resource-list"
import { PersonalLibraryWork } from "./workspace/personal-library-work"
import {
  filterLibraryResources,
  groupLibraryResources,
  librarySourceMeta,
  librarySubjectPreviewLimit,
  previewLibraryResources,
  slugifyLibraryContext,
} from "./library-records"
import type { LibrarySource } from "./library-types"

const sourceSecondaryLinks: Record<LibrarySource, { label: string; href: string }[]> = {
  personal: [],
  classroom: [{ label: "Open My Classes", href: "/students/classrooms" }],
  "study-space": [{ label: "Open Study Spaces", href: "/students/study-spaces" }],
}

type StudentLibrarySourceViewProps = {
  source: LibrarySource
}

export function StudentLibrarySourceView({ source }: StudentLibrarySourceViewProps) {
  const meta = librarySourceMeta[source]
  const SourceIcon = meta.icon
  const [query, setQuery] = useState("")
  const [activeContext, setActiveContext] = useState("all")

  const resources = useMemo(
    () => filterLibraryResources(previewLibraryResources, source, query),
    [source, query]
  )

  const subjectCategories = useMemo(() => {
    const contexts = new Set<string>()

    for (const resource of previewLibraryResources) {
      if (resource.source === source) contexts.add(resource.context)
    }

    return [...contexts].sort((a, b) => a.localeCompare(b))
  }, [source])

  const visibleResources = useMemo(
    () =>
      activeContext === "all"
        ? resources
        : resources.filter((resource) => resource.context === activeContext),
    [activeContext, resources]
  )

  const groups = useMemo(() => groupLibraryResources(visibleResources), [visibleResources])
  const isPreviewing = activeContext === "all"

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <li>
            <Link
              to="/students/materials"
              className="inline-flex items-center gap-1 rounded-md font-medium text-slate-600 outline-none hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
              Study Library
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            /
          </li>
          <li aria-current="page" className="font-medium text-slate-900">
            {meta.label}
          </li>
        </ol>
      </nav>

      <section
        className={cn(
          "rounded-3xl border p-6 shadow-sm sm:p-8",
          meta.headerClassName,
        )}
      >
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 sm:gap-x-5">
          <span
            className={cn(
              "col-start-1 row-span-3 row-start-1 inline-flex w-16 shrink-0 items-center justify-center rounded-3xl sm:w-22",
              meta.iconClassName,
            )}
          >
            <SourceIcon aria-hidden="true" className="size-7 sm:size-9" />
          </span>

          <p
            className={cn(
              "col-start-2 row-start-1 text-[11px] font-semibold tracking-[0.16em] uppercase",
              meta.eyebrowClassName,
            )}
          >
            {meta.ownerLabel}
          </p>

          <h2 className="col-start-2 row-start-2 mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {meta.label}
          </h2>

          <p className="col-start-2 row-start-3 mt-2 max-w-xl text-sm leading-6 text-slate-600">
            {meta.description}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            to={meta.ownerHref}
            className={cn(
              buttonVariants({ variant: "default", size: "default" }),
              "px-5",
              meta.buttonClassName,
            )}
          >
            {meta.ownerAction}
          </Link>

          {sourceSecondaryLinks[source]
            .filter((link) => link.href !== meta.ownerHref)
            .map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "default" }),
                  "px-4",
                  meta.ghostClassName,
                )}
              >
                {link.label}
              </Link>
            ))}
        </div>
      </section>

      {source === "personal" && <PersonalLibraryWork query={query} />}

      <section
        aria-label="Library guidance"
        className="flex flex-wrap items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
      >
        <FolderOpen className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
        <p className="flex-1 text-sm leading-6 text-blue-800">
          {source === "personal" ? "Your documents open in Owlio. Example resources below link to their owning context." : "Opening a resource takes you to the context that owns it. Nothing here is copied, moved, or shared between contexts."}
        </p>
      </section>

      <Card className={cn("shadow-sm ring-0", meta.panelClassName)}>
        <CardContent className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Sample resources in this library</h3>
              <p className="mt-1 text-sm text-slate-500">
                Example resources link to their owning context. External files and account sync aren’t connected.
              </p>
            </div>

            <LibrarySearchField
              value={query}
              onValueChange={setQuery}
              label={`Search ${meta.shortLabel.toLowerCase()} resources`}
              placeholder="Search resources..."
            />
          </div>

          <div
            role="group"
            aria-label="Subject categories"
            className="flex flex-wrap items-center gap-2"
          >
            <Button
              type="button"
              size="xs"
              variant="outline"
              aria-pressed={activeContext === "all"}
              onClick={() => setActiveContext("all")}
              className={cn(
                activeContext === "all"
                  ? cn("border-transparent", meta.buttonClassName)
                  : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white",
              )}
            >
              All
            </Button>

            {subjectCategories.map((context) => {
              const isActive = activeContext === context

              return (
                <Button
                  key={context}
                  type="button"
                  size="xs"
                  variant="outline"
                  aria-pressed={isActive}
                  onClick={() => setActiveContext(context)}
                  className={cn(
                    "min-w-0",
                    isActive
                      ? cn("border-transparent", meta.buttonClassName)
                      : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white",
                  )}
                >
                  <span className="truncate">{context}</span>
                </Button>
              )
            })}
          </div>

          {isPreviewing ? (
            <p className="text-xs text-slate-500" role="status">
              {visibleResources.length}{" "}
              {visibleResources.length === 1 ? "resource" : "resources"} shown
            </p>
          ) : null}

          {visibleResources.length > 0 ? (
            <div className="space-y-6">
              {groups.map((group) => {
                const groupId = `group-${source}-${slugifyLibraryContext(group.context)}`
                const subjectHref = `${meta.libraryHref}/${slugifyLibraryContext(group.context)}`
                const visibleItems =
                  isPreviewing && group.items.length > librarySubjectPreviewLimit
                    ? group.items.slice(0, librarySubjectPreviewLimit)
                    : group.items
                const hiddenCount = group.items.length - visibleItems.length

                return (
                  <section key={group.context} aria-labelledby={groupId}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 id={groupId} className="text-sm font-semibold text-slate-900">
                        <Link
                          to={subjectHref}
                          className={cn(
                            "rounded outline-none hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                            meta.linkClassName,
                          )}
                        >
                          {group.context}
                        </Link>
                      </h4>

                      <span className="group/count relative inline-flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-white/70 text-slate-600"
                        >
                          {group.items.length}{" "}
                          {group.items.length === 1 ? "resource" : "resources"}
                        </Badge>

                        {hiddenCount > 0 ? (
                          <>
                            <button
                              type="button"
                              aria-label={`Show all ${group.context} resources`}
                              onClick={() => setActiveContext(group.context)}
                              className="inline-flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 outline-none transition hover:bg-white hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                              <ChevronRight aria-hidden="true" className="size-4" />
                            </button>
                            <span
                              role="tooltip"
                              className="pointer-events-none absolute bottom-full right-0 z-10 mb-1 rounded-md bg-slate-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/count:opacity-100"
                            >
                              Show more
                            </span>
                          </>
                        ) : null}
                      </span>
                    </div>

                    <ul className="mt-3 grid gap-4 lg:grid-cols-2">
                      {visibleItems.map((resource) => (
                        <li key={resource.id}>
                          <ResourceCard resource={resource} />
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          ) : (
            <ResourceList
              resources={visibleResources}
              isFiltered={query.trim().length > 0}
              onClearFilters={() => setQuery("")}
              emptyTitle="No resources match this search"
              emptyDescription="Clear the search to see every resource in this library."
              emptyActionLabel={meta.ownerAction}
              emptyActionHref={meta.ownerHref}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
