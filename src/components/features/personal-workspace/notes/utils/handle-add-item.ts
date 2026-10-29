import type { NoteRecord } from "../contents/note-records"
import { createChecklistItemId } from "./note-records"

export function handleAddItem(note: NoteRecord): Partial<NoteRecord> {
  return {
    kind: "checklist",
    items: [...note.items, { id: createChecklistItemId(), text: "", done: false }],
  }
}
