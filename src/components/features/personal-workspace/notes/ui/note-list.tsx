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
