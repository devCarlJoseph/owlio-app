import type { LibraryResource } from '@/components/features/materials/library-types'
import { collectOperation } from '@/services/api/contract-client'
import { getClassrooms } from '@/services/api/classroom.service'
import { getPersonalNotes } from '@/services/api/personal-workspace.service'
import { useAccountRecords } from './use-account-records'

async function loadLibrary(signal?: AbortSignal): Promise<LibraryResource[]> {
  const [materials, notes, classrooms] = await Promise.all([
    collectOperation('GET /api/v1/users/me/materials', { signal }), getPersonalNotes(signal), getClassrooms(signal),
  ])
  const shared = await Promise.all(classrooms.map(async classroom => ({ classroom, items: await collectOperation('GET /api/v1/classrooms/{classroomId}/materials', { params: { classroomId: classroom.id }, signal }) })))
  return [
    ...materials.map(material => ({ id: material.id, title: material.title, kind: 'Link' as const, source: 'personal' as const, owner: 'You', context: 'Personal library', contextHref: '/students/materials/personal', contextAction: 'Open personal library', summary: '', updated: '', availability: 'available' as const })),
    ...notes.map(note => ({ id: note.id, title: note.title, kind: 'Note' as const, source: 'personal' as const, owner: 'You', context: 'Personal notes', contextHref: '/students/notes', contextAction: 'Open notes', summary: note.content.slice(0, 160), updated: '', availability: 'available' as const })),
    ...shared.flatMap(({ classroom, items }) => items.map(item => ({ id: item.id, title: item.title, kind: 'Link' as const, source: 'classroom' as const, owner: 'Classroom', context: classroom.name, contextHref: `/students/classrooms/${classroom.id}?tab=materials`, contextAction: 'Open classroom materials', summary: '', updated: '', availability: 'available' as const }))),
  ]
}
export function useConnectedLibrary() { return useAccountRecords(loadLibrary) }
