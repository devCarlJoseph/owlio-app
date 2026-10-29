import { Sparkles, Plus, Edit2, Trash2, X } from "lucide-react"
import { TutorPage, TutorUnavailable } from "../tutor-workspace-ui"
import { useState } from "react"
import { TutorAiChat, type ChatDraft } from "./tutor-ai-chat"

export default function TutorAiAssistantView() {
  const [draftSuggestions, setDraftSuggestions] = useState([
    {
      id: 1,
      type: "Lesson plan",
      title: "Introduction to Integration",
      context: "Calculus - Sarah Johnson",
      generated: "10 minutes ago",
    },
    {
      id: 2,
      type: "Practice problems",
      title: "Derivative practice set",
      context: "Calculus - Sarah Johnson",
      generated: "1 hour ago",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDraft, setEditingDraft] = useState<typeof draftSuggestions[0] | null>(null)
  const [formData, setFormData] = useState({
    type: "Lesson plan",
    title: "",
    context: "",
    generated: "",
  })

  const handleCreate = () => {
    setEditingDraft(null)
    setFormData({ type: "Lesson plan", title: "", context: "", generated: "" })
    setIsModalOpen(true)
  }

  const handleEdit = (draft: typeof draftSuggestions[0]) => {
    setEditingDraft(draft)
    setFormData({
      type: draft.type,
      title: draft.title,
      context: draft.context,
      generated: draft.generated,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Delete this draft? (Local preview only - not persisted)")) {
      setDraftSuggestions(draftSuggestions.filter(d => d.id !== id))
    }
  }

  const handleSave = () => {
    if (editingDraft) {
      setDraftSuggestions(draftSuggestions.map(d => d.id === editingDraft.id ? { ...d, ...formData } : d))
    } else {
      const newId = Math.max(0, ...draftSuggestions.map(d => d.id)) + 1
      setDraftSuggestions([...draftSuggestions, { id: newId, ...formData }])
    }
    setIsModalOpen(false)
  }

  const handleSaveFromChat = (draft: ChatDraft) => {
    setDraftSuggestions((prev) => [
      ...prev,
      { id: Math.max(0, ...prev.map((d) => d.id)) + 1, ...draft, generated: "Just now" },
    ])
  }

  return (
    <TutorPage
      eyebrow="Resources & progress"
      title="AI Tutor Assistant"
      description="Support tutoring preparation with editable drafts only. The tutor remains responsible for all teaching decisions and learner communication."
    >
      <TutorAiChat onSaveDraft={handleSaveFromChat} />

      <section aria-label="AI drafts" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">AI assistance</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Recent drafts</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600">{draftSuggestions.length} suggestions in preview mode</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus aria-hidden="true" className="size-4" />
              Add Draft
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {draftSuggestions.map((draft) => (
            <article
              key={draft.id}
              onClick={() => handleEdit(draft)}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-sm cursor-pointer"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                <Sparkles aria-hidden="true" className="size-4 text-purple-700" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{draft.title}</p>
                <p className="text-xs opacity-60">{draft.type} • {draft.context} • {draft.generated}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(draft); }} className="rounded p-1 hover:bg-slate-100 transition-colors" aria-label="Edit">
                  <Edit2 aria-hidden="true" className="size-3 text-slate-400" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(draft.id); }} className="rounded p-1 hover:bg-red-50 transition-colors" aria-label="Delete">
                  <Trash2 aria-hidden="true" className="size-3 text-slate-400 hover:text-red-600" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{editingDraft ? 'Edit Draft' : 'Add Draft'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
                <X aria-hidden="true" className="size-5 text-slate-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Lesson plan">Lesson plan</option>
                  <option value="Practice problems">Practice problems</option>
                  <option value="Quiz questions">Quiz questions</option>
                  <option value="Feedback draft">Feedback draft</option>
                  <option value="Activity draft">Activity draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Introduction to Integration"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Context</label>
                <input
                  type="text"
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Calculus - Sarah Johnson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Generated</label>
                <input
                  type="text"
                  value={formData.generated}
                  onChange={(e) => setFormData({ ...formData, generated: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., 10 minutes ago"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                {editingDraft ? 'Update' : 'Create'}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Local preview only - changes are not persisted</p>
          </div>
        </div>
      )}

      <TutorUnavailable
        title="AI generation is not connected"
        description="No approved provider, privacy/retention contract, or tutor AI service is available. Do not enter private learner or session information."
      />
    </TutorPage>
  )
}
