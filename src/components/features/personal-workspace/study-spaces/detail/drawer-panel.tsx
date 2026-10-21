import { useEffect, useRef, useState } from "react"
import { Download, FileText, Pencil, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  addDrawerFile,
  drawerAcceptAttr,
  drawerMaxFiles,
  drawerNotice,
  formatFileSize,
  getDrawerFileBlob,
  isDrawerStorageAvailable,
  listDrawerFiles,
  removeDrawerFile,
  renameDrawerFile,
  validateDrawerFile,
  type DrawerFileMeta,
} from "./drawer-storage"

type DrawerPanelProps = {
  spaceId: string
  onClose: () => void
}

export function DrawerPanel({ spaceId, onClose }: DrawerPanelProps) {
  const available = isDrawerStorageAvailable()
  const [files, setFiles] = useState<DrawerFileMeta[]>([])
  const [loading, setLoading] = useState(available)
  const [error, setError] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState("")
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!available) return
    let active = true
    listDrawerFiles(spaceId)
      .then((list) => active && setFiles(list))
      .catch(() => active && setError("Your drawer could not be read in this browser."))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [available, spaceId])

  async function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list)
    let count = files.length
    const added: DrawerFileMeta[] = []
    let message: string | null = null

    for (const file of incoming) {
      const problem = validateDrawerFile(file, count)
      if (problem) {
        message = problem
        continue
      }
      try {
        added.push(await addDrawerFile(spaceId, file))
        count += 1
      } catch {
        message = `"${file.name}" could not be saved. Browser storage may be full.`
      }
    }

    if (added.length > 0) setFiles((current) => [...added, ...current])
    setError(message)
  }

  async function handleRemove(file: DrawerFileMeta) {
    try {
      await removeDrawerFile(file.id)
      setFiles((current) => current.filter((entry) => entry.id !== file.id))
    } catch {
      setError(`"${file.name}" could not be removed.`)
    }
  }

  async function handleRename(file: DrawerFileMeta) {
    const name = renameDraft.trim()
    setRenamingId(null)
    if (name.length === 0 || name === file.name) return
    try {
      await renameDrawerFile(file.id, name)
      setFiles((current) => current.map((entry) => (entry.id === file.id ? { ...entry, name } : entry)))
    } catch {
      setError(`"${file.name}" could not be renamed.`)
    }
  }

  async function handleOpen(file: DrawerFileMeta) {
    const blob = await getDrawerFileBlob(file.id).catch(() => null)
    if (!blob) {
      setError(`"${file.name}" could not be opened.`)
      return
    }
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = file.name
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }

  return (
    <div
      role="dialog"
      aria-label="My drawer"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose()
      }}
      className="absolute inset-y-3 left-3 z-20 flex w-80 max-w-[92%] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg motion-safe:animate-in motion-safe:slide-in-from-left-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2">
        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <FileText className="size-4 text-emerald-800" aria-hidden="true" />
          My drawer
          <span className="text-xs font-normal text-slate-500">
            {files.length}/{drawerMaxFiles}
          </span>
        </p>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose} aria-label="Close my drawer">
          <X aria-hidden="true" />
        </Button>
      </div>

      <p className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
        {drawerNotice} Other people&apos;s drawers are private.
      </p>

      {available ? (
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            void addFiles(event.dataTransfer.files)
          }}
          className={`m-3 flex items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs ${
            dragging ? "border-emerald-600 bg-emerald-50" : "border-slate-300"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={drawerAcceptAttr}
            className="sr-only"
            aria-label="Choose files for my drawer"
            onChange={(event) => {
              if (event.target.files) void addFiles(event.target.files)
              event.target.value = ""
            }}
          />
          <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
            <Upload aria-hidden="true" />
            Add files
          </Button>
          <span className="text-slate-500">or drop here · pdf, images, txt, docx · 10 MB max</span>
        </div>
      ) : (
        <p className="m-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          This browser cannot store files locally, so the drawer is unavailable.
        </p>
      )}

      {error ? (
        <p role="alert" className="mx-3 mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <ul aria-label="Files in my drawer" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {loading ? <li className="text-xs text-slate-500">Opening your drawer…</li> : null}
        {!loading && available && files.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
            Your drawer is empty. Add the files you work on in this space.
          </li>
        ) : null}
        {files.map((file) => (
          <li key={file.id} className="rounded-lg border border-slate-200 p-2">
            {renamingId === file.id ? (
              <form
                className="flex items-center gap-1"
                onSubmit={(event) => {
                  event.preventDefault()
                  void handleRename(file)
                }}
              >
                <Input
                  value={renameDraft}
                  onChange={(event) => setRenameDraft(event.target.value)}
                  aria-label={`New name for ${file.name}`}
                  maxLength={120}
                  autoFocus
                />
                <Button type="submit" size="xs">
                  Save
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {formatFileSize(file.size)} · added {new Date(file.addedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="icon-xs" aria-label={`Download ${file.name}`} onClick={() => void handleOpen(file)}>
                  <Download aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Rename ${file.name}`}
                  onClick={() => {
                    setRenamingId(file.id)
                    setRenameDraft(file.name)
                  }}
                >
                  <Pencil aria-hidden="true" />
                </Button>
                <Button type="button" variant="ghost" size="icon-xs" aria-label={`Remove ${file.name}`} onClick={() => void handleRemove(file)}>
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
