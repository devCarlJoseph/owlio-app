import { useEffect, useMemo, useState } from "react"
import { FolderOpen, Info, LayoutGrid, List, Plus, Search, X } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NoteDeleteDialog } from "./note-delete-dialog"
import { NoteEditorDialog } from "./note-editor-dialog"
import { NoteLabelChips } from "./note-label-chips"
import { NoteList } from "./note-list"
import {
  countNotesInBucket,
  createNoteId,
  getNoteLabels,
  groupNotesByLabel,
  loadNotes,
  notesBucketLabels,
  notesGuidance,
  notesStorageNotice,
  noteMatchesQuery,
  saveNotes,
  sortNotes,
  type NoteBucket,
  type NoteRecord,
} from "./note-records"

const notesIntro =
  "Capture what you learn in your own words. Write a note or tick off a checklist, then keep it where you can find it again."

type UndoState =
  | { message: string; kind: "restore"; note: NoteRecord }
  | { message: string; kind: "remove"; noteId: string }

function createEmptyNote(): NoteRecord {
  const timestamp = new Date().toISOString()

  return {
    id: createNoteId(),
    title: "",
    body: "",
    labels: [],
    updatedAt: timestamp,
    pinned: false,
    kind: "text",
    color: "default",
    items: [],
    archived: false,
    trashed: false,
  }
}

