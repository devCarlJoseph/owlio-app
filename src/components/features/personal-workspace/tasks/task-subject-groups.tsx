import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatTaskDueDate, getTaskStatus, type TaskRecord } from "./task-records"

type TaskSubjectGroup = {
  subject: string
  tasks: TaskRecord[]
}

function groupTasksBySubject(tasks: TaskRecord[]): TaskSubjectGroup[] {
  const groups = new Map<string, TaskRecord[]>()

  for (const task of tasks) {
    const subject = task.subject.trim().length > 0 ? task.subject.trim() : "No subject"
    const existing = groups.get(subject)
    if (existing) existing.push(task)
    else groups.set(subject, [task])
  }

  return [...groups.entries()]
    .map(([subject, groupedTasks]) => ({ subject, tasks: groupedTasks }))
    .sort((first, second) => {
      if (first.subject === "No subject") return 1
      if (second.subject === "No subject") return -1
      return first.subject.localeCompare(second.subject)
    })
}

type TaskSubjectGroupsProps = {
  tasks: TaskRecord[]
  onOpen: (task: TaskRecord) => void
}

export function TaskSubjectGroups({ tasks, onOpen }: TaskSubjectGroupsProps) {
  const groups = groupTasksBySubject(tasks)

  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>
              <h3 className="text-base font-semibold text-slate-900">By subject</h3>
            </CardTitle>
            <CardDescription className="mt-1 text-slate-500">
              Your tasks grouped by the subject you chose when creating them.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="gap-4">
        {groups.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-sm leading-6 text-slate-600">
            No tasks yet. Create a task with a subject and it will appear in that subject group here.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.subject} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-900">{group.subject}</h4>
                <span className="text-xs text-slate-500">
                  {group.tasks.length} {group.tasks.length === 1 ? "task" : "tasks"}
                </span>
              </div>
              <ul className="space-y-2">
                {group.tasks.map((task) => {
                  const status = getTaskStatus(task.status)

                  return (
                    <li key={task.id}>
                      <button
                        type="button"
                        onClick={() => onOpen(task)}
                        className="flex w-full items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-left outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate text-sm font-medium ${
                              task.status === "done" ? "text-slate-500 line-through" : "text-slate-900"
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-500">{formatTaskDueDate(task)}</span>
                        </span>
                        <span
                          className={`shrink-0 rounded-4xl border px-2 py-0.5 text-xs font-medium ${status.badge}`}
                        >
                          {status.label}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}