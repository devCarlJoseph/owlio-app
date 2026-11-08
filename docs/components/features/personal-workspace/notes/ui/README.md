# ui

This directory mirrors `src/components/features/personal-workspace/notes/ui/`. For the current files, proposed component folders, and manual migration checks, use the [personal-workspace guide](../../README.md) and its [source index](../../SOURCE_INDEX.md). These copies are documentation only; application code has not moved.

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/personal-workspace/notes/ui/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### `note-card-menu.tsx`

Current file: `src/components/features/personal-workspace/notes/ui/note-card-menu.tsx`

```tsx
import { Archive, ArchiveRestore, MoreVertical, Pencil, Pin, PinOff, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { NoteRecord } from "../contents/note-records"
import { getNoteTitle } from "../utils/note-records"

type NoteCardMenuProps = {
  note: NoteRecord
  onEdit: (note: NoteRecord) => void
  onTogglePin: (note: NoteRecord) => void
  onArchive: (note: NoteRecord) => void
  onDelete: (note: NoteRecord) => void
}

export function NoteCardMenu({
  note,
  onEdit,
  onTogglePin,
  onArchive,
  onDelete,
}: NoteCardMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={`Options for ${getNoteTitle(note)}`}
            className="relative z-10 shrink-0 text-slate-500 hover:bg-black/5 hover:text-slate-900"
          />
        }
      >
        <MoreVertical aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(note)}>
          <Pencil aria-hidden="true" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onTogglePin(note)}>
          {note.pinned ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}
          {note.pinned ? "Unpin from top" : "Pin to top"}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => onArchive(note)}>
          {note.archived ? <ArchiveRestore aria-hidden="true" /> : <Archive aria-hidden="true" />}
          {note.archived ? "Move back to notes" : "Archive"}
        </DropdownMenuItem>

        <DropdownMenuItem variant="destructive" onClick={() => onDelete(note)}>
          <Trash aria-hidden="true" />
          Move to trash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### `note-card.tsx`

Current file: `src/components/features/personal-workspace/notes/ui/note-card.tsx`

```tsx
import { Pin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { NoteCardMenu } from "./note-card-menu"
import type { NoteCardActions } from "../contents/note-card-actions"
import { NoteLabels } from "./note-labels"
import type { NoteRecord } from "../contents/note-records"
import { getNoteColorMeta, getNoteTitle } from "../utils/note-records"

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

function formatNoteTimestamp(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Just now"
  return timestampFormatter.format(parsed)
}

function NoteChecklistPreview({
  note,
  onToggleItem,
}: {
  note: NoteRecord
  onToggleItem: (note: NoteRecord, itemId: string) => void
}) {
  if (note.items.length === 0) {
    return <p className="text-sm italic leading-5 text-slate-500">No checklist items yet.</p>
  }

  return (
    <ul className="space-y-1.5">
      {note.items.map((item) => (
        <li key={item.id} className="flex items-start gap-2">
          <Checkbox
            checked={item.done}
            onCheckedChange={() => onToggleItem(note, item.id)}
            aria-label={item.text}
            className="mt-0.5"
          />
          <span
            className={`text-sm leading-5 ${
              item.done ? "text-slate-400 line-through" : "text-slate-700"
            }`}
          >
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  )
}

type NoteCardProps = {
  note: NoteRecord
  variant: "grid" | "list"
  actions: NoteCardActions
}

export function NoteCard({ note, variant, actions }: NoteCardProps) {
  const colorMeta = getNoteColorMeta(note.color)
  const title = note.title.trim()
  const doneItems = note.items.filter((item) => item.done).length

  if (variant === "list") {
    return (
      <Card size="sm" className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardContent className="flex-row items-center gap-3">
          <span
            aria-hidden="true"
            className={`size-3 shrink-0 rounded-full ring-1 ring-black/5 ${colorMeta.swatch}`}
          />

          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => actions.onOpen(note)}
              className="block w-full truncate text-left text-sm font-semibold text-slate-900 outline-none hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              {getNoteTitle(note)}
            </button>
            <p className="truncate text-xs text-slate-500">
              {note.kind === "checklist"
                ? `${doneItems} of ${note.items.length} done`
                : note.body || "No text yet"}
            </p>
          </div>

          <NoteLabels labels={note.labels} onLabelClick={actions.onSelectTag} max={2} />

          <span className="hidden shrink-0 items-center gap-1 text-[11px] text-slate-500 sm:flex">
            {note.pinned ? <Pin aria-hidden="true" className="size-3" /> : null}
            <time dateTime={note.updatedAt}>{formatNoteTimestamp(note.updatedAt)}</time>
          </span>

          <NoteCardMenu
            note={note}
            onEdit={actions.onEdit}
            onTogglePin={actions.onTogglePin}
            onArchive={actions.onArchive}
            onDelete={actions.onDelete}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      size="sm"
      className={`h-full border border-slate-200/80 shadow-sm ring-0 ${colorMeta.card}`}
    >
      <CardContent className="flex-1 gap-2">
        <div className="flex items-start justify-between gap-2">
          {title ? (
            <h4 className="min-w-0 flex-1 text-sm font-semibold leading-5 text-slate-900">
              <button
                type="button"
                onClick={() => actions.onOpen(note)}
                className="block w-full truncate rounded text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
              >
                {title}
              </button>
            </h4>
          ) : (
            <span className="min-w-0 flex-1" />
          )}

          <NoteCardMenu
            note={note}
            onEdit={actions.onEdit}
            onTogglePin={actions.onTogglePin}
            onArchive={actions.onArchive}
            onDelete={actions.onDelete}
          />
        </div>

        {note.kind === "checklist" ? (
          <NoteChecklistPreview note={note} onToggleItem={actions.onToggleItem} />
        ) : (
          <button
            type="button"
            onClick={() => actions.onOpen(note)}
            className="block w-full rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
          >
            <span className="line-clamp-4 text-sm leading-6 text-slate-700">{note.body}</span>
          </button>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <NoteLabels labels={note.labels} onLabelClick={actions.onSelectTag} max={2} />

          <span className="flex shrink-0 items-center gap-1 text-[11px] text-slate-500">
            {note.pinned ? <Pin aria-hidden="true" className="size-3" /> : null}
            <time dateTime={note.updatedAt}>{formatNoteTimestamp(note.updatedAt)}</time>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
```

### `note-delete-dialog.tsx`

Current file: `src/components/features/personal-workspace/notes/ui/note-delete-dialog.tsx`

```tsx
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { NoteRecord } from "../contents/note-records"

type NoteDeleteDialogProps = {
  open: boolean
  note: NoteRecord | null
  onOpenChange: (open: boolean) => void
  onConfirm: (note: NoteRecord) => void
}

export function NoteDeleteDialog({ open, note, onOpenChange, onConfirm }: NoteDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">Move this note to trash?</DialogTitle>
          <DialogDescription className="text-slate-600">
            {note ? `“${note.title || "Untitled note"}”` : "This note"} will be moved to the trash in this
            browser. You can restore it from the trash afterwards.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Keep note
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (!note) return
              onConfirm(note)
            }}
          >
            <Trash aria-hidden="true" />
            Move to trash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### `note-label-chips.tsx`

Current file: `src/components/features/personal-workspace/notes/ui/note-label-chips.tsx`

```tsx
import { Button } from "@/components/ui/button"
import type { NoteLabelGroup } from "../contents/note-records"

type NoteLabelChipsProps = {
  groups: NoteLabelGroup[]
  activeLabel: string | null
  onSelectLabel: (label: string | null) => void
}

export function NoteLabelChips({ groups, activeLabel, onSelectLabel }: NoteLabelChipsProps) {
  if (groups.length === 0) {
    return (
      <p className="text-xs leading-5 text-slate-500">
        Add a label such as <span className="font-semibold text-blue-700">physics</span> to a note to
        group it here.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-slate-500">Labels</span>

      <Button
        type="button"
        size="xs"
        variant="outline"
        aria-pressed={activeLabel === null}
        onClick={() => onSelectLabel(null)}
        className={
          activeLabel === null
            ? "border-blue-700 bg-blue-700 text-white hover:bg-blue-800"
            : "border-slate-200 text-slate-600 hover:bg-slate-50"
        }
      >
        All
      </Button>

      {groups.map((group) => {
        const isActive = activeLabel === group.label

        return (
          <Button
            key={group.label}
            type="button"
            size="xs"
            variant="outline"
            aria-pressed={isActive}
            onClick={() => onSelectLabel(isActive ? null : group.label)}
            className={
              isActive
                ? "border-blue-700 bg-blue-700 text-white hover:bg-blue-800"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }
          >
            {group.label}
            <span className="tabular-nums opacity-70">{group.notes.length}</span>
          </Button>
        )
      })}
    </div>
  )
}
```

### `note-labels.tsx`

Current file: `src/components/features/personal-workspace/notes/ui/note-labels.tsx`

```tsx
import { useState } from "react"
import { MoreHorizontal, X } from "lucide-react"
import { cn } from "cn"

type NoteLabelsProps = {
  labels: string[]
  onLabelClick?: (label: string) => void
  onRemove?: (label: string) => void
  max?: number
  className?: string
}

export function NoteLabels({
  labels,
  onLabelClick,
  onRemove,
  max = 2,
  className,
}: NoteLabelsProps) {
  const [open, setOpen] = useState(false)

  if (labels.length === 0) return null

  const visible = labels.slice(0, max)
  const hidden = labels.slice(max)

  return (
    <div className={cn("relative flex items-center gap-1.5 overflow-hidden", className)}>
      {visible.map((label) => (
        <span
          key={label}
          className="inline-flex max-w-40 shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
        >
          <button
            type="button"
            onClick={() => onLabelClick?.(label)}
            className="truncate rounded outline-none hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {label}
          </button>
          {onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(label)}
              aria-label={`Remove label ${label}`}
              className="rounded-full p-0.5 outline-none hover:bg-slate-300/70 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          ) : null}
        </span>
      ))}

      {hidden.length > 0 ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-label={`${hidden.length} more ${hidden.length === 1 ? "label" : "labels"}`}
            aria-expanded={open}
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 outline-none transition hover:bg-slate-200 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <MoreHorizontal aria-hidden="true" className="size-3.5" />
          </button>

          {open ? (
            <div
              role="menu"
              aria-label="More labels"
              className="absolute bottom-full left-0 z-20 mb-1 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
            >
              {hidden.map((label) => (
                <button
                  key={label}
                  type="button"
                  role="menuitem"
                  onClick={() => onLabelClick?.(label)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wide text-slate-600 outline-none hover:bg-slate-100 focus-visible:bg-slate-100"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
```

### `note-list.tsx`

Current file: `src/components/features/personal-workspace/notes/ui/note-list.tsx`

```tsx
import { Archive, ArchiveRestore, NotebookPen, Search, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { NoteCard } from "./note-card"
import type { NoteCardActions } from "../contents/note-card-actions"
import type { NoteBucket, NoteRecord } from "../contents/note-records"
import { getNoteTitle } from "../utils/note-records"

type NoteListProps = {
  notes: NoteRecord[]
  totalCount: number
  variant: "grid" | "list"
  bucket: NoteBucket
  query: string
  activeTag: string | null
  actions: NoteCardActions
  onCreate: () => void
  onClearFilters: () => void
  onRestore: (note: NoteRecord) => void
  onEmptyTrash: () => void
}

const bucketEmptyCopy: Record<
  NoteBucket,
  { title: string; description: string; media: typeof NotebookPen }
> = {
  notes: {
    title: "No notes yet.",
    description: "Create your first note to start building your personal study record.",
    media: NotebookPen,
  },
  archive: {
    title: "Nothing in the archive.",
    description:
      "Archived notes are set aside but kept in this browser. Move a note back when you want to keep working on it.",
    media: Archive,
  },
  trash: {
    title: "Trash is empty.",
    description: "Deleted notes stay in this browser until you empty the trash.",
    media: Trash,
  },
}

export function NoteList({
  notes,
  totalCount,
  variant,
  bucket,
  activeTag,
  query,
  actions,
  onCreate,
  onClearFilters,
  onRestore,
  onEmptyTrash,
}: NoteListProps) {
  const isFiltered = activeTag !== null || query.trim().length > 0
  const emptyCopy = bucketEmptyCopy[bucket]

  if (notes.length === 0) {
    const Media = isFiltered ? Search : emptyCopy.media
    const title = isFiltered ? "No notes match this view." : emptyCopy.title
    const description = isFiltered
      ? "Try another group or clear the filters to see every note."
      : emptyCopy.description

    return (
      <Empty className="border border-dashed border-slate-300 bg-slate-50/60 p-8 sm:p-10">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-slate-100 text-slate-500">
            <Media aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle className="text-base text-slate-900">{title}</EmptyTitle>
          <EmptyDescription className="text-slate-600">{description}</EmptyDescription>
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
          ) : bucket === "notes" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCreate}
              className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
            >
              Create a note
            </Button>
          ) : null}
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="space-y-3">
      {bucket === "trash" ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
            <p className="text-xs leading-5 text-slate-600">
              Deleted notes stay in this browser until you empty the trash. Nothing is sent to a server.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={onEmptyTrash}>
              <Trash aria-hidden="true" />
              Empty trash
            </Button>
          </div>

          <ul className="space-y-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <p className="min-w-0 truncate text-sm font-medium text-slate-800">
                  {getNoteTitle(note)}
                </p>
                <Button type="button" variant="outline" size="sm" onClick={() => onRestore(note)}>
                  <ArchiveRestore aria-hidden="true" />
                  Restore
                </Button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <ul
          className={
            variant === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "space-y-2"
          }
        >
          {notes.map((note) => (
            <li key={note.id}>
              <NoteCard note={note} variant={variant} actions={actions} />
            </li>
          ))}
        </ul>
      )}

      {isFiltered ? (
        <p className="text-xs text-slate-500">
          Showing {notes.length} of {totalCount} notes.
        </p>
      ) : null}
    </div>
  )
}
```

<!-- END GENERATED CURRENT SOURCE -->
