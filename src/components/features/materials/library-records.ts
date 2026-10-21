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
} from "./library-types"

export const libraryGuidance =
  "Your Study Library collects the resources you can reach, and keeps each one with the context that owns it: your own notes, a classroom you joined, or a study space you are part of."

export const libraryStorageNotice =
  "The materials service is not connected yet. Every resource below is placeholder content for reviewing the layout, and no file is uploaded, previewed, or downloaded."

export const librarySourceNotice =
  "Opening a resource always takes you to the context that owns it. Owlio never moves a personal note, a class file, or a peer-shared resource somewhere else."

export const librarySourceMeta: Record<LibrarySource, LibrarySourceMeta> = {
  personal: {
    id: "personal",
    label: "Personal resources",
    shortLabel: "Personal",
    ownerLabel: "You own these",
    ownerNote:
      "Notes and references you wrote. They stay in your workspace and are never treated as classroom material.",
    description:
      "Keep personal notes, study references, and reusable templates in the workspace that belongs to you.",
    icon: NotebookPen,
    iconClassName: "bg-amber-100 text-amber-800",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-800",
    libraryHref: "/students/materials/personal",
    ownerHref: "/students/notes",
    ownerAction: "Open Notes",
  },
  classroom: {
    id: "classroom",
    label: "Classroom materials",
    shortLabel: "Classroom",
    ownerLabel: "Educator-published",
    ownerNote:
      "Resources an educator published to a class you joined. The classroom keeps ownership of the file and the record.",
    description:
      "Find the files, slides, and links your educator published, alongside the class or lesson they belong to.",
    icon: GraduationCap,
    iconClassName: "bg-sky-100 text-sky-800",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-800",
    libraryHref: "/students/materials/classroom",
    ownerHref: "/students/classrooms",
    ownerAction: "Open My Classes",
  },
  "study-space": {
    id: "study-space",
    label: "Study space resources",
    shortLabel: "Study spaces",
    ownerLabel: "Peer-shared",
    ownerNote:
      "Resources your peers shared in a student-created space. A study space is not an official classroom.",
    description:
      "See what your study group shared, and keep it inside the space where your peers put it.",
    icon: Users,
    iconClassName: "bg-emerald-100 text-emerald-800",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-800",
    libraryHref: "/students/materials/study-spaces",
    ownerHref: "/students/study-spaces",
    ownerAction: "Open Study Spaces",
  },
}

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

