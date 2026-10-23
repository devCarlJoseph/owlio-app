import { useState } from "react"
import {
  Archive,
  Check,
  ListChecks,
  MoreVertical,
  Palette,
  Pin,
  PinOff,
  Plus,
  StickyNote,
  Tag,
  Trash,
  X,
} from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NoteLabels } from "./note-labels"
import {
  createChecklistItemId,
  getNoteColorMeta,
  normalizeLabels,
  noteColors,
  type NoteChecklistItem,
  type NoteColor,
  type NoteKind,
  type NoteRecord,
} from "./note-records"

const editedFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

type NoteEditorDialogProps = {
  note: NoteRecord | null
  isNew?: boolean
  onOpenChange: (open: boolean) => void
  onChange: (note: NoteRecord) => void
  onCommit?: () => void
  onTogglePin: (note: NoteRecord) => void
  onArchive: (note: NoteRecord) => void
  onDelete: (note: NoteRecord) => void
}

export function NoteEditorDialog({
  note,
  isNew = false,
  onOpenChange,
  onChange,
  onCommit,
  onTogglePin,
  onArchive,
  onDelete,
}: NoteEditorDialogProps) {
  const [addingLabel, setAddingLabel] = useState(false)
  const [labelInput, setLabelInput] = useState("")

  if (!note) return null

  const current = note
  const edited = new Date(current.updatedAt)
  const colorMeta = getNoteColorMeta(current.color)

  function update(patch: Partial<NoteRecord>) {
    onChange({ ...current, ...patch, updatedAt: new Date().toISOString() })
  }

  function handleAddLabel() {
    const [label] = normalizeLabels(labelInput)
    if (!label) return

    if (!current.labels.includes(label)) {
      update({ labels: [...current.labels, label].sort() })
    }

    setLabelInput("")
    setAddingLabel(false)
  }

  function handleRemoveLabel(label: string) {
    update({ labels: current.labels.filter((item) => item !== label) })
  }

  function handleAddItem() {
    const item: NoteChecklistItem = { id: createChecklistItemId(), text: "", done: false }
    update({ kind: "checklist", items: [...current.items, item] })
  }

  function handleUpdateItem(itemId: string, patch: Partial<NoteChecklistItem>) {
    update({
      items: current.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    })
  }

  function handleRemoveItem(itemId: string) {
    update({ items: current.items.filter((item) => item.id !== itemId) })
  }

  function handleKindChange(kind: NoteKind) {
    if (kind === "checklist") {
      update({
        kind: "checklist",
        items:
          current.items.length > 0
            ? current.items
            : [{ id: createChecklistItemId(), text: "", done: false }],
      })
      return
    }

    update({ kind: "text" })
  }

  return (
    <Dialog open={note !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle className="sr-only">{isNew ? "New note" : "Edit note"}</DialogTitle>

        <div className="grid gap-2">
          <Input
            value={note.title}
            onChange={(event) => update({ title: event.currentTarget.value })}
            placeholder="Title"
            aria-label="Note title"
            className="h-auto border-0 bg-transparent px-0 text-2xl font-semibold tracking-tight text-slate-900 shadow-none focus-visible:ring-0"
          />

          {note.kind === "checklist" ? (
            <div className="space-y-2">
              {note.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={(checked) => handleUpdateItem(item.id, { done: checked })}
                    aria-label={item.text.length > 0 ? item.text : "Checklist item"}
                  />
                  <Input
                    value={item.text}
                    onChange={(event) => handleUpdateItem(item.id, { text: event.currentTarget.value })}
                    placeholder="List item"
                    aria-label={`Checklist item ${note.items.indexOf(item) + 1}`}
                    className="h-auto border-0 bg-transparent px-0 text-base text-slate-700 shadow-none focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Remove checklist item"
                    onClick={() => handleRemoveItem(item.id)}
                    className="shrink-0 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X aria-hidden="true" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddItem}
                className="w-fit text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <Plus aria-hidden="true" />
                Add item
              </Button>
            </div>
          ) : (
            <Textarea
              value={note.body}
              onChange={(event) => update({ body: event.currentTarget.value })}
              rows={8}
              placeholder="Start writing..."
              aria-label="Note content"
              className="resize-none border-0 bg-transparent px-0 text-base leading-7 text-slate-700 shadow-none focus-visible:ring-0"
            />
          )}
        </div>

        {note.labels.length > 0 ? (
          <NoteLabels labels={note.labels} onRemove={handleRemoveLabel} max={3} />
        ) : null}

        {addingLabel ? (
          <div className="flex items-center gap-2">
            <Input
              value={labelInput}
              onChange={(event) => setLabelInput(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  handleAddLabel()
                }
                if (event.key === "Escape") setAddingLabel(false)
              }}
              placeholder="Label name"
              aria-label="New label"
              autoFocus
              className="h-9 rounded-lg border-slate-200 bg-slate-50"
            />
            <Button type="button" size="sm" onClick={handleAddLabel} className="bg-blue-700 text-white hover:bg-blue-800">
              <Check aria-hidden="true" />
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Cancel adding a label"
              onClick={() => {
                setAddingLabel(false)
                setLabelInput("")
              }}
              className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X aria-hidden="true" />
            </Button>
          </div>
        ) : null}

        {!isNew ? (
          <div className="flex items-center justify-end">
            <p className="text-xs text-slate-500">
              Edited {Number.isNaN(edited.getTime()) ? "just now" : editedFormatter.format(edited)}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={note.pinned ? "Unpin note" : "Pin note"}
              onClick={() => onTogglePin(note)}
              className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              {note.pinned ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Change note colour"
                    className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  />
                }
              >
                <Palette aria-hidden="true" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                  value={current.color}
                  onValueChange={(value) => update({ color: value as NoteColor })}
                >
                  {noteColors.map((color) => (
                    <DropdownMenuRadioItem key={color.value} value={color.value}>
                      <span aria-hidden="true" className={`size-3 rounded-full ${color.chip}`} />
                      {color.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={note.kind === "checklist" ? "Switch to a text note" : "Switch to a checklist"}
              onClick={() => handleKindChange(note.kind === "checklist" ? "text" : "checklist")}
              className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              {note.kind === "checklist" ? (
                <StickyNote aria-hidden="true" />
              ) : (
                <ListChecks aria-hidden="true" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="More note options"
                    className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  />
                }
              >
                <MoreVertical aria-hidden="true" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => {
                    setAddingLabel(true)
                  }}
                >
                  <Tag aria-hidden="true" />
                  Add label
                </DropdownMenuItem>

                {!isNew ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onArchive(note)}>
                      <Archive aria-hidden="true" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(note)}>
                      <Trash aria-hidden="true" />
                      Delete
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>

            <Badge variant="secondary" className={`ml-2 ${colorMeta.chip}`}>
              {note.kind === "checklist" ? "Checklist" : "Note"}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {!isNew ? (
              <Link
                to="/students/materials/personal"
                className="text-xs font-medium text-slate-500 outline-none hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Study library
              </Link>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onCommit?.()
                onOpenChange(false)
              }}
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
