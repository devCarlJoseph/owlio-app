import { Megaphone, Users, Calendar, Bell, Clock, Plus, Edit2, Trash2, X } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"
import { useState } from "react"

export default function TutorAnnouncementsView() {
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Calculus Session Rescheduled",
      audience: "Sarah Johnson",
      scheduled: "Oct 27, 2026",
      status: "published",
      views: 1,
    },
    {
      id: 2,
      title: "Python Group Project Materials",
      audience: "Study Group",
      scheduled: "Oct 26, 2026",
      status: "published",
      views: 6,
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<typeof announcements[0] | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    audience: "",
    scheduled: "",
    status: "draft",
    views: 0,
  })

  const handleCreate = () => {
    setEditingAnnouncement(null)
    setFormData({ title: "", audience: "", scheduled: "", status: "draft", views: 0 })
    setIsModalOpen(true)
  }

  const handleEdit = (announcement: typeof announcements[0]) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      audience: announcement.audience,
      scheduled: announcement.scheduled,
      status: announcement.status,
      views: announcement.views,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Delete this announcement? (Local preview only - not persisted)")) {
      setAnnouncements(announcements.filter(a => a.id !== id))
    }
  }

  const handleSave = () => {
    if (editingAnnouncement) {
      setAnnouncements(announcements.map(a => a.id === editingAnnouncement.id ? { ...a, ...formData } : a))
    } else {
      const newId = Math.max(...announcements.map(a => a.id)) + 1
      setAnnouncements([...announcements, { id: newId, ...formData }])
    }
    setIsModalOpen(false)
  }

  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Announcements"
      description="Tutor-authored notices need an explicitly selected learner or group audience and service-confirmed publication."
    >
      <TutorSection title="Notice audience" description="No learner/group audience can be selected until authorized tutoring relationships are loaded.">
        <Megaphone aria-hidden="true" className="size-5 text-blue-700" />
      </TutorSection>

      <section aria-label="Recent announcements" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Your announcements</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Recent announcements</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600">{announcements.length} announcements in preview mode</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus aria-hidden="true" className="size-4" />
              Add Announcement
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              onClick={() => handleEdit(announcement)}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-sm cursor-pointer"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                <Megaphone aria-hidden="true" className="size-4 text-amber-700" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{announcement.title}</p>
                <p className="text-xs opacity-60">{announcement.audience} • {announcement.scheduled}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  announcement.status === 'published' ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-700'
                }`}>
                  {announcement.status}
                </span>
                <p className="text-xs opacity-60 mt-1">{announcement.views} views</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(announcement); }} className="rounded p-1 hover:bg-slate-100 transition-colors" aria-label="Edit">
                  <Edit2 aria-hidden="true" className="size-3 text-slate-400" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(announcement.id); }} className="rounded p-1 hover:bg-red-50 transition-colors" aria-label="Delete">
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
              <h3 className="text-lg font-semibold text-slate-900">{editingAnnouncement ? 'Edit Announcement' : 'Add Announcement'}</h3>
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
                  placeholder="e.g., Calculus Session Rescheduled"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
                <input
                  type="text"
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Sarah Johnson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date</label>
                <input
                  type="text"
                  value={formData.scheduled}
                  onChange={(e) => setFormData({ ...formData, scheduled: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Oct 27, 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Views</label>
                <input
                  type="number"
                  value={formData.views}
                  onChange={(e) => setFormData({ ...formData, views: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                {editingAnnouncement ? 'Update' : 'Create'}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Local preview only - changes are not persisted</p>
          </div>
        </div>
      )}

      <TutorUnavailable
        title="Announcements are unavailable"
        description="No announcement service is connected. Drafting, publishing, scheduling, retracting, and delivery status are not represented as available."
      />
    </TutorPage>
  )
}
