import { useEffect, useMemo, useState } from "react"
import { Hash, Info, NotebookPen, Plus, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { NoteComposerDialog } from "./note-composer-dialog"
import { NoteDeleteDialog } from "./note-delete-dialog"
import { NoteDetailDialog } from "./note-detail-dialog"
import { NoteGroups } from "./note-groups"
import { NoteList } from "./note-list"
import {
  createNoteId,
  getNoteTags,
  groupNotesByTag,
  loadNotes,
  notesGuidance,
  notesStorageNotice,
  saveNotes,
  sortNotes,
  type NoteDraft,
  type NoteRecord,
} from "./note-records"

export function NotesView() {
  const [notes, setNotes] = useState<NoteRecord[]>(() => loadNotes())
  const [query, setQuery] = useState("")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)
  const [detailNoteId, setDetailNoteId] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NoteRecord | null>(null)

  useEffect(() => {
    saveNotes(notes)
  }, [notes])

  const tagGroups = useMemo(() => groupNotesByTag(notes), [notes])

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return sortNotes(
      notes.filter((note) => {
        const matchesTag = activeTag === null || getNoteTags(note).includes(activeTag)
        const matchesQuery =
          normalizedQuery.length === 0 ||
          note.title.toLowerCase().includes(normalizedQuery) ||
          note.body.toLowerCase().includes(normalizedQuery)

        return matchesTag && matchesQuery
      })
    )
  }, [notes, query, activeTag])

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

  function requestDelete(note: NoteRecord) {
    setDetailNoteId(null)
    setDeleteTarget(note)
  }

  function handleSubmit(draft: NoteDraft) {
    setNotes((current) => {
      if (editingNoteId) {
        return current.map((note) =>
          note.id === editingNoteId
            ? {
                ...note,
                title: draft.title,
                body: draft.body,
                tags: draft.tags,
                updatedAt: new Date().toISOString(),
              }
            : note
        )
      }

      return [
        ...current,
        {
          id: createNoteId(),
          title: draft.title,
          body: draft.body,
          tags: draft.tags,
          updatedAt: new Date().toISOString(),
          pinned: false,
        },
      ]
    })

    setComposerOpen(false)
    setEditingNoteId(null)
  }

  function handleTogglePin(note: NoteRecord) {
    setNotes((current) =>
      current.map((item) => (item.id === note.id ? { ...item, pinned: !item.pinned } : item))
    )
  }

  function handleDelete(note: NoteRecord) {
    setNotes((current) => current.filter((item) => item.id !== note.id))
    setDeleteTarget(null)
  }

  function clearFilters() {
    setQuery("")
    setActiveTag(null)
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          Personal workspace
        </Badge>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Notes</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Capture what you learn in your own words. Your notes belong to your study life whether or not a
          classroom is involved.
        </p>
      </section>

      <section
        aria-label="Notes guidance"
        className="flex flex-wrap items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
      >
        <NotebookPen className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
        <p className="flex-1 text-sm leading-6 text-blue-800">{notesGuidance}</p>
        <p className="flex w-full items-start gap-2 border-t border-blue-100 pt-2 text-xs leading-5 text-blue-800 sm:w-auto sm:flex-1 sm:border-t-0 sm:pt-0">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {notesStorageNotice}
        </p>
      </section>

      <div className="space-y-5">
        <Card className="border border-slate-200 bg-white shadow-sm ring-0">
            <CardContent className="gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Your notes</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Add a note, then group it with hashtags such as physics or task.
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  aria-label="Create a new note"
                  onClick={openCreateDialog}
                  className="rounded-full bg-blue-700 text-white hover:bg-blue-800"
                >
                  <Plus aria-hidden="true" />
                </Button>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                {activeTag ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTag(null)}
                    className="w-fit border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                  >
                    <Hash aria-hidden="true" />
                    {activeTag}
                    <X aria-hidden="true" />
                    <span className="sr-only">Clear group filter</span>
                  </Button>
                ) : (
                  <p className="text-xs text-slate-500">Pick a group below to filter the list.</p>
                )}
              </div>

              <NoteList
                notes={visibleNotes}
                totalCount={notes.length}
                activeTag={activeTag}
                query={query}
                onCreate={openCreateDialog}
                onOpen={openDetailDialog}
                onSelectTag={(tag) => setActiveTag(activeTag === tag ? null : tag)}
                onClearFilters={clearFilters}
              />

              <p className="text-xs leading-5 text-slate-500">
                Notes are stored in this browser for preview. Nothing is sent to a server, and classroom notes
                owned by an educator are not shown here.
              </p>
            </CardContent>
          </Card>

          <NoteGroups
            groups={tagGroups}
            activeTag={activeTag}
            onSelectTag={(tag) => setActiveTag(tag)}
            onEdit={openEditById}
          />
        </div>

      <NoteDetailDialog
        open={detailNoteId !== null}
        note={detailNote}
        onOpenChange={(open) => {
          if (!open) setDetailNoteId(null)
        }}
        onTogglePin={handleTogglePin}
        onEdit={openEditDialog}
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