import { BookOpenText, FolderOpen, Users, FileImage, Link as LinkIcon, FileText, File, Plus, Edit2, Trash2, X } from "lucide-react"
import { Link } from "react-router"
import { TutorPage, TutorSection, TutorUnavailable } from "../tutor-workspace-ui"
import { useState } from "react"

export default function TutorMaterialsView() {
  const [materials, setMaterials] = useState([
    {
      id: 1,
      title: "Calculus Derivatives Worksheet",
      type: "PDF",
      learner: "Sarah Johnson",
      added: "Oct 25, 2026",
    },
    {
      id: 2,
      title: "Physics Formula Sheet",
      type: "Document",
      learner: "Michael Chen",
      added: "Oct 24, 2026",
    },
    {
      id: 3,
      title: "Chemistry Periodic Table",
      type: "Image",
      learner: "Emma Wilson",
      added: "Oct 23, 2026",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<typeof materials[0] | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    type: "Document",
    learner: "",
    added: "",
  })

  const handleCreate = () => {
    setEditingMaterial(null)
    setFormData({ title: "", type: "Document", learner: "", added: "" })
    setIsModalOpen(true)
  }

  const handleEdit = (material: typeof materials[0]) => {
    setEditingMaterial(material)
    setFormData({
      title: material.title,
      type: material.type,
      learner: material.learner,
      added: material.added,
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Delete this material? (Local preview only - not persisted)")) {
      setMaterials(materials.filter(m => m.id !== id))
    }
  }

  const handleSave = () => {
    if (editingMaterial) {
      setMaterials(materials.map(m => m.id === editingMaterial.id ? { ...m, ...formData } : m))
    } else {
      const newId = Math.max(...materials.map(m => m.id)) + 1
      setMaterials([...materials, { id: newId, ...formData }])
    }
    setIsModalOpen(false)
  }

  return (
    <TutorPage
      eyebrow="Resources & progress"
      title="Teaching Materials"
      description="Use one tutor resource library with an explicit owner and audience. Private resources must be shared deliberately before learners can see them."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <TutorSection title="Learner context" description="Select an authorized learner or group before attaching a resource.">
          <Users aria-hidden="true" className="size-5 text-blue-700" />
          <Link className="text-sm font-semibold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" to="/tutors/learners">Open My Learners</Link>
        </TutorSection>
        <TutorSection title="Session context" description="Materials may be linked to an appointment when sessions are available.">
          <BookOpenText aria-hidden="true" className="size-5 text-blue-700" />
          <Link className="text-sm font-semibold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" to="/tutors/sessions">Open Sessions</Link>
        </TutorSection>
        <TutorSection title="Tutor library" description="Browse, upload, preview, and share only when storage rules are confirmed.">
          <FolderOpen aria-hidden="true" className="size-5 text-blue-700" />
        </TutorSection>
      </div>

      <section aria-label="Recent materials" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Your library</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-950">Recent materials</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-slate-600">{materials.length} materials in preview mode</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              <Plus aria-hidden="true" className="size-4" />
              Add Material
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {materials.map((material) => (
            <article
              key={material.id}
              onClick={() => handleEdit(material)}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-sm cursor-pointer"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-50">
                <File aria-hidden="true" className="size-4 text-sky-700" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{material.title}</p>
                <p className="text-xs opacity-60">{material.type} • {material.learner} • {material.added}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(material); }} className="rounded p-1 hover:bg-slate-100 transition-colors" aria-label="Edit">
                  <Edit2 aria-hidden="true" className="size-3 text-slate-400" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(material.id); }} className="rounded p-1 hover:bg-red-50 transition-colors" aria-label="Delete">
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
              <h3 className="text-lg font-semibold text-slate-900">{editingMaterial ? 'Edit Material' : 'Add Material'}</h3>
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
                  placeholder="e.g., Calculus Derivatives Worksheet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Document">Document</option>
                  <option value="PDF">PDF</option>
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                  <option value="Link">Link</option>
                </select>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Date Added</label>
                <input
                  type="text"
                  value={formData.added}
                  onChange={(e) => setFormData({ ...formData, added: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g., Oct 25, 2026"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                {editingMaterial ? 'Update' : 'Create'}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500 text-center">Local preview only - changes are not persisted</p>
          </div>
        </div>
      )}

      <TutorUnavailable
        title="The materials library is not connected"
        description="Resource browsing, upload, storage, preview, and sharing require an approved materials service. No file types or upload limits are assumed."
      />
    </TutorPage>
  )
}
