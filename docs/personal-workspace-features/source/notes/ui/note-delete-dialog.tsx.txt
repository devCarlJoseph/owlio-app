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