import { useMemo, useState } from "react"
import { ChevronLeft, FolderOpen, Info } from "lucide-react"
import { Link } from "react-router"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LibrarySearchField } from "./library-search-field"
import { ResourceCard } from "./resource-card"
import { ResourceList } from "./resource-list"
import {
  filterLibraryResources,
  groupLibraryResources,
  librarySourceMeta,
  libraryStorageNotice,
  previewLibraryResources,
} from "./library-records"
import type { LibrarySource } from "./library-types"

const sourceSecondaryLinks: Record<LibrarySource, { label: string; href: string }[]> = {
  personal: [
    { label: "Open Notes", href: "/students/notes" },
    { label: "Open My Learning", href: "/students/subjects" },
  ],
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

  const resources = useMemo(
    () => filterLibraryResources(previewLibraryResources, source, query),
    [source, query]
  )

  const groups = useMemo(() => groupLibraryResources(resources), [resources])

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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Badge variant="outline" className={meta.badgeClassName}>
              {meta.ownerLabel}
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {meta.label}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{meta.description}</p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{meta.ownerNote}</p>
          </div>

          <span
            className={`inline-flex size-12 shrink-0 items-center justify-center rounded-2xl ${meta.iconClassName}`}
          >
            <SourceIcon aria-hidden="true" className="size-6" />
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            to={meta.ownerHref}
            className={cn(
              buttonVariants({ variant: "default", size: "default" }),
              "bg-blue-700 text-white hover:bg-blue-800",
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
                className={buttonVariants({ variant: "outline", size: "default" })}
              >
                {link.label}
              </Link>
            ))}
        </div>
      </section>

      <section
        aria-label="Library guidance"
        className="flex flex-wrap items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
      >
        <FolderOpen className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
        <p className="flex-1 text-sm leading-6 text-blue-800">
          Opening a resource takes you to the context that owns it. Nothing here is copied, moved, or
          shared between contexts.
        </p>
        <p className="flex w-full items-start gap-2 border-t border-blue-100 pt-2 text-xs leading-5 text-blue-800 sm:w-auto sm:flex-1 sm:border-t-0 sm:pt-0">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {libraryStorageNotice}
        </p>
      </section>

      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardContent className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Resources in this library</h3>
              <p className="mt-1 text-sm text-slate-500">
                Search by title, resource kind, context, or who shared it.
              </p>
            </div>

            <LibrarySearchField
              value={query}
              onValueChange={setQuery}
              label={`Search ${meta.shortLabel.toLowerCase()} resources`}
              placeholder="Search resources..."
            />
          </div>

          <p className="text-xs text-slate-500" role="status">
            {resources.length} {resources.length === 1 ? "resource" : "resources"} shown
          </p>

          {resources.length > 0 ? (
            <div className="space-y-6">
              {groups.map((group) => {
                const groupId = `group-${source}-${group.context
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")}`

                return (
                  <section key={group.context} aria-labelledby={groupId}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 id={groupId} className="text-sm font-semibold text-slate-900">
                        {group.context}
                      </h4>
                      <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                        {group.items.length}{" "}
                        {group.items.length === 1 ? "resource" : "resources"}
                      </Badge>
                    </div>

                    <ul className="mt-3 grid gap-4 lg:grid-cols-2">
                      {group.items.map((resource) => (
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
              resources={resources}
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
