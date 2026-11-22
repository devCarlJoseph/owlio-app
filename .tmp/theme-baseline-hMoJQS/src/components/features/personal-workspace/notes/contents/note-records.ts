export type NoteKind = "text" | "checklist"

export type NoteChecklistItem = {
  id: string
  text: string
  done: boolean
}

export type NoteColor =
  | "default"
  | "blue"
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "purple"
  | "teal"

export type NoteBucket = "notes" | "archive" | "trash"

export type NoteRecord = {
  id: string
  title: string
  body: string
  labels: string[]
  updatedAt: string
  pinned: boolean
  kind: NoteKind
  color: NoteColor
  items: NoteChecklistItem[]
  archived: boolean
  trashed: boolean
}

export type NoteDraft = {
  title: string
  body: string
  labels: string[]
  kind: NoteKind
  color: NoteColor
  items: NoteChecklistItem[]
}

export type NoteLabelGroup = {
  label: string
  notes: NoteRecord[]
}

export type NoteColorMeta = {
  value: NoteColor
  label: string
  card: string
  swatch: string
  chip: string
}

export const notesStorageKey = "owlio.student-notes.v1"

export const notesGuidance =
  "Notes are personal study records. They stay in your workspace and are never treated as classroom materials."

export const notesStorageNotice =
  "Your notes are kept in this browser until account sync is connected. No demo notes are included."

export const notesLabelHint =
  "Labels are stored separately from your note text, so they never appear inside the note."

export const notesLabelPlaceholder = "e.g. novels reviews"

export const notesBucketLabels: Record<NoteBucket, string> = {
  notes: "Notes",
  archive: "Archive",
  trash: "Trash",
}

export const notesBucketHints: Record<NoteBucket, string> = {
  notes: "Notes you are still working with.",
  archive: "Notes you set aside. They stay in this browser until you move them back.",
  trash: "Deleted notes. They stay in this browser until you empty the trash.",
}

export const noteColors: NoteColorMeta[] = [
  {
    value: "default",
    label: "Default",
    card: "bg-white surface-dark:bg-card",
    swatch: "bg-white surface-dark:bg-card ring-1 ring-slate-300 surface-dark:ring-border",
    chip: "bg-slate-100 surface-dark:bg-muted text-slate-600 surface-dark:text-muted-foreground",
  },
  {
    value: "blue",
    label: "Blue",
    card: "bg-blue-50 surface-dark:bg-surface-blue-soft",
    swatch: "bg-blue-200 surface-dark:bg-surface-blue-strong",
    chip: "bg-blue-100 surface-dark:bg-surface-blue-soft text-blue-800 surface-dark:text-blue-300",
  },
  {
    value: "green",
    label: "Green",
    card: "bg-emerald-50 surface-dark:bg-surface-emerald-soft",
    swatch: "bg-emerald-200 surface-dark:bg-surface-emerald-strong",
    chip: "bg-emerald-100 surface-dark:bg-surface-emerald-soft text-emerald-800 surface-dark:text-emerald-300",
  },
  {
    value: "yellow",
    label: "Yellow",
    card: "bg-amber-50 surface-dark:bg-surface-amber-soft",
    swatch: "bg-amber-200 surface-dark:bg-surface-amber-strong",
    chip: "bg-amber-100 surface-dark:bg-surface-amber-soft text-amber-800 surface-dark:text-amber-300",
  },
  {
    value: "orange",
    label: "Orange",
    card: "bg-orange-50 surface-dark:bg-surface-orange-soft",
    swatch: "bg-orange-200 surface-dark:bg-surface-orange-strong",
    chip: "bg-orange-100 surface-dark:bg-surface-orange-soft text-orange-800 surface-dark:text-orange-300",
  },
  {
    value: "red",
    label: "Red",
    card: "bg-rose-50 surface-dark:bg-surface-rose-soft",
    swatch: "bg-rose-200 surface-dark:bg-surface-rose-strong",
    chip: "bg-rose-100 surface-dark:bg-surface-rose-soft text-rose-800 surface-dark:text-rose-300",
  },
  {
    value: "purple",
    label: "Purple",
    card: "bg-violet-50 surface-dark:bg-surface-violet-soft",
    swatch: "bg-violet-200 surface-dark:bg-surface-violet-strong",
    chip: "bg-violet-100 surface-dark:bg-surface-violet-soft text-violet-800 surface-dark:text-violet-300",
  },
  {
    value: "teal",
    label: "Teal",
    card: "bg-cyan-50 surface-dark:bg-surface-cyan-soft",
    swatch: "bg-cyan-200 surface-dark:bg-surface-cyan-strong",
    chip: "bg-cyan-100 surface-dark:bg-surface-cyan-soft text-cyan-800 surface-dark:text-cyan-300",
  },
]

export const sampleNotes: NoteRecord[] = []
