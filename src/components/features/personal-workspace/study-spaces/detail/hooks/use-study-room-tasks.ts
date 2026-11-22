import { useCallback, useEffect, useRef, useState } from "react"
import { getApiErrorMessage } from "@/services/api/api-error"
import { changeStudySpaceTask, createStudySpaceTask, listStudySpaceTasks } from "@/services/api/study-space.service"
import type { RoomTask, RoomTaskDraft } from "../utils/room-tasks"

export function useStudyRoomTasks(spaceId?: string, userId?: string) {
  const [tasks, setTasks] = useState<RoomTask[]>([])
  const [readError, setReadError] = useState("")
  const [writeError, setWriteError] = useState("")
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(Boolean(spaceId))
  const request = useRef<AbortController | null>(null)
  const active = useRef(false)
  const saving = useRef(false)
  const refresh = useCallback(async () => {
    if (!spaceId) return
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    try {
      const records = await listStudySpaceTasks(spaceId, controller.signal)
      if (controller.signal.aborted) return
      setTasks(records.sort((a, b) => a.position - b.position || a.id.localeCompare(b.id)).map((task) => ({
        ...task, due: task.dueAt, assignee: task.assigneeId === userId ? "me" : task.assigneeId ?? "everyone",
      })))
      setReadError("")
    } catch (cause) {
      if (!controller.signal.aborted) setReadError(getApiErrorMessage(cause, "Group tasks could not be loaded."))
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [spaceId, userId])

  useEffect(() => {
    if (!spaceId) return
    active.current = true
    const initial = window.setTimeout(() => { void refresh() }, 0)
    const timer = window.setInterval(() => { if (!document.hidden) void refresh() }, 12_000)
    return () => {
      active.current = false
      request.current?.abort()
      window.clearTimeout(initial)
      window.clearInterval(timer)
    }
  }, [refresh, spaceId])

  async function save(operation: () => Promise<unknown>) {
    if (!active.current || saving.current) return false
    saving.current = true
    setBusy(true)
    setWriteError("")
    try {
      await operation()
      if (active.current) void refresh()
      return true
    } catch (cause) {
      if (active.current) setWriteError(getApiErrorMessage(cause, "The task change could not be saved."))
      return false
    } finally {
      saving.current = false
      if (active.current) setBusy(false)
    }
  }

  return {
    tasks, loading, busy, error: writeError || readError, refresh,
    add(draft: RoomTaskDraft) {
      if (!spaceId) return false
      return save(() => createStudySpaceTask(spaceId, {
        title: draft.title, notes: draft.notes,
        ...(draft.due ? { dueAt: draft.due } : {}),
        ...(draft.assignee === "everyone" ? {} : { assigneeId: draft.assignee === "me" ? userId : draft.assignee }),
      }))
    },
    toggle(task: RoomTask) {
      if (spaceId) void save(() => changeStudySpaceTask(spaceId, task.id, { action: "complete", done: !task.done }))
    },
    remove(id: string) {
      if (spaceId) void save(() => changeStudySpaceTask(spaceId, id, { action: "remove" }))
    },
    move(id: string, direction: -1 | 1) {
      if (!spaceId) return
      const index = tasks.findIndex((task) => task.id === id)
      const target = index >= 0 ? tasks[index + direction] : undefined
      if (target) void save(() => changeStudySpaceTask(spaceId, id, { action: "move", beforeOrAfterId: target.id }))
    },
  }
}
