import { LockKeyhole, MessageCircleMore, FileText, Send, Calendar, User, Plus, Edit2, Trash2, X } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"
import { useState } from "react"

export default function TutorSessionNotesView() {
  const [sessionNotes, setSessionNotes] = useState([
    {
      id: 1,
      session: "Calculus - Sarah Johnson",
      date: "Oct 27, 2026",
      learner: "Sarah Johnson",
      preview: "Sarah showed strong understanding of chain rule. Needs more practice with implicit differentiation before next session.",
      isPrivate: true,
    },
    {
      id: 2,
      session: "Physics - Michael Chen",
      date: "Oct 26, 2026",
      learner: "Michael Chen",
      preview: "Excellent progress on Newton's laws. Suggested reviewing momentum conservation problems for homework.",
      isPrivate: true,
    },
    {
      id: 3,
      session: "Chemistry - Emma Wilson",
      date: "Oct 25, 2026",
      learner: "Emma Wilson",
      preview: "Lab report on acid-base titration was well-structured. Consider reinforcing stoichiometry calculations.",
      isPrivate: true,
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<typeof sessionNotes[0] | null>(null)
  const [formData, setFormData] = useState({
    session: "",
    date: "",
    learner: "",
    preview: "",
    isPrivate: true,
  })

  const handleCreate = () => {
    setEditingNote(null)
    setFormData({ session: "", date: "", learner: "", preview: "", isPrivate: true })
    setIsModalOpen(true)
  }

  const handleEdit = (note: typeof sessionNotes[0]) => {
    setEditingNote(note)
    setFormData({
      session: note.session,
      date: note.date,
      learner: note.learner,
      preview: note.preview,
      isPrivate: note.isPrivate,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Delete this session note? (Local preview only - not persisted)")) {
      setSessionNotes(sessionNotes.filter(n => n.id !== id))
    }
  }

  const handleSave = () => {
    if (editingNote) {
      setSessionNotes(sessionNotes.map(n => n.id === editingNote.id ? { ...n, ...formData } : n))
    } else {
      const newId = Math.max(...sessionNotes.map(n => n.id)) + 1
      setSessionNotes([...sessionNotes, { id: newId, ...formData }])
    }
    setIsModalOpen(false)
  }

  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Session Notes"
      description="Keep tutor-only observations separate from feedback intentionally published to a learner."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TutorSection title="Private tutor notes" description="Private notes require explicit tutor-only access and retention rules.">
          <LockKeyhole aria-hidden="true" className="size-5 text-slate-700" />
          <p className="text-sm text-slate-600">These notes must not appear in learner feeds, group discussions, notifications, or progress views.</p>
        </TutorSection>
        <TutorSection title="Learner-visible feedback" description="Publishing is a separate action with a confirmed audience.">
          <MessageCircleMore aria-hidden="true" className="size-5 text-blue-700" />
          <p className="text-sm text-slate-600">A private note never becomes feedback automatically.</p>
        </TutorSection>
      </div>

      <section aria-label="Recent notes" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Your notes</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Recent session notes</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600">{sessionNotes.length} notes in preview mode</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus aria-hidden="true" className="size-4" />
              Add Note
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {sessionNotes.map((note) => (
            <article
              key={note.id}
              onClick={() => handleEdit(note)}
              className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <LockKeyhole aria-hidden="true" className="size-4 text-slate-600" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{note.session}</p>
                      <p className="text-xs opacity-60 flex items-center gap-1">
                        <User aria-hidden="true" className="size-3" />
                        {note.learner} • {note.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        Private
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(note); }} className="rounded p-1 hover:bg-slate-100 transition-colors" aria-label="Edit">
                          <Edit2 aria-hidden="true" className="size-3 text-slate-400" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }} className="rounded p-1 hover:bg-red-50 transition-colors" aria-label="Delete">
                          <Trash2 aria-hidden="true" className="size-3 text-slate-400 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{note.preview}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{editingNote ? 'Edit Session Note' : 'Add Session Note'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
                <X aria-hidden="true" className="size-5 text-slate-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Session</label>
                <input
                  type="text"
                  value={formData.session}
                  onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Calculus - Sarah Johnson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Learner</label>
                <input
                  type="text"
                  value={formData.learner}
                  onChange={(e) => setFormData({ ...formData, learner: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Sarah Johnson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Oct 27, 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
                <textarea
                  value={formData.preview}
                  onChange={(e) => setFormData({ ...formData, preview: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[100px]"
                  placeholder="Enter your private tutor notes..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPrivate" className="text-sm text-slate-700">Private (tutor-only)</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                {editingNote ? 'Update' : 'Create'}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Local preview only - changes are not persisted</p>
          </div>
        </div>
      )}

      <TutorUnavailable
        title="Notes and feedback are unavailable"
        description="No session-note or feedback service is connected. Creating, saving, or publishing records is unavailable."
      />
    </TutorPage>
  )
}
