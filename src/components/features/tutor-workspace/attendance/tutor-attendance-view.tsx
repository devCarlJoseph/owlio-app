import { CalendarCheck, Users, Clock, ShieldCheck, Calendar, CheckCircle2, Plus, Edit2, Trash2, X } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"
import { useState } from "react"

export default function TutorAttendanceView() {
  const [attendanceRecords, setAttendanceRecords] = useState([
    {
      id: 1,
      session: "Calculus - Sarah Johnson",
      date: "Oct 27, 2026",
      learner: "Sarah Johnson",
      status: "present",
    },
    {
      id: 2,
      session: "Physics - Michael Chen",
      date: "Oct 26, 2026",
      learner: "Michael Chen",
      status: "present",
    },
    {
      id: 3,
      session: "Python Study Group",
      date: "Oct 25, 2026",
      learner: "Group - 6 members",
      status: "partial",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<typeof attendanceRecords[0] | null>(null)
  const [formData, setFormData] = useState({
    session: "",
    date: "",
    learner: "",
    status: "present",
  })

  const handleCreate = () => {
    setEditingRecord(null)
    setFormData({ session: "", date: "", learner: "", status: "present" })
    setIsModalOpen(true)
  }

  const handleEdit = (record: typeof attendanceRecords[0]) => {
    setEditingRecord(record)
    setFormData({
      session: record.session,
      date: record.date,
      learner: record.learner,
      status: record.status,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Delete this attendance record? (Local preview only - not persisted)")) {
      setAttendanceRecords(attendanceRecords.filter(r => r.id !== id))
    }
  }

  const handleSave = () => {
    if (editingRecord) {
      setAttendanceRecords(attendanceRecords.map(r => r.id === editingRecord.id ? { ...r, ...formData } : r))
    } else {
      const newId = Math.max(...attendanceRecords.map(r => r.id)) + 1
      setAttendanceRecords([...attendanceRecords, { id: newId, ...formData }])
    }
    setIsModalOpen(false)
  }

  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Session Attendance"
      description="Record attendance explicitly for an actual tutoring session, including each participant in a supported group session."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TutorSection title="Session roll call" description="Select an authorized session and use only its eligible participants.">
          <CalendarCheck aria-hidden="true" className="size-5 text-blue-700" />
        </TutorSection>
        <TutorSection title="Learner history" description="Individual attendance history and corrections require service-defined rules.">
          <Users aria-hidden="true" className="size-5 text-blue-700" />
        </TutorSection>
      </div>

      <section aria-label="Recent attendance" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Attendance records</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Recent sessions</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600">{attendanceRecords.length} records in preview mode</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus aria-hidden="true" className="size-4" />
              Add Record
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {attendanceRecords.map((record) => (
            <article
              key={record.id}
              onClick={() => handleEdit(record)}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-sm cursor-pointer"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Calendar aria-hidden="true" className="size-4 text-blue-700" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{record.session}</p>
                <p className="text-xs opacity-60">{record.learner} • {record.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  record.status === 'present' ? 'bg-emerald-100 text-emerald-900' :
                  record.status === 'partial' ? 'bg-amber-100 text-amber-900' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {record.status === 'present' && <CheckCircle2 aria-hidden="true" className="inline size-3 mr-1" />}
                  {record.status}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleEdit(record); }} className="rounded p-1 hover:bg-slate-100 transition-colors" aria-label="Edit">
                    <Edit2 aria-hidden="true" className="size-3 text-slate-400" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }} className="rounded p-1 hover:bg-red-50 transition-colors" aria-label="Delete">
                    <Trash2 aria-hidden="true" className="size-3 text-slate-400 hover:text-red-600" />
                  </button>
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
              <h3 className="text-lg font-semibold text-slate-900">{editingRecord ? 'Edit Attendance Record' : 'Add Attendance Record'}</h3>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'present' | 'absent' | 'partial' | 'late' })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="partial">Partial</option>
                  <option value="late">Late</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                {editingRecord ? 'Update' : 'Create'}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Local preview only - changes are not persisted</p>
          </div>
        </div>
      )}

      <TutorUnavailable
        title="Attendance records are unavailable"
        description="No tutor attendance service or session roster is connected. LiveKit presence, room duration, chat, and screen sharing are not attendance."
      />
    </TutorPage>
  )
}
