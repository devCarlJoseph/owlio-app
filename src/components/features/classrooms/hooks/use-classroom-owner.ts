import { useEffect, useState } from 'react'
import { useAuthSession } from '@/components/features/auth/context/auth-session-context'
import { getClassroomMembers } from '@/services/api/classroom.service'
import type { Classroom } from '../types/classroom-types'

export function useClassroomOwner(classroom: Classroom) {
  const { user } = useAuthSession()
  const { id, ownerId, instructorName, isMock } = classroom
  const identity = JSON.stringify([user?.id, id, ownerId])
  const [result, setResult] = useState<{ identity: string; name: string } | null>(null)
  const knownName = instructorName.trim() || (ownerId === user?.id ? user?.name : '') || ''

  useEffect(() => {
    if (knownName || isMock || !user?.id || !ownerId) return
    const controller = new AbortController()
    async function loadOwner() {
      try {
        let cursor: string | undefined
        const seen = new Set<string>()
        do {
          const page = await getClassroomMembers(id, cursor, controller.signal)
          if (controller.signal.aborted) return
          const owner = page.items.find(member => member.id === ownerId && member.role === 'owner')
          if (owner) { setResult({ identity, name: owner.name.trim() }); return }
          cursor = page.nextCursor ?? undefined
          if (cursor && seen.has(cursor)) throw new Error('Member pagination could not continue.')
          if (cursor) seen.add(cursor)
        } while (cursor)
        setResult({ identity, name: '' })
      } catch {
        if (!controller.signal.aborted) setResult({ identity, name: '' })
      }
    }
    void loadOwner()
    return () => controller.abort()
  }, [id, ownerId, identity, knownName, isMock, user?.id])

  return {
    name: knownName || (result?.identity === identity ? result.name : ''),
    loading: !knownName && !isMock && Boolean(user?.id && ownerId) && result?.identity !== identity,
  }
}
