import { formatDistanceToNow } from "date-fns"
import { studySpaceKinds, type StudySpaceRecord } from "./study-spaces-records"

export function kindLabel(kind: StudySpaceRecord["kind"]): string {
  return studySpaceKinds.find((entry) => entry.value === kind)?.label ?? "Study space"
}

function relativeTime(iso: string): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return formatDistanceToNow(date, { addSuffix: true })
}

export function metaLine(space: StudySpaceRecord): string {
  const visited = space.lastVisitedAt ? relativeTime(space.lastVisitedAt) : null
  if (visited) return `Last opened ${visited}`
  const created = relativeTime(space.createdAt)
  return created ? `Added ${created}` : "Saved in this browser"
}
