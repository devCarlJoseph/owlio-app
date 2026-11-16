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
  "Sample notes are for layout preview only. Your notes are kept in this browser and are never sent to a server."

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

export const sampleNotes: NoteRecord[] = [
  {
    id: "sample-wave-checklist",
    title: "Wave equation checklist",
    body: "",
    labels: ["exam", "physics"],
    updatedAt: "2026-10-12T09:15:00.000Z",
    pinned: true,
    kind: "checklist",
    color: "blue",
    items: [
      { id: "sample-wave-speed", text: "Speed, wavelength, and frequency", done: true },
      { id: "sample-wave-signs", text: "Sign rules for the interference diagram", done: true },
      { id: "sample-wave-bands", text: "Node and antinode positions", done: false },
      { id: "sample-wave-practice", text: "Two past-paper questions", done: false },
    ],
    archived: false,
    trashed: false,
  },
  {
    id: "sample-bonding-recap",
    title: "Chemical bonding recap",
    body: "Ionic versus covalent, electron affinity trends, and why lattice energy drives melting point.",
    labels: ["chemistry"],
    updatedAt: "2026-10-11T16:40:00.000Z",
    pinned: false,
    kind: "text",
    color: "green",
    items: [],
    archived: false,
    trashed: false,
  },
  {
    id: "sample-lab-template",
    title: "Lab report template",
    body: "Aim, method, results, discussion. Keep the safety section short but present.",
    labels: ["chemistry", "lab"],
    updatedAt: "2026-10-10T11:05:00.000Z",
    pinned: false,
    kind: "text",
    color: "yellow",
    items: [],
    archived: false,
    trashed: false,
  },
  {
    id: "sample-calculus-plan",
    title: "Calculus study plan",
    body: "Two practice sets before Friday, then one past paper under timed conditions.",
    labels: ["math", "task"],
    updatedAt: "2026-10-09T19:30:00.000Z",
    pinned: false,
    kind: "text",
    color: "purple",
    items: [],
    archived: false,
    trashed: false,
  },
  {
    id: "sample-essay-outline",
    title: "Essay intro outline",
    body: "Thesis, two supporting points, counter-argument paragraph. Draft the counter-argument first.",
    labels: ["english", "task"],
    updatedAt: "2026-10-08T08:20:00.000Z",
    pinned: false,
    kind: "checklist",
    color: "orange",
    items: [
      { id: "sample-essay-thesis", text: "Write the thesis in one sentence", done: true },
      { id: "sample-essay-points", text: "Pick two supporting points", done: false },
      { id: "sample-essay-counter", text: "Draft the counter-argument paragraph", done: false },
    ],
    archived: false,
    trashed: false,
  },
  {
    id: "sample-vocabulary-set",
    title: "Unit 3 vocabulary",
    body: "Collect words I keep missing, with one example sentence each.",
    labels: [],
    updatedAt: "2026-10-07T13:15:00.000Z",
    pinned: false,
    kind: "text",
    color: "teal",
    items: [],
    archived: false,
    trashed: false,
  },
]
