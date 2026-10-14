import { Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getNoteTags, type NoteRecord } from "./note-records"

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

function formatUpdatedAt(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Updated just now"
  return `Updated ${dateTimeFormatter.format(parsed)}`
}

type NoteListItemProps = {
  note: NoteRecord
  activeTag: string | null
  onOpen: (note: NoteRecord) => void
  onSelectTag: (tag: string) => void
}

function NoteListItem({ note, activeTag, onOpen, onSelectTag }: NoteListItemProps) {
  const tags = getNoteTags(note)

  return (
    <Card size="sm" className="relative h-full border border-slate-200 bg-white shadow-sm ring-0">
      <CardContent className="h-full gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="truncate text-base font-semibold text-slate-900">{note.title}</h4>
            <p className="mt-0.5 text-xs text-slate-500">
              {note.pinned ? "Pinned · " : ""}
              {formatUpdatedAt(note.updatedAt)}
            </p>
          </div>
          {tags.length > 0 ? (
            <ul className="flex shrink-0 flex-wrap justify-end gap-2">
              {tags.slice(0, 2).map((tag) => (
                <li key={tag}>
                  <button
                    type="button"
                    onClick={() => onSelectTag(tag)}
                    aria-pressed={activeTag === tag}
                    className={`relative z-10 inline-flex items-center gap-1 rounded-4xl px-2 py-0.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      activeTag === tag
                        ? "bg-blue-700 text-white"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    <Hash className="size-3" aria-hidden="true" />
                    {tag}
                  </button>
                </li>
              ))}
              {tags.length > 2 ? (
                <li className="inline-flex items-center rounded-4xl bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  +{tags.length - 2}
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{note.body}</p>

        <button
          type="button"
          onClick={() => onOpen(note)}
          className="absolute inset-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span className="sr-only">Open note {note.title}</span>
        </button>
      </CardContent>
    </Card>
  )
}

type NoteListProps = {
  notes: NoteRecord[]
  totalCount: number
  activeTag: string | null
  query: string
  onCreate: () => void
  onOpen: (note: NoteRecord) => void
  onSelectTag: (tag: string) => void
  onClearFilters: () => void
}

export function NoteList({
  notes,
  totalCount,
  activeTag,
  query,
  onCreate,
  onOpen,
  onSelectTag,
  onClearFilters,
}: NoteListProps) {
  const isFiltered = activeTag !== null || query.trim().length > 0

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {notes.map((note) => (
        <NoteListItem
          key={note.id}
          note={note}
          activeTag={activeTag}
          onOpen={onOpen}
          onSelectTag={onSelectTag}
        />
      ))}

      {notes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center sm:col-span-2">
          <p className="text-sm font-semibold text-slate-900">
            {isFiltered ? "No notes match this view." : "No notes yet."}
          </p>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {isFiltered
              ? "Try another group or clear the filters to see every note."
              : "Create your first note to start building your personal study record."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
            onClick={isFiltered ? onClearFilters : onCreate}
          >
            {isFiltered ? "Clear filters" : "Create a note"}
          </Button>
        </div>
      ) : null}

      {notes.length > 0 && isFiltered ? (
        <p className="text-xs text-slate-500 sm:col-span-2">
          Showing {notes.length} of {totalCount} notes.
        </p>
      ) : null}
    </div>
  )
}