import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  taskPriorityOptions,
  taskStatusOptions,
  type TaskDraft,
  type TaskPriority,
  type TaskRecord,
  type TaskStatus,
} from "./task-records"
import { activeSubjectNames } from "../subjects/sample-subjects"

type TaskComposerDialogProps = {
  open: boolean
  task: TaskRecord | null
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: TaskDraft) => void
}

export function TaskComposerDialog({ open, task, onOpenChange, onSubmit }: TaskComposerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <TaskComposerForm
          key={task?.id ?? "new-task"}
          task={task}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

type TaskComposerFormProps = {
  task: TaskRecord | null
  onCancel: () => void
  onSubmit: (draft: TaskDraft) => void
}

function TaskComposerForm({ task, onCancel, onSubmit }: TaskComposerFormProps) {
  const [draft, setDraft] = useState<TaskDraft>({
    title: task?.title ?? "",
    subject: task?.subject ?? "",
    dueDate: task?.dueDate ?? "",
    priority: task?.priority ?? "medium",
    status: task?.status ?? "todo",
    notes: task?.notes ?? "",
  })
  const [titleError, setTitleError] = useState<string | null>(null)

  function handleSubmit() {
    const nextTitleError =
      draft.title.trim().length < 3 ? "Add a short title of at least 3 characters." : null

    setTitleError(nextTitleError)
    if (nextTitleError) return

    onSubmit({
      title: draft.title.trim(),
      subject: draft.subject.trim(),
      dueDate: draft.dueDate,
      priority: draft.priority,
      status: draft.status,
      notes: draft.notes.trim(),
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-slate-900">
          {task ? "Edit task" : "New task"}
        </DialogTitle>
        <DialogDescription className="text-slate-600">
          {task
            ? "Update your personal task. Educator-assigned work stays in the classroom."
            : "Plan personal study work. Educator-assigned work stays in the classroom."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field data-invalid={titleError !== null}>
          <FieldLabel htmlFor="task-title" className="text-slate-700">
            Title
          </FieldLabel>
          <Input
            id="task-title"
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            aria-invalid={titleError !== null}
            aria-describedby={titleError ? "task-title-error" : undefined}
            placeholder="Finish wave problem set"
            className="border-slate-200 bg-slate-50"
          />
          <FieldError id="task-title-error">{titleError}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="task-subject" className="text-slate-700">
            Subject
          </FieldLabel>
          <Input
            id="task-subject"
            list="student-subjects"
            value={draft.subject}
            onChange={(event) => setDraft((current) => ({ ...current, subject: event.target.value }))}
            placeholder="Choose one of your subjects"
            aria-describedby="task-subject-hint"
            className="border-slate-200 bg-slate-50"
          />
          <datalist id="student-subjects">
            {activeSubjectNames.map((subject) => (
              <option key={subject} value={subject} />
            ))}
          </datalist>
          <FieldDescription id="task-subject-hint" className="text-slate-500">
            Pick a subject you are tracking, or type another one.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="task-due-date" className="text-slate-700">
            Due date
          </FieldLabel>
          <Input
            id="task-due-date"
            type="date"
            value={draft.dueDate}
            onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
            className="border-slate-200 bg-slate-50"
          />
        </Field>

        <Field>
          <FieldLabel className="text-slate-700">Priority</FieldLabel>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Task priority">
            {taskPriorityOptions.map((option) => {
              const isActive = draft.priority === option.value

              return (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant="outline"
                  aria-pressed={isActive}
                  onClick={() => setDraft((current) => ({ ...current, priority: option.value as TaskPriority }))}
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
        </Field>

        <Field>
          <FieldLabel className="text-slate-700">Status</FieldLabel>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Task status">
            {taskStatusOptions.map((option) => {
              const isActive = draft.status === option.value

              return (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant="outline"
                  aria-pressed={isActive}
                  onClick={() => setDraft((current) => ({ ...current, status: option.value as TaskStatus }))}
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
        </Field>

        <Field>
          <FieldLabel htmlFor="task-notes" className="text-slate-700">
            Personal notes
          </FieldLabel>
          <Textarea
            id="task-notes"
            rows={4}
            value={draft.notes}
            onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
            placeholder="Questions 4 to 9 first, then review the diagram."
            className="border-slate-200 bg-slate-50"
          />
          <FieldDescription className="text-slate-500">
            Only you can see these notes. They are not shared with educators.
          </FieldDescription>
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" className="bg-blue-700 text-white hover:bg-blue-800" onClick={handleSubmit}>
          Save task
        </Button>
      </DialogFooter>
    </>
  )
}