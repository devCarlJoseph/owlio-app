import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { ArrowUpRight, ClipboardList, Info, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TaskComposerDialog } from "./task-composer-dialog"
import { TaskDeleteDialog } from "./task-delete-dialog"
import { TaskDetailDialog } from "./task-detail-dialog"
import { TaskList } from "./task-list"
import { TaskSubjectGroups } from "./task-subject-groups"
import {
  createTaskId,
  loadTasks,
  saveTasks,
  sortTasks,
  taskStatusOptions,
  tasksGuidance,
  tasksStorageNotice,
  type TaskDraft,
  type TaskRecord,
  type TaskStatus,
} from "./task-records"

export function TasksView() {
  const [tasks, setTasks] = useState<TaskRecord[]>(() => loadTasks())
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [composerOpen, setComposerOpen] = useState(false)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TaskRecord | null>(null)

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return sortTasks(
      tasks.filter((task) => {
        const matchesStatus = statusFilter === "all" || task.status === statusFilter
        const matchesQuery =
          normalizedQuery.length === 0 ||
          task.title.toLowerCase().includes(normalizedQuery) ||
          task.subject.toLowerCase().includes(normalizedQuery) ||
          task.notes.toLowerCase().includes(normalizedQuery)

        return matchesStatus && matchesQuery
      })
    )
  }, [tasks, query, statusFilter])

  const editingTask = useMemo(
    () => tasks.find((task) => task.id === editingTaskId) ?? null,
    [tasks, editingTaskId]
  )

  const detailTask = useMemo(
    () => tasks.find((task) => task.id === detailTaskId) ?? null,
    [tasks, detailTaskId]
  )

  function openCreateDialog() {
    setEditingTaskId(null)
    setComposerOpen(true)
  }

  function openEditDialog(task: TaskRecord) {
    setDetailTaskId(null)
    setEditingTaskId(task.id)
    setComposerOpen(true)
  }

  function openDetailDialog(task: TaskRecord) {
    setDetailTaskId(task.id)
  }

  function requestDelete(task: TaskRecord) {
    setDetailTaskId(null)
    setDeleteTarget(task)
  }

  function handleSubmit(draft: TaskDraft) {
    setTasks((current) => {
      if (editingTaskId) {
        return current.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title: draft.title,
                subject: draft.subject,
                dueDate: draft.dueDate,
                priority: draft.priority,
                status: draft.status,
                notes: draft.notes,
              }
            : task
        )
      }

      return [
        ...current,
        {
          id: createTaskId(),
          title: draft.title,
          subject: draft.subject,
          dueDate: draft.dueDate,
          priority: draft.priority,
          status: draft.status,
          notes: draft.notes,
          createdAt: new Date().toISOString(),
        },
      ]
    })

    setComposerOpen(false)
    setEditingTaskId(null)
  }

  function handleDelete(task: TaskRecord) {
    setTasks((current) => current.filter((item) => item.id !== task.id))
    setDeleteTarget(null)
  }

  function clearFilters() {
    setQuery("")
    setStatusFilter("all")
  }

  const isFiltered = statusFilter !== "all" || query.trim().length > 0

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          Personal workspace
        </Badge>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Personal tasks
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Plan your own learning work, study sessions, and deadlines. Classroom assignments stay with your
          educator.
        </p>
      </section>

      <section
        aria-label="Task guidance"
        className="flex flex-wrap items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
      >
        <ClipboardList className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
        <p className="flex-1 text-sm leading-6 text-blue-800">{tasksGuidance}</p>
        <p className="flex w-full items-start gap-2 border-t border-blue-100 pt-2 text-xs leading-5 text-blue-800 sm:w-auto sm:flex-1 sm:border-t-0 sm:pt-0">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {tasksStorageNotice}
        </p>
      </section>

      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardContent className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Your tasks</h3>
              <p className="mt-1 text-sm text-slate-500">
                Track study work you planned yourself, with a subject, due date, and priority.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                render={<Link to="/students/classwork" />}
                variant="outline"
                size="sm"
                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              >
                Assigned classwork
                <ArrowUpRight aria-hidden="true" />
              </Button>
              <Button
                type="button"
                size="icon"
                aria-label="Create a new task"
                onClick={openCreateDialog}
                className="rounded-full bg-blue-700 text-white hover:bg-blue-800"
              >
                <Plus aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative sm:w-64">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                aria-label="Search tasks"
                placeholder="Search tasks..."
                className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter tasks by status">
              {[...taskStatusOptions, { value: "all" as const, label: "All" }].map((option) => {
                const isActive = statusFilter === option.value

                return (
                  <Button
                    key={option.value}
                    type="button"
                    size="sm"
                    variant="outline"
                    aria-pressed={isActive}
                    onClick={() => setStatusFilter(option.value)}
                    className={
                      isActive
                        ? "border-blue-700 bg-blue-700 text-white hover:bg-blue-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }
                  >
                    {option.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <TaskList
            tasks={visibleTasks}
            isFiltered={isFiltered}
            onCreate={openCreateDialog}
            onOpen={openDetailDialog}
            onClearFilters={clearFilters}
          />

          <p className="text-xs leading-5 text-slate-500">
            Tasks are stored in this browser for preview. Nothing is sent to a server, and assigned classwork is
            not loaded here.
          </p>
        </CardContent>
      </Card>

      <TaskSubjectGroups tasks={tasks} onOpen={openDetailDialog} />

      <TaskDetailDialog
        open={detailTaskId !== null}
        task={detailTask}
        onOpenChange={(open) => {
          if (!open) setDetailTaskId(null)
        }}
        onEdit={openEditDialog}
        onDelete={requestDelete}
      />

      <TaskComposerDialog
        open={composerOpen}
        task={editingTask}
        onOpenChange={(open) => {
          setComposerOpen(open)
          if (!open) setEditingTaskId(null)
        }}
        onSubmit={handleSubmit}
      />

      <TaskDeleteDialog
        open={deleteTarget !== null}
        task={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
      />
    </div>
  )
}