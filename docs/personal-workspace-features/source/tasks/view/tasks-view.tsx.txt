import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { ArrowUpRight, CheckCheck, Columns3, Folder, Info, List, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TaskBoard } from "./task-board"
import { TaskComposerDialog } from "./task-composer-dialog"
import { TaskDeleteDialog } from "./task-delete-dialog"
import { TaskDetailDialog } from "./task-detail-dialog"
import { TaskList } from "./task-list"
import { TaskSubjectGroups } from "./task-subject-groups"
import { createTaskId, loadPersonalTasks, sampleTasks, saveTasks, sortTasks, taskStatusOptions, type TaskDraft, type TaskRecord, type TaskStatus } from "./task-records"

const selectClass = "h-9 min-w-0 rounded-lg border border-input bg-background px-2 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function TasksView() {
  const [collection, setCollection] = useState(loadPersonalTasks)
  const [preview, setPreview] = useState(() => collection.tasks.length === 0 && !collection.error)
  const [saveFailed, setSaveFailed] = useState(false)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [view, setView] = useState<"board" | "list" | "subject">("board")
  const [composerOpen, setComposerOpen] = useState(false)
  const [initialStatus, setInitialStatus] = useState<TaskStatus>("todo")
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TaskRecord | null>(null)
  const tasks = preview ? sampleTasks : collection.tasks
  const subjects = [...new Set(tasks.map(task => task.subject).filter(Boolean))].sort()
  const editingTask = collection.tasks.find(task => task.id === editingTaskId) ?? null
  const detailTask = tasks.find(task => task.id === detailTaskId) ?? null
  const completed = tasks.filter(task => task.status === "done").length
  const isFiltered = statusFilter !== "all" || subjectFilter !== "all" || query.trim().length > 0
  const visibleTasks = useMemo(() => {
    const search = query.trim().toLowerCase()
    return sortTasks(tasks.filter(task => (statusFilter === "all" || task.status === statusFilter) &&
      (subjectFilter === "all" || task.subject === subjectFilter) &&
      `${task.title} ${task.subject} ${task.notes}`.toLowerCase().includes(search)))
  }, [tasks, query, statusFilter, subjectFilter])

  useEffect(() => {
    if (!saveFailed) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = "" }
    const checkNavigation = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("a[href]") && !window.confirm("Your latest task changes aren’t saved. Leave this page and lose those changes?")) { event.preventDefault(); event.stopPropagation() }
    }
    window.addEventListener("beforeunload", warn)
    document.addEventListener("click", checkNavigation, true)
    return () => { window.removeEventListener("beforeunload", warn); document.removeEventListener("click", checkNavigation, true) }
  }, [saveFailed])

  function updateTasks(next: TaskRecord[]) {
    setCollection({ tasks: next, error: false })
    setSaveFailed(!saveTasks(next))
  }
  function clearFilters() { setQuery(""); setStatusFilter("all"); setSubjectFilter("all") }
  function create(status: TaskStatus = "todo") {
    setInitialStatus(status); setEditingTaskId(null); setDetailTaskId(null); setComposerOpen(true)
  }
  function submit(draft: TaskDraft) {
    const next = editingTaskId
      ? collection.tasks.map(task => task.id === editingTaskId ? { ...task, ...draft } : task)
      : [...collection.tasks, { id: createTaskId(), ...draft, createdAt: new Date().toISOString() }]
    updateTasks(next)
    setPreview(false); clearFilters(); setComposerOpen(false); setEditingTaskId(null)
  }
  function changeStatus(task: TaskRecord, status: TaskStatus) {
    if (preview || collection.error) return
    updateTasks(collection.tasks.map(item => item.id === task.id ? { ...item, status } : item))
  }
  function switchPreview() { setPreview(!preview); clearFilters(); setDetailTaskId(null) }

  return <div className="mx-auto w-full max-w-7xl rounded-2xl border border-border bg-card p-4 sm:p-6">
    <header className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">Your personal workspace</p><h2 className="mt-1.5 text-2xl font-semibold tracking-tight">My tasks</h2><p className="mt-1.5 text-sm text-muted-foreground">A little structure for whatever you’re learning next.</p></div>
        <Button id="create-personal-task" onClick={() => create()} disabled={collection.error}><Plus aria-hidden="true" /> New task</Button>
      </div>
      <nav aria-label="Task ownership" className="flex flex-wrap items-center gap-1 border-b border-border">
        <span aria-current="page" className="border-b-2 border-primary px-3 py-3 text-sm font-medium">Personal tasks</span>
        <Link to="/students/classwork" className="inline-flex items-center gap-1.5 rounded-t-lg px-3 py-3 text-sm text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">Assigned classwork <ArrowUpRight aria-hidden="true" className="size-3.5" /></Link>
      </nav>
    </header>

    <div className="my-4 flex flex-wrap items-center justify-between gap-3">
      <div role="group" aria-label="Task view" className="flex flex-wrap items-center gap-1">
        {([{ value: "board", label: "Board", icon: Columns3 }, { value: "list", label: "List", icon: List }, { value: "subject", label: "By subject", icon: Folder }] as const).map(item => <Button key={item.value} variant="ghost" size="sm" aria-pressed={view === item.value} onClick={() => setView(item.value)} className={view === item.value ? "bg-muted text-foreground" : "text-muted-foreground"}><item.icon aria-hidden="true" className="size-3.5" />{item.label}</Button>)}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><CheckCheck aria-hidden="true" className="size-3.5" /><span>{completed} of {tasks.length} {preview ? "examples" : "tasks"} completed</span><span aria-hidden="true" className="mx-1 h-3 border-l border-border" /><button type="button" onClick={switchPreview} className="rounded underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring">{preview ? "Show my tasks" : "View example board"}</button></div>
    </div>

    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-44 flex-1 sm:max-w-xs"><Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input type="search" aria-label="Search tasks" placeholder="Search tasks…" value={query} onChange={event => setQuery(event.target.value)} className="h-9 bg-background pl-9 text-xs md:text-xs" /></div>
      <select aria-label="Filter tasks by status" className={selectClass} value={statusFilter} onChange={event => setStatusFilter(event.target.value as TaskStatus | "all")}><option value="all">All statuses</option>{taskStatusOptions.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
      <select aria-label="Filter tasks by subject" className={`${selectClass} max-w-44`} value={subjectFilter} onChange={event => setSubjectFilter(event.target.value)}><option value="all">All subjects</option>{subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}</select>
      {isFiltered && <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>}
    </div>

    <div className="mb-4 flex flex-wrap items-start justify-between gap-x-5 gap-y-2 text-[11px] leading-5 text-muted-foreground">
      <p className="flex max-w-2xl items-start gap-1.5"><Info aria-hidden="true" className="mt-1 size-3 shrink-0" />{preview ? "Example board · Sample tasks for exploring the layout. Examples aren’t added to your personal tasks." : "Personal tasks stay in this browser. Clearing browser data removes them; they aren’t synced to an account or sent to educators."}</p>
      <p role="status" className={saveFailed ? "font-medium text-destructive" : ""}>{collection.error ? "Local storage unavailable" : saveFailed ? "Latest changes aren’t saved" : preview ? "Preview only" : `${visibleTasks.length} ${visibleTasks.length === 1 ? "task" : "tasks"} shown · Browser local`}</p>
    </div>
    {collection.error && <div role="alert" className="mb-4 rounded-xl border border-destructive/30 p-4 text-sm"><p>Your saved tasks couldn’t be read. Retry before editing so the saved data isn’t replaced.</p><Button className="mt-3" variant="outline" size="sm" onClick={() => { const next = loadPersonalTasks(); setCollection(next); setPreview(false) }}>Retry loading tasks</Button></div>}
    {saveFailed && <div role="alert" className="mb-4 rounded-xl border border-destructive/30 p-4 text-sm"><p>Your latest changes are still on this page. Keep it open and retry saving after checking browser storage.</p><Button className="mt-3" variant="outline" size="sm" onClick={() => setSaveFailed(!saveTasks(collection.tasks))}>Retry save</Button></div>}

    {visibleTasks.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-muted/30 px-5 py-14 text-center"><CheckCheck aria-hidden="true" className="mx-auto mb-3 size-7 text-muted-foreground" /><h3 className="text-base font-medium">{isFiltered ? "No tasks match this view" : "Make room for your next goal"}</h3><p className="mt-2 text-sm text-muted-foreground">{isFiltered ? "Try another search, status, or subject." : "Create a personal task to start planning your study work."}</p><Button className="mt-4" variant="outline" disabled={!isFiltered && collection.error} onClick={() => isFiltered ? clearFilters() : create()}>{isFiltered ? "Reset filters" : "Create a task"}</Button></div>
      : view === "board" ? <TaskBoard tasks={visibleTasks} preview={preview} onOpen={task => setDetailTaskId(task.id)} onCreate={create} onStatusChange={changeStatus} canCreate={!collection.error} />
      : view === "list" ? <TaskList tasks={visibleTasks} onOpen={task => setDetailTaskId(task.id)} />
      : <TaskSubjectGroups tasks={visibleTasks} onOpen={task => setDetailTaskId(task.id)} />}
    <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">Educator-assigned assessments and submissions live in <Link to="/students/classwork" className="rounded font-medium text-foreground underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-ring">Assigned classwork</Link>.</p>

    <TaskDetailDialog open={detailTaskId !== null} task={detailTask} preview={preview} saveFailed={saveFailed} onRetrySave={() => setSaveFailed(!saveTasks(collection.tasks))} onOpenChange={open => { if (!open) setDetailTaskId(null) }} onEdit={task => { setDetailTaskId(null); setEditingTaskId(task.id); setComposerOpen(true) }} onDelete={task => { setDetailTaskId(null); setDeleteTarget(task) }} onStatusChange={changeStatus} onCreate={!collection.error ? () => create() : undefined} />
    <TaskComposerDialog open={composerOpen} task={editingTask} initialStatus={initialStatus} onOpenChange={open => { setComposerOpen(open); if (!open) setEditingTaskId(null) }} onSubmit={submit} />
    <TaskDeleteDialog open={deleteTarget !== null} task={deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null) }} onConfirm={task => { updateTasks(collection.tasks.filter(item => item.id !== task.id)); setDeleteTarget(null) }} />
  </div>
}
