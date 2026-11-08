export type DrawerFileMeta = {
  id: string
  spaceId: string
  name: string
  type: string
  size: number
  addedAt: string
}

type DrawerFileRecord = DrawerFileMeta & { blob: Blob }

export const drawerNotice =
  "Files stay on this device. They are not uploaded, shared with other students, or sent to a service."

export const drawerMaxFileBytes = 10 * 1024 * 1024
export const drawerMaxFiles = 25
export const drawerAllowedExtensions = ["pdf", "png", "jpg", "jpeg", "gif", "webp", "txt", "docx"]
export const drawerAcceptAttr = drawerAllowedExtensions.map((extension) => `.${extension}`).join(",")

const DB_NAME = "owlio-study-space-drawer"
const STORE = "files"

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function validateDrawerFile(file: { name: string; size: number }, existingCount: number): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
  if (!drawerAllowedExtensions.includes(extension)) {
    return `"${file.name}" is not supported. Use pdf, images, txt, or docx files.`
  }
  if (file.size > drawerMaxFileBytes) return `"${file.name}" is larger than 10 MB.`
  if (existingCount >= drawerMaxFiles) return `Your drawer is full (${drawerMaxFiles} files).`
  return null
}

export function isDrawerStorageAvailable(): boolean {
  return typeof indexedDB !== "undefined"
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: "id" })
      store.createIndex("spaceId", "spaceId")
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode)
        const request = action(transaction.objectStore(STORE))
        transaction.oncomplete = () => {
          db.close()
          resolve(request.result)
        }
        transaction.onerror = () => {
          db.close()
          reject(transaction.error)
        }
      })
  )
}

export async function listDrawerFiles(spaceId: string): Promise<DrawerFileMeta[]> {
  const records = await run<DrawerFileRecord[]>("readonly", (store) => store.index("spaceId").getAll(spaceId))
  return records
    .map((record) => ({
      id: record.id,
      spaceId: record.spaceId,
      name: record.name,
      type: record.type,
      size: record.size,
      addedAt: record.addedAt,
    }))
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
}

export async function addDrawerFile(spaceId: string, file: File): Promise<DrawerFileMeta> {
  const meta: DrawerFileMeta = {
    id: crypto.randomUUID(),
    spaceId,
    name: file.name,
    type: file.type,
    size: file.size,
    addedAt: new Date().toISOString(),
  }
  await run("readwrite", (store) => store.put({ ...meta, blob: file } satisfies DrawerFileRecord))
  return meta
}

export async function renameDrawerFile(id: string, name: string): Promise<void> {
  const record = await run<DrawerFileRecord | undefined>("readonly", (store) => store.get(id))
  if (!record) return
  await run("readwrite", (store) => store.put({ ...record, name }))
}

export async function removeDrawerFile(id: string): Promise<void> {
  await run("readwrite", (store) => store.delete(id))
}

export async function getDrawerFileBlob(id: string): Promise<Blob | null> {
  const record = await run<DrawerFileRecord | undefined>("readonly", (store) => store.get(id))
  return record?.blob ?? null
}
