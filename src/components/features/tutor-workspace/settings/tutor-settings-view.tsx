import { Settings2, UserRound, Bell, ShieldCheck, Globe, Plus, Edit2, Trash2, X } from "lucide-react"
import { Link } from "react-router"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"
import { useState } from "react"

export default function TutorSettingsView() {
  const [currentSettings, setCurrentSettings] = useState([
    {
      id: 1,
      title: "Email notifications",
      value: "Enabled",
      lastUpdated: "Oct 20, 2026",
    },
    {
      id: 2,
      title: "Timezone",
      value: "UTC-5 (Eastern Time)",
      lastUpdated: "Sep 15, 2026",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSetting, setEditingSetting] = useState<typeof currentSettings[0] | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    lastUpdated: "",
  })

  const handleCreate = () => {
    setEditingSetting(null)
    setFormData({ title: "", value: "", lastUpdated: "" })
    setIsModalOpen(true)
  }

  const handleEdit = (setting: typeof currentSettings[0]) => {
    setEditingSetting(setting)
    setFormData({
      title: setting.title,
      value: setting.value,
      lastUpdated: setting.lastUpdated,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Delete this setting? (Local preview only - not persisted)")) {
      setCurrentSettings(currentSettings.filter(s => s.id !== id))
    }
  }

  const handleSave = () => {
    if (editingSetting) {
      setCurrentSettings(currentSettings.map(s => s.id === editingSetting.id ? { ...s, ...formData } : s))
    } else {
      const newId = Math.max(...currentSettings.map(s => s.id)) + 1
      setCurrentSettings([...currentSettings, { id: newId, ...formData }])
    }
    setIsModalOpen(false)
  }

  return (
    <TutorPage
      eyebrow="Account"
      title="Profile & Settings"
      description="Profile and preferences can be edited only when the authenticated profile/preferences service supports those fields."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TutorSection title="Profile">
          <UserRound aria-hidden="true" className="size-5 text-blue-700" />
          <p className="text-sm leading-6 text-slate-600">Tutor profile details and editing are not connected on this page.</p>
        </TutorSection>
        <TutorSection title="Preferences">
          <Settings2 aria-hidden="true" className="size-5 text-blue-700" />
          <p className="text-sm leading-6 text-slate-600">Teaching defaults and notification preferences require a supported settings contract.</p>
        </TutorSection>
      </div>

      <section aria-label="Current settings" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Your settings</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Current preferences</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600">{currentSettings.length} settings in preview mode</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus aria-hidden="true" className="size-4" />
              Add Setting
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {currentSettings.map((setting) => (
            <article
              key={setting.id}
              onClick={() => handleEdit(setting)}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-sm cursor-pointer"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Settings2 aria-hidden="true" className="size-4 text-slate-600" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{setting.title}</p>
                <p className="text-xs opacity-60">{setting.value} • Updated {setting.lastUpdated}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(setting); }} className="rounded p-1 hover:bg-slate-100 transition-colors" aria-label="Edit">
                  <Edit2 aria-hidden="true" className="size-3 text-slate-400" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(setting.id); }} className="rounded p-1 hover:bg-red-50 transition-colors" aria-label="Delete">
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
              <h3 className="text-lg font-semibold text-slate-900">{editingSetting ? 'Edit Setting' : 'Add Setting'}</h3>
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
                  placeholder="e.g., Email notifications"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Enabled"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Updated</label>
                <input
                  type="text"
                  value={formData.lastUpdated}
                  onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Oct 20, 2026"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                {editingSetting ? 'Update' : 'Create'}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Local preview only - changes are not persisted</p>
          </div>
        </div>
      )}

      <TutorUnavailable
        title="Profile settings are unavailable"
        description="No tutor profile or preferences update service is connected. No editable fields or local-save behavior are shown."
      />
      <Link to="/tutors/account/security" className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
        Open account security
      </Link>
    </TutorPage>
  )
}
