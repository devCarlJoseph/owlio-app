export type WorkKind = "document" | "presentation"
export type BlockKind = "paragraph" | "heading" | "bullets"
export type WorkBlock = {
  id: string
  kind: BlockKind
  text: string
  bold: boolean
  italic: boolean
  align: "left" | "center" | "right"
}
export type WorkSlide = { id: string; title: string; body: string; notes: string; theme: "paper" | "sage" | "midnight" }
export type LibraryWork = {
  version: 1
  id: string
  kind: WorkKind
  title: string
  taskId: string
  updatedAt: string
  blocks: WorkBlock[]
  slides: WorkSlide[]
}

export const workStoragePrefix = "owlio.study-library-work.v1."
export const workHref = (id: string) => `/students/materials/workspace/${encodeURIComponent(id)}`
export const createWorkId = () => crypto.randomUUID()
export const createBlock = (): WorkBlock => ({ id: createWorkId(), kind: "paragraph", text: "", bold: false, italic: false, align: "left" })
export const createSlide = (): WorkSlide => ({ id: createWorkId(), title: "", body: "", notes: "", theme: "paper" })

export function createWork(kind: WorkKind, title: string): LibraryWork {
  return { version: 1, id: createWorkId(), kind, title: title.trim() || (kind === "document" ? "Untitled document" : "Untitled presentation"), taskId: "", updatedAt: new Date().toISOString(), blocks: kind === "document" ? [createBlock()] : [], slides: kind === "presentation" ? [createSlide()] : [] }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function isLibraryWork(value: unknown): value is LibraryWork {
  if (!isObject(value)) return false
  return value.version === 1 && typeof value.id === "string" && value.id.length > 0 &&
    (value.kind === "document" || value.kind === "presentation") && typeof value.title === "string" &&
    typeof value.taskId === "string" && typeof value.updatedAt === "string" && Number.isFinite(Date.parse(value.updatedAt)) &&
    Array.isArray(value.blocks) && value.blocks.every(block => isObject(block) && typeof block.id === "string" && block.id.length > 0 &&
      ["paragraph", "heading", "bullets"].includes(String(block.kind)) && typeof block.text === "string" &&
      typeof block.bold === "boolean" && typeof block.italic === "boolean" && ["left", "center", "right"].includes(String(block.align))) &&
    Array.isArray(value.slides) && value.slides.every(slide => isObject(slide) && typeof slide.id === "string" && slide.id.length > 0 &&
      typeof slide.title === "string" && typeof slide.body === "string" && typeof slide.notes === "string" &&
      ["paper", "sage", "midnight"].includes(String(slide.theme))) &&
    new Set(value.blocks.map(block => block.id)).size === value.blocks.length &&
    new Set(value.slides.map(slide => slide.id)).size === value.slides.length &&
    (value.kind === "document" ? value.blocks.length > 0 && value.slides.length === 0 : value.slides.length > 0 && value.blocks.length === 0)
}

export function loadWork(id: string): LibraryWork | null {
  const raw = localStorage.getItem(workStoragePrefix + id)
  if (!raw) return null
  const value: unknown = JSON.parse(raw)
  if (!isLibraryWork(value) || value.id !== id) throw new Error("Unreadable local work")
  return value
}

export function listWork(): { items: LibraryWork[]; error: boolean } {
  const items: LibraryWork[] = []
  let error = false
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(workStoragePrefix)) continue
      try {
        const item = loadWork(key.slice(workStoragePrefix.length))
        if (item) items.push(item)
      } catch { error = true }
    }
  } catch { error = true }
  return { items: items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), error }
}

export function saveWork(work: LibraryWork, expectedRevision: string | null): void {
  const current = loadWork(work.id)
  if ((current?.updatedAt ?? null) !== expectedRevision) throw new Error("Local work changed elsewhere")
  localStorage.setItem(workStoragePrefix + work.id, JSON.stringify(work))
}

export function reviseWork(work: LibraryWork): LibraryWork {
  return { ...work, updatedAt: new Date(Math.max(Date.now(), Date.parse(work.updatedAt) + 1)).toISOString() }
}
