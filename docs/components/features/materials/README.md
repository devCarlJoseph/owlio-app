# Materials component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt`/`.css.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(materials): add organized materials source copies`

Target: `src/components/features/materials/`. These are manual destinations, not existing import paths. Keep student-owned editor files separate from published classroom materials. [Folder rules](../../../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `forms/` | `library-search-field.tsx`, `resource-source-filter.tsx` |
| `ui/` | `library-category-row.tsx`, `library-context-cards.tsx`, `library-gallery-card.tsx`, `library-theme.module.css`, `resource-card.tsx`, `resource-list-row.tsx`, `resource-list.tsx` |
| `view/` | `student-library-source-view.tsx`, `student-library-subject-view.tsx`, `student-library-subject-view.test.tsx`, `student-library-view.tsx`, `student-library-view.test.tsx` |
| Root contract | `library-types.ts` |
| Split mixed root module | `library-records.ts`: `librarySourceMeta`, icons and labeled `previewLibraryResources` -> `contents/`; filter/count/group/slug helpers -> `utils/`; use a temporary compatibility export until consumers have migrated |
| `workspace/view/` | `document-editor.tsx`, `library-workspace-view.tsx`, `library-workspace.test.tsx`, `personal-library-work.tsx`, `presentation-editor.tsx` |
| `workspace/model/` | `work-drafts.ts`, `work-records.ts` (in-memory draft recovery and browser-local records) |

Prefer splitting the mixed `library-records.ts` by responsibility over moving the 500-line file unchanged. Preserve existing browser storage keys, document revisions, save-error recovery, and backup import/export. Move editor-related tests with the corresponding view; never represent preview resources as uploaded or synced.

[All feature plans](../../../component-breakdowns.md)

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/materials/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### Nested feature guides

- [`workspace/`](workspace/README.md)

### `library-category-row.tsx`

Current file: `src/components/features/materials/library-category-row.tsx`

```tsx
import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { libraryKinds } from "./library-records"
import type { LibraryResourceKind } from "./library-types"

type LibraryCategoryRowProps = {
  selectedKinds: LibraryResourceKind[]
  onToggleKind: (kind: LibraryResourceKind) => void
  onClearKinds: () => void
  layout: "grid" | "list"
  onLayoutChange: (layout: "grid" | "list") => void
}

export function LibraryCategoryRow({
  selectedKinds,
  onToggleKind,
  onClearKinds,
  layout,
  onLayoutChange,
}: LibraryCategoryRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Categories</span>

        <Button
          type="button"
          size="xs"
          variant="outline"
          aria-pressed={selectedKinds.length === 0}
          onClick={onClearKinds}
          className={
            selectedKinds.length === 0
              ? "border-blue-700 bg-blue-700 text-white hover:bg-blue-800"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }
        >
          All
        </Button>

        {libraryKinds.map((kind) => {
          const isActive = selectedKinds.includes(kind)

          return (
            <Button
              key={kind}
              type="button"
              size="xs"
              variant="outline"
              aria-pressed={isActive}
              onClick={() => onToggleKind(kind)}
              className={
                isActive
                  ? "border-blue-700 bg-blue-700 text-white hover:bg-blue-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }
            >
              {kind}
            </Button>
          )
        })}
      </div>

      <div
        role="group"
        aria-label="Resource layout"
        className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1"
      >
        {(
          [
            { value: "grid" as const, label: "Grid view", icon: LayoutGrid },
            { value: "list" as const, label: "List view", icon: List },
          ] as const
        ).map((option) => {
          const OptionIcon = option.icon
          const isActive = layout === option.value

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              aria-label={option.label}
              onClick={() => onLayoutChange(option.value)}
              className={`inline-flex size-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-white hover:text-slate-900"
              }`}
            >
              <OptionIcon aria-hidden="true" className="size-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

### `library-context-cards.tsx`

Current file: `src/components/features/materials/library-context-cards.tsx`

```tsx
import { ArrowRight } from "lucide-react"
import { Link } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { librarySourceMeta, librarySources } from "./library-records"

