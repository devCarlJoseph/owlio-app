import { Archive, ArchiveRestore, Copy, Hash, Pencil, Pin, PinOff, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getNoteColorMeta, getNoteTags, getNoteTitle, type NoteRecord } from "./note-records"

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

type NoteDetailDialogProps = {
  open: boolean
  note: NoteRecord | null
  onOpenChange: (open: boolean) => void
  onTogglePin: (note: NoteRecord) => void
  onToggleItem: (note: NoteRecord, itemId: string) => void
  onEdit: (note: NoteRecord) => void
  onDuplicate: (note: NoteRecord) => void
  onArchive: (note: NoteRecord) => void
  onDelete: (note: NoteRecord) => void
}

export function NoteDetailDialog({
  open,
  note,
  onOpenChange,
  onTogglePin,
  onToggleItem,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: NoteDetailDialogProps) {
  const tags = note ? getNoteTags(note) : []
  const colorMeta = note ? getNoteColorMeta(note.color) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {note ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {getNoteTitle(note)}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                {note.pinned ? "Pinned note · " : ""}
                {note.archived && !note.trashed ? "Archived · " : ""}
                {note.trashed ? "In trash · " : ""}
                Updated {dateTimeFormatter.format(new Date(note.updatedAt))}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {note.kind === "checklist" ? (
                <ul className="space-y-2">
                  {note.items.map((item) => (
                    <li key={item.id} className="flex items-start gap-2">
                      <Checkbox
                        checked={item.done}
                        onCheckedChange={() => onToggleItem(note, item.id)}
                        aria-label={item.text}
                        className="mt-0.5"
                      />
                      <span
                        className={`text-sm leading-6 ${
                          item.done ? "text-slate-400 line-through" : "text-slate-700"
                        }`}
                      >
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{note.body}</p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {colorMeta ? (
                  <Badge variant="outline" className={`${colorMeta.chip} border-transparent`}>
                    {colorMeta.label}
                  </Badge>
                ) : null}
                {note.kind === "checklist" ? (
                  <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">
                    {note.items.filter((item) => item.done).length} of {note.items.length} done
                  </Badge>
                ) : null}
              </div>

              {tags.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-4xl bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                    >
                      <Hash className="size-3" aria-hidden="true" />
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <DialogFooter className="sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onTogglePin(note)}
                >
                  {note.pinned ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}
                  {note.pinned ? "Unpin" : "Pin"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onDuplicate(note)}
                >
                  <Copy aria-hidden="true" />
                  Duplicate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onArchive(note)}
                >
                  {note.archived ? <ArchiveRestore aria-hidden="true" /> : <Archive aria-hidden="true" />}
                  {note.archived ? "Unarchive" : "Archive"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(note)}
                >
                  <Pencil aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(note)}
                  className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                >
                  <Trash aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900">Note unavailable</DialogTitle>
              <DialogDescription className="text-slate-600">
                This note is no longer in your list.
              </DialogDescription>
            </DialogHeader>
            <Badge variant="outline" className="w-fit border-slate-200 bg-slate-50 text-slate-600">
              Removed
            </Badge>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
