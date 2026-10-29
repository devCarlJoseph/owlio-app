import { MessagesSquare, Users, BookOpen, CalendarDays, MessageSquare, Clock, Plus, Edit2, Trash2, X } from "lucide-react"
import { TutorPage, TutorUnavailable } from "../tutor-workspace-ui"
import { useState } from "react"

export default function TutorDiscussionsView() {
  const [discussions, setDiscussions] = useState([
    {
      id: 1,
      title: "Calculus Quiz #3 - Questions",
      context: "Activity",
      learner: "Sarah Johnson",
      lastMessage: "Could you clarify problem 7?",
      lastActive: "2 hours ago",
      replies: 3,
    },
    {
      id: 2,
      title: "Python Project - Group Feedback",
      context: "Group",
      learner: "Study Group",
      lastMessage: "Updated the implementation draft",
      lastActive: "Yesterday",
      replies: 8,
    },
    {
      id: 3,
      title: "Physics Lab Report Follow-up",
      context: "Session",
      learner: "Michael Chen",
      lastMessage: "Thanks for the detailed feedback",
      lastActive: "3 days ago",
      replies: 2,
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDiscussion, setEditingDiscussion] = useState<typeof discussions[0] | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    context: "Activity",
    learner: "",
    lastMessage: "",
    lastActive: "",
    replies: 0,
  })

  const handleCreate = () => {
    setEditingDiscussion(null)
    setFormData({ title: "", context: "Activity", learner: "", lastMessage: "", lastActive: "", replies: 0 })
    setIsModalOpen(true)
  }

  const handleEdit = (discussion: typeof discussions[0]) => {
    setEditingDiscussion(discussion)
    setFormData({
      title: discussion.title,
      context: discussion.context,
      learner: discussion.learner,
      lastMessage: discussion.lastMessage,
      lastActive: discussion.lastActive,
      replies: discussion.replies,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Delete this discussion? (Local preview only - not persisted)")) {
      setDiscussions(discussions.filter(d => d.id !== id))
    }
  }

  const handleSave = () => {
    if (editingDiscussion) {
      setDiscussions(discussions.map(d => d.id === editingDiscussion.id ? { ...d, ...formData } : d))
    } else {
      const newId = Math.max(...discussions.map(d => d.id)) + 1
      setDiscussions([...discussions, { id: newId, ...formData }])
    }
    setIsModalOpen(false)
  }

  return (
    <TutorPage
      eyebrow="Sessions & communication"
      title="Discussions"
      description="Keep questions and replies attached to the learner, group, session, or activity they concern."
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <MessagesSquare aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h3 className="font-semibold text-slate-900">Contextual threads</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Thread authorship, audience, timestamps, and replies require a confirmed communication service.</p>
          </div>
        </div>
      </div>

      <section aria-label="Recent discussions" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Active threads</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Recent discussions</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600">{discussions.length} discussions in preview mode</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus aria-hidden="true" className="size-4" />
              Add Discussion
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {discussions.map((discussion) => (
            <article
              key={discussion.id}
              onClick={() => handleEdit(discussion)}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-sm cursor-pointer"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <MessageSquare aria-hidden="true" className="size-4 text-blue-700" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{discussion.title}</p>
                <p className="text-xs opacity-60">{discussion.context} • {discussion.learner}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <Clock aria-hidden="true" className="size-3" />
                  {discussion.lastActive}
                </p>
                <p className="text-xs opacity-60">{discussion.replies} replies</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(discussion); }} className="rounded p-1 hover:bg-slate-100 transition-colors" aria-label="Edit">
                  <Edit2 aria-hidden="true" className="size-3 text-slate-400" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(discussion.id); }} className="rounded p-1 hover:bg-red-50 transition-colors" aria-label="Delete">
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
              <h3 className="text-lg font-semibold text-slate-900">{editingDiscussion ? 'Edit Discussion' : 'Add Discussion'}</h3>
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
                  placeholder="e.g., Calculus Quiz #3 - Questions"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Context</label>
                <select
                  value={formData.context}
                  onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Activity">Activity</option>
                  <option value="Group">Group</option>
                  <option value="Session">Session</option>
                  <option value="Learner">Learner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Learner/Group</label>
                <input
                  type="text"
                  value={formData.learner}
                  onChange={(e) => setFormData({ ...formData, learner: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Sarah Johnson"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Message</label>
                <input
                  type="text"
                  value={formData.lastMessage}
                  onChange={(e) => setFormData({ ...formData, lastMessage: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Could you clarify problem 7?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Active</label>
                  <input
                    type="text"
                    value={formData.lastActive}
                    onChange={(e) => setFormData({ ...formData, lastActive: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="e.g., 2 hours ago"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Replies</label>
                  <input
                    type="number"
                    value={formData.replies}
                    onChange={(e) => setFormData({ ...formData, replies: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                {editingDiscussion ? 'Update' : 'Create'}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Local preview only - changes are not persisted</p>
          </div>
        </div>
      )}

      <TutorUnavailable
        title="Discussions are not connected"
        description="No posts or replies are loaded. Meeting Room chat stays transient and does not become a saved discussion. Direct messages are outside this plan."
      />
    </TutorPage>
  )
}
