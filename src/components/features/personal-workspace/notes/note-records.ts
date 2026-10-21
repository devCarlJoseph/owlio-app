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
  tags: string[]
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
  tags: string[]
  kind: NoteKind
  color: NoteColor
  items: NoteChecklistItem[]
}

export type NoteTagGroup = {
  tag: string
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

export const notesTagHint =
  "Hashtags become groups. They are stored separately from your note text, so they never appear inside the note."

export const notesTagPlaceholder = "#physics #exam"

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
    card: "bg-white",
    swatch: "bg-white ring-1 ring-slate-300",
    chip: "bg-slate-100 text-slate-600",
  },
  {
    value: "blue",
    label: "Blue",
    card: "bg-blue-50",
    swatch: "bg-blue-200",
    chip: "bg-blue-100 text-blue-800",
  },
  {
    value: "green",
    label: "Green",
    card: "bg-emerald-50",
    swatch: "bg-emerald-200",
    chip: "bg-emerald-100 text-emerald-800",
  },
  {
    value: "yellow",
    label: "Yellow",
    card: "bg-amber-50",
    swatch: "bg-amber-200",
    chip: "bg-amber-100 text-amber-800",
  },
  {
    value: "orange",
    label: "Orange",
    card: "bg-orange-50",
    swatch: "bg-orange-200",
    chip: "bg-orange-100 text-orange-800",
  },
  {
    value: "red",
    label: "Red",
    card: "bg-rose-50",
    swatch: "bg-rose-200",
    chip: "bg-rose-100 text-rose-800",
  },
  {
    value: "purple",
    label: "Purple",
    card: "bg-violet-50",
    swatch: "bg-violet-200",
    chip: "bg-violet-100 text-violet-800",
  },
  {
    value: "teal",
    label: "Teal",
    card: "bg-cyan-50",
    swatch: "bg-cyan-200",
    chip: "bg-cyan-100 text-cyan-800",
  },
]

export const sampleNotes: NoteRecord[] = [
  {
    id: "sample-wave-checklist",
    title: "Wave equation checklist",
    body: "",
    tags: ["exam", "physics"],
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
    tags: ["chemistry"],
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
    tags: ["chemistry", "lab"],
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
    tags: ["math", "task"],
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
    tags: ["english", "task"],
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
    tags: [],
    updatedAt: "2026-10-07T13:15:00.000Z",
    pinned: false,
    kind: "text",
    color: "teal",
    items: [],
    archived: false,
    trashed: false,
  },
]

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

const inlineTagPattern = /#[\p{L}\p{N}][\p{L}\p{N}_-]*/gu

export function extractInlineTags(text: string): string[] {
  const tags = new Set<string>()

  for (const match of text.matchAll(inlineTagPattern)) {
    tags.add(match[0].slice(1).toLowerCase())
  }

  return [...tags].sort()
}

export function stripInlineTags(text: string): string {
  return text
    .replace(inlineTagPattern, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function normalizeTags(rawTags: string): string[] {
  const tags = new Set<string>()

  for (const rawTag of rawTags.split(/[,\s]+/)) {
    const cleaned = rawTag.replace(/^#+/, "").replace(/[^\p{L}\p{N}_-]/gu, "").toLowerCase()
    if (cleaned.length > 0) tags.add(cleaned)
  }

  return [...tags].sort()
}

export function normalizeNote(note: NoteRecord): NoteRecord {
  const storedTags = Array.isArray(note.tags) ? note.tags : []
  const inlineTags = extractInlineTags(`${note.title}\n${note.body}`)
  const tags = [...new Set([...storedTags.map((tag) => tag.toLowerCase()), ...inlineTags])].sort()
  const kind: NoteKind = note.kind === "checklist" ? "checklist" : "text"
  const items = Array.isArray(note.items)
    ? note.items.filter(isChecklistItem).map((item) => ({ ...item, text: item.text.trim() }))
    : []

  return {
    ...note,
    body: stripInlineTags(note.body),
    tags,
    kind,
    color: isNoteColor(note.color) ? note.color : "default",
    items,
    archived: note.archived === true,
    trashed: note.trashed === true,
  }
}

export function getNoteTags(note: NoteRecord): string[] {
  return note.tags
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
    note.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
    note.items.some((item) => item.text.toLowerCase().includes(normalizedQuery))
  )
}

export function groupNotesByTag(notes: NoteRecord[]): NoteTagGroup[] {
  const groups = new Map<string, NoteRecord[]>()

  for (const note of notes) {
    for (const tag of getNoteTags(note)) {
      const grouped = groups.get(tag)

      if (grouped) grouped.push(note)
      else groups.set(tag, [note])
    }
  }

  return [...groups.entries()]
    .map(([tag, groupedNotes]) => ({ tag, notes: groupedNotes }))
    .sort((first, second) => second.notes.length - first.notes.length || first.tag.localeCompare(second.tag))
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
