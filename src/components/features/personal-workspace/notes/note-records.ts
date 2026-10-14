export type NoteRecord = {
  id: string
  title: string
  body: string
  tags: string[]
  updatedAt: string
  pinned: boolean
}

export type NoteDraft = {
  title: string
  body: string
  tags: string[]
}

export type NoteTagGroup = {
  tag: string
  notes: NoteRecord[]
}

export const notesStorageKey = "owlio.student-notes.v1"

export const notesGuidance =
  "Notes are personal study records. They stay in your workspace and are never treated as classroom materials."

export const notesStorageNotice =
  "Sample notes are for layout preview only. Your notes are kept in this browser and are never sent to a server."

export const notesTagHint =
  "Hashtags become groups. They are stored separately from your note text, so they never appear inside the note."

export const notesTagPlaceholder = "#physics #exam"

export const sampleNotes: NoteRecord[] = [
  {
    id: "sample-wave-checklist",
    title: "Wave equation checklist",
    body: "Speed, wavelength, frequency. Re-check the sign rules for the interference diagram before the exam.",
    tags: ["exam", "physics"],
    updatedAt: "2026-10-12T09:15:00.000Z",
    pinned: true,
  },
  {
    id: "sample-bonding-recap",
    title: "Chemical bonding recap",
    body: "Ionic versus covalent, electron affinity trends, and why lattice energy drives melting point.",
    tags: ["chemistry"],
    updatedAt: "2026-10-11T16:40:00.000Z",
    pinned: false,
  },
  {
    id: "sample-lab-template",
    title: "Lab report template",
    body: "Aim, method, results, discussion. Keep the safety section short but present.",
    tags: ["chemistry", "lab"],
    updatedAt: "2026-10-10T11:05:00.000Z",
    pinned: false,
  },
  {
    id: "sample-calculus-plan",
    title: "Calculus study plan",
    body: "Two practice sets before Friday, then one past paper under timed conditions.",
    tags: ["math", "task"],
    updatedAt: "2026-10-09T19:30:00.000Z",
    pinned: false,
  },
  {
    id: "sample-essay-outline",
    title: "Essay intro outline",
    body: "Thesis, two supporting points, counter-argument paragraph. Draft the counter-argument first.",
    tags: ["english", "task"],
    updatedAt: "2026-10-08T08:20:00.000Z",
    pinned: false,
  },
  {
    id: "sample-vocabulary-set",
    title: "Unit 3 vocabulary",
    body: "Collect words I keep missing, with one example sentence each.",
    tags: [],
    updatedAt: "2026-10-07T13:15:00.000Z",
    pinned: false,
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

export function createNoteId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, " ").trim())
    .join("\n")
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

  return {
    ...note,
    body: stripInlineTags(note.body),
    tags,
  }
}

export function getNoteTags(note: NoteRecord): string[] {
  return note.tags
}

export function groupNotesByTag(notes: NoteRecord[]): NoteTagGroup[] {
  const groups = new Map<string, NoteRecord[]>()

  for (const note of notes) {
    for (const tag of getNoteTags(note)) {
      const existing = groups.get(tag)
      if (existing) existing.push(note)
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