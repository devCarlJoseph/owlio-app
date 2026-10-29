import { ClipboardList, CalendarDays, MessageSquareText, TrendingUp, Award, BarChart3, User, Plus, Edit2, Trash2, X } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"
import { useState } from "react"

export default function TutorStudentProgressView() {
  const [learnerProgress, setLearnerProgress] = useState([
    {
      id: 1,
      learner: "Sarah Johnson",
      subject: "Calculus",
      sessions: 12,
      averageScore: 85,
      lastActivity: "2 days ago",
    },
    {
      id: 2,
      learner: "Michael Chen",
      subject: "Physics",
      sessions: 8,
      averageScore: 78,
      lastActivity: "Yesterday",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProgress, setEditingProgress] = useState<typeof learnerProgress[0] | null>(null)
  const [formData, setFormData] = useState({
    learner: "",
    subject: "",
    sessions: 0,
    averageScore: 0,
    lastActivity: "",
  })

  const handleCreate = () => {
    setEditingProgress(null)
    setFormData({ learner: "", subject: "", sessions: 0, averageScore: 0, lastActivity: "" })
    setIsModalOpen(true)
  }

  const handleEdit = (progress: typeof learnerProgress[0]) => {
    setEditingProgress(progress)
    setFormData({
      learner: progress.learner,
      subject: progress.subject,
      sessions: progress.sessions,
      averageScore: progress.averageScore,
      lastActivity: progress.lastActivity,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Delete this progress record? (Local preview only - not persisted)")) {
      setLearnerProgress(learnerProgress.filter(p => p.id !== id))
    }
  }

  const handleSave = () => {
    if (editingProgress) {
      setLearnerProgress(learnerProgress.map(p => p.id === editingProgress.id ? { ...p, ...formData } : p))
    } else {
      const newId = Math.max(...learnerProgress.map(p => p.id)) + 1
      setLearnerProgress([...learnerProgress, { id: newId, ...formData }])
    }
    setIsModalOpen(false)
  }

  return (
    <TutorPage
      eyebrow="Resources & progress"
      title="Student Progress"
      description="Review learner progress from actual tutoring evidence, with sources, dates, and tutor-defined criteria. Tutoring evaluations are not institutional grades."
    >
      <section aria-label="Learner progress" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Progress tracking</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Learner progress overview</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600">{learnerProgress.length} learners in preview mode</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus aria-hidden="true" className="size-4" />
              Add Progress
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {learnerProgress.map((progress) => (
            <article
              key={progress.id}
              onClick={() => handleEdit(progress)}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-sm cursor-pointer"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                <User aria-hidden="true" className="size-4 text-emerald-700" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{progress.learner} • {progress.subject}</p>
                <p className="text-xs opacity-60">{progress.sessions} sessions • Avg score: {progress.averageScore}%</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-slate-600">{progress.lastActivity}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(progress); }} className="rounded p-1 hover:bg-slate-100 transition-colors" aria-label="Edit">
                  <Edit2 aria-hidden="true" className="size-3 text-slate-400" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(progress.id); }} className="rounded p-1 hover:bg-red-50 transition-colors" aria-label="Delete">
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
              <h3 className="text-lg font-semibold text-slate-900">{editingProgress ? 'Edit Progress' : 'Add Progress'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
                <X aria-hidden="true" className="size-5 text-slate-600" />
              </button>
            </div>
            <div className="space-y-4">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Calculus"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sessions</label>
                  <input
                    type="number"
                    value={formData.sessions}
                    onChange={(e) => setFormData({ ...formData, sessions: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Average Score (%)</label>
                  <input
                    type="number"
                    value={formData.averageScore}
                    onChange={(e) => setFormData({ ...formData, averageScore: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Activity</label>
                <input
                  type="text"
                  value={formData.lastActivity}
                  onChange={(e) => setFormData({ ...formData, lastActivity: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., 2 days ago"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                {editingProgress ? 'Update' : 'Create'}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Local preview only - changes are not persisted</p>
          </div>
        </div>
      )}

      <TutorUnavailable
        title="Progress evidence is unavailable"
        description="No tutor sessions, attendance, activity evaluations, plans, or published feedback are connected. No mastery, grade, or progress metric is inferred."
      />
    </TutorPage>
  )
}
