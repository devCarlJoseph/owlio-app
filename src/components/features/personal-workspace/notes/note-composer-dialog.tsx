import { useState } from "react"
import { Hash } from "lucide-react"
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
  normalizeTags,
  notesTagHint,
  notesTagPlaceholder,
  stripInlineTags,
} from "./note-records"
import type { NoteDraft, NoteRecord } from "./note-records"

type NoteComposerDialogProps = {
  open: boolean
  note: NoteRecord | null
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: NoteDraft) => void
}

export function NoteComposerDialog({ open, note, onOpenChange, onSubmit }: NoteComposerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <NoteComposerForm
          key={note?.id ?? "new-note"}
          note={note}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}

type NoteComposerFormProps = {
  note: NoteRecord | null
  onCancel: () => void
  onSubmit: (draft: NoteDraft) => void
}

function NoteComposerForm({ note, onCancel, onSubmit }: NoteComposerFormProps) {
  const [draft, setDraft] = useState<NoteDraft>({
    title: note?.title ?? "",
    body: note?.body ?? "",
    tags: note?.tags ?? [],
  })
  const [tagInput, setTagInput] = useState(() => (note?.tags ?? []).map((tag) => `#${tag}`).join(" "))
  const [titleError, setTitleError] = useState<string | null>(null)
  const [bodyError, setBodyError] = useState<string | null>(null)

  const tags = normalizeTags(tagInput)

  function handleSubmit() {
    const nextTitleError =
      draft.title.trim().length < 3 ? "Add a short title of at least 3 characters." : null
    const nextBodyError = draft.body.trim().length === 0 ? "Write the note content before saving." : null

    setTitleError(nextTitleError)
    setBodyError(nextBodyError)

    if (nextTitleError || nextBodyError) return

    onSubmit({ title: draft.title.trim(), body: stripInlineTags(draft.body), tags })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-slate-900">
          {note ? "Edit note" : "New note"}
        </DialogTitle>
        <DialogDescription className="text-slate-600">
          {note
            ? "Update your note. Edit the hashtags to move it between groups."
            : "Write your note, then add hashtags to group it."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field data-invalid={titleError !== null}>
          <FieldLabel htmlFor="note-title" className="text-slate-700">
            Title
          </FieldLabel>
          <Input
            id="note-title"
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            aria-invalid={titleError !== null}
            aria-describedby={titleError ? "note-title-error" : undefined}
            placeholder="Chapter 4 key ideas"
            className="border-slate-200 bg-slate-50"
          />
          <FieldError id="note-title-error">{titleError}</FieldError>
        </Field>

        <Field data-invalid={bodyError !== null}>
          <FieldLabel htmlFor="note-body" className="text-slate-700">
            Note
          </FieldLabel>
          <Textarea
            id="note-body"
            rows={6}
            value={draft.body}
            onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
            aria-invalid={bodyError !== null}
            aria-describedby={bodyError ? "note-body-error" : undefined}
            placeholder="Write your note here."
            className="border-slate-200 bg-slate-50"
          />
          <FieldError id="note-body-error">{bodyError}</FieldError>
        </Field>

        <Field>
          <FieldLabel htmlFor="note-tags" className="text-slate-700">
            Hashtags
          </FieldLabel>
          <Input
            id="note-tags"
            value={tagInput}
            onChange={(event) => setTagInput(event.target.value)}
            placeholder={notesTagPlaceholder}
            aria-describedby="note-tags-hint"
            className="border-slate-200 bg-slate-50"
          />
          <FieldDescription id="note-tags-hint" className="text-slate-500">
            {notesTagHint}
          </FieldDescription>
        </Field>

        <div>
          <p className="text-xs font-medium text-slate-500">Groups this note will join</p>
          {tags.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-4xl bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                >
                  <Hash className="size-3" aria-hidden="true" />
                  {tag}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs leading-5 text-slate-500">
              No hashtags yet, so this note will only appear in your note list.
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          className="bg-blue-700 text-white hover:bg-blue-800"
          onClick={handleSubmit}
        >
          Save note
        </Button>
      </DialogFooter>
    </>
  )
}