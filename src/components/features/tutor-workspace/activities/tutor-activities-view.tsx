import {
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  MessageSquareText,
  type LucideIcon,
  Clock,
  FileText,
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
} from "lucide-react"
import { TutorPage } from "../tutor-workspace-ui"
import { useState } from "react"

const activityAreas = [
  {
    title: "Practice and activities",
    description: "Tutor-authored work tied to an authorized learner or supported group.",
    icon: ClipboardList,
    iconClassName: "bg-blue-100 text-blue-900",
  },
  {
    title: "Learner responses",
    description: "Review learner-specific work only when submission types and lifecycle are defined.",
    icon: ClipboardCheck,
    iconClassName: "bg-orange-100 text-orange-900",
  },
  {
    title: "Evaluation and feedback",
    description: "Keep tutor evaluation separate from private Session Notes and publish feedback deliberately.",
    icon: MessageSquareText,
    iconClassName: "bg-emerald-100 text-emerald-900",
  },
]

const activities = [
  {
    id: 1,
    title: "Calculus Quiz #3",
    learner: "Sarah Johnson",
    type: "quiz",
    submissions: 1,
    status: "needs review",
    dueDate: "Oct 28, 2026",
  },
  {
    id: 2,
    title: "Physics Lab Report",
    learner: "Michael Chen",
    type: "assignment",
    submissions: 1,
    status: "needs review",
    dueDate: "Oct 27, 2026",
  },
  {
    id: 3,
    title: "Chemistry Problem Set",
    learner: "Emma Wilson",
    type: "practice",
    submissions: 0,
    status: "pending",
    dueDate: "Oct 30, 2026",
  },
  {
    id: 4,
    title: "Python Programming Exercise",
    learner: "Study Group",
    type: "project",
    submissions: 4,
    status: "in progress",
    dueDate: "Nov 1, 2026",
  },
]

