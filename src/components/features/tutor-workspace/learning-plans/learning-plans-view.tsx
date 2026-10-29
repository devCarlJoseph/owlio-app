import { BookOpenCheck, CircleHelp, Flag, ListChecks, Target, Calendar, Users, Plus, Edit2, Trash2, X } from "lucide-react"
import { TutorPage } from "../tutor-workspace-ui"
import { useState } from "react"

const selectedPlanMilestones = [
  { id: 1, title: "Master derivatives", completed: true, date: "Completed" },
  { id: 2, title: "Understand limits", completed: true, date: "Completed" },
  { id: 3, title: "Integration techniques", completed: false, date: "In progress" },
  { id: 4, title: "Applications of calculus", completed: false, date: "Upcoming" },
]

export default function LearningPlansView() {
  const [learningPlans, setLearningPlans] = useState([
    {
      id: 1,
      title: "Calculus Mastery - Sarah Johnson",
      learner: "Sarah Johnson",
      progress: 65,
      sessions: 8,
      nextMilestone: "Integration techniques",
      lastUpdated: "2 days ago",
    },
    {
      id: 2,
      title: "Physics Fundamentals - Michael Chen",
      learner: "Michael Chen",
      progress: 40,
      sessions: 5,
      nextMilestone: "Newton's laws applications",
      lastUpdated: "1 week ago",
    },
    {
      id: 3,
      title: "Chemistry Lab Skills - Emma Wilson",
      learner: "Emma Wilson",
      progress: 80,
      sessions: 12,
      nextMilestone: "Organic chemistry intro",
      lastUpdated: "3 days ago",
    },
  ])

  const [selectedPlan, setSelectedPlan] = useState(learningPlans[0])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<typeof learningPlans[0] | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    learner: "",
    progress: 0,
    sessions: 0,
    nextMilestone: "",
    lastUpdated: "",
  })

  const handleCreate = () => {
    setEditingPlan(null)
    setFormData({ title: "", learner: "", progress: 0, sessions: 0, nextMilestone: "", lastUpdated: "" })
    setIsModalOpen(true)
  }

  const handleEdit = (plan: typeof learningPlans[0]) => {
    setEditingPlan(plan)
    setSelectedPlan(plan)
    setFormData({
      title: plan.title,
      learner: plan.learner,
      progress: plan.progress,
      sessions: plan.sessions,
      nextMilestone: plan.nextMilestone,
      lastUpdated: plan.lastUpdated,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Delete this learning plan? (Local preview only - not persisted)")) {
      setLearningPlans(learningPlans.filter(p => p.id !== id))
      if (selectedPlan?.id === id && learningPlans.length > 1) {
        setSelectedPlan(learningPlans.find(p => p.id !== id)!)
      }
    }
  }

  const handleSave = () => {
    if (editingPlan) {
      setLearningPlans(learningPlans.map(p => p.id === editingPlan.id ? { ...p, ...formData } : p))
      setSelectedPlan({ ...selectedPlan, ...formData })
    } else {
      const newId = Math.max(...learningPlans.map(p => p.id)) + 1
      const newPlan = { id: newId, ...formData }
      setLearningPlans([...learningPlans, newPlan])
      setSelectedPlan(newPlan)
    }
    setIsModalOpen(false)
  }

  return (
    <TutorPage
      eyebrow="Learner management"
      title="Learning Plans"
      description="Organize tutor-defined goals across multiple sessions. A learning plan is separate from a single-session agenda, school curriculum, and gradebook."
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(15rem,0.78fr)_minmax(0,1.6fr)]">
        <aside
          aria-labelledby="plan-library-title"
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-800">Plan library</p>
              <h3 id="plan-library-title" className="mt-1 text-lg font-semibold text-slate-950">Your plans</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-950">
                {learningPlans.length} plans
              </span>
              <button onClick={handleCreate} className="rounded-lg p-2 hover:bg-slate-100 transition-colors" aria-label="Add plan">
                <Plus aria-hidden="true" className="size-4 text-slate-600" />
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-2">
            {learningPlans.map((plan) => (
              <article
                key={plan.id}
                onClick={() => handleEdit(plan)}
                className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition-all duration-200 hover:border-blue-200 hover:bg-white hover:shadow-sm cursor-pointer"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Target aria-hidden="true" className="size-4 text-blue-700" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{plan.title}</p>
                  <p className="text-xs opacity-75">{plan.learner}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${plan.progress}%` }} />
                    </div>
                    <span className="text-xs text-slate-600">{plan.progress}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(plan); }} className="rounded p-1 hover:bg-slate-100 transition-colors" aria-label="Edit">
                    <Edit2 aria-hidden="true" className="size-3 text-slate-400" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(plan.id); }} className="rounded p-1 hover:bg-red-50 transition-colors" aria-label="Delete">
                    <Trash2 aria-hidden="true" className="size-3 text-slate-400 hover:text-red-600" />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <p className="mx-4 mb-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-5 text-blue-950 sm:mx-5 sm:mb-5">
            Plans belong to an authorized individual learner or supported group and span multiple sessions.
          </p>
        </aside>

        <section
          aria-labelledby="plan-details-title"
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-800">Selected plan</p>
              <h3 id="plan-details-title" className="mt-1 text-lg font-semibold text-slate-950">{selectedPlan.title}</h3>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900">
              {selectedPlan.progress}% complete
            </span>
          </div>

          <div className="mt-5 flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <Users aria-hidden="true" className="size-5 text-blue-700" />
            </span>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">{selectedPlan.learner}</h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {selectedPlan.sessions} sessions completed • Next milestone: {selectedPlan.nextMilestone}
              </p>
            </div>
          </div>

          <section aria-labelledby="plan-milestones-title" className="mt-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Plan progress</p>
              <h4 id="plan-milestones-title" className="mt-1 text-base font-semibold text-slate-950">Milestones</h4>
            </div>
            <div className="mt-4 space-y-2">
              {selectedPlanMilestones.map((milestone) => (
                <article key={milestone.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${milestone.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {milestone.completed ? (
                      <ListChecks aria-hidden="true" className="size-4" />
                    ) : (
                      <CircleHelp aria-hidden="true" className="size-4" />
                    )}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{milestone.title}</p>
                    <p className="text-xs opacity-60">{milestone.date}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{editingPlan ? 'Edit Learning Plan' : 'Add Learning Plan'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
                <X aria-hidden="true" className="size-5 text-slate-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Calculus Mastery - Sarah Johnson"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0"
                  />
                </div>
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
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Next Milestone</label>
                <input
                  type="text"
                  value={formData.nextMilestone}
                  onChange={(e) => setFormData({ ...formData, nextMilestone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Integration techniques"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Updated</label>
                <input
                  type="text"
                  value={formData.lastUpdated}
                  onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
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
                {editingPlan ? 'Update' : 'Create'}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Local preview only - changes are not persisted</p>
          </div>
        </div>
      )}
    </TutorPage>
  )
}
