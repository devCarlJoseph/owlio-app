import { Hash, Pin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { NoteCardMenu } from "./note-card-menu"
import type { NoteCardActions } from "./note-card-actions"
import { getNoteColorMeta, getNoteTags, getNoteTitle, type NoteRecord } from "./note-records"

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

function NoteTagChips({
  note,
  activeTag,
  onSelectTag,
  max,
}: {
  note: NoteRecord
  activeTag: string | null
  onSelectTag: (tag: string) => void
  max: number
}) {
  const tags = getNoteTags(note)

  if (tags.length === 0) return null

  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.slice(0, max).map((tag) => (
        <li key={tag}>
          <button
            type="button"
            onClick={() => onSelectTag(tag)}
            aria-pressed={activeTag === tag}
            className={`inline-flex items-center gap-0.5 rounded-4xl px-1.5 py-0.5 text-[11px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
              activeTag === tag
                ? "bg-slate-800 text-white"
                : "bg-white/70 text-slate-600 hover:bg-white hover:text-slate-900"
            }`}
          >
            <Hash className="size-2.5" aria-hidden="true" />
            {tag}
          </button>
        </li>
      ))}
      {tags.length > max ? (
        <li className="inline-flex items-center rounded-4xl bg-white/70 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
          +{tags.length - max}
        </li>
      ) : null}
    </ul>
  )
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
  activeTag: string | null
  actions: NoteCardActions
}

export function NoteCard({ note, variant, activeTag, actions }: NoteCardProps) {
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

          <NoteTagChips
            note={note}
            activeTag={activeTag}
            onSelectTag={actions.onSelectTag}
            max={2}
          />

          <span className="hidden shrink-0 items-center gap-1 text-[11px] text-slate-500 sm:flex">
            {note.pinned ? <Pin aria-hidden="true" className="size-3" /> : null}
            <time dateTime={note.updatedAt}>{formatNoteTimestamp(note.updatedAt)}</time>
          </span>

          <NoteCardMenu
            note={note}
            onEdit={actions.onEdit}
            onTogglePin={actions.onTogglePin}
            onDuplicate={actions.onDuplicate}
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
            onDuplicate={actions.onDuplicate}
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
          <NoteTagChips
            note={note}
            activeTag={activeTag}
            onSelectTag={actions.onSelectTag}
            max={2}
          />

          <span className="flex shrink-0 items-center gap-1 text-[11px] text-slate-500">
            {note.pinned ? <Pin aria-hidden="true" className="size-3" /> : null}
            <time dateTime={note.updatedAt}>{formatNoteTimestamp(note.updatedAt)}</time>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