export default function TutorActivitiesView() {
  const [activities, setActivities] = useState([
    {
      id: 1,
      title: "Calculus Quiz #3",
      learner: "Sarah Johnson",
      type: "quiz",
      submissions: 1,
      status: "needs review",
      dueDate: "Oct 28, 2026",
    },
    {
      id: 2,
      title: "Physics Lab Report",
      learner: "Michael Chen",
      type: "assignment",
      submissions: 1,
      status: "needs review",
      dueDate: "Oct 27, 2026",
    },
    {
      id: 3,
      title: "Chemistry Problem Set",
      learner: "Emma Wilson",
      type: "practice",
      submissions: 0,
      status: "pending",
      dueDate: "Oct 30, 2026",
    },
    {
      id: 4,
      title: "Python Programming Exercise",
      learner: "Study Group",
      type: "project",
      submissions: 4,
      status: "in progress",
      dueDate: "Nov 1, 2026",
    },
  ])

  const [selectedActivity, setSelectedActivity] = useState({
    title: "Calculus Quiz #3",
    learner: "Sarah Johnson",
    description: "Complete problems 1-10 covering derivatives and applications",
    dueDate: "Oct 28, 2026",
    submissions: [
      {
        id: 1,
        learner: "Sarah Johnson",
        submittedAt: "Oct 27, 2026 at 4:30 PM",
        status: "submitted",
      },
    ],
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<typeof activities[0] | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    learner: "",
    type: "practice",
    dueDate: "",
    status: "pending",
  })

  const handleCreate = () => {
    setEditingActivity(null)
    setFormData({ title: "", learner: "", type: "practice", dueDate: "", status: "pending" })
    setIsModalOpen(true)
  }

  const handleEdit = (activity: typeof activities[0]) => {
    setEditingActivity(activity)
    setFormData({ title: activity.title, learner: activity.learner, type: activity.type, dueDate: activity.dueDate, status: activity.status })
    setSelectedActivity({
      title: activity.title,
      learner: activity.learner,
      description: "Complete the assigned work for this activity",
      dueDate: activity.dueDate,
      submissions: activity.submissions > 0 ? [{
        id: 1,
        learner: activity.learner,
        submittedAt: "Oct 27, 2026 at 4:30 PM",
        status: "submitted",
      }] : [],
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Delete this activity? (Local preview only - not persisted)")) {
      setActivities(activities.filter(a => a.id !== id))
    }
  }

  const handleSave = () => {
    if (editingActivity) {
      setActivities(activities.map(a => a.id === editingActivity.id ? { ...a, ...formData, submissions: a.submissions } : a))
      setSelectedActivity({
        title: formData.title,
        learner: formData.learner,
        description: "Complete the assigned work for this activity",
        dueDate: formData.dueDate,
        submissions: selectedActivity.submissions,
      })
    } else {
      const newId = Math.max(...activities.map(a => a.id)) + 1
      setActivities([...activities, { id: newId, ...formData, submissions: 0 }])
    }
    setIsModalOpen(false)
  }

  return (
    <TutorPage
      eyebrow="Learner management"
      title="Activities & Evaluations"
      description="Prepare tutoring practice, review learner work, and provide tutor-controlled evaluations without assuming school grading rules."
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.6fr)]">
        <aside
          aria-labelledby="activity-library-title"
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-800">Tutor workspace</p>
              <h3 id="activity-library-title" className="mt-1 text-lg font-semibold text-slate-950">Activity library</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-950">
                {activities.length} activities
              </span>
              <button onClick={handleCreate} className="rounded-lg p-2 hover:bg-slate-100 transition-colors" aria-label="Add activity">
                <Plus aria-hidden="true" className="size-4 text-slate-600" />
              </button>
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-2">
            {activities.map((activity) => (
              <article
                key={activity.id}
                onClick={() => handleEdit(activity)}
                className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition-all duration-200 hover:border-blue-200 hover:bg-white hover:shadow-sm cursor-pointer"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <FileText aria-hidden="true" className="size-4 text-blue-700" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs opacity-75">{activity.learner}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className={`rounded-full px-2 py-0.5 ${
                      activity.status === 'needs review' ? 'bg-amber-100 text-amber-900' :
                      activity.status === 'pending' ? 'bg-slate-100 text-slate-700' :
                      'bg-blue-100 text-blue-900'
                    }`}>
                      {activity.status}
                    </span>
                    <span className="opacity-60">• {activity.submissions} submissions</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(activity); }} className="rounded p-1 hover:bg-slate-100 transition-colors" aria-label="Edit">
                    <Edit2 aria-hidden="true" className="size-3 text-slate-400" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(activity.id); }} className="rounded p-1 hover:bg-red-50 transition-colors" aria-label="Delete">
                    <Trash2 aria-hidden="true" className="size-3 text-slate-400 hover:text-red-600" />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <p className="mx-4 mb-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-5 text-blue-950 sm:mx-5 sm:mb-5">
            Activities should stay linked to their learner or group and relevant tutoring context.
          </p>
        </aside>

        <section
          aria-labelledby="activity-details-title"
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-800">Selected activity</p>
              <h3 id="activity-details-title" className="mt-1 text-lg font-semibold text-slate-950">{selectedActivity.title}</h3>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900">
              {selectedActivity.submissions.length} submission
            </span>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Users aria-hidden="true" className="size-5 text-blue-700" />
              </span>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">{selectedActivity.learner}</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">{selectedActivity.description}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock aria-hidden="true" className="size-3.5" />
                    Due: {selectedActivity.dueDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <section aria-labelledby="submissions-title" className="mt-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Learner work</p>
              <h4 id="submissions-title" className="mt-1 text-base font-semibold text-slate-950">Submissions</h4>
            </div>
            <div className="mt-4 space-y-2">
              {selectedActivity.submissions.map((submission) => (
                <article key={submission.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <ClipboardCheck aria-hidden="true" className="size-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{submission.learner}</p>
                    <p className="text-xs opacity-60">{submission.submittedAt}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-900">
                    {submission.status}
                  </span>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="activity-workflow-title" className="mt-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tutoring workflow</p>
              <h4 id="activity-workflow-title" className="mt-1 text-base font-semibold text-slate-950">What belongs here</h4>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {activityAreas.map(({ title, description, icon: Icon, iconClassName }) => (
                <ActivityAreaCard
                  key={title}
                  title={title}
                  description={description}
                  icon={Icon}
                  iconClassName={iconClassName}
                />
              ))}
            </div>
          </section>

          <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Activity types, response rules, evaluation criteria, and feedback release states must come from an approved tutoring contract.
          </p>
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{editingActivity ? 'Edit Activity' : 'Add Activity'}</h3>
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
                  placeholder="e.g., Calculus Quiz #3"
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="practice">Practice</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="text"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Oct 28, 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'needs review' | 'in progress' })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="pending">Pending</option>
                  <option value="needs review">Needs Review</option>
                  <option value="in progress">In Progress</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                {editingActivity ? 'Update' : 'Create'}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Local preview only - changes are not persisted</p>
          </div>
        </div>
      )}
    </TutorPage>
  )
}

function ActivityAreaCard({
  title,
  description,
  icon: Icon,
  iconClassName,
}: {
  title: string
  description: string
  icon: LucideIcon
  iconClassName: string
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h4 className="mt-3 text-sm font-semibold text-slate-900">{title}</h4>
      <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
    </article>
  )
}
