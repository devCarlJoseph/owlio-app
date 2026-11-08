import {
  noteColors,
  notesStorageKey,
  sampleNotes,
  type NoteBucket,
  type NoteChecklistItem,
  type NoteColor,
  type NoteColorMeta,
  type NoteKind,
  type NoteLabelGroup,
  type NoteRecord,
} from "../contents/note-records"

function isNoteRecord(value: unknown): value is NoteRecord {
  if (typeof value !== "object" || value === null) return false
  const note = value as Record<string, unknown>

  return (
    typeof note.id === "string" &&
    typeof note.title === "string" &&
    typeof note.body === "string" &&
    typeof note.updatedAt === "string" &&
    typeof note.pinned === "boolean"
  )
}

function isChecklistItem(value: unknown): value is NoteChecklistItem {
  if (typeof value !== "object" || value === null) return false
  const item = value as Record<string, unknown>

  return (
    typeof item.id === "string" &&
    typeof item.text === "string" &&
    typeof item.done === "boolean"
  )
}

function isNoteColor(value: unknown): value is NoteColor {
  return noteColors.some((color) => color.value === value)
}

export function createNoteId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createChecklistItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function normalizeLabels(rawLabels: string): string[] {
  const labels = new Set<string>()

  for (const rawLabel of rawLabels.split(/[,\s]+/)) {
    const cleaned = rawLabel.replace(/^#+/, "").replace(/[^\p{L}\p{N}_-]/gu, "").toLowerCase()
    if (cleaned.length > 0) labels.add(cleaned)
  }

  return [...labels].sort()
}

export function normalizeNote(note: NoteRecord): NoteRecord {
  const storedLabels = Array.isArray(note.labels)
    ? note.labels
    : Array.isArray((note as unknown as { tags?: unknown }).tags)
      ? ((note as unknown as { tags: string[] }).tags ?? [])
      : []
  const labels = [...new Set(storedLabels.map((label) => label.trim().toLowerCase()))]
    .filter((label) => label.length > 0)
    .sort()
  const kind: NoteKind = note.kind === "checklist" ? "checklist" : "text"
  const items = Array.isArray(note.items)
    ? note.items.filter(isChecklistItem).map((item) => ({ ...item, text: item.text.trim() }))
    : []

  return {
    ...note,
    labels,
    kind,
    color: isNoteColor(note.color) ? note.color : "default",
    items,
    archived: note.archived === true,
    trashed: note.trashed === true,
  }
}

export function getNoteLabels(note: NoteRecord): string[] {
  return note.labels
}

export function getNoteColorMeta(color: NoteColor): NoteColorMeta {
  return noteColors.find((item) => item.value === color) ?? noteColors[0]
}

export function getNoteTitle(note: NoteRecord): string {
  const title = note.title.trim()

  if (title.length > 0) return title
  if (note.kind === "checklist" && note.items.length > 0) return "Untitled checklist"
  if (note.body.trim().length > 0) return "Untitled note"

  return "Untitled note"
}

export function noteMatchesQuery(note: NoteRecord, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()

  if (normalizedQuery.length === 0) return true

  return (
    note.title.toLowerCase().includes(normalizedQuery) ||
    note.body.toLowerCase().includes(normalizedQuery) ||
    note.labels.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
    note.items.some((item) => item.text.toLowerCase().includes(normalizedQuery))
  )
}

export function groupNotesByLabel(notes: NoteRecord[]): NoteLabelGroup[] {
  const groups = new Map<string, NoteRecord[]>()

  for (const note of notes) {
    for (const label of getNoteLabels(note)) {
      const grouped = groups.get(label)

      if (grouped) grouped.push(note)
      else groups.set(label, [note])
    }
  }

  return [...groups.entries()]
    .map(([label, groupedNotes]) => ({ label, notes: groupedNotes }))
    .sort(
      (first, second) =>
        second.notes.length - first.notes.length || first.label.localeCompare(second.label)
    )
}

export function sortNotes(notes: NoteRecord[]): NoteRecord[] {
  return [...notes].sort(
    (first, second) =>
      Number(second.pinned) - Number(first.pinned) ||
      new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
  )
}

export function notesInBucket(notes: NoteRecord[], bucket: NoteBucket): NoteRecord[] {
  if (bucket === "trash") return notes.filter((note) => note.trashed)
  if (bucket === "archive") return notes.filter((note) => note.archived && !note.trashed)

  return notes.filter((note) => !note.archived && !note.trashed)
}

export function countNotesInBucket(notes: NoteRecord[], bucket: NoteBucket): number {
  return notesInBucket(notes, bucket).length
}

export function duplicateNote(note: NoteRecord): NoteRecord {
  return normalizeNote({
    ...note,
    id: createNoteId(),
    title: note.title.length > 0 ? `${note.title} (copy)` : note.title,
    updatedAt: new Date().toISOString(),
    pinned: false,
    items: note.items.map((item) => ({ ...item, id: createChecklistItemId() })),
  })
}

export function loadNotes(): NoteRecord[] {
  if (typeof window === "undefined") return sampleNotes

  try {
    const stored = window.localStorage.getItem(notesStorageKey)
    if (!stored) return sampleNotes

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return sampleNotes

    return parsed.filter(isNoteRecord).map(normalizeNote)
  } catch {
    return sampleNotes
  }
}

export function saveNotes(notes: NoteRecord[]): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(notesStorageKey, JSON.stringify(notes))
  } catch {
    return
  }
}

export function createEmptyNote(): NoteRecord {
  const timestamp = new Date().toISOString()

  return {
    id: createNoteId(),
    title: "",
    body: "",
    labels: [],
    updatedAt: timestamp,
    pinned: false,
    kind: "text",
    color: "default",
    items: [],
    archived: false,
    trashed: false,
  }
}