export const previewLibraryResources: LibraryResource[] = [
  {
    id: "preview-personal-wave",
    title: "Wave equation checklist",
    kind: "Note",
    source: "personal",
    owner: "You",
    context: "Physics I",
    contextHref: "/students/notes",
    contextAction: "Open in Notes",
    summary: "Speed, wavelength, and frequency, with the sign rules for interference diagrams.",
    updated: "Edited 12 Oct",
    availability: "available",
  },
  {
    id: "preview-personal-bonding",
    title: "Chemical bonding recap",
    kind: "Note",
    source: "personal",
    owner: "You",
    context: "Chemistry I",
    contextHref: "/students/notes",
    contextAction: "Open in Notes",
    summary: "Ionic versus covalent, electron affinity trends, and what drives melting point.",
    updated: "Edited 11 Oct",
    availability: "available",
  },
  {
    id: "preview-personal-lab-template",
    title: "Lab report template",
    kind: "Template",
    source: "personal",
    owner: "You",
    context: "Chemistry I",
    contextHref: "/students/subjects",
    contextAction: "Open in My Learning",
    summary: "Aim, method, results, and discussion, with a short safety section.",
    updated: "Edited 10 Oct",
    availability: "available",
  },
  {
    id: "preview-personal-essay",
    title: "Essay intro outline",
    kind: "Template",
    source: "personal",
    owner: "You",
    context: "English",
    contextHref: "/students/notes",
    contextAction: "Open in Notes",
    summary: "Thesis, two supporting points, and a counter-argument paragraph to draft first.",
    updated: "Edited 8 Oct",
    availability: "available",
  },
  {
    id: "preview-classroom-ecosystem",
    title: "Ecosystem field notes",
    kind: "Document",
    source: "classroom",
    owner: "Morgan Chen",
    context: "Biology 101",
    contextHref: "/students/classrooms/biology-101",
    contextAction: "Open class",
    summary: "Class notes on energy flow, population change, and field observation prompts.",
    updated: "Posted 20 Oct",
    availability: "available",
  },
  {
    id: "preview-classroom-foodwebs",
    title: "Food webs overview",
    kind: "Link",
    source: "classroom",
    owner: "Morgan Chen",
    context: "Biology 101",
    contextHref: "/students/classrooms/biology-101",
    contextAction: "Open class",
    summary: "Reference link for how energy moves through a food web.",
    updated: "Posted 18 Oct",
    availability: "available",
  },
  {
    id: "preview-classroom-cells",
    title: "Cell structure slides",
    kind: "Slides",
    source: "classroom",
    owner: "Morgan Chen",
    context: "Biology 101",
    contextHref: "/students/classrooms/biology-101",
    contextAction: "Open class",
    summary: "Lesson slides comparing prokaryotic and eukaryotic cells.",
    updated: "Posted 14 Oct",
    availability: "available",
  },
  {
    id: "preview-classroom-linear",
    title: "Linear equations reference",
    kind: "Document",
    source: "classroom",
    owner: "Alex Rivera",
    context: "Math Study Group",
    contextHref: "/students/classrooms/tutoring-math",
    contextAction: "Open class",
    summary: "Tutor-shared reference on solving and graphing linear equations.",
    updated: "Posted 16 Oct",
    availability: "available",
  },
  {
    id: "preview-classroom-restricted",
    title: "Restricted practice set",
    kind: "Worksheet",
    source: "classroom",
    owner: "Alex Rivera",
    context: "Math Study Group",
    contextHref: "/students/classrooms/tutoring-math",
    contextAction: "Open class",
    summary: "",
    updated: "",
    availability: "unavailable",
  },
  {
    id: "preview-space-waves",
    title: "Problem set — waves week 3",
    kind: "Worksheet",
    source: "study-space",
    owner: "Physics Group",
    context: "Physics Group",
    contextHref: "/students/study-spaces",
    contextAction: "Open study spaces",
    summary: "Peer problem set on superposition, with answers agreed in the space.",
    updated: "Shared 19 Oct",
    availability: "available",
  },
  {
    id: "preview-space-essay",
    title: "Argument outline examples",
    kind: "Reading",
    source: "study-space",
    owner: "Essay Writers",
    context: "Essay Writers",
    contextHref: "/students/study-spaces",
    contextAction: "Open study spaces",
    summary: "Two peer outlines to review before the next writing session.",
    updated: "Shared 17 Oct",
    availability: "available",
  },
  {
    id: "preview-space-calculus",
    title: "Calculus drill set",
    kind: "Worksheet",
    source: "study-space",
    owner: "Maths Club",
    context: "Maths Club",
    contextHref: "/students/study-spaces",
    contextAction: "Open study spaces",
    summary: "Short drills on limits and derivatives for Friday's review.",
    updated: "Shared 15 Oct",
    availability: "available",
  },
  {
    id: "preview-space-sources",
    title: "Source analysis guide",
    kind: "Link",
    source: "study-space",
    owner: "History Circle",
    context: "History Circle",
    contextHref: "/students/study-spaces",
    contextAction: "Open study spaces",
    summary: "A peer checklist for reading and comparing primary sources.",
    updated: "Shared 12 Oct",
    availability: "available",
  },
]

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
  query: string
): LibraryResource[] {
  const normalizedQuery = query.trim().toLowerCase()

  return resources.filter((resource) => {
    const matchesSource = source === "all" || resource.source === source
    const matchesQuery =
      normalizedQuery.length === 0 ||
      resource.title.toLowerCase().includes(normalizedQuery) ||
      resource.kind.toLowerCase().includes(normalizedQuery) ||
      resource.context.toLowerCase().includes(normalizedQuery) ||
      resource.owner.toLowerCase().includes(normalizedQuery)

    return matchesSource && matchesQuery
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
