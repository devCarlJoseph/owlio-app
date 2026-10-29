import { CalendarClock, MapPin, Video, Users, Clock, Calendar, ChevronLeft, ChevronRight, MoreVertical, Plus, Edit2, Trash2, X } from "lucide-react"
import { Link } from "react-router"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"
import { useState } from "react"

const sessionFeatures = [
  {
    title: "Individual sessions",
    description: "One-to-one tutoring with detailed session context and learner-specific records.",
    icon: Users,
    iconClassName: "bg-blue-100 text-blue-900",
  },
  {
    title: "Group sessions",
    description: "Shared learning context while maintaining individual attendance and progress.",
    icon: Users,
    iconClassName: "bg-emerald-100 text-emerald-900",
  },
  {
    title: "Recurring schedules",
    description: "Set up regular tutoring appointments with timezone-aware scheduling.",
    icon: Clock,
    iconClassName: "bg-amber-100 text-amber-900",
  },
]

export default function TutorSessionsView() {
  const [sessions, setSessions] = useState([
    {
      id: 1,
      learner: "Sarah Johnson",
      subject: "Calculus",
      date: "Oct 29, 2026",
      time: "3:00 PM",
      duration: "1 hour",
      type: "online",
      hasMeetingRoom: true,
      status: "upcoming",
      avatarInitials: "SJ",
      avatarColor: "bg-blue-500",
    },
    {
      id: 2,
      learner: "Michael Chen",
      subject: "Physics",
      date: "Oct 30, 2026",
      time: "10:00 AM",
      duration: "45 min",
      type: "online",
      hasMeetingRoom: true,
      status: "upcoming",
      avatarInitials: "MC",
      avatarColor: "bg-emerald-500",
    },
    {
      id: 3,
      learner: "Study Group - Python",
      subject: "Programming",
      date: "Oct 31, 2026",
      time: "2:00 PM",
      duration: "1.5 hours",
      type: "online",
      hasMeetingRoom: true,
      status: "upcoming",
      avatarInitials: "PG",
      avatarColor: "bg-purple-500",
    },
    {
      id: 4,
      learner: "Emma Wilson",
      subject: "Chemistry",
      date: "Oct 27, 2026",
      time: "4:00 PM",
      duration: "1 hour",
      type: "online",
      hasMeetingRoom: true,
      status: "completed",
      avatarInitials: "EW",
      avatarColor: "bg-rose-500",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<typeof sessions[0] | null>(null)
  const [formData, setFormData] = useState({
    learner: "",
    subject: "",
    date: "",
    time: "",
    duration: "",
    type: "online",
    hasMeetingRoom: true,
    status: "upcoming",
  })

  const handleCreate = () => {
    setEditingSession(null)
    setFormData({
      learner: "",
      subject: "",
      date: "",
      time: "",
      duration: "",
      type: "online",
      hasMeetingRoom: true,
      status: "upcoming",
    })
    setIsModalOpen(true)
  }

  const handleEdit = (session: typeof sessions[0]) => {
    setEditingSession(session)
    setFormData({
      learner: session.learner,
      subject: session.subject,
      date: session.date,
      time: session.time,
      duration: session.duration,
      type: session.type,
      hasMeetingRoom: session.hasMeetingRoom,
      status: session.status,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Delete this session? (Local preview only - not persisted)")) {
      setSessions(sessions.filter(s => s.id !== id))
    }
  }

  const handleSave = () => {
    if (editingSession) {
      setSessions(sessions.map(s => s.id === editingSession.id ? { ...s, ...formData, avatarInitials: formData.learner.split(' ').map(n => n[0]).join('').toUpperCase(), avatarColor: ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500'][Math.floor(Math.random() * 4)] } : s))
    } else {
      const newId = Math.max(...sessions.map(s => s.id)) + 1
      setSessions([...sessions, {
        id: newId,
        ...formData,
        avatarInitials: formData.learner.split(' ').map(n => n[0]).join('').toUpperCase(),
        avatarColor: ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500'][Math.floor(Math.random() * 4)],
      }])
    }
    setIsModalOpen(false)
  }

  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Sessions & Schedule"
      description="Manage tutoring appointments separately from longer-term Learning Plans. Session time, timezone, delivery mode, and recurrence must follow the session service contract."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <TutorSection title="Session details" description="Learner/group, topic, and a session agenda belong to the appointment.">
          <CalendarClock aria-hidden="true" className="size-5 text-blue-700" />
        </TutorSection>
        <TutorSection title="Delivery mode" description="Online, in-person, or hybrid options require backend support.">
          <MapPin aria-hidden="true" className="size-5 text-blue-700" />
        </TutorSection>
        <TutorSection title="Meeting Room" description="A room link belongs only to an eligible online session with a valid room.">
          <Video aria-hidden="true" className="size-5 text-blue-700" />
        </TutorSection>
      </div>

      <section aria-label="Calendar view" className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 hover:bg-slate-100 transition-colors" aria-label="Previous month">
              <ChevronLeft aria-hidden="true" className="size-5 text-slate-600" />
            </button>
            <span className="text-lg font-semibold text-slate-900">October 2026</span>
            <button className="rounded-lg p-2 hover:bg-slate-100 transition-colors" aria-label="Next month">
              <ChevronRight aria-hidden="true" className="size-5 text-slate-600" />
            </button>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Day</button>
            <button className="rounded-lg px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">Week</button>
            <button className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Month</button>
          </div>
        </div>
      </section>

      <section aria-label="Scheduled sessions" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Your schedule</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Today's sessions</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600">{sessions.length} sessions in preview mode</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus aria-hidden="true" className="size-4" />
              Add Session
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {sessions.map((session) => (
            <article
              key={session.id}
              onClick={() => handleEdit(session)}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md cursor-pointer"
            >
              <div className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-slate-50 px-4 py-3 min-w-[80px]">
                <span className="text-2xl font-bold text-slate-900">{session.time.split(':')[0]}</span>
                <span className="text-xs font-medium text-slate-500">{session.time.split(' ')[1]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{session.subject}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{session.learner}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(session); }} className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors" aria-label="Edit session">
                      <Edit2 aria-hidden="true" className="size-4 text-slate-400" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }} className="rounded-lg p-1.5 hover:bg-red-50 transition-colors" aria-label="Delete session">
                      <Trash2 aria-hidden="true" className="size-4 text-slate-400 hover:text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    session.status === 'upcoming' ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <span className={`size-1.5 rounded-full ${session.status === 'upcoming' ? 'bg-blue-500' : 'bg-slate-500'}`} />
                    {session.status}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <Clock aria-hidden="true" className="size-3.5" />
                    {session.duration}
                  </span>
                  {session.hasMeetingRoom && (
                    <span className="flex items-center gap-1 text-xs text-emerald-700">
                      <Video aria-hidden="true" className="size-3.5" />
                      Online
                    </span>
                  )}
                </div>
              </div>
              <span className={`flex shrink-0 size-12 items-center justify-center rounded-full text-sm font-semibold text-white ${session.avatarColor}`}>
                {session.avatarInitials}
              </span>
            </article>
          ))}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{editingSession ? 'Edit Session' : 'Add Session'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
                <X aria-hidden="true" className="size-5 text-slate-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Learner Name</label>
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Oct 29, 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="3:00 PM"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="1 hour"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'upcoming' | 'completed' })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="meetingRoom"
                  checked={formData.hasMeetingRoom}
                  onChange={(e) => setFormData({ ...formData, hasMeetingRoom: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="meetingRoom" className="text-sm text-slate-700">Enable Meeting Room</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                {editingSession ? 'Update' : 'Create'}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Local preview only - changes are not persisted</p>
          </div>
        </div>
      )}

      <section aria-label="Session types" className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Session capabilities</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">Types of tutoring sessions</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {sessionFeatures.map(({ title, description, icon: Icon, iconClassName }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none">
              <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}>
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h4 className="mt-3 text-sm font-semibold text-slate-900">{title}</h4>
              <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/tutors/learning-plans" className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Open Learning Plans</Link>
        <Link to="/tutors/classwork" className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Open Activities & Evaluations</Link>
      </div>
    </TutorPage>
  )
}