export function NotesView() {
  const [notes, setNotes] = useState<NoteRecord[]>(() => loadNotes())
  const [bucket, setBucket] = useState<NoteBucket>("notes")
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [activeLabel, setActiveLabel] = useState<string | null>(null)
  const [detailNoteId, setDetailNoteId] = useState<string | null>(null)
  const [draftNote, setDraftNote] = useState<NoteRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NoteRecord | null>(null)
  const [undo, setUndo] = useState<UndoState | null>(null)

  useEffect(() => {
    saveNotes(notes)
  }, [notes])

  const scopedNotes = useMemo(() => {
    if (bucket === "trash") return notes.filter((note) => note.trashed)
    if (bucket === "archive") return notes.filter((note) => note.archived && !note.trashed)

    return notes.filter((note) => !note.archived && !note.trashed)
  }, [notes, bucket])

  const bucketNotes = useMemo(() => sortNotes(scopedNotes), [scopedNotes])

  const visibleNotes = useMemo(
    () =>
      bucketNotes.filter((note) => {
        const matchesLabel =
          activeLabel === null || getNoteLabels(note).includes(activeLabel)
        return matchesLabel && noteMatchesQuery(note, query)
      }),
    [bucketNotes, activeLabel, query]
  )

  const labelGroups = useMemo(() => groupNotesByLabel(scopedNotes), [scopedNotes])

  const detailNote = useMemo(
    () => notes.find((note) => note.id === detailNoteId) ?? null,
    [notes, detailNoteId]
  )

  function openCreateDialog() {
    setDraftNote(createEmptyNote())
  }

  function openDetailDialog(note: NoteRecord) {
    setDraftNote(null)
    setDetailNoteId(note.id)
  }

  function handleEditorChange(updated: NoteRecord) {
    if (draftNote && updated.id === draftNote.id) {
      setDraftNote(updated)
      return
    }

    setNotes((current) =>
      current.map((note) => (note.id === updated.id ? updated : note))
    )
  }

  function handleEditorCommit() {
    if (!draftNote) return

    const title = draftNote.title.trim()
    const hasContent = title.length > 0 || draftNote.body.trim().length > 0

    if (hasContent) {
      setNotes((current) => [draftNote, ...current])
    }

    setDraftNote(null)
  }

  function handleEditorClose() {
    setDraftNote(null)
    setDetailNoteId(null)
  }

  function handleTogglePin(note: NoteRecord) {
    setNotes((current) =>
      current.map((item) => (item.id === note.id ? { ...item, pinned: !item.pinned } : item))
    )
  }

  function handleToggleItem(note: NoteRecord, itemId: string) {
    setNotes((current) =>
      current.map((item) =>
        item.id === note.id
          ? {
              ...item,
              items: item.items.map((entry) =>
                entry.id === itemId ? { ...entry, done: !entry.done } : entry
              ),
            }
          : item
      )
    )
  }

  function handleArchive(note: NoteRecord) {
    setNotes((current) =>
      current.map((item) =>
        item.id === note.id ? { ...item, archived: !item.archived } : item
      )
    )
    setUndo({
      message: note.archived ? "Note moved back to your notes." : "Note archived.",
      kind: "restore",
      note,
    })
  }

  function requestDelete(note: NoteRecord) {
    setDetailNoteId(null)
    setDraftNote(null)
    setDeleteTarget(note)
  }

  function handleDelete(note: NoteRecord) {
    setNotes((current) =>
      current.map((item) => (item.id === note.id ? { ...item, trashed: true } : item))
    )
    setDeleteTarget(null)
    setDetailNoteId(null)
    setUndo({ message: "Note moved to trash.", kind: "restore", note })
  }

  function handleRestore(note: NoteRecord) {
    setNotes((current) =>
      current.map((item) =>
        item.id === note.id ? { ...item, trashed: false, archived: false } : item
      )
    )
  }

  function handleEmptyTrash() {
    setNotes((current) => current.filter((note) => !note.trashed))
    setUndo(null)
  }

  function handleUndo() {
    if (!undo) return

    if (undo.kind === "remove") {
      setNotes((current) => current.filter((note) => note.id !== undo.noteId))
    } else {
      setNotes((current) =>
        current.map((item) => (item.id === undo.note.id ? undo.note : item))
      )
    }

    setUndo(null)
  }

  function clearFilters() {
    setQuery("")
    setActiveLabel(null)
  }

  const cardActions = {
    onOpen: openDetailDialog,
    onSelectTag: (label: string) =>
      setActiveLabel((current) => (current === label ? null : label)),
    onToggleItem: handleToggleItem,
    onEdit: openDetailDialog,
    onTogglePin: handleTogglePin,
    onArchive: handleArchive,
    onDelete: requestDelete,
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <li>
            <Link
              to="/students/materials"
              className="rounded-md font-medium text-slate-600 outline-none hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Study Library
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            /
          </li>
          <li>
            <Link
              to="/students/materials/personal"
              className="rounded-md font-medium text-slate-600 outline-none hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Personal resources
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">
            /
          </li>
          <li aria-current="page" className="font-medium text-slate-900">
            Notes
          </li>
        </ol>
      </nav>

      <section className="relative overflow-visible rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-100 via-sky-50 to-blue-200 p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="bg-white/80 text-blue-700 ring-1 ring-blue-200">
              Personal workspace
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Notes
            </h2>
          </div>

          <Button
            type="button"
            onClick={openCreateDialog}
            className="bg-blue-700 text-white hover:bg-blue-800"
          >
            <Plus aria-hidden="true" />
            New note
          </Button>
        </div>

        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
          <button
            type="button"
            aria-label="About Notes"
            className="group/info relative inline-flex size-9 items-center justify-center rounded-full bg-white/80 text-slate-500 ring-1 ring-blue-200 outline-none transition hover:bg-white hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Info aria-hidden="true" className="size-4" />
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-64 rounded-xl bg-slate-900 p-3 text-left text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover/info:opacity-100 group-focus-visible/info:opacity-100"
            >
              {notesIntro}
            </span>
          </button>
        </div>
      </section>

      <section
        aria-label="Notes guidance"
        className="flex flex-wrap items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
      >
        <FolderOpen className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
        <p className="flex-1 text-sm leading-6 text-blue-800">{notesGuidance}</p>
        <p className="flex w-full items-start gap-2 border-t border-blue-100 pt-2 text-xs leading-5 text-blue-800 sm:w-auto sm:flex-1 sm:border-t-0 sm:pt-0">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {notesStorageNotice}
        </p>
      </section>

      <Card className="overflow-visible border border-slate-200 bg-white shadow-sm ring-0">
        <CardContent className="gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900">Your notes</h3>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative sm:w-64">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                />
                <Input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.currentTarget.value)}
                  aria-label="Search notes"
                  placeholder="Search notes..."
                  className="h-9 rounded-lg border-slate-200 bg-slate-50 pl-9"
                />
              </div>

              <div
                role="group"
                aria-label="Note layout"
                className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1"
              >
                {(
                  [
                    { value: "grid" as const, label: "Grid view", icon: LayoutGrid },
                    { value: "list" as const, label: "List view", icon: List },
                  ] as const
                ).map((option) => {
                  const OptionIcon = option.icon
                  const isActive = view === option.value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={isActive}
                      aria-label={option.label}
                      onClick={() => setView(option.value)}
                      className={`inline-flex size-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        isActive
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      <OptionIcon aria-hidden="true" className="size-4" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <Tabs
            value={bucket}
            onValueChange={(value) => {
              setBucket((value ?? "notes") as NoteBucket)
              setActiveLabel(null)
            }}
            className="gap-4"
          >
            <TabsList
              variant="line"
              className="h-auto w-full flex-wrap justify-start gap-1 border-b border-slate-200 pb-px"
            >
              {noteBuckets.map((item) => (
                <TabsTrigger key={item} value={item} className="flex-none gap-2">
                  {notesBucketLabels[item]}
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-slate-500 group-data-[variant=line]/tabs-list:data-active:bg-blue-50 group-data-[variant=line]/tabs-list:data-active:text-blue-700">
                    {countNotesInBucket(notes, item)}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {noteBuckets.map((item) => (
              <TabsContent key={item} value={item} className="space-y-4">
                <NoteLabelChips
                  groups={labelGroups}
                  activeLabel={activeLabel}
                  onSelectLabel={setActiveLabel}
                />

                {activeLabel ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveLabel(null)}
                      className="w-fit border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                    >
                      {activeLabel}
                      <X aria-hidden="true" />
                      <span className="sr-only">Clear label filter</span>
                    </Button>
                    <span className="text-xs text-slate-500">
                      Showing one label of {bucketNotes.length}{" "}
                      {bucketNotes.length === 1 ? "note" : "notes"}.
                    </span>
                  </div>
                ) : null}

                <NoteList
                  notes={visibleNotes}
                  totalCount={bucketNotes.length}
                  variant={view}
                  bucket={item}
                  activeTag={activeLabel}
                  query={query}
                  actions={cardActions}
                  onCreate={openCreateDialog}
                  onClearFilters={clearFilters}
                  onRestore={handleRestore}
                  onEmptyTrash={handleEmptyTrash}
                />
              </TabsContent>
            ))}
          </Tabs>

          <div className="sticky bottom-6 z-10 flex items-end justify-between gap-3">
            {undo ? (
              <div className="flex max-w-md flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 shadow-lg">
                <p role="status" className="text-sm text-white">
                  {undo.message}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleUndo}
                    className="text-white hover:bg-white/10 hover:text-white"
                  >
                    Undo
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setUndo(null)}
                    aria-label="Dismiss"
                    className="text-white hover:bg-white/10 hover:text-white"
                  >
                    <X aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ) : (
              <span />
            )}
          </div>

          <p className="text-xs leading-5 text-slate-500">{notesStorageNotice}</p>
        </CardContent>
      </Card>

      <NoteEditorDialog
        note={draftNote ?? detailNote}
        isNew={draftNote !== null}
        onOpenChange={(open) => {
          if (!open) handleEditorClose()
        }}
        onChange={handleEditorChange}
        onCommit={handleEditorCommit}
        onTogglePin={handleTogglePin}
        onArchive={handleArchive}
        onDelete={requestDelete}
      />

      <NoteDeleteDialog
        open={deleteTarget !== null}
        note={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
      />
    </div>
  )
}

const noteBuckets: NoteBucket[] = ["notes", "archive", "trash"]
