import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  FolderOpen,
  NotebookPen,
  Palette,
  Plus,
  Trash,
} from "lucide-react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { NoteEditorDialog } from "@/components/features/personal-workspace/notes/forms/note-editor-dialog"
import {
  createNoteId,
  loadNotes,
  saveNotes,
} from "@/components/features/personal-workspace/notes/utils/note-records"
import type { NoteRecord } from "@/components/features/personal-workspace/notes/contents/note-records"
import { TaskComposerDialog } from "@/components/features/personal-workspace/tasks/task-composer-dialog"
import {
  createTaskId,
  loadTasks,
  saveTasks,
  type TaskDraft,
  type TaskRecord,
} from "@/components/features/personal-workspace/tasks/task-records"
import { SubjectActionButton } from "./subject-action-button"
import { SubjectCongratsDialog } from "./subject-congrats-dialog"
import { SubjectComposerDialog } from "./subject-composer-dialog"
import { SubjectDeleteDialog } from "./subject-delete-dialog"
import { SubjectMilestoneDeleteDialog } from "./subject-milestone-delete-dialog"
import { SubjectMilestoneDialog } from "./subject-milestone-dialog"
import { SubjectMilestonesCard } from "./subject-milestones-card"
import { SubjectStudyContent } from "./subject-study-content"
import { getSubjectAppearance } from "./subject-appearance"
import {
  createMilestoneId,
  findSubjectById,
  getSubjectCoverColor,
  getSubjectMilestoneState,
  getSubjectTag,
  getSubjectTheme,
  loadSubjects,
  notesForSubject,
  saveSubjects,
  subjectsGuidance,
  subjectsStorageNotice,
  tasksForSubject,
  type SubjectDraft,
  type SubjectMilestone,
  type SubjectRecord,
} from "./subject-records"

