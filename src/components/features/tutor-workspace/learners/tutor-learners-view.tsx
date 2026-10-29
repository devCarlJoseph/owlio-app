import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ClipboardList,
  type LucideIcon,
  Users,
  UserRound,
  Mail,
  Calendar,
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  X,
} from "lucide-react"
import { Link } from "react-router"
import { TutorPage } from "../tutor-workspace-ui"
import { useState } from "react"

const relatedWorkspaces = [
  {
    title: "Learning Plans",
    description: "Open the general multi-session planning workspace.",
    href: "/tutors/learning-plans",
    icon: BookOpen,
    iconClassName: "bg-amber-100 text-amber-900",
  },
  {
    title: "Sessions & Schedule",
    description: "Open the general tutoring session workspace.",
    href: "/tutors/sessions",
    icon: CalendarDays,
    iconClassName: "bg-sky-100 text-sky-900",
  },
  {
    title: "Activities & Evaluations",
    description: "Open the general activities workspace.",
    href: "/tutors/classwork",
    icon: ClipboardList,
    iconClassName: "bg-emerald-100 text-emerald-900",
  },
]

const individualLearners = [
  {
    id: 1,
    name: "Sarah Johnson",
    subject: "Calculus",
    sessions: 12,
    lastSession: "2 days ago",
    status: "active",
  },
  {
    id: 2,
    name: "Michael Chen",
    subject: "Physics",
    sessions: 8,
    lastSession: "Yesterday",
    status: "active",
  },
  {
    id: 3,
    name: "Emma Wilson",
    subject: "Chemistry",
    sessions: 15,
    lastSession: "1 week ago",
    status: "active",
  },
  {
    id: 4,
    name: "James Rodriguez",
    subject: "Biology",
    sessions: 5,
    lastSession: "3 days ago",
    status: "active",
  },
]

const learningGroups = [
  {
    id: 1,
    name: "Python Study Group",
    members: 6,
    subject: "Programming",
    sessions: 4,
    nextSession: "Friday",
  },
  {
    id: 2,
    name: "SAT Math Prep",
    members: 8,
    subject: "Mathematics",
    sessions: 6,
    nextSession: "Saturday",
  },
]

