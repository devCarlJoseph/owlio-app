import { createStudySpaceId, type StudySpaceRecord } from "../study-spaces-records"

export type RoomTaskAssignee = "everyone" | "me" | string

export type RoomTask = {
  id: string
  title: string
  notes: string
  due: string | null
  assignee: RoomTaskAssignee
  done: boolean
  sample?: boolean
}

export const roomTasksNotice =
  "Group tasks are saved in this browser only. They are not sent to other students and are not classwork."

export const roomTasksStoragePrefix = "owlio.study-space-tasks.v1."

const sampleTasks: RoomTask[] = [
  {
    id: "sample-task-everyone",
    title: "Skim this week's reading",
    notes: "Sample task from the space leader.",
    due: null,
    assignee: "everyone",
    done: false,
    sample: true,
  },
  {
    id: "sample-task-me",
    title: "Bring one question to the group",
    notes: "Sample task from the space leader.",
    due: null,
    assignee: "me",
    done: false,
    sample: true,
  },
]

function isRoomTask(value: unknown): value is RoomTask {
  if (typeof value !== "object" || value === null) return false
  const task = value as Record<string, unknown>
  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.notes === "string" &&
    (task.due === null || typeof task.due === "string") &&
    typeof task.assignee === "string" &&
    typeof task.done === "boolean"
  )
}

export function loadRoomTasks(space: StudySpaceRecord): RoomTask[] {
  const fallback = space.role === "member" ? sampleTasks : []
  if (typeof window === "undefined") return fallback

  try {
    const stored = window.localStorage.getItem(`${roomTasksStoragePrefix}${space.id}`)
    if (!stored) return fallback
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter(isRoomTask) : fallback
  } catch {
    return fallback
  }
}

export function saveRoomTasks(spaceId: string, tasks: RoomTask[]): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(`${roomTasksStoragePrefix}${spaceId}`, JSON.stringify(tasks))
  } catch {
    return
  }
}

// The leader (space owner) manages tasks; every group mate can tick the tasks that are theirs.
export function canManageTasks(space: StudySpaceRecord): boolean {
  return space.role === "owner"
}

export function canTickTask(task: RoomTask): boolean {
  return task.assignee === "everyone" || task.assignee === "me"
}

export type RoomTaskDraft = Pick<RoomTask, "title" | "notes" | "due" | "assignee">

export function createRoomTask(draft: RoomTaskDraft): RoomTask {
  return {
    id: createStudySpaceId(),
    title: draft.title.trim(),
    notes: draft.notes.trim(),
    due: draft.due && draft.due.length > 0 ? draft.due : null,
    assignee: draft.assignee,
    done: false,
  }
}

export function toggleRoomTask(tasks: RoomTask[], taskId: string): RoomTask[] {
  return tasks.map((task) => (task.id === taskId && canTickTask(task) ? { ...task, done: !task.done } : task))
}

export function moveRoomTask(tasks: RoomTask[], taskId: string, direction: -1 | 1): RoomTask[] {
  const index = tasks.findIndex((task) => task.id === taskId)
  const target = index + direction
  if (index === -1 || target < 0 || target >= tasks.length) return tasks
  const next = [...tasks]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
