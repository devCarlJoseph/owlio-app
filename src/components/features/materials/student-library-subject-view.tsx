import { useMemo } from "react"
import { ChevronLeft, Info } from "lucide-react"
import { Link, useParams } from "react-router"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ResourceCard } from "./resource-card"
import {
  findLibraryContextBySlug,
  librarySourceMeta,
  libraryStorageNotice,
  previewLibraryResources,
} from "./library-records"
import type { LibrarySource } from "./library-types"

type StudentLibrarySubjectViewProps = {
  source: LibrarySource
}

export function StudentLibrarySubjectView({ source }: StudentLibrarySubjectViewProps) {
  const { subject } = useParams()
  const meta = librarySourceMeta[source]

  const resources = useMemo(() => {
    const context = findLibraryContextBySlug(previewLibraryResources, subject)
    if (!context) return []

    return previewLibraryResources.filter(
      (resource) => resource.source === source && resource.context === context
    )
  }, [subject, source])

  const contextName = resources[0]?.context

  if (!contextName) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <Link
          to={meta.libraryHref}
          className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-slate-600 outline-none hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          {meta.label}
        </Link>

        <Card className={cn("shadow-sm ring-0", meta.panelClassName)}>
          <CardContent className="items-center py-10 text-center">
            <h2 className="text-base font-semibold text-slate-900">Subject not found</h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-slate-600">
              There are no resources for this {meta.shortLabel.toLowerCase()} group in your library.
            </p>
            <Link
              to={meta.libraryHref}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "mt-4",
                meta.buttonClassName,
              )}
            >
              Back to {meta.shortLabel.toLowerCase()} resources
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <li>
            <Link
              to="/students/materials"
              className="rounded-md font-medium text-slate-600 outline-none hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Study Library
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            /
          </li>
          <li>
            <Link
              to={meta.libraryHref}
              className="rounded-md font-medium text-slate-600 outline-none hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {meta.label}
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            /
          </li>
          <li aria-current="page" className="font-medium text-slate-900">
            {contextName}
          </li>
        </ol>
      </nav>

      <section
        className={cn(
          "rounded-2xl border p-6 shadow-sm sm:p-8",
          meta.headerClassName,
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Badge variant="outline" className={meta.badgeClassName}>
              {meta.ownerLabel}
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {contextName}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Every resource you collected for {contextName}.
            </p>
          </div>

          <span
            className={`inline-flex size-12 shrink-0 items-center justify-center rounded-2xl ${meta.iconClassName}`}
          >
            <meta.icon aria-hidden="true" className="size-6" />
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            to={meta.libraryHref}
            className={cn(
              buttonVariants({ variant: "default", size: "default" }),
              meta.buttonClassName,
            )}
          >
            <ChevronLeft aria-hidden="true" />
            Back to {meta.shortLabel.toLowerCase()} resources
          </Link>
        </div>
      </section>

      <Card className={cn("shadow-sm ring-0", meta.panelClassName)}>
        <CardContent className="gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Resources in this library</h3>
            <p className="mt-1 text-sm text-slate-500">
              {resources.length} {resources.length === 1 ? "resource" : "resources"} collected.
            </p>
          </div>

          <ul className="grid gap-4 lg:grid-cols-2">
            {resources.map((resource) => (
              <li key={resource.id}>
                <ResourceCard resource={resource} />
              </li>
            ))}
          </ul>

          <p className="flex items-start gap-2 text-xs leading-5 text-slate-600">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            {libraryStorageNotice}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