const createdAtFormatter = new Intl.DateTimeFormat(undefined, {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

function formatSubjectDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Recently"

  return createdAtFormatter.format(parsed)
}

type MilestoneSnapshot = {
  milestones: SubjectMilestone[]
  progressStarted: boolean
}

type RemovalSnapshot = {
  milestones: SubjectMilestone[]
  progressStarted: boolean
  label: string
}

function activateNextMilestone(milestones: SubjectMilestone[]): SubjectMilestone[] {
  const nextIndex = milestones.findIndex((item) => item.status === "not-started")
  if (nextIndex === -1) return milestones

  return milestones.map((item, index) =>
    index === nextIndex ? { ...item, status: "in-progress" } : item
  )
}

export function SubjectDetailView() {
  const { subjectId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)
  const [subjects, setSubjects] = useState<SubjectRecord[]>(() => loadSubjects())
  const [notes, setNotes] = useState(() => loadNotes())
  const [tasks, setTasks] = useState(() => loadTasks())
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [draftNote, setDraftNote] = useState<NoteRecord | null>(null)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<SubjectMilestone | null>(null)
  const [removeMilestoneTarget, setRemoveMilestoneTarget] = useState<SubjectMilestone | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SubjectRecord | null>(null)
  const [congratsOpen, setCongratsOpen] = useState(false)
  const [milestoneHistory, setMilestoneHistory] = useState<MilestoneSnapshot[]>([])
  const [removalSnapshot, setRemovalSnapshot] = useState<RemovalSnapshot | null>(null)

  useEffect(() => {
    saveSubjects(subjects)
  }, [subjects])

  useEffect(() => {
    saveNotes(notes)
  }, [notes])

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const subject = useMemo(() => findSubjectById(subjects, subjectId), [subjects, subjectId])
  const reading = subject?.milestones.some((item) => item.id === searchParams.get("topic")) ?? false

  useEffect(() => {
    if (!reading) pageRef.current?.scrollIntoView?.({ block: "start" })
  }, [reading, subjectId])

  const subjectNotes = useMemo(
    () => (subject ? notesForSubject(notes, subject) : []),
    [notes, subject]
  )

  const subjectTasks = useMemo(
    () => (subject ? tasksForSubject(tasks, subject) : []),
    [tasks, subject]
  )

  function updateSubject(patch: Partial<SubjectRecord>) {
    if (!subject) return

    setSubjects((current) =>
      current.map((item) =>
        item.id === subject.id
          ? { ...item, ...patch, updatedAt: new Date().toISOString() }
          : item
      )
    )
  }

  function pushMilestoneHistory() {
    if (!subject) return

    setMilestoneHistory((current) => [
      ...current,
      { milestones: subject.milestones, progressStarted: subject.progressStarted },
    ])
  }

  function handleSubmit(draft: SubjectDraft) {
    updateSubject({
      name: draft.name,
      code: draft.code,
      instructor: draft.instructor,
    })
    setCustomizeOpen(false)
  }

  function handleCoverChange(cover: { coverColor: string; coverImage: string | null }) {
    updateSubject(cover)
  }

  function handleDelete(target: SubjectRecord) {
    setSubjects((current) => current.filter((item) => item.id !== target.id))
    setDeleteTarget(null)
    navigate("/students/subjects", { replace: true })
  }

  function handleAddMilestone(title: string) {
    if (!subject) return

    updateSubject({
      milestones: [
        ...subject.milestones,
        { id: createMilestoneId(), title, status: "not-started" },
      ],
    })
    setMilestoneDialogOpen(false)
    setEditingMilestone(null)
  }

  function handleEditMilestone(title: string) {
    if (!subject || !editingMilestone) return

    updateSubject({
      milestones: subject.milestones.map((item) =>
        item.id === editingMilestone.id ? { ...item, title } : item
      ),
    })
    setMilestoneDialogOpen(false)
    setEditingMilestone(null)
  }

  function handleDeleteMilestone(milestone: SubjectMilestone) {
    if (!subject) return

    setRemovalSnapshot({
      milestones: subject.milestones,
      progressStarted: subject.progressStarted,
      label: "Undo removed milestone",
    })
    updateSubject({
      milestones: subject.milestones.filter((item) => item.id !== milestone.id),
    })
    setRemoveMilestoneTarget(null)
  }

  function handleRemoveAllMilestones() {
    if (!subject) return

    setRemovalSnapshot({
      milestones: subject.milestones,
      progressStarted: subject.progressStarted,
      label: "Undo removed milestones",
    })
    updateSubject({ milestones: [], progressStarted: false })
  }

  function handleUndoRemoval() {
    if (!subject || !removalSnapshot) return

    updateSubject({
      milestones: removalSnapshot.milestones,
      progressStarted: removalSnapshot.progressStarted,
    })
    setRemovalSnapshot(null)
  }

  function openNoteComposer() {
    if (!subject) return

    const timestamp = new Date().toISOString()
    setDraftNote({
      id: createNoteId(),
      title: "",
      body: "",
      labels: [getSubjectTag(subject)],
      kind: "text",
      color: "default",
      items: [],
      updatedAt: timestamp,
      pinned: false,
      archived: false,
      trashed: false,
    })
  }

  function handleDraftNoteChange(updated: NoteRecord) {
    setDraftNote(updated)
  }

  function handleDraftNoteCommit() {
    if (!draftNote) return

    const hasContent =
      draftNote.title.trim().length > 0 || draftNote.body.trim().length > 0

    if (hasContent) {
      setNotes((current) => [draftNote, ...current])
    }

    setDraftNote(null)
  }

  function handleAddTask(draft: TaskDraft) {
    if (!subject) return

    const task: TaskRecord = {
      id: createTaskId(),
      title: draft.title,
      subject: subject.name,
      dueDate: draft.dueDate,
      priority: draft.priority,
      status: draft.status,
      notes: draft.notes,
      createdAt: new Date().toISOString(),
    }

    setTasks((current) => [task, ...current])
    setTaskDialogOpen(false)
  }

  function handleStartProgress() {
    if (!subject) return

    pushMilestoneHistory()
    updateSubject({
      progressStarted: true,
      milestones: activateNextMilestone(subject.milestones),
    })
  }

  function handleStartNextMilestone() {
    if (!subject) return

    pushMilestoneHistory()
    updateSubject({ milestones: activateNextMilestone(subject.milestones) })
  }

  function handleCompleteMilestone(milestoneId?: string) {
    if (!subject) return

    pushMilestoneHistory()
    const milestones: SubjectMilestone[] = subject.milestones.map((item) =>
      item.id === (milestoneId ?? subject.milestones.find((milestone) => milestone.status === "in-progress")?.id)
        ? { ...item, status: "completed" }
        : item
    )
    const allDone =
      milestones.length > 0 && milestones.every((item) => item.status === "completed")

    updateSubject({ milestones, progressStarted: true })

    if (allDone) setCongratsOpen(true)
  }

  function handleUndoMilestones() {
    const previous = milestoneHistory[milestoneHistory.length - 1]
    if (!previous) return

    setMilestoneHistory((current) => current.slice(0, -1))
    updateSubject({
      milestones: previous.milestones,
      progressStarted: previous.progressStarted,
    })
  }

  if (!subject) {
    return (
      <div ref={pageRef} className="mx-auto w-full max-w-3xl space-y-4">
        <Link
          to="/students/subjects"
          className="inline-flex items-center gap-1 rounded-md text-sm font-medium text-slate-600 outline-none hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          My subjects
        </Link>

        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <h2 className="text-base font-semibold text-slate-900">Subject not found</h2>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-600">
              This subject is no longer in your workspace. It may have been deleted in another tab.
            </p>
            <Link
              to="/students/subjects"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-4 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800",
              )}
            >
              Back to my subjects
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const coverColor = getSubjectCoverColor(subject.coverColor)
  const theme = getSubjectTheme(subject)
  const appearance = getSubjectAppearance(subject)
  const progress = getSubjectMilestoneState(subject)
  const nextTopic = progress.active ?? subject.milestones.find((item) => item.status !== "completed") ?? subject.milestones[0]

  return (
    <div ref={pageRef} className="mx-auto w-full max-w-7xl space-y-6">
      {!reading ? <>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <li>
            <Link
              to="/students/subjects"
              className="inline-flex items-center gap-1 rounded-md font-medium text-slate-600 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ color: appearance.accent }}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              My Learning
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            /
          </li>
          <li aria-current="page" className="font-medium text-slate-900">
            {subject.name}
          </li>
        </ol>
      </nav>

      <section
        aria-label="Subject overview"
        className="relative overflow-hidden rounded-xl border border-border bg-muted/40 px-5 py-8 sm:px-8 lg:px-10 lg:py-10"
      >
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div className="relative z-10 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
              <span className="rounded-md bg-background px-2.5 py-1 font-medium text-brand">Personal subject</span>
              {subject.code ? <span className="rounded-md border border-slate-200/80 bg-white/80 px-2.5 py-1">{subject.code}</span> : null}
              <span className="rounded-md border border-slate-200/80 bg-white/80 px-2.5 py-1">{subject.milestones.length} study topics</span>
            </div>
            <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#1b1a21] sm:text-4xl">
              {subject.name}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Keep your notes, personal study topics, and learning progress together in one place.
            </p>
            {subject.instructor ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                <NotebookPen aria-hidden="true" className="size-4 text-slate-500" />
                Instructor reference: <span className="font-medium underline decoration-slate-300 underline-offset-2">{subject.instructor}</span>
              </p>
            ) : null}
            {progress.total > 0 ? (
              <div className="mt-5 max-w-lg">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-[#1b1a21]">{progress.active?.title ?? (progress.allDone ? "All topics complete" : "Ready for your next topic")}</span>
                  <span className="shrink-0 text-slate-500">{progress.completed} of {progress.total} complete</span>
                </div>
                <div role="progressbar" aria-label={`${subject.name} topic progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.progress} className="h-2.5 overflow-hidden rounded-full bg-white/80 shadow-inner" style={{ boxShadow: `inset 0 0 0 1px ${appearance.border}` }}>
                  <div className="h-full rounded-full transition-[width]" style={{ width: `${progress.progress}%`, backgroundColor: appearance.accent }} />
                </div>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to={nextTopic ? `?topic=${encodeURIComponent(nextTopic.id)}` : "#study-outline"}
                className={cn(buttonVariants(), "rounded-lg bg-brand px-4 text-brand-foreground hover:bg-brand/90")}
              >
                {progress.allDone ? "Review topics" : "Continue studying"} <ArrowRight aria-hidden="true" />
              </Link>
              <span className="text-xs text-slate-500">Added {formatSubjectDate(subject.createdAt)}</span>
            </div>
          </div>

          <div role="region" aria-label="Subject cover" className="relative z-10 mx-auto flex h-52 w-full max-w-lg items-center justify-center overflow-hidden rounded-xl sm:h-64">
            {subject.coverImage ? (
              <img src={subject.coverImage} alt="" aria-hidden="true" className="size-full object-cover" />
            ) : (
              <div aria-hidden="true" className={`absolute inset-0 ${coverColor.className}`} />
            )}
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-slate-950/10 to-transparent" />
          </div>
        </div>

        <div className="absolute right-3 top-3 z-20 flex gap-2">
          <SubjectActionButton
            icon={Palette}
            label="Customize"
            onClick={() => setCustomizeOpen(true)}
          />
          <SubjectActionButton
            icon={Trash}
            label="Delete"
            tone="danger"
            onClick={() => setDeleteTarget(subject)}
          />
        </div>
      </section>
      </> : null}

      <SubjectStudyContent
        subject={subject}
        onStartProgress={handleStartProgress}
        onCompleteMilestone={handleCompleteMilestone}
      />

      {!reading ? <>
      <section id="manage-milestones" aria-label="Milestone management" className="scroll-mt-6">
      <SubjectMilestonesCard
        subject={subject}
        theme={theme}
        canUndo={milestoneHistory.length > 0}
        removalLabel={removalSnapshot?.label ?? null}
        onAddMilestone={() => {
          setEditingMilestone(null)
          setMilestoneDialogOpen(true)
        }}
        onEditMilestone={(milestone) => {
          setEditingMilestone(milestone)
          setMilestoneDialogOpen(true)
        }}
        onDeleteMilestone={(milestone) => setRemoveMilestoneTarget(milestone)}
        onRemoveAllMilestones={handleRemoveAllMilestones}
        onUndoRemoval={handleUndoRemoval}
        onStartProgress={handleStartProgress}
        onCompleteMilestone={() => handleCompleteMilestone()}
        onStartNextMilestone={handleStartNextMilestone}
        onUndoMilestones={handleUndoMilestones}
      />
      </section>

      <section
        aria-label="Subject guidance"
        className="flex flex-wrap items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
      >
        <NotebookPen className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
        <p className="flex-1 text-sm leading-6 text-blue-800">{subjectsGuidance}</p>
        <p className="flex w-full items-start gap-2 border-t border-blue-100 pt-2 text-xs leading-5 text-blue-800 sm:w-auto sm:flex-1 sm:border-t-0 sm:pt-0">
          {subjectsStorageNotice}
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border border-slate-200 bg-white shadow-sm ring-0">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>
                  <h3 className="text-base font-semibold text-slate-900">Your notes</h3>
                </CardTitle>
                <CardDescription className="mt-1 text-slate-500">
                  Notes you tagged for {subject.name}.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openNoteComposer}
                  className={theme.soft}
                >
                  <Plus aria-hidden="true" />
                  Add note
                </Button>
                <Link
                  to="/students/notes"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Open notes
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="gap-2">
            {subjectNotes.length > 0 ? (
              <ul className="space-y-2">
                {subjectNotes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                  >
                    <p className="truncate text-sm font-semibold text-slate-900">{note.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">
                      {note.body}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty className="border border-dashed border-slate-300 bg-slate-50/60 p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-slate-100 text-slate-500">
                    <NotebookPen aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle className="text-sm text-slate-900">No notes yet</EmptyTitle>
                  <EmptyDescription className="text-slate-600">
                    Add a note and tag it with a matching hashtag to see it here.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Link
                    to="/students/notes"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Open notes
                  </Link>
                </EmptyContent>
              </Empty>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm ring-0">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>
                  <h3 className="text-base font-semibold text-slate-900">Your tasks</h3>
                </CardTitle>
                <CardDescription className="mt-1 text-slate-500">
                  Personal tasks assigned to {subject.name}.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTaskDialogOpen(true)}
                  className={theme.soft}
                >
                  <Plus aria-hidden="true" />
                  Add task
                </Button>
                <Link
                  to="/students/tasks"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Open tasks
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="gap-2">
            {subjectTasks.length > 0 ? (
              <ul className="space-y-2">
                {subjectTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3"
                  >
                    <p className="min-w-0 truncate text-sm font-semibold text-slate-900">
                      {task.title}
                    </p>
                    <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
                      {task.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty className="border border-dashed border-slate-300 bg-slate-50/60 p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-slate-100 text-slate-500">
                    <ClipboardList aria-hidden="true" />
                  </EmptyMedia>
                  <EmptyTitle className="text-sm text-slate-900">No tasks yet</EmptyTitle>
                  <EmptyDescription className="text-slate-600">
                    Plan personal study work for this subject on the tasks page.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Link
                    to="/students/tasks"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Open tasks
                  </Link>
                </EmptyContent>
              </Empty>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>
                <h3 className="text-base font-semibold text-slate-900">Study resources</h3>
              </CardTitle>
              <CardDescription className="mt-1 text-slate-500">
                Resources you have collected for {subject.name}.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/students/materials/personal"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), theme.soft)}
              >
                <Plus aria-hidden="true" />
                Add resources
              </Link>
              <Link
                to="/students/materials"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Open study library
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="gap-2">
          <Empty className="border border-dashed border-slate-300 bg-slate-50/60 p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-slate-100 text-slate-500">
                <FolderOpen aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-sm text-slate-900">No resources yet</EmptyTitle>
              <EmptyDescription className="text-slate-600">
                Nothing is linked to {subject.name} so far. Browse the study library to find something
                for this subject.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                to="/students/materials/personal"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Add resources
              </Link>
              <Link
                to="/students/materials"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Open study library
              </Link>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>

      </> : null}

      <SubjectComposerDialog
        open={customizeOpen}
        subject={subject}
        onOpenChange={setCustomizeOpen}
        onSubmit={handleSubmit}
        onCoverChange={handleCoverChange}
      />

      <SubjectMilestoneDialog
        open={milestoneDialogOpen}
        milestone={editingMilestone}
        onOpenChange={(open) => {
          setMilestoneDialogOpen(open)
          if (!open) setEditingMilestone(null)
        }}
        onSubmit={(title) =>
          editingMilestone ? handleEditMilestone(title) : handleAddMilestone(title)
        }
      />

      <SubjectMilestoneDeleteDialog
        open={removeMilestoneTarget !== null}
        milestone={removeMilestoneTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveMilestoneTarget(null)
        }}
        onConfirm={handleDeleteMilestone}
      />

      <SubjectCongratsDialog
        open={congratsOpen}
        subjectName={subject.name}
        onOpenChange={setCongratsOpen}
      />

      <NoteEditorDialog
        note={draftNote}
        isNew={draftNote !== null}
        onOpenChange={(open) => {
          if (!open) setDraftNote(null)
        }}
        onChange={handleDraftNoteChange}
        onCommit={handleDraftNoteCommit}
        onTogglePin={() => undefined}
        onArchive={() => undefined}
        onDelete={() => undefined}
      />

      <TaskComposerDialog
        open={taskDialogOpen}
        task={null}
        initialSubject={subject.name}
        onOpenChange={setTaskDialogOpen}
        onSubmit={handleAddTask}
      />

      <SubjectDeleteDialog
        open={deleteTarget !== null}
        subject={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
      />
    </div>
  )
}
