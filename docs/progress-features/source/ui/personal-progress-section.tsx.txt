import { useEffect, useState } from "react"
import { Link } from "react-router"
import { ArrowRight, CheckCheck, ChevronRight, Circle, CircleCheck, CircleHelp, Clock, HardDrive, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { formatTaskDueDate, getTaskStatus, loadPersonalTasks, sortTasks, tasksStorageKey, taskStatusOptions, type TaskRecord, type TaskStatus } from "@/components/features/personal-workspace/tasks/task-records"

const statusIcons = { todo: Circle, "in-progress": Clock, done: CircleCheck }

function TaskEvidence({ task }: { task: TaskRecord }) {
  const Icon = statusIcons[task.status]
  return (
    <li className="min-w-0">
      <Dialog>
        <DialogTrigger render={<Button variant="ghost" />} aria-label={`View task ${task.title}`} className="h-auto min-h-20 w-full justify-start gap-3 rounded-none px-5 py-4 text-left whitespace-normal sm:px-6">
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${task.status === "done" ? "bg-brand-soft text-brand-soft-foreground" : "bg-muted text-muted-foreground"}`}><Icon aria-hidden="true" className="size-4" /></span>
          <span className="min-w-0 flex-1"><span className="block font-medium wrap-anywhere">{task.title}</span><span className="mt-1 block text-xs font-normal text-muted-foreground wrap-anywhere">{task.subject || "No subject"} <span aria-hidden="true">·</span> {getTaskStatus(task.status).label}</span></span>
          <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        </DialogTrigger>
        <DialogContent className="max-h-[85dvh] overflow-y-auto motion-reduce:animate-none" overlayClassName="motion-reduce:animate-none">
          <DialogHeader>
            <p className="text-xs font-medium text-brand">Personal task · This browser</p>
            <DialogTitle className="pr-6 text-lg leading-7 wrap-anywhere">{task.title}</DialogTitle>
            <DialogDescription>Current saved task details. Changes to this task belong in My tasks.</DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm">
            <dt className="text-muted-foreground">Status</dt><dd>{getTaskStatus(task.status).label}</dd>
            <dt className="text-muted-foreground">Subject</dt><dd className="wrap-anywhere">{task.subject || "No subject"}</dd>
            <dt className="text-muted-foreground">Due date</dt><dd>{formatTaskDueDate(task)}</dd>
          </dl>
          {task.notes && <div><h3 className="mb-2 text-sm font-medium">Your notes</h3><p className="text-sm leading-6 whitespace-pre-wrap text-muted-foreground wrap-anywhere">{task.notes}</p></div>}
          <Button render={<Link to="/students/tasks" />} variant="outline">Manage in My tasks <ArrowRight aria-hidden="true" /></Button>
        </DialogContent>
      </Dialog>
    </li>
  )
}

export function PersonalProgressSection() {
  const [collection, setCollection] = useState(loadPersonalTasks)
  const [status, setStatus] = useState<TaskStatus | "all">("all")

  useEffect(() => {
    const refresh = () => setCollection(loadPersonalTasks())
    const onStorage = (event: StorageEvent) => {
      if (event.key === tasksStorageKey || event.key === null) refresh()
    }
    window.addEventListener("focus", refresh)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("focus", refresh)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  const tasks = collection.tasks
  const completed = tasks.filter(task => task.status === "done").length
  const visible = sortTasks(tasks.filter(task => status === "all" || task.status === status))

  return (
    <section aria-labelledby="personal-progress-title" className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="personal-progress-title" className="text-lg font-semibold">Your personal progress</h2>
        <Badge variant="outline" className="gap-1.5 rounded-full py-1 font-normal text-muted-foreground"><HardDrive aria-hidden="true" className="size-3" />This browser only</Badge>
      </div>

      {collection.error ? (
        <Alert variant="destructive" className="rounded-2xl border-destructive/30">
          <CircleHelp aria-hidden="true" />
          <AlertTitle>We couldn’t read your saved tasks</AlertTitle>
          <AlertDescription><p>Your progress is unavailable for now. Your saved data hasn’t been changed.</p><Button variant="outline" onClick={() => setCollection(loadPersonalTasks())} className="mt-3 text-foreground"><RefreshCw aria-hidden="true" />Retry loading tasks</Button></AlertDescription>
        </Alert>
      ) : tasks.length === 0 ? (
        <Card className="rounded-2xl border border-border shadow-none ring-0">
          <Empty className="min-h-80 px-5 py-12 sm:py-16">
            <EmptyHeader>
              <EmptyMedia className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand-soft-foreground"><CheckCheck aria-hidden="true" className="size-7" /></EmptyMedia>
              <h3 className="text-xl font-semibold tracking-tight">Small steps, visible progress</h3>
              <EmptyDescription>Save your first personal task to start building a picture of your learning. No class needed.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent><Button render={<Link to="/students/tasks" />} className="mt-2 min-h-11 bg-brand px-5 text-brand-foreground hover:bg-brand/90">Go to personal tasks <ArrowRight aria-hidden="true" /></Button></EmptyContent>
          </Empty>
        </Card>
      ) : (
        <>
          <Card className="gap-5 rounded-2xl border border-border shadow-none ring-0">
            <CardHeader className="gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">Personal task completion</h3>
              <p className="flex flex-wrap items-baseline gap-x-2"><span className="text-4xl font-semibold tracking-tight tabular-nums">{completed}<span className="ml-2 text-2xl font-normal text-muted-foreground">/ {tasks.length}</span></span><span className="text-sm text-muted-foreground">tasks completed</span></p>
            </CardHeader>
            <CardContent className="gap-4">
              <Progress aria-label="Personal task completion" value={completed / tasks.length * 100} className="[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-indicator]]:bg-brand [&_[data-slot=progress-indicator]]:motion-reduce:transition-none" />
              <dl className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                {taskStatusOptions.map(option => {
                  const Icon = statusIcons[option.value]
                  return <div key={option.value}><dt className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"><Icon aria-hidden="true" className="size-3.5" />{option.label}</dt><dd className="mt-1 text-lg font-semibold tabular-nums">{tasks.filter(task => task.status === option.value).length}</dd></div>
                })}
              </dl>
            </CardContent>
          </Card>

          <Card className="gap-0 rounded-2xl border border-border py-0 shadow-none ring-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
              <h3 className="font-semibold">Your saved tasks</h3>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">Show
                <select value={status} onChange={event => setStatus(event.target.value as TaskStatus | "all")} className="min-h-10 max-w-40 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="all">All statuses</option>
                  {taskStatusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
            <p role="status" className="px-5 pt-4 text-xs text-muted-foreground sm:px-6">{visible.length} of {tasks.length} personal tasks shown</p>
            {visible.length ? <ul className="divide-y divide-border py-2">{visible.map(task => <TaskEvidence key={task.id} task={task} />)}</ul> : (
              <Empty className="px-5 py-10"><h4 className="font-medium">No tasks with this status</h4><p className="text-sm text-muted-foreground">Choose another status to see your saved work.</p><Button variant="outline" onClick={() => setStatus("all")}>Show all tasks</Button></Empty>
            )}
          </Card>
        </>
      )}

      <p className="px-1 text-xs leading-5 text-muted-foreground">Based on personal tasks saved in this browser. Examples are excluded. This is a current snapshot, not a history of when you studied. Your tasks aren’t synced to an account.</p>
    </section>
  )
}
