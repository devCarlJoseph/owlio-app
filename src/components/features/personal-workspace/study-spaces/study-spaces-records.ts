export type StudySpaceRole = "owner" | "member"

export type StudySpaceKind = "focused" | "collaborative" | "lounge"

export type StudySpaceRecord = {
  id: string
  name: string
  about: string
  role: StudySpaceRole
  kind: StudySpaceKind
  capacity: number
  createdAt: string
  inviteCode?: string
  // Local-only timestamp of the last time this browser opened the room.
  lastVisitedAt?: string
}

export const studySpaceKinds: { value: StudySpaceKind; label: string; description: string }[] = [
  {
    value: "focused",
    label: "Focused desks",
    description: "Individual desks facing the board for quiet, independent study.",
  },
  {
    value: "collaborative",
    label: "Shared tables",
    description: "Paired desks facing each other for group work and discussion.",
  },
  {
    value: "lounge",
    label: "Study lounge",
    description: "Round tables with casual seating for relaxed reading and review.",
  },
]

export const minSpaceCapacity = 2
export const maxSpaceCapacity = 8
export const defaultSpaceCapacity = 4

export type StudySpaceCharacter = {
  name: string
  bodyColor: string
  accentColor: string
  createdAt: string
}

export const studySpacesStorageKey = "owlio.student-study-spaces.v1"

export const studySpaceCharacterStoragePrefix = "owlio.study-space-character."

export const studySpacesGuidance =
  "A study space is for peer collaboration, not an official classroom. It never carries official grades, attendance, or educator feedback."

export const studySpacesStorageNotice =
  "Sample spaces are for layout preview only. Creating and joining a study space is not connected to a service, so new spaces are kept in this browser."

export const studySpacesJoinHint =
  "Joining by code or invitation is not connected yet. The code you enter is not verified by a service, and the space stays in this browser."

export const studySpacesOpenHint =
  "Select a space to open its local room preview. The room is not connected to a service, so no other students can see or join it."

export const studySpaceRoomPreviewNotice =
  "Local preview — only you are in this room. Other students cannot see your character or messages."

export const studySpaceChatLocalNotice =
  "Messages stay on this device for this visit and are not sent to other students."

export const sampleCreatedSpaces: StudySpaceRecord[] = [
  {
    id: "sample-space-physics",
    name: "Physics Group",
    about: "Weekly problem sets and past paper review.",
    role: "owner",
    kind: "collaborative",
    capacity: 6,
    createdAt: "2026-09-28T09:00:00.000Z",
  },
  {
    id: "sample-space-essay",
    name: "Essay Writers",
    about: "Peer review of argument outlines.",
    role: "owner",
    kind: "lounge",
    capacity: 4,
    createdAt: "2026-10-02T17:30:00.000Z",
  },
  {
    id: "sample-space-maths",
    name: "Maths Club",
    about: "Calculus drills before Friday.",
    role: "owner",
    kind: "focused",
    capacity: 6,
    createdAt: "2026-10-09T13:10:00.000Z",
  },
]

export const sampleJoinedSpaces: StudySpaceRecord[] = [
  {
    id: "sample-space-history",
    name: "History Circle",
    about: "Source analysis discussion.",
    role: "member",
    kind: "lounge",
    capacity: 8,
    createdAt: "2026-09-20T08:00:00.000Z",
  },
  {
    id: "sample-space-language",
    name: "Language Exchange",
    about: "Conversation practice twice a week.",
    role: "member",
    kind: "collaborative",
    capacity: 4,
    createdAt: "2026-10-05T19:45:00.000Z",
  },
]

function isStudySpaceKind(value: unknown): value is StudySpaceKind {
  return value === "focused" || value === "collaborative" || value === "lounge"
}

function isStudySpaceRecord(value: unknown): value is StudySpaceRecord {
  if (typeof value !== "object" || value === null) return false
  const space = value as Record<string, unknown>

  if (space.inviteCode !== undefined && typeof space.inviteCode !== "string") return false
  if (space.lastVisitedAt !== undefined && typeof space.lastVisitedAt !== "string") return false

  return (
    typeof space.id === "string" &&
    typeof space.name === "string" &&
    typeof space.about === "string" &&
    typeof space.createdAt === "string" &&
    (space.role === "owner" || space.role === "member")
  )
}

// Records saved before room type/capacity existed get sensible defaults so the room still renders.
function normalizeStudySpace(space: StudySpaceRecord): StudySpaceRecord {
  const raw = space as Partial<StudySpaceRecord>
  const capacity =
    typeof raw.capacity === "number" && Number.isFinite(raw.capacity)
      ? Math.min(Math.max(Math.round(raw.capacity), minSpaceCapacity), maxSpaceCapacity)
      : defaultSpaceCapacity

  return {
    ...space,
    kind: isStudySpaceKind(raw.kind) ? raw.kind : "collaborative",
    capacity,
  }
}

export function createStudySpaceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `space-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function loadStudySpaces(): StudySpaceRecord[] {
  if (typeof window === "undefined") return [...sampleCreatedSpaces, ...sampleJoinedSpaces]

  try {
    const stored = window.localStorage.getItem(studySpacesStorageKey)
    if (!stored) return [...sampleCreatedSpaces, ...sampleJoinedSpaces]

    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return [...sampleCreatedSpaces, ...sampleJoinedSpaces]

    return parsed.filter(isStudySpaceRecord).map(normalizeStudySpace)
  } catch {
    return [...sampleCreatedSpaces, ...sampleJoinedSpaces]
  }
}

export function saveStudySpaces(spaces: StudySpaceRecord[]): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(studySpacesStorageKey, JSON.stringify(spaces))
  } catch {
    return
  }
}

export function markStudySpaceVisited(spaceId: string): void {
  const spaces = loadStudySpaces()
  const index = spaces.findIndex((space) => space.id === spaceId)
  if (index === -1) return

  spaces[index] = { ...spaces[index], lastVisitedAt: new Date().toISOString() }
  saveStudySpaces(spaces)
}

export type SpaceSortKey = "recent" | "newest" | "name"

export function sortSpaces(spaces: StudySpaceRecord[], sort: SpaceSortKey): StudySpaceRecord[] {
  const sorted = [...spaces]
  if (sort === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sort === "newest") {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } else {
    sorted.sort((a, b) =>
      (b.lastVisitedAt ?? b.createdAt).localeCompare(a.lastVisitedAt ?? a.createdAt)
    )
  }
  return sorted
}

function isStudySpaceCharacter(value: unknown): value is StudySpaceCharacter {
  if (typeof value !== "object" || value === null) return false
  const character = value as Record<string, unknown>

  return (
    typeof character.name === "string" &&
    typeof character.bodyColor === "string" &&
    typeof character.accentColor === "string" &&
    typeof character.createdAt === "string"
  )
}

export function loadSpaceCharacter(spaceId: string): StudySpaceCharacter | null {
  if (typeof window === "undefined") return null

  try {
    const stored = window.localStorage.getItem(`${studySpaceCharacterStoragePrefix}${spaceId}`)
    if (!stored) return null

    const parsed: unknown = JSON.parse(stored)
    return isStudySpaceCharacter(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveSpaceCharacter(spaceId: string, character: StudySpaceCharacter): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(`${studySpaceCharacterStoragePrefix}${spaceId}`, JSON.stringify(character))
  } catch {
    return
  }
}
