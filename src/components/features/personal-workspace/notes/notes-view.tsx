import { useEffect, useMemo, useState } from "react"
import { FolderOpen, Info, LayoutGrid, List, Plus, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NoteComposerDialog } from "./note-composer-dialog"
import { NoteDeleteDialog } from "./note-delete-dialog"
import { NoteDetailDialog } from "./note-detail-dialog"
import { NoteGroups } from "./note-groups"
import { NoteList } from "./note-list"
import {
  countNotesInBucket,
  createNoteId,
  duplicateNote,
  getNoteTags,
  groupNotesByTag,
  loadNotes,
  noteMatchesQuery,
  notesBucketHints,
  notesBucketLabels,
  notesGuidance,
  notesStorageNotice,
  saveNotes,
  sortNotes,
  type NoteBucket,
  type NoteDraft,
  type NoteRecord,
} from "./note-records"

const noteBuckets: NoteBucket[] = ["notes", "archive", "trash"]

type UndoState =
  | { message: string; kind: "restore"; note: NoteRecord }
  | { message: string; kind: "remove"; noteId: string }

export function NotesView() {
  const [notes, setNotes] = useState<NoteRecord[]>(() => loadNotes())
  const [bucket, setBucket] = useState<NoteBucket>("notes")
  const [query, setQuery] = useState("")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [detailNoteId, setDetailNoteId] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
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
        const matchesTag = activeTag === null || getNoteTags(note).includes(activeTag)
        return matchesTag && noteMatchesQuery(note, query)
      }),
    [bucketNotes, activeTag, query]
  )

  const tagGroups = useMemo(() => groupNotesByTag(scopedNotes), [scopedNotes])

  const editingNote = useMemo(
    () => notes.find((note) => note.id === editingNoteId) ?? null,
    [notes, editingNoteId]
  )

  const detailNote = useMemo(
    () => notes.find((note) => note.id === detailNoteId) ?? null,
    [notes, detailNoteId]
  )

  function openCreateDialog() {
    setEditingNoteId(null)
    setComposerOpen(true)
  }

  function openEditDialog(note: NoteRecord) {
    setDetailNoteId(null)
    setEditingNoteId(note.id)
    setComposerOpen(true)
  }

  function openEditById(noteId: string) {
    const note = notes.find((item) => item.id === noteId)
    if (note) openEditDialog(note)
  }

  function openDetailDialog(note: NoteRecord) {
    setDetailNoteId(note.id)
  }

  function handleSubmit(draft: NoteDraft) {
    if (editingNoteId) {
      setNotes((current) =>
        current.map((note) =>
          note.id === editingNoteId
            ? {
                ...note,
                title: draft.title,
                body: draft.body,
                tags: draft.tags,
                kind: draft.kind,
                color: draft.color,
                items: draft.items,
                updatedAt: new Date().toISOString(),
              }
            : note
        )
      )
    } else {
      setNotes((current) => [
        ...current,
        {
          id: createNoteId(),
          title: draft.title,
          body: draft.body,
          tags: draft.tags,
          kind: draft.kind,
          color: draft.color,
          items: draft.items,
          updatedAt: new Date().toISOString(),
          pinned: false,
          archived: false,
          trashed: false,
        },
      ])
    }

    setComposerOpen(false)
    setEditingNoteId(null)
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

  function handleDuplicate(note: NoteRecord) {
    const copy = duplicateNote(note)
    setNotes((current) => [copy, ...current])
    setUndo({ message: "Note duplicated.", kind: "remove", noteId: copy.id })
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
    setActiveTag(null)
  }

  const cardActions = {
    onOpen: openDetailDialog,
    onSelectTag: (tag: string) => setActiveTag((current) => (current === tag ? null : tag)),
    onToggleItem: handleToggleItem,
    onEdit: openEditDialog,
    onTogglePin: handleTogglePin,
    onDuplicate: handleDuplicate,
    onArchive: handleArchive,
    onDelete: requestDelete,
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              Personal workspace
            </Badge>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Notes</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Capture what you learn in your own words. Write a note or tick off a checklist, then keep
              it where you can find it again.
            </p>
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
            <div>
              <h3 className="text-base font-semibold text-slate-900">Your notes</h3>
              <p className="mt-1 text-sm text-slate-500">
                Search by title, text, checklist item, or group. Hashtags such as{" "}
                <span className="font-semibold text-blue-700">#physics</span> group your notes.
              </p>
            </div>

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
              setActiveTag(null)
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
                <p className="text-xs text-slate-500">{notesBucketHints[item]}</p>

                {activeTag ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTag(null)}
                      className="w-fit border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                    >
                      #{activeTag}
                      <X aria-hidden="true" />
                      <span className="sr-only">Clear group filter</span>
                    </Button>
                    <span className="text-xs text-slate-500">
                      Showing one group of {bucketNotes.length}{" "}
                      {bucketNotes.length === 1 ? "note" : "notes"}.
                    </span>
                  </div>
                ) : null}

                <NoteList
                  notes={visibleNotes}
                  totalCount={bucketNotes.length}
                  variant={view}
                  bucket={item}
                  activeTag={activeTag}
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

            <Button
              type="button"
              onClick={openCreateDialog}
              aria-label="Create a new note"
              className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <Plus aria-hidden="true" className="size-6" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <NoteGroups
        groups={tagGroups}
        activeTag={activeTag}
        onSelectTag={(tag) => setActiveTag(tag)}
        onEdit={openEditById}
      />

      <NoteDetailDialog
        open={detailNoteId !== null}
        note={detailNote}
        onOpenChange={(open) => {
          if (!open) setDetailNoteId(null)
        }}
        onTogglePin={handleTogglePin}
        onToggleItem={handleToggleItem}
        onEdit={openEditDialog}
        onDuplicate={handleDuplicate}
        onArchive={handleArchive}
        onDelete={requestDelete}
      />

      <NoteComposerDialog
        open={composerOpen}
        note={editingNote}
        onOpenChange={(open) => {
          setComposerOpen(open)
          if (!open) setEditingNoteId(null)
        }}
        onSubmit={handleSubmit}
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
