import type { LibraryWork } from "./work-records"

type UnsavedWork = { work: LibraryWork; savedRevision: string }
const unsavedWork = new Map<string, UnsavedWork>()

export const getUnsavedWork = (id: string) => unsavedWork.get(id)
export const retainUnsavedWork = (work: LibraryWork, savedRevision: string) => unsavedWork.set(work.id, { work, savedRevision })
export const forgetUnsavedWork = (id: string) => unsavedWork.delete(id)
