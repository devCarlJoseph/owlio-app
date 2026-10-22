import { Archive, ArchiveRestore, MoreVertical, Pencil, Pin, PinOff, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getNoteTitle, type NoteRecord } from "./note-records"

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