export default function TutorLearnersView() {
  const [individualLearners, setIndividualLearners] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      subject: "Calculus",
      sessions: 12,
      lastSession: "2 days ago",
      status: "active",
    },
    {
      id: 2,
      name: "Michael Chen",
      subject: "Physics",
      sessions: 8,
      lastSession: "Yesterday",
      status: "active",
    },
    {
      id: 3,
      name: "Emma Wilson",
      subject: "Chemistry",
      sessions: 15,
      lastSession: "1 week ago",
      status: "active",
    },
    {
      id: 4,
      name: "James Rodriguez",
      subject: "Biology",
      sessions: 5,
      lastSession: "3 days ago",
      status: "active",
    },
  ])

  const [learningGroups, setLearningGroups] = useState([
    {
      id: 1,
      name: "Python Study Group",
      members: 6,
      subject: "Programming",
      sessions: 4,
      nextSession: "Friday",
    },
    {
      id: 2,
      name: "SAT Math Prep",
      members: 8,
      subject: "Mathematics",
      sessions: 6,
      nextSession: "Saturday",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'learner' | 'group'>('learner')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    sessions: 0,
    lastSession: "",
    nextSession: "",
    members: 0,
  })

  const handleCreate = (type: 'learner' | 'group') => {
    setModalType(type)
    setEditingItem(null)
    setFormData({
      name: "",
      subject: "",
      sessions: 0,
      lastSession: "",
      nextSession: "",
      members: 0,
    })
    setIsModalOpen(true)
  }

  const handleEdit = (item: any, type: 'learner' | 'group') => {
    setModalType(type)
    setEditingItem(item)
    setFormData({
      name: item.name,
      subject: item.subject,
      sessions: item.sessions,
      lastSession: item.lastSession || "",
      nextSession: item.nextSession || "",
      members: item.members || 0,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number, type: 'learner' | 'group') => {
    if (confirm(`Delete this ${type}? (Local preview only - not persisted)`)) {
      if (type === 'learner') {
        setIndividualLearners(individualLearners.filter(l => l.id !== id))
      } else {
        setLearningGroups(learningGroups.filter(g => g.id !== id))
      }
    }
  }

  const handleSave = () => {
    if (modalType === 'learner') {
      if (editingItem) {
        setIndividualLearners(individualLearners.map(l => l.id === editingItem.id ? { ...l, ...formData } : l))
      } else {
        const newId = Math.max(...individualLearners.map(l => l.id), 0) + 1
        setIndividualLearners([...individualLearners, { id: newId, ...formData, status: 'active' }])
      }
    } else {
      if (editingItem) {
        setLearningGroups(learningGroups.map(g => g.id === editingItem.id ? { ...g, ...formData } : g))
      } else {
        const newId = Math.max(...learningGroups.map(g => g.id), 0) + 1
        setLearningGroups([...learningGroups, { id: newId, ...formData }])
      }
    }
    setIsModalOpen(false)
  }

  return (
    <TutorPage
      eyebrow="Learner management"
      title="My Learners"
      description="Keep individual learners and tutoring groups distinct, with each learner's records limited to the authorized tutoring relationship."
    >
      <section
        aria-label="Learner directory status"
        className="relative isolate overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-orange-50 p-5 sm:p-7"
      >
        <div aria-hidden="true" className="absolute -right-12 -top-20 -z-10 size-56 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-800">Your tutoring relationships</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              One directory for individuals and groups.
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              You have {individualLearners.length} individual learners and {learningGroups.length} learning groups in preview mode.
            </p>
          </div>
          <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-950">
            <span aria-hidden="true" className="size-2 rounded-full bg-emerald-500" />
            Preview mode active
          </span>
        </div>
      </section>

      <section aria-labelledby="learner-contexts-title" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Browse by relationship</p>
            <h3 id="learner-contexts-title" className="mt-1 text-lg font-semibold text-slate-950">Learner contexts</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleCreate('learner')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus aria-hidden="true" className="size-4" />
              Add Learner
            </button>
            <button onClick={() => handleCreate('group')} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <Plus aria-hidden="true" className="size-4" />
              Add Group
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <LearnerContextCard
            id="individual-learners"
            title="Individual learners"
            description="One-to-one tutoring relationships and their authorized learning context."
            count={individualLearners.length}
            learners={individualLearners}
            icon={UserRound}
            tone="blue"
            onEdit={(item) => handleEdit(item, 'learner')}
            onDelete={(id) => handleDelete(id, 'learner')}
          />
          <LearnerContextCard
            id="learning-groups"
            title="Learning groups"
            description="Shared tutoring context, kept separate from each member's private records."
            count={learningGroups.length}
            groups={learningGroups}
            icon={Users}
            tone="orange"
            onEdit={(item) => handleEdit(item, 'group')}
            onDelete={(id) => handleDelete(id, 'group')}
          />
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{editingItem ? `Edit ${modalType}` : `Add ${modalType}`}</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
                <X aria-hidden="true" className="size-5 text-slate-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder={modalType === 'learner' ? "e.g., Sarah Johnson" : "e.g., Python Study Group"}
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
              {modalType === 'learner' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Session</label>
                  <input
                    type="text"
                    value={formData.lastSession}
                    onChange={(e) => setFormData({ ...formData, lastSession: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g., 2 days ago"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Members</label>
                    <input
                      type="number"
                      value={formData.members}
                      onChange={(e) => setFormData({ ...formData, members: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Next Session</label>
                    <input
                      type="text"
                      value={formData.nextSession}
                      onChange={(e) => setFormData({ ...formData, nextSession: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g., Friday"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Local preview only - changes are not persisted</p>
          </div>
        </div>
      )}

      <section aria-labelledby="related-workspaces-title" className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Continue tutoring</p>
          <h3 id="related-workspaces-title" className="mt-1 text-lg font-semibold text-slate-950">Related workspaces</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            These links open general tutor workspaces; they do not open a learner-specific record or save changes.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {relatedWorkspaces.map(({ title, description, href, icon: Icon, iconClassName }) => (
            <Link
              key={href}
              to={href}
              className="group flex min-h-28 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:transform-none"
            >
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 font-semibold text-slate-900">
                  {title}
                  <ArrowUpRight aria-hidden="true" className="size-4 text-blue-800 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
                </span>
                <span className="mt-1 block text-sm leading-5 text-slate-600">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </TutorPage>
  )
}

function LearnerContextCard({
  id,
  title,
  description,
  count,
  learners,
  groups,
  icon: Icon,
  tone,
  onEdit,
  onDelete,
}: {
  id: string
  title: string
  description: string
  count: number
  learners?: Array<{ id: number; name: string; subject: string; sessions: number; lastSession: string }>
  groups?: Array<{ id: number; name: string; members: number; subject: string; sessions: number; nextSession: string }>
  icon: LucideIcon
  tone: "blue" | "orange"
  onEdit?: (item: any) => void
  onDelete?: (id: number) => void
}) {
  const toneClasses = tone === "blue"
    ? "border-blue-100 bg-blue-50/70 text-blue-950"
    : "border-orange-100 bg-orange-50/70 text-orange-950"

  return (
    <section aria-labelledby={`${id}-title`} className={`rounded-3xl border p-5 shadow-sm sm:p-6 ${toneClasses}`}>
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 id={`${id}-title`} className="text-base font-semibold">{title}</h4>
              <p className="mt-1 text-sm leading-5 opacity-80">{description}</p>
            </div>
            <span className="shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold">
              {count}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-5 space-y-2">
        {learners && learners.slice(0, 3).map((learner) => (
          <article 
            key={learner.id} 
            onClick={() => onEdit && onEdit(learner)}
            className="group flex items-center gap-3 rounded-xl bg-white/70 p-3 transition-all duration-200 hover:bg-white hover:shadow-sm cursor-pointer"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <GraduationCap aria-hidden="true" className="size-4 opacity-70" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{learner.name}</p>
              <p className="text-xs opacity-75">{learner.subject} • {learner.sessions} sessions</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="shrink-0 text-xs opacity-60">{learner.lastSession}</span>
              {onEdit && (
                <button onClick={(e) => { e.stopPropagation(); onEdit(learner); }} className="rounded p-1 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100" aria-label="Edit">
                  <Edit2 aria-hidden="true" className="size-3 text-slate-400" />
                </button>
              )}
              {onDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(learner.id); }} className="rounded p-1 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100" aria-label="Delete">
                  <Trash2 aria-hidden="true" className="size-3 text-slate-400 hover:text-red-600" />
                </button>
              )}
            </div>
          </article>
        ))}
        {groups && groups.slice(0, 2).map((group) => (
          <article 
            key={group.id} 
            onClick={() => onEdit && onEdit(group)}
            className="group flex items-center gap-3 rounded-xl bg-white/70 p-3 transition-all duration-200 hover:bg-white hover:shadow-sm cursor-pointer"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <Users aria-hidden="true" className="size-4 opacity-70" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{group.name}</p>
              <p className="text-xs opacity-75">{group.subject} • {group.members} members</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="shrink-0 text-xs opacity-60 flex items-center gap-1">
                <Calendar aria-hidden="true" className="size-3" />
                {group.nextSession}
              </span>
              {onEdit && (
                <button onClick={(e) => { e.stopPropagation(); onEdit(group); }} className="rounded p-1 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100" aria-label="Edit">
                  <Edit2 aria-hidden="true" className="size-3 text-slate-400" />
                </button>
              )}
              {onDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(group.id); }} className="rounded p-1 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100" aria-label="Delete">
                  <Trash2 aria-hidden="true" className="size-3 text-slate-400 hover:text-red-600" />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
