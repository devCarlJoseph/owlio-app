import type { NoteRecord } from "./note-records"

export type NoteCardActions = {
  onOpen: (note: NoteRecord) => void
  onSelectTag: (tag: string) => void
  onToggleItem: (note: NoteRecord, itemId: string) => void
  onEdit: (note: NoteRecord) => void
  onTogglePin: (note: NoteRecord) => void
  onDuplicate: (note: NoteRecord) => void
  onArchive: (note: NoteRecord) => void
  onDelete: (note: NoteRecord) => void
}
