import { Hash, Pencil, Pin, PinOff, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getNoteTags, type NoteRecord } from "./note-records"

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
  onEdit: (note: NoteRecord) => void
  onDelete: (note: NoteRecord) => void
}

export function NoteDetailDialog({
  open,
  note,
  onOpenChange,
  onTogglePin,
  onEdit,
  onDelete,
}: NoteDetailDialogProps) {
  const tags = note ? getNoteTags(note) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {note ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-900">{note.title}</DialogTitle>
              <DialogDescription className="text-slate-600">
                {note.pinned ? "Pinned note · " : ""}
                Updated {dateTimeFormatter.format(new Date(note.updatedAt))}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm leading-6 text-slate-700">{note.body}</p>

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
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onTogglePin(note)}
                >
                  {note.pinned ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}
                  {note.pinned ? "Unpin note" : "Pin note"}
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