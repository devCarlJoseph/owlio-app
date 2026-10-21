import { useRef, useState } from "react"
import { Hash, ListChecks, Plus, StickyNote, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  createChecklistItemId,
  noteColors,
  normalizeTags,
  notesTagHint,
  notesTagPlaceholder,
  stripInlineTags,
  type NoteChecklistItem,
  type NoteColor,
  type NoteDraft,
  type NoteKind,
  type NoteRecord,
} from "./note-records"

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
    kind: note?.kind ?? "text",
    color: note?.color ?? "default",
    items: note?.items ?? [],
  })
  const [tagInput, setTagInput] = useState(() => (note?.tags ?? []).map((tag) => `#${tag}`).join(" "))
  const [contentError, setContentError] = useState<string | null>(null)
  const itemInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const tags = normalizeTags(tagInput)

  function updateItem(itemId: string, patch: Partial<NoteChecklistItem>) {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    }))
  }

  function addItem() {
    const id = createChecklistItemId()
    setDraft((current) => ({ ...current, items: [...current.items, { id, text: "", done: false }] }))
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => itemInputRefs.current[id]?.focus())
    }
  }

  function removeItem(itemId: string) {
    setDraft((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== itemId),
    }))
  }

  function handleSubmit() {
    const cleanedItems = draft.items
      .map((item) => ({ ...item, text: item.text.trim() }))
      .filter((item) => item.text.length > 0)

    const hasContent =
      draft.kind === "checklist" ? cleanedItems.length > 0 : draft.body.trim().length > 0

    if (!hasContent) {
      setContentError(
        draft.kind === "checklist"
          ? "Add at least one checklist item before saving."
          : "Write the note content before saving."
      )
      return
    }

    setContentError(null)

    onSubmit({
      title: draft.title.trim(),
      body: draft.kind === "checklist" ? "" : stripInlineTags(draft.body),
      tags,
      kind: draft.kind,
      color: draft.color,
      items: cleanedItems,
    })
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
            : "Capture what you are learning. A title is optional, and hashtags group the note for you."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="note-title" className="text-slate-700">
            Title <span className="font-normal text-slate-400">(optional)</span>
          </FieldLabel>
          <Input
            id="note-title"
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            placeholder="Chapter 4 key ideas"
            className="border-slate-200 bg-slate-50"
          />
        </Field>

        <div>
          <p className="text-xs font-medium text-slate-500" id="note-kind-label">
            Note type
          </p>
          <div
            role="group"
            aria-labelledby="note-kind-label"
            className="mt-2 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1"
          >
            {(
              [
                { value: "text" as NoteKind, label: "Note", icon: StickyNote },
                { value: "checklist" as NoteKind, label: "Checklist", icon: ListChecks },
              ] as const
            ).map((option) => {
              const OptionIcon = option.icon
              const isActive = draft.kind === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setDraft((current) => ({ ...current, kind: option.value }))}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <OptionIcon aria-hidden="true" className="size-4" />
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {draft.kind === "text" ? (
          <Field data-invalid={contentError !== null}>
            <FieldLabel htmlFor="note-body" className="text-slate-700">
              Note
            </FieldLabel>
            <Textarea
              id="note-body"
              rows={6}
              value={draft.body}
              onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
              aria-invalid={contentError !== null}
              aria-describedby={contentError ? "note-content-error" : undefined}
              placeholder="Write your note here."
              className="border-slate-200 bg-slate-50"
            />
            <FieldError id="note-content-error">{contentError}</FieldError>
          </Field>
        ) : (
          <Field data-invalid={contentError !== null}>
            <FieldLabel htmlFor="note-item-0" className="text-slate-700">
              Checklist
            </FieldLabel>
            <div className="space-y-2">
              {draft.items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={(checked) => updateItem(item.id, { done: checked })}
                    aria-label={item.text.length > 0 ? item.text : `Checklist item ${index + 1}`}
                  />
                  <Input
                    ref={(element) => {
                      itemInputRefs.current[item.id] = element
                    }}
                    id={index === 0 ? "note-item-0" : undefined}
                    value={item.text}
                    onChange={(event) => updateItem(item.id, { text: event.target.value })}
                    aria-label={`Checklist item ${index + 1}`}
                    placeholder="List item"
                    className="border-slate-200 bg-slate-50"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove checklist item ${index + 1}`}
                    onClick={() => removeItem(item.id)}
                    className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <X aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addItem}
              className="mt-2 w-fit text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              <Plus aria-hidden="true" />
              Add item
            </Button>

            <FieldError id="note-content-error">{contentError}</FieldError>
          </Field>
        )}

        <fieldset>
          <legend className="text-xs font-medium text-slate-500">Colour</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {noteColors.map((color) => (
              <label key={color.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="note-color"
                  value={color.value}
                  checked={draft.color === color.value}
                  onChange={() => setDraft((current) => ({ ...current, color: color.value as NoteColor }))}
                  className="peer sr-only"
                />
                <span className="flex size-7 items-center justify-center rounded-full ring-offset-2 transition peer-checked:ring-2 peer-checked:ring-slate-900 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500">
                  <span className={`size-5 rounded-full ring-1 ring-black/10 ${color.swatch}`} />
                </span>
                <span className="sr-only">{color.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

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
