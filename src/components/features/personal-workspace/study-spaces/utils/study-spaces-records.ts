import { isLegacyDemoRecord, preserveLegacyDemoRecords } from '@/lib/local-demo-records'
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
  joinCode?: string
  accountSpace?: true
  discoverySpace?: true
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

export const studyHallCharacterStorageKey = "owlio.study-hall-character.v1"

export const studySpacesGuidance =
  "A study space is for peer collaboration, not an official classroom. It never carries official grades, attendance, or educator feedback."

export const studySpacesStorageNotice =
  "No demo spaces are included. Spaces created here stay in this browser until the API is connected."

export const studySpacesJoinHint =
  "Joining by code or invitation is not connected yet. The code you enter is not verified by a service, and the space stays in this browser."

export const studySpacesOpenHint =
  "Select a space to open its local room preview. The room is not connected to a service, so no other students can see or join it."

export const studySpaceRoomPreviewNotice =
  "Local preview — only you are in this room. Other students cannot see your character or messages."

export const studySpaceChatLocalNotice =
  "Messages stay on this device for this visit and are not sent to other students."

export const sampleCreatedSpaces: StudySpaceRecord[] = []

export const sampleJoinedSpaces: StudySpaceRecord[] = []

export const studySpaceJoinedDiscoveryStorageKey = "owlio.study-space-joined-discovery.v1"

export const studySpacesDiscoveryCaption =
  "Student-created shared spaces are listed here. Each space requires the owner’s access code to join."

export const studySpacesLockedTooltip = "Locked — an access code is required to join"

// Sample preview spaces for the locked wing. They are not saved spaces until joined locally,
// and they carry no members, owners, or activity.
export const sampleDiscoverySpaces: StudySpaceRecord[] = []

export function loadJoinedDiscoveryIds(): string[] {
  if (typeof window === "undefined") return []

  try {
    const stored = window.localStorage.getItem(studySpaceJoinedDiscoveryStorageKey)
    if (!stored) return []

    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []
  } catch {
    return []
  }
}

export function saveJoinedDiscoveryIds(ids: string[]): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(studySpaceJoinedDiscoveryStorageKey, JSON.stringify(ids))
  } catch {
    return
  }
}

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

    return parsed.filter(isStudySpaceRecord).filter(record => !isLegacyDemoRecord(record)).map(normalizeStudySpace)
  } catch {
    return [...sampleCreatedSpaces, ...sampleJoinedSpaces]
  }
}

export function saveStudySpaces(spaces: StudySpaceRecord[]): void {
  if (typeof window === "undefined") return

  try {
    preserveLegacyDemoRecords(studySpacesStorageKey)
    window.localStorage.setItem(studySpacesStorageKey, JSON.stringify(spaces))
  } catch {
    return
  }
}

function layoutKey(userId: string, spaceId: string) {
  return `owlio.account-study-space-layout.v1.${userId}.${spaceId}`
}

export function loadAccountRoomLayout(userId: string, space: StudySpaceRecord): StudySpaceRecord {
  try {
    const saved = JSON.parse(localStorage.getItem(layoutKey(userId, space.id)) ?? "null")
    if (saved) return normalizeStudySpace({ ...space, kind: saved.kind, capacity: saved.capacity })
  } catch {
    // The room can still open with its default layout.
  }
  return space
}

export function saveAccountRoomLayout(userId: string, spaceId: string, layout: Pick<StudySpaceRecord, "kind" | "capacity">): boolean {
  try {
    localStorage.setItem(layoutKey(userId, spaceId), JSON.stringify({ kind: layout.kind, capacity: layout.capacity }))
    return true
  } catch {
    return false
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

function loadCharacter(key: string): StudySpaceCharacter | null {
  if (typeof window === "undefined") return null

  try {
    const stored = window.localStorage.getItem(key)
    if (!stored) return null

    const parsed: unknown = JSON.parse(stored)
    return isStudySpaceCharacter(parsed) ? parsed : null
  } catch {
    return null
  }
}

function saveCharacter(key: string, character: StudySpaceCharacter): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(key, JSON.stringify(character))
  } catch {
    return
  }
}

export function loadSpaceCharacter(spaceId: string): StudySpaceCharacter | null {
  return loadCharacter(`${studySpaceCharacterStoragePrefix}${spaceId}`)
}

export function saveSpaceCharacter(spaceId: string, character: StudySpaceCharacter): void {
  saveCharacter(`${studySpaceCharacterStoragePrefix}${spaceId}`, character)
}

// One browser-local character for walking the study hall; rooms default to it until customized.
export function loadHallCharacter(): StudySpaceCharacter | null {
  return loadCharacter(studyHallCharacterStorageKey)
}

export function saveHallCharacter(character: StudySpaceCharacter): void {
  saveCharacter(studyHallCharacterStorageKey, character)
}
