import {
  BookOpen,
  FileText,
  GraduationCap,
  Link2,
  NotebookPen,
  Presentation,
  Table2,
  Users,
  type LucideIcon,
} from "lucide-react"
import type {
  LibraryResource,
  LibraryResourceKind,
  LibrarySource,
  LibrarySourceMeta,
} from "../types/library-types"

export const librarySourceMeta: Record<LibrarySource, LibrarySourceMeta> = {
  personal: {
    id: "personal",
    label: "Personal resources",
    shortLabel: "Personal",
    ownerLabel: "You own these",
    description: "Your own notes and references, kept in your workspace.",
    icon: NotebookPen,
    iconClassName: "bg-amber-100 surface-dark:bg-surface-amber-soft text-amber-800 surface-dark:text-amber-300",
    eyebrowClassName: "text-amber-700 surface-dark:text-amber-300",
    badgeClassName: "border-amber-200 surface-dark:border-surface-amber-border bg-white/80 surface-dark:bg-card/80 text-amber-800 surface-dark:text-amber-300",
    cardClassName: "border-amber-200 surface-dark:border-surface-amber-border bg-amber-50 surface-dark:bg-surface-amber-soft",
    buttonClassName: "bg-amber-600 text-white hover:bg-amber-700",
    ghostClassName: "text-amber-800 surface-dark:text-amber-300 hover:bg-amber-100 surface-dark:hover:bg-surface-amber-soft",
    headerClassName: "border-amber-200 surface-dark:border-surface-amber-border bg-gradient-to-br from-amber-50 surface-dark:from-surface-amber-soft via-white surface-dark:via-card to-orange-50 surface-dark:to-surface-orange-soft",
    linkClassName: "hover:text-amber-700 surface-dark:hover:text-amber-300",
    panelClassName: "border-amber-200 surface-dark:border-surface-amber-border bg-gradient-to-br from-amber-50/80 surface-dark:from-surface-amber-soft/80 via-white surface-dark:via-card to-orange-50/70 surface-dark:to-surface-orange-soft/70",
    libraryHref: "/students/materials/personal",
    ownerHref: "/students/subjects",
    ownerAction: "Open My Learning",
  },
  classroom: {
    id: "classroom",
    label: "Classroom materials",
    shortLabel: "Classroom",
    ownerLabel: "Educator-published",
    description: "Files your educator published to a class you joined.",
    icon: GraduationCap,
    iconClassName: "bg-sky-100 surface-dark:bg-surface-sky-soft text-sky-800 surface-dark:text-sky-300",
    eyebrowClassName: "text-sky-700 surface-dark:text-sky-300",
    badgeClassName: "border-sky-200 surface-dark:border-surface-sky-border bg-white/80 surface-dark:bg-card/80 text-sky-800 surface-dark:text-sky-300",
    cardClassName: "border-sky-200 surface-dark:border-surface-sky-border bg-sky-50 surface-dark:bg-surface-sky-soft",
    buttonClassName: "bg-sky-600 text-white hover:bg-sky-700",
    ghostClassName: "text-sky-800 surface-dark:text-sky-300 hover:bg-sky-100 surface-dark:hover:bg-surface-sky-soft",
    headerClassName: "border-sky-200 surface-dark:border-surface-sky-border bg-gradient-to-br from-sky-100 surface-dark:from-surface-sky-soft via-white surface-dark:via-card to-blue-100 surface-dark:to-surface-blue-soft",
    linkClassName: "hover:text-sky-700 surface-dark:hover:text-sky-300",
    panelClassName: "border-sky-200 surface-dark:border-surface-sky-border bg-gradient-to-br from-sky-100 surface-dark:from-surface-sky-soft via-white surface-dark:via-card to-blue-100 surface-dark:to-surface-blue-soft",
    libraryHref: "/students/materials/classroom",
    ownerHref: "/students/classrooms",
    ownerAction: "Open My Classes",
  },
  "study-space": {
    id: "study-space",
    label: "Study space resources",
    shortLabel: "Study spaces",
    ownerLabel: "Peer-shared",
    description: "What your peers shared in a space you belong to.",
    icon: Users,
    iconClassName: "bg-emerald-100 surface-dark:bg-surface-emerald-soft text-emerald-800 surface-dark:text-emerald-300",
    eyebrowClassName: "text-emerald-700 surface-dark:text-emerald-300",
    badgeClassName: "border-emerald-200 surface-dark:border-surface-emerald-border bg-white/80 surface-dark:bg-card/80 text-emerald-800 surface-dark:text-emerald-300",
    cardClassName: "border-emerald-200 surface-dark:border-surface-emerald-border bg-emerald-50 surface-dark:bg-surface-emerald-soft",
    buttonClassName: "bg-emerald-600 text-white hover:bg-emerald-700",
    ghostClassName: "text-emerald-800 surface-dark:text-emerald-300 hover:bg-emerald-100 surface-dark:hover:bg-surface-emerald-soft",
    headerClassName: "border-emerald-200 surface-dark:border-surface-emerald-border bg-gradient-to-br from-emerald-50 surface-dark:from-surface-emerald-soft via-white surface-dark:via-card to-teal-50 surface-dark:to-surface-teal-soft",
    linkClassName: "hover:text-emerald-700 surface-dark:hover:text-emerald-300",
    panelClassName: "border-emerald-200 surface-dark:border-surface-emerald-border bg-gradient-to-br from-emerald-50/80 surface-dark:from-surface-emerald-soft/80 via-white surface-dark:via-card to-teal-50/70 surface-dark:to-surface-teal-soft/70",
    libraryHref: "/students/materials/study-spaces",
    ownerHref: "/students/study-spaces",
    ownerAction: "Open Study Spaces",
  },
}

