import type { NoteRecord } from "../contents/note-records"

export function toggleItem(note: NoteRecord, itemId: string): NoteRecord {
  return {
    ...note,
    items: note.items.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    ),
  }
}
