import { CalendarDays, ClipboardList, MessageCircleMore, Bell, UserCheck, AlertCircle, Clock, Plus, Edit2, Trash2, X } from "lucide-react"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"
import { useState } from "react"

export default function TutorNotificationsView() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "Session reminder",
      title: "Calculus session with Sarah Johnson starts in 1 hour",
      time: "10 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "Activity submission",
      title: "Michael Chen submitted Physics Lab Report",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 3,
      type: "Discussion reply",
      title: "Sarah Johnson replied to Calculus Quiz #3 discussion",
      time: "5 hours ago",
      unread: false,
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNotification, setEditingNotification] = useState<typeof notifications[0] | null>(null)
  const [formData, setFormData] = useState({
    type: "Session reminder",
    title: "",
    time: "",
    unread: false,
  })

  const handleCreate = () => {
    setEditingNotification(null)
    setFormData({ type: "Session reminder", title: "", time: "", unread: true })
    setIsModalOpen(true)
  }

  const handleEdit = (notification: typeof notifications[0]) => {
    setEditingNotification(notification)
    setFormData({
      type: notification.type,
      title: notification.title,
      time: notification.time,
      unread: notification.unread,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Delete this notification? (Local preview only - not persisted)")) {
      setNotifications(notifications.filter(n => n.id !== id))
    }
  }

  const handleSave = () => {
    if (editingNotification) {
      setNotifications(notifications.map(n => n.id === editingNotification.id ? { ...n, ...formData } : n))
    } else {
      const newId = Math.max(...notifications.map(n => n.id)) + 1
      setNotifications([...notifications, { id: newId, ...formData }])
    }
    setIsModalOpen(false)
  }

  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Notifications"
      description="Notifications should link confirmed events back to their source without exposing private session notes or learner details unnecessarily."
    >
      <section aria-label="Recent notifications" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Inbox</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Recent notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600">{notifications.length} notifications in preview mode</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus aria-hidden="true" className="size-4" />
              Add Notification
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              onClick={() => handleEdit(notification)}
              className={`group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-sm cursor-pointer ${notification.unread ? 'border-l-4 border-l-blue-500' : ''}`}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Bell aria-hidden="true" className="size-4 text-blue-700" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs opacity-60">{notification.type}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <Clock aria-hidden="true" className="size-3" />
                  {notification.time}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(notification); }} className="rounded p-1 hover:bg-slate-100 transition-colors" aria-label="Edit">
                  <Edit2 aria-hidden="true" className="size-3 text-slate-400" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }} className="rounded p-1 hover:bg-red-50 transition-colors" aria-label="Delete">
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
              <h3 className="text-lg font-semibold text-slate-900">{editingNotification ? 'Edit Notification' : 'Add Notification'}</h3>
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
                  <option value="Session reminder">Session reminder</option>
                  <option value="Activity submission">Activity submission</option>
                  <option value="Discussion reply">Discussion reply</option>
                  <option value="Feedback published">Feedback published</option>
                  <option value="System alert">System alert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Calculus session with Sarah Johnson starts in 1 hour"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., 10 minutes ago"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="unread"
                  checked={formData.unread}
                  onChange={(e) => setFormData({ ...formData, unread: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="unread" className="text-sm text-slate-700">Unread</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                {editingNotification ? 'Update' : 'Create'}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Local preview only - changes are not persisted</p>
          </div>
        </div>
      )}

      <TutorUnavailable
        title="Notification inbox is unavailable"
        description="No notification delivery or read-state service is connected. There are no live event items to display."
      />
    </TutorPage>
  )
}