export const libraryKinds: LibraryResourceKind[] = [
  "Note",
  "Template",
  "Worksheet",
  "Slides",
  "Reading",
  "Link",
  "Document",
]

export const librarySources: LibrarySource[] = ["personal", "classroom", "study-space"]

export const libraryKindIcons: Record<LibraryResourceKind, LucideIcon> = {
  Note: NotebookPen,
  Template: Table2,
  Worksheet: FileText,
  Slides: Presentation,
  Reading: BookOpen,
  Link: Link2,
  Document: FileText,
}

export const previewLibraryResources: LibraryResource[] = []

export type LibraryFilter = LibrarySource | "all"

export function getLibrarySourceMeta(source: LibrarySource): LibrarySourceMeta {
  return librarySourceMeta[source]
}

export function countLibraryResources(resources: LibraryResource[], source: LibraryFilter): number {
  if (source === "all") return resources.length

  return resources.filter((resource) => resource.source === source).length
}

export function filterLibraryResources(
  resources: LibraryResource[],
  source: LibraryFilter,
  query: string,
  kinds?: LibraryResourceKind[]
): LibraryResource[] {
  const normalizedQuery = query.trim().toLowerCase()

  return resources.filter((resource) => {
    const matchesSource = source === "all" || resource.source === source
    const matchesKind = !kinds || kinds.length === 0 || kinds.includes(resource.kind)
    const matchesQuery =
      normalizedQuery.length === 0 ||
      resource.title.toLowerCase().includes(normalizedQuery) ||
      resource.kind.toLowerCase().includes(normalizedQuery) ||
      resource.context.toLowerCase().includes(normalizedQuery) ||
      resource.owner.toLowerCase().includes(normalizedQuery)

    return matchesSource && matchesKind && matchesQuery
  })
}

export function groupLibraryResources(resources: LibraryResource[]) {
  const groups = new Map<string, LibraryResource[]>()

  for (const resource of resources) {
    const existing = groups.get(resource.context)

    if (existing) existing.push(resource)
    else groups.set(resource.context, [resource])
  }

  return [...groups.entries()].map(([context, items]) => ({ context, items }))
}

export function slugifyLibraryContext(context: string): string {
  return context
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function findLibraryContextBySlug(
  resources: LibraryResource[],
  slug: string | undefined
): string | undefined {
  if (!slug) return undefined

  return resources.find(
    (resource) => slugifyLibraryContext(resource.context) === slug
  )?.context
}

export const librarySubjectPreviewLimit = 4
