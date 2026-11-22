import { FileQuestion } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ResourceCard } from "./resource-card"
import { LibraryGalleryCard } from "./library-gallery-card"
import type { LibraryResource } from "../types/library-types"

type ResourceListProps = {
  resources: LibraryResource[]
  isFiltered: boolean
  onClearFilters: () => void
  emptyTitle: string
  emptyDescription: string
  emptyActionLabel: string
  emptyActionHref?: string
  presentation?: "default" | "gallery"
}

export function ResourceList({
  resources,
  isFiltered,
  onClearFilters,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionHref,
  presentation = "default",
}: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <Empty className="border border-dashed border-slate-300 surface-dark:border-border bg-slate-50/60 surface-dark:bg-background/60 p-8 sm:p-10">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-slate-100 surface-dark:bg-muted text-slate-500 surface-dark:text-muted-foreground">
            <FileQuestion aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle className="text-base text-slate-900 surface-dark:text-foreground">{emptyTitle}</EmptyTitle>
          <EmptyDescription className="text-slate-600 surface-dark:text-muted-foreground">{emptyDescription}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {isFiltered ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="border-blue-200 surface-dark:border-surface-blue-border bg-blue-50 surface-dark:bg-surface-blue-soft text-blue-700 surface-dark:text-blue-300 hover:bg-blue-100 surface-dark:hover:bg-surface-blue-soft hover:text-blue-800 surface-dark:hover:text-blue-300"
            >
              Clear filters
            </Button>
          ) : (
            emptyActionHref && (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link to={emptyActionHref} />}
                className="border-blue-200 surface-dark:border-surface-blue-border bg-blue-50 surface-dark:bg-surface-blue-soft text-blue-700 surface-dark:text-blue-300 hover:bg-blue-100 surface-dark:hover:bg-surface-blue-soft hover:text-blue-800 surface-dark:hover:text-blue-300"
              >
                {emptyActionLabel}
              </Button>
            )
          )}
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <ul className={presentation === "gallery" ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-4" : "grid gap-4 lg:grid-cols-2"}>
      {resources.map((resource) => (
        <li key={resource.id}>
          {presentation === "gallery" && resource.availability === "available" ? <LibraryGalleryCard resource={resource} /> : <ResourceCard resource={resource} />}
        </li>
      ))}
    </ul>
  )
}