export function LibraryContextCards() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {librarySources.map((source) => {
        const meta = librarySourceMeta[source]
        const Icon = meta.icon

        return (
          <Card key={source} className={`group relative h-full border p-0 shadow-none ring-0 ${meta.cardClassName}`}>
            <CardContent className="h-full gap-2 p-4">
              <span className="flex items-center justify-between gap-3">
                <Icon aria-hidden="true" className="size-5 text-foreground/70" />
                <span className="text-[10px] text-muted-foreground">{meta.ownerLabel}</span>
              </span>
              <h4 className="mt-1 text-sm font-semibold text-foreground">
                <Link to={meta.libraryHref} className="rounded outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] hover:underline focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2">{meta.label}</Link>
              </h4>
              <p className="text-xs leading-5 text-muted-foreground">{meta.description}</p>
              <span className="mt-auto flex items-center gap-1 pt-2 text-xs font-medium text-foreground">Explore collection <ArrowRight aria-hidden="true" className="size-3.5" /></span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
```

### `library-gallery-card.tsx`

Current file: `src/components/features/materials/library-gallery-card.tsx`

```tsx
import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router"
import { Card } from "@/components/ui/card"
import { libraryKindIcons, librarySourceMeta } from "./library-records"
import type { LibraryResource } from "./library-types"
import styles from './library-theme.module.css'

export function LibraryGalleryCard({ resource }: { resource: LibraryResource }) {
  const meta = librarySourceMeta[resource.source]
  const KindIcon = libraryKindIcons[resource.kind]
  const SourceIcon = meta.icon

  return (
    <Card className="group/resource relative h-full gap-0 rounded-xl border border-border/70 bg-card p-2 shadow-none ring-0 transition-shadow hover:shadow-md motion-reduce:transition-none">
      <div aria-hidden="true" data-source={resource.source} className={`${styles.cover} relative h-36 overflow-hidden rounded-lg px-5 pt-4`}>
        <div className={`mx-auto min-h-44 max-w-48 rounded-t border border-border/60 bg-card p-4 shadow-sm transition-transform duration-200 group-hover/resource:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none ${resource.kind === "Template" ? "rotate-3" : resource.kind === "Reading" ? "-rotate-3" : ""}`}>
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <span className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">{resource.context}</span>
            <KindIcon className={`${styles.icon} size-5 shrink-0 rounded p-1`} />
          </div>
          <p className="mt-2 text-[11px] font-semibold leading-4 text-card-foreground">{resource.title}</p>
          {resource.kind === "Worksheet" || resource.kind === "Template" ? (
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {[0, 1, 2, 3].map((item) => <div key={item} className="h-5 rounded-sm border border-border bg-background" />)}
            </div>
          ) : (
            <div className="mt-3 space-y-1.5">
              <div className={`${styles.accent} h-5 rounded-sm`} />
              <div className="h-1 rounded-full bg-muted" />
              <div className="h-1 w-4/5 rounded-full bg-muted" />
              <div className="h-1 w-3/5 rounded-full bg-muted" />
            </div>
          )}
        </div>
        <span className="absolute bottom-2 right-2 rounded border border-border/50 bg-card px-1.5 py-0.5 text-[9px] font-medium text-card-foreground">{resource.kind}</span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-1.5 pb-2 pt-3">
        <div className="flex items-start justify-between gap-1">
          <h4 className="text-sm font-medium leading-5 text-foreground">
            <Link to={resource.contextHref} className="rounded outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] hover:underline focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2">{resource.title}</Link>
          </h4>
          <ArrowUpRight aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">{resource.kind} · {resource.context}</p>
        <p className="mt-auto flex items-start gap-1.5 pt-1 text-[11px] leading-4 text-muted-foreground"><SourceIcon aria-hidden="true" className="mt-0.5 size-3 shrink-0" />{meta.shortLabel} · {resource.owner}</p>
      </div>
    </Card>
  )
}
```

### `library-records.ts`

Current file: `src/components/features/materials/library-records.ts`

```ts
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

export const librarySourceMeta: Record<LibrarySource, LibrarySourceMeta> = {
  personal: {
    id: "personal",
    label: "Personal resources",
    shortLabel: "Personal",
    ownerLabel: "You own these",
    description: "Your own notes and references, kept in your workspace.",
    icon: NotebookPen,
    iconClassName: "bg-amber-100 text-amber-800",
    eyebrowClassName: "text-amber-700",
    badgeClassName: "border-amber-200 bg-white/80 text-amber-800",
    cardClassName: "border-amber-200 bg-amber-50",
    buttonClassName: "bg-amber-600 text-white hover:bg-amber-700",
    ghostClassName: "text-amber-800 hover:bg-amber-100",
    headerClassName: "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50",
    linkClassName: "hover:text-amber-700",
    panelClassName: "border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/70",
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
    iconClassName: "bg-sky-100 text-sky-800",
    eyebrowClassName: "text-sky-700",
    badgeClassName: "border-sky-200 bg-white/80 text-sky-800",
    cardClassName: "border-sky-200 bg-sky-50",
    buttonClassName: "bg-sky-600 text-white hover:bg-sky-700",
    ghostClassName: "text-sky-800 hover:bg-sky-100",
    headerClassName: "border-sky-200 bg-gradient-to-br from-sky-100 via-white to-blue-100",
    linkClassName: "hover:text-sky-700",
    panelClassName: "border-sky-200 bg-gradient-to-br from-sky-100 via-white to-blue-100",
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
    iconClassName: "bg-emerald-100 text-emerald-800",
    eyebrowClassName: "text-emerald-700",
    badgeClassName: "border-emerald-200 bg-white/80 text-emerald-800",
    cardClassName: "border-emerald-200 bg-emerald-50",
    buttonClassName: "bg-emerald-600 text-white hover:bg-emerald-700",
    ghostClassName: "text-emerald-800 hover:bg-emerald-100",
    headerClassName: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50",
    linkClassName: "hover:text-emerald-700",
    panelClassName: "border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/70",
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
    id: "preview-personal-titration",
    title: "Titration walkthrough",
    kind: "Note",
    source: "personal",
    owner: "You",
    context: "Chemistry I",
    contextHref: "/students/notes",
    contextAction: "Open in Notes",
    summary: "Endpoint colour, indicator choice, and how to read the burette.",
    updated: "Edited 9 Oct",
    availability: "available",
  },
  {
    id: "preview-personal-trends",
    title: "Periodic trends summary",
    kind: "Template",
    source: "personal",
    owner: "You",
    context: "Chemistry I",
    contextHref: "/students/subjects",
    contextAction: "Open in My Learning",
    summary: "Blank table for radius, electronegativity, and ionisation energy.",
    updated: "Edited 8 Oct",
    availability: "available",
  },
  {
    id: "preview-personal-safety",
    title: "Lab safety checklist",
    kind: "Template",
    source: "personal",
    owner: "You",
    context: "Chemistry I",
    contextHref: "/students/subjects",
    contextAction: "Open in My Learning",
    summary: "Goggles, gloves, waste disposal, and the spill procedure.",
    updated: "Edited 7 Oct",
    availability: "available",
  },
  {
    id: "preview-personal-algebra",
    title: "Algebra cheat sheet",
    kind: "Template",
    source: "personal",
    owner: "You",
    context: "Mathematics",
    contextHref: "/students/subjects",
    contextAction: "Open in My Learning",
    summary: "Quadratics, simultaneous equations, and the identities worth memorising.",
    updated: "Edited 6 Oct",
    availability: "available",
  },
  {
    id: "preview-personal-calculus",
    title: "Calculus formula sheet",
    kind: "Template",
    source: "personal",
    owner: "You",
    context: "Mathematics",
    contextHref: "/students/subjects",
    contextAction: "Open in My Learning",
    summary: "Product, quotient, and chain rule with worked limit patterns.",
    updated: "Edited 5 Oct",
    availability: "available",
  },
  {
    id: "preview-personal-kinematics",
    title: "Kinematics formula sheet",
    kind: "Template",
    source: "personal",
    owner: "You",
    context: "Physics I",
    contextHref: "/students/subjects",
    contextAction: "Open in My Learning",
    summary: "SUVAT equations, projectile motion, and when to use each.",
    updated: "Edited 4 Oct",
    availability: "available",
  },
  {
    id: "preview-personal-essay-guide",
    title: "Essay structure guide",
    kind: "Template",
    source: "personal",
    owner: "You",
    context: "English",
    contextHref: "/students/subjects",
    contextAction: "Open in My Learning",
    summary: "Thesis, evidence, counter-argument, and a conclusion that lands.",
    updated: "Edited 3 Oct",
    availability: "available",
  },
  {
    id: "preview-personal-sources",
    title: "Source analysis guide",
    kind: "Note",
    source: "personal",
    owner: "You",
    context: "History",
    contextHref: "/students/subjects",
    contextAction: "Open in My Learning",
    summary: "How to weigh a primary source against the historian writing about it.",
    updated: "Edited 2 Oct",
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
    id: "preview-classroom-microscope",
    title: "Microscope use guide",
    kind: "Reading",
    source: "classroom",
    owner: "Morgan Chen",
    context: "Biology 101",
    contextHref: "/students/classrooms/biology-101",
    contextAction: "Open class",
    summary: "Focusing, lighting, and the order of the slides in a wet mount.",
    updated: "Posted 13 Oct",
    availability: "available",
  },
  {
    id: "preview-classroom-cell-division",
    title: "Cell division worksheet",
    kind: "Worksheet",
    source: "classroom",
    owner: "Morgan Chen",
    context: "Biology 101",
    contextHref: "/students/classrooms/biology-101",
    contextAction: "Open class",
    summary: "Mitosis stages with a labelled diagram to complete.",
    updated: "Posted 12 Oct",
    availability: "available",
  },
  {
    id: "preview-classroom-quadratics",
    title: "Quadratics practice set",
    kind: "Worksheet",
    source: "classroom",
    owner: "Alex Rivera",
    context: "Math Study Group",
    contextHref: "/students/classrooms/tutoring-math",
    contextAction: "Open class",
    summary: "Factoring, completing the square, and the discriminant.",
    updated: "Posted 15 Oct",
    availability: "available",
  },
  {
    id: "preview-space-interference",
    title: "Interference problems",
    kind: "Worksheet",
    source: "study-space",
    owner: "Physics Group",
    context: "Physics Group",
    contextHref: "/students/study-spaces",
    contextAction: "Open study spaces",
    summary: "Two-source interference with a path-difference diagram.",
    updated: "Shared 18 Oct",
    availability: "available",
  },
  {
    id: "preview-space-energy",
    title: "Energy worksheet",
    kind: "Worksheet",
    source: "study-space",
    owner: "Physics Group",
    context: "Physics Group",
    contextHref: "/students/study-spaces",
    contextAction: "Open study spaces",
    summary: "Work-energy theorem, conservation, and a mixed set.",
    updated: "Shared 17 Oct",
    availability: "available",
  },
  {
    id: "preview-space-vectors",
    title: "Vector diagrams",
    kind: "Link",
    source: "study-space",
    owner: "Physics Group",
    context: "Physics Group",
    contextHref: "/students/study-spaces",
    contextAction: "Open study spaces",
    summary: "Reference sheet for resolving vectors into components.",
    updated: "Shared 16 Oct",
    availability: "available",
  },
  {
    id: "preview-space-pendulum",
    title: "Pendulum lab writeup",
    kind: "Template",
    source: "study-space",
    owner: "Physics Group",
    context: "Physics Group",
    contextHref: "/students/study-spaces",
    contextAction: "Open study spaces",
    summary: "Aim, method, uncertainty, and the conclusion we agreed on.",
    updated: "Shared 15 Oct",
    availability: "available",
  },
  {
    id: "preview-space-argument",
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
```

### `library-search-field.tsx`

Current file: `src/components/features/materials/library-search-field.tsx`

```tsx
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

type LibrarySearchFieldProps = {
  value: string
  onValueChange: (value: string) => void
  label: string
  placeholder: string
}

export function LibrarySearchField({ value, onValueChange, label, placeholder }: LibrarySearchFieldProps) {
  return (
    <div className="relative w-full sm:w-72">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.currentTarget.value)}
        aria-label={label}
        placeholder={placeholder}
        autoComplete="off"
        className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9"
      />
    </div>
  )
}
```

### `library-theme.module.css`

Current file: `src/components/features/materials/library-theme.module.css`

```css
.banner {
  background: linear-gradient(to right, #fff7ed, #fafaf9, #ecfdf5);
}

.cover {
  --library-cover: #fffbeb;
  background-color: var(--library-cover);
}

.cover[data-source="classroom"] { --library-cover: #f0f9ff; }
.cover[data-source="study-space"] { --library-cover: #ecfdf5; }
.accent { background-color: var(--library-cover); }
.icon { background-color: var(--library-cover); color: var(--foreground); }

:global(.dark) .banner {
  background: linear-gradient(to right, #30374a, #273449, #263f43);
}

:global(.dark) .cover { --library-cover: #3b3b49; }
:global(.dark) .cover[data-source="classroom"] { --library-cover: #2d4058; }
:global(.dark) .cover[data-source="study-space"] { --library-cover: #2b4546; }
```

### `library-types.ts`

Current file: `src/components/features/materials/library-types.ts`

```ts
import type { LucideIcon } from "lucide-react"

export type LibrarySource = "personal" | "classroom" | "study-space"

export type LibraryResourceKind =
  | "Note"
  | "Template"
  | "Worksheet"
  | "Slides"
  | "Reading"
  | "Link"
  | "Document"

export type LibraryResourceAvailability = "available" | "unavailable"

export type LibraryResource = {
  id: string
  title: string
  kind: LibraryResourceKind
  source: LibrarySource
  owner: string
  context: string
  contextHref: string
  contextAction: string
  summary: string
  updated: string
  availability: LibraryResourceAvailability
}

export type LibrarySourceMeta = {
  id: string
  label: string
  shortLabel: string
  ownerLabel: string
  description: string
  icon: LucideIcon
  iconClassName: string
  eyebrowClassName: string
  badgeClassName: string
  cardClassName: string
  buttonClassName: string
  ghostClassName: string
  headerClassName: string
  panelClassName: string
  linkClassName: string
  libraryHref: string
  ownerHref: string
  ownerAction: string
}
```

### `resource-card.tsx`

Current file: `src/components/features/materials/resource-card.tsx`

```tsx
import { Lock } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { libraryKindIcons, librarySourceMeta } from "./library-records"
import type { LibraryResource } from "./library-types"

type ResourceCardProps = {
  resource: LibraryResource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const sourceMeta = librarySourceMeta[resource.source]
  const KindIcon = libraryKindIcons[resource.kind]
  const isAvailable = resource.availability === "available"

  return (
    <Card
      className={
        isAvailable
          ? "group/resource relative h-full border border-slate-200 bg-white shadow-sm ring-0 transition hover:border-slate-300 hover:shadow-md motion-reduce:transition-none"
          : "border border-dashed border-slate-300 bg-slate-50/60 shadow-none ring-0"
      }
    >
      <CardContent className="gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${
              isAvailable ? sourceMeta.iconClassName : "bg-slate-200 text-slate-500"
            }`}
          >
            {isAvailable ? (
              <KindIcon aria-hidden="true" className="size-4" />
            ) : (
              <Lock aria-hidden="true" className="size-4" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-900">
              {isAvailable ? (
                <Link
                  to={resource.contextHref}
                  className="rounded outline-none after:absolute after:inset-0 after:content-[''] hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {resource.title}
                </Link>
              ) : (
                "Resource unavailable"
              )}
            </h4>
            <p className="mt-0.5 text-xs text-slate-500">
              {sourceMeta.shortLabel} · {resource.context}
            </p>
          </div>

          {isAvailable && (
            <Badge variant="outline" className="shrink-0 border-slate-200 bg-slate-50 text-slate-600">
              {resource.kind}
            </Badge>
          )}
        </div>

        <p className={`text-sm leading-6 ${isAvailable ? "text-slate-600" : "text-slate-500"}`}>
          {isAvailable
            ? resource.summary
            : "This resource is not available in your account right now. Open the context that owns it to see what is shared with you."}
        </p>

        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            {isAvailable
              ? `${resource.owner}${resource.updated ? ` · ${resource.updated}` : ""}`
              : "No details are shown for resources you cannot open."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
```

### `resource-list-row.tsx`

Current file: `src/components/features/materials/resource-list-row.tsx`

```tsx
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { ResourceCard } from "./resource-card"
import { libraryKindIcons, librarySourceMeta } from "./library-records"
import type { LibraryResource } from "./library-types"

type ResourceListRowProps = {
  resource: LibraryResource
}

export function ResourceListRow({ resource }: ResourceListRowProps) {
  const KindIcon = libraryKindIcons[resource.kind]
  const sourceMeta = librarySourceMeta[resource.source]

  if (resource.availability !== "available") {
    return <li><ResourceCard resource={resource} /></li>
  }

  return (
    <li className="group/resource relative flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:shadow-sm">
      <span
        aria-hidden="true"
        className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${sourceMeta.iconClassName}`}
      >
        <KindIcon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          <Link
            to={resource.contextHref}
            className="rounded outline-none after:absolute after:inset-0 after:content-[''] hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {resource.title}
          </Link>
        </p>
        <p className="truncate text-xs text-slate-500">
          {sourceMeta.shortLabel} · {resource.context}
          {resource.owner ? ` · ${resource.owner}` : ""}
        </p>
      </div>

      <Badge variant="outline" className="shrink-0 border-slate-200 bg-slate-50 text-slate-600">
        {resource.kind}
      </Badge>

      {resource.updated ? (
        <span className="hidden shrink-0 text-xs text-slate-400 sm:inline">{resource.updated}</span>
      ) : null}
    </li>
  )
}
```

### `resource-list.tsx`

Current file: `src/components/features/materials/resource-list.tsx`

```tsx
import { FileQuestion } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ResourceCard } from "./resource-card"
import { LibraryGalleryCard } from "./library-gallery-card"
import type { LibraryResource } from "./library-types"

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
      <Empty className="border border-dashed border-slate-300 bg-slate-50/60 p-8 sm:p-10">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-slate-100 text-slate-500">
            <FileQuestion aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle className="text-base text-slate-900">{emptyTitle}</EmptyTitle>
          <EmptyDescription className="text-slate-600">{emptyDescription}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {isFiltered ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
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
                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
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
```

### `resource-source-filter.tsx`

Current file: `src/components/features/materials/resource-source-filter.tsx`

```tsx
import { cn } from "cn"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { librarySources } from "./library-records"
import type { LibraryFilter } from "./library-records"

type ResourceSourceFilterProps = {
  counts: Record<LibraryFilter, number>
}

const sourceAccents: Record<LibraryFilter, { trigger: string; badge: string }> = {
  all: {
    trigger: "data-active:text-slate-900 data-active:after:bg-slate-900",
    badge:
      "group-data-[variant=line]/tabs-list:data-active:bg-slate-100 group-data-[variant=line]/tabs-list:data-active:text-slate-900",
  },
  personal: {
    trigger: "data-active:text-amber-800 data-active:after:bg-amber-500",
    badge:
      "group-data-[variant=line]/tabs-list:data-active:bg-amber-100 group-data-[variant=line]/tabs-list:data-active:text-amber-800",
  },
  classroom: {
    trigger: "data-active:text-sky-800 data-active:after:bg-sky-500",
    badge:
      "group-data-[variant=line]/tabs-list:data-active:bg-sky-100 group-data-[variant=line]/tabs-list:data-active:text-sky-800",
  },
  "study-space": {
    trigger: "data-active:text-emerald-800 data-active:after:bg-emerald-500",
    badge:
      "group-data-[variant=line]/tabs-list:data-active:bg-emerald-100 group-data-[variant=line]/tabs-list:data-active:text-emerald-800",
  },
}

export function ResourceSourceFilter({ counts }: ResourceSourceFilterProps) {
  const options: { value: LibraryFilter; label: string }[] = [
    { value: "all", label: "All sources" },
    ...librarySources.map((source) => ({
      value: source as LibraryFilter,
      label:
        source === "personal"
          ? "Personal"
          : source === "classroom"
            ? "Classroom"
            : "Study spaces",
    })),
  ]

  return (
    <TabsList
      variant="line"
      className="h-auto w-full flex-wrap justify-start gap-1 border-b border-slate-200 pb-px"
    >
      {options.map((option) => {
        const accent = sourceAccents[option.value]

        return (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className={cn("flex-none gap-2", accent.trigger)}
          >
            {option.label}
            <span
              title={`${counts[option.value]} sample resources; personal editor files are listed separately`}
              aria-label={`${counts[option.value]} sample resources`}
              className={cn(
                "rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-slate-500",
                accent.badge,
              )}
            >
              {counts[option.value]}
            </span>
          </TabsTrigger>
        )
      })}
    </TabsList>
  )
}
```

### `student-library-source-view.tsx`

Current file: `src/components/features/materials/student-library-source-view.tsx`

```tsx
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
```

### `student-library-subject-view.test.tsx`

Current file: `src/components/features/materials/student-library-subject-view.test.tsx`

```tsx
import { cleanup, render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"
import { afterEach, describe, expect, it } from "vitest"
import StudentClassroomMaterialSubjectPage from "@/pages/dashboard/students/materials/classroom/subject"
import StudentPersonalMaterialSubjectPage from "@/pages/dashboard/students/materials/personal/subject"
import StudentStudySpaceMaterialSubjectPage from "@/pages/dashboard/students/materials/study-spaces/subject"

afterEach(cleanup)

function renderSubject(slug: string, page: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[`/students/materials/personal/${slug}`]}>
      <Routes>
        <Route path="/students/materials/personal/:subject" element={page} />
      </Routes>
    </MemoryRouter>
  )
}

describe("personal subject resources page", () => {
  it("lists every resource collected for the subject", () => {
    renderSubject("chemistry-i", <StudentPersonalMaterialSubjectPage />)

    expect(screen.getByRole("heading", { name: "Chemistry I" })).toBeTruthy()
    expect(screen.getByText("Chemical bonding recap")).toBeTruthy()
    expect(screen.getByText("Lab report template")).toBeTruthy()
    expect(screen.getByText("Titration walkthrough")).toBeTruthy()
    expect(screen.getByText("Periodic trends summary")).toBeTruthy()
    expect(screen.getByText("Lab safety checklist")).toBeTruthy()
  })

  it("keeps a breadcrumb back to the personal library", () => {
    renderSubject("mathematics", <StudentPersonalMaterialSubjectPage />)

    expect(screen.getByRole("link", { name: "Study Library" })).toBeTruthy()
    expect(screen.getByRole("link", { name: "Personal resources" })).toBeTruthy()
    expect(screen.getByText("Algebra cheat sheet")).toBeTruthy()
  })

  it("shows a safe empty state for an unknown subject", () => {
    renderSubject("does-not-exist", <StudentPersonalMaterialSubjectPage />)

    expect(screen.getByRole("heading", { name: "Subject not found" })).toBeTruthy()
  })
})

describe("classroom subject resources page", () => {
  it("lists the resources a class published", () => {
    renderSubject("biology-101", <StudentClassroomMaterialSubjectPage />)

    expect(screen.getByRole("heading", { name: "Biology 101" })).toBeTruthy()
    expect(screen.getByText("Ecosystem field notes")).toBeTruthy()
    expect(screen.getByText("Food webs overview")).toBeTruthy()
    expect(screen.getByText("Cell structure slides")).toBeTruthy()
    expect(screen.getByRole("link", { name: "Classroom materials" })).toBeTruthy()
  })
})

describe("study space subject resources page", () => {
  it("lists the resources a space shared", () => {
    renderSubject("physics-group", <StudentStudySpaceMaterialSubjectPage />)

    expect(screen.getByRole("heading", { name: "Physics Group" })).toBeTruthy()
    expect(screen.getByText("Problem set — waves week 3")).toBeTruthy()
    expect(screen.getByText("Interference problems")).toBeTruthy()
    expect(screen.getByRole("link", { name: "Study space resources" })).toBeTruthy()
  })
})
```

### `student-library-subject-view.tsx`

Current file: `src/components/features/materials/student-library-subject-view.tsx`

```tsx
import { useMemo } from "react"
import { ChevronLeft } from "lucide-react"
import { Link, useParams } from "react-router"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ResourceCard } from "./resource-card"
import {
  findLibraryContextBySlug,
  librarySourceMeta,
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
        </CardContent>
      </Card>
    </div>
  )
}
```

### `student-library-view.test.tsx`

Current file: `src/components/features/materials/student-library-view.test.tsx`

```tsx
import { cleanup, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { afterEach, describe, expect, it } from "vitest"
import StudentClassroomMaterialsPage from "@/pages/dashboard/students/materials/classroom"
import StudentMaterialsPage from "@/pages/dashboard/students/materials"
import StudentPersonalMaterialsPage from "@/pages/dashboard/students/materials/personal"
import StudentStudySpaceMaterialsPage from "@/pages/dashboard/students/materials/study-spaces"

function renderPage(page: React.ReactElement) {
  const { container } = render(
    <MemoryRouter>
      {page}
    </MemoryRouter>
  )

  return {
    container,
    hrefs: Array.from(container.querySelectorAll("a")).map((link) => link.getAttribute("href")),
    text: container.textContent ?? "",
  }
}

afterEach(cleanup)

describe("student Study Library", () => {
  it("gives every source card its own library route", () => {
    const { hrefs, text } = renderPage(<StudentMaterialsPage />)

    expect(text).toContain("Study Library")
    expect(hrefs).toContain("/students/materials/personal")
    expect(hrefs).toContain("/students/materials/classroom")
    expect(hrefs).toContain("/students/materials/study-spaces")
    expect(text).not.toContain("Open My Classes")
  })

  it("moves each resource card to its owning context when clicked", () => {
    const { container } = renderPage(<StudentMaterialsPage />)

    const resourceCard = container.querySelector(".group\\/resource")
    const resourceLink = resourceCard?.querySelector("a")

    expect(resourceLink?.getAttribute("href")).toBe("/students/notes")
    expect(resourceCard?.textContent).not.toContain("You own these")
    expect(resourceCard?.textContent).not.toContain("Open in Notes")
  })

  it("labels the collection as examples without offering file operations", () => {
    const { text } = renderPage(<StudentMaterialsPage />)

    expect(text).not.toContain("Three learning spaces")
    expect(text).not.toContain("Peer-shared resources")

    expect(text).toContain("Sample collection.")
    expect(text).toContain("Illustrative covers and example resources")
    expect(text).toContain("Files, uploads, and sync aren’t connected")
    expect(screen.queryByRole("button", { name: /upload|download/i })).toBeNull()
  })

  it("shows four resources per collection with links to every full source library", () => {
    renderPage(<StudentMaterialsPage />)

    for (const name of ["Made for your next study session", "From the classroom", "Better when shared"]) {
      const collection = within(screen.getByRole("region", { name }))
      expect(collection.getAllByRole("listitem")).toHaveLength(4)
      expect(collection.getByRole("link", { name: /View all/ }).getAttribute("href")).toMatch(/^\/students\/materials\//)
    }
    expect(screen.getByRole("status").textContent).toContain("12 resources shown of 28")
  })

  it("combines search, source, and kind filters and recovers from an empty view", async () => {
    const user = userEvent.setup()
    renderPage(<StudentMaterialsPage />)

    await user.click(screen.getByRole("tab", { name: /Personal/ }))
    await user.click(screen.getByRole("button", { name: "Note" }))
    await user.type(screen.getByRole("searchbox"), "wave")
    expect(screen.getByRole("link", { name: "Wave equation checklist" })).toBeTruthy()
    expect(screen.queryByRole("link", { name: "Chemical bonding recap" })).toBeNull()
    expect(screen.getByRole("status").textContent).toContain("1 resource shown")

    await user.click(screen.getByRole("tab", { name: /Classroom/ }))
    expect(screen.getByText("No resources match this view")).toBeTruthy()
    await user.click(screen.getByRole("button", { name: "Clear filters" }))
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("")
    expect(screen.getByRole("tab", { name: /All sources/ }).getAttribute("aria-selected")).toBe("true")
    expect(screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed")).toBe("true")
  })

  it("drops the intro guidance and learning context headings", () => {
    const { text } = renderPage(<StudentMaterialsPage />)

    expect(text).not.toContain("Your Study Library collects")
    expect(text).not.toContain("The materials service is not connected yet")
    expect(text).not.toContain("Pick up where you left off")
    expect(text).not.toContain("Where are you learning?")
  })

  it("keeps the source colours on list rows", async () => {
    const user = userEvent.setup()
    const { container } = renderPage(<StudentMaterialsPage />)

    await user.click(screen.getByRole("button", { name: "List view" }))

    const row = container.querySelector("li.group\\/resource")
    const icon = row?.querySelector("span")

    expect(icon?.className).toContain("bg-amber-100")
    expect(icon?.className).toContain("text-amber-800")
    expect(row?.textContent).toContain("Personal · Physics I")
    expect(screen.getByText("Resource unavailable")).toBeTruthy()
    expect(screen.queryByText("Restricted practice set")).toBeNull()
  })

  it("colours the active layout and source tab", async () => {
    const user = userEvent.setup()
    renderPage(<StudentMaterialsPage />)

    const listButton = screen.getByRole("button", { name: "List view" })
    await user.click(listButton)
    expect(listButton.className).toContain("bg-sky-600")
    expect(listButton.className).toContain("text-white")

    const personalTab = screen.getByRole("tab", { name: /Personal/ })
    expect(personalTab.className).toContain("data-active:text-amber-800")
    expect(personalTab.className).toContain("data-active:after:bg-amber-500")
  })

  it("switches the resource layout and filters by kind", async () => {
    const user = userEvent.setup()
    const { container } = renderPage(<StudentMaterialsPage />)

    await user.click(screen.getByRole("button", { name: "List view" }))

    const list = container.querySelector("ul.space-y-2")
    expect(list).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Note" }))
    expect(screen.getByText(/resource(s)? shown/)).toBeTruthy()
  })

  it("keeps the display menu out of the category row", () => {
    renderPage(<StudentMaterialsPage />)

    expect(screen.queryByRole("button", { name: "Choose what to display" })).toBeNull()
    expect(screen.getByRole("group", { name: "Resource layout" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Note" })).toBeTruthy()
  })

  it("keeps personal resources on the personal library route", () => {
    const { hrefs, text } = renderPage(<StudentPersonalMaterialsPage />)

    expect(text).toContain("Personal resources")
    expect(text).toContain("Wave equation checklist")
    expect(hrefs).toContain("/students/materials")
    expect(hrefs).toContain("/students/notes")
  })

  it("keeps classroom resources on the classroom library route", () => {
    const { hrefs, text } = renderPage(<StudentClassroomMaterialsPage />)

    expect(text).toContain("Classroom materials")
    expect(text).toContain("Ecosystem field notes")
    expect(hrefs).toContain("/students/classrooms/biology-101")
  })

  it("hides details for a classroom resource the student cannot open", () => {
    const { text } = renderPage(<StudentClassroomMaterialsPage />)

    expect(text).toContain("Resource unavailable")
    expect(text).not.toContain("Restricted practice set")
  })

  it("keeps peer-shared resources on the study space library route", () => {
    const { hrefs, text } = renderPage(<StudentStudySpaceMaterialsPage />)

    expect(text).toContain("Study space resources")
    expect(text).toContain("Problem set")
    expect(hrefs).toContain("/students/study-spaces")
  })

  it("uses a pastel gradient in the source family and drops the duplicated line", () => {
    const { container, text } = renderPage(<StudentPersonalMaterialsPage />)

    expect(container.querySelector(".from-amber-50")).toBeTruthy()
    expect(container.querySelector(".to-orange-50")).toBeTruthy()

    const occurrences = text.split("Your own notes and references, kept in your workspace.").length - 1
    expect(occurrences).toBe(1)
  })

  it("caps a subject preview at four resources and offers show more", () => {
    const { container } = renderPage(<StudentPersonalMaterialsPage />)

    const chemistrySection = Array.from(
      container.querySelectorAll("section")
    ).find((section) => section.textContent?.includes("Chemistry I"))

    expect(chemistrySection?.querySelectorAll("li").length).toBe(4)
    expect(chemistrySection?.textContent).toContain("5 resources")
    expect(chemistrySection?.querySelector("[role=tooltip]")?.textContent).toBe("Show more")
  })

  it("links a subject to its own resources page", () => {
    const { hrefs } = renderPage(<StudentPersonalMaterialsPage />)

    expect(hrefs).toContain("/students/materials/personal/chemistry-i")
    expect(hrefs).toContain("/students/materials/personal/mathematics")
  })

  it("lays the personal resources card out as a left-aligned banner", () => {
    renderPage(<StudentPersonalMaterialsPage />)

    const heading = screen.getByRole("heading", { level: 2, name: "Personal resources" })
    const banner = heading.closest("section")

    expect(banner?.textContent).toContain("You own these")
    expect(banner?.textContent).toContain(
      "Your own notes and references, kept in your workspace."
    )
    expect(banner?.querySelector("svg")).toBeTruthy()

    const actions = Array.from(banner?.querySelectorAll("a") ?? [])
    expect(actions.length).toBe(1)
    expect(actions[0]?.textContent?.trim()).toBe("Open My Learning")
    expect(actions[0]?.className).toContain("bg-amber-600")
    expect(screen.queryByRole("link", { name: "Open Notes" })).toBeNull()
  })

  it("adds subject categories with All selected by default", () => {
    renderPage(<StudentPersonalMaterialsPage />)

    expect(screen.getByRole("button", { name: "All" }).getAttribute("aria-pressed")).toBe("true")
    expect(
      screen.getByRole("button", { name: "Chemistry I" }).getAttribute("aria-pressed")
    ).toBe("false")
    expect(screen.getByRole("group", { name: "Subject categories" })).toBeTruthy()
  })

  it("hides the resource count copy once a subject category is selected", async () => {
    const user = userEvent.setup()
    renderPage(<StudentPersonalMaterialsPage />)

    expect(screen.getByText("12 resources shown")).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "English" }))

    expect(screen.queryByText(/resources shown/)).toBeNull()
  })

  it("jumps to a subject category from the show more arrow", async () => {
    const user = userEvent.setup()
    const { container } = renderPage(<StudentPersonalMaterialsPage />)

    await user.click(screen.getByRole("button", { name: "Show all Chemistry I resources" }))

    expect(
      screen.getByRole("button", { name: /^Chemistry I/ }).getAttribute("aria-pressed")
    ).toBe("true")
    expect(container.querySelectorAll("ul li").length).toBe(5)
    expect(screen.queryByRole("button", { name: "Show all Chemistry I resources" })).toBeNull()
    expect(screen.queryByText("Wave equation checklist")).toBeNull()
    expect(screen.getByText("Chemical bonding recap")).toBeTruthy()
  })

  it("filters the library to one subject category", async () => {
    const user = userEvent.setup()
    const { container } = renderPage(<StudentPersonalMaterialsPage />)

    await user.click(screen.getByRole("button", { name: /^English/ }))

    expect(container.querySelectorAll("ul li").length).toBe(2)
    expect(screen.getByText("Essay intro outline")).toBeTruthy()
    expect(screen.queryByText("Chemical bonding recap")).toBeNull()
  })

  it("uses the same design for classroom and study space libraries", () => {
    const classroom = renderPage(<StudentClassroomMaterialsPage />)
    expect(classroom.container.querySelector(".from-sky-100")).toBeTruthy()
    expect(classroom.container.querySelector(".to-blue-100")).toBeTruthy()
    expect(classroom.hrefs).toContain("/students/materials/classroom/biology-101")

    const studySpace = renderPage(<StudentStudySpaceMaterialsPage />)
    expect(studySpace.container.querySelector(".from-emerald-50")).toBeTruthy()
    expect(studySpace.container.querySelector(".to-teal-50")).toBeTruthy()
    expect(studySpace.hrefs).toContain("/students/materials/study-spaces/physics-group")
  })

  it("caps the classroom and study space previews at four resources too", () => {
    const classroom = renderPage(<StudentClassroomMaterialsPage />)
    const biology = Array.from(classroom.container.querySelectorAll("section")).find(
      (section) => section.textContent?.includes("Biology 101")
    )
    expect(biology?.querySelectorAll("li").length).toBe(4)
    expect(biology?.textContent).toContain("5 resources")
    expect(biology?.querySelector("[role=tooltip]")?.textContent).toBe("Show more")

    const studySpace = renderPage(<StudentStudySpaceMaterialsPage />)
    const physics = Array.from(studySpace.container.querySelectorAll("section")).find(
      (section) => section.textContent?.includes("Physics Group")
    )
    expect(physics?.querySelectorAll("li").length).toBe(4)
    expect(physics?.textContent).toContain("5 resources")
  })
})
```

### `student-library-view.tsx`

Current file: `src/components/features/materials/student-library-view.tsx`

```tsx
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
import { PersonalLibraryWork } from "./workspace/personal-library-work"
import {
  countLibraryResources,
  filterLibraryResources,
  librarySourceMeta,
  librarySources,
  previewLibraryResources,
  type LibraryFilter,
} from "./library-records"
import type { LibraryResourceKind, LibrarySource } from "./library-types"
import styles from './library-theme.module.css'

const collections: Record<LibrarySource, { title: string; description: string }> = {
  personal: { title: "Made for your next study session", description: "Your personal notes, references, and a little head start." },
  classroom: { title: "From the classroom", description: "Educator-published materials, connected to their class." },
  "study-space": { title: "Better when shared", description: "Peer resources from the spaces where you learn together." },
}

function LibraryBannerPaper({ side }: { side: "left" | "right" }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute top-9 hidden h-56 w-40 rounded-lg border border-border/70 bg-card p-5 shadow-lg shadow-slate-900/5 xl:block ${side === "left" ? "-left-6 -rotate-12" : "-right-4 rotate-12"}`}>
      <span className="mb-4 flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand-soft-foreground"><BookOpen className="size-4" /></span>
      <div className="h-2 w-3/4 rounded bg-muted" />
      <div className="mt-2 h-1 w-1/2 rounded bg-muted" />
      <div className="mt-5 space-y-2">
        {["w-full", "w-4/5", "w-full", "w-3/5", "w-4/5"].map((width, index) => <div key={index} className={`h-1 rounded bg-muted ${width}`} />)}
      </div>
      <div className="mt-4 h-8 rounded bg-brand-soft" />
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
      <section aria-labelledby="study-library-heading" className={`${styles.banner} relative isolate overflow-hidden rounded-xl border border-border/40 px-5 py-6 sm:px-8 sm:py-7`}>
        <LibraryBannerPaper side="left" />
        <LibraryBannerPaper side="right" />
        <div className="relative mx-auto max-w-xl text-center">
          <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"><Sparkles aria-hidden="true" className="size-3" /> A little curiosity goes a long way</p>
          <h2 id="study-library-heading" className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Welcome to your Study Library</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">A place for your notes, classroom discoveries, and ideas worth sharing. Find your next starting point.</p>
          <div className="mx-auto mt-4 max-w-md [&>div]:w-full [&_input]:h-10 [&_input]:border-border [&_input]:bg-background [&_input]:shadow-sm">
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
              {(source === "all" || source === "personal") && <PersonalLibraryWork query={query} kinds={selectedKinds} />}
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
```

<!-- END GENERATED CURRENT SOURCE -->
