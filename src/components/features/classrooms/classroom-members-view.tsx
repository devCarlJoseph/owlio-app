import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/api-error'
import { getClassroomStudents, type ApiPage, type ApiStudent } from '@/services/api/classroom.service'
import type { Classroom, WorkspaceRole } from './classroom-types'

export function ClassroomMembersView({ classroom }: { classroom: Classroom; role: WorkspaceRole }) {
  return classroom.access !== 'owner' ? <p>Only the classroom owner can view the student roster.</p> : <Roster key={classroom.id} classroomId={classroom.id} />
}
function Roster({ classroomId }: { classroomId: string }) {
  const [page, setPage] = useState<ApiPage<ApiStudent>>({ items: [], nextCursor: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    getClassroomStudents(classroomId, undefined, controller.signal).then(result => {
      if (!controller.signal.aborted) { setPage(result); setError('') }
    }).catch(failure => { if (!controller.signal.aborted) setError(getApiErrorMessage(failure, 'Students could not be loaded.')) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [classroomId, reload])
  async function more() {
    if (loading || !page.nextCursor) return
    setLoading(true); setError('')
    try {
      const result = await getClassroomStudents(classroomId, page.nextCursor)
      setPage(current => ({ items: [...current.items, ...result.items], nextCursor: result.nextCursor }))
    } catch (failure) { setError(getApiErrorMessage(failure, 'More students could not be loaded.')) }
    finally { setLoading(false) }
  }
  return <section className="space-y-3"><h3 className="text-lg font-semibold">Students</h3>
    {error && <div role="alert"><p>{error}</p><Button variant="outline" onClick={() => { setLoading(true); setReload(value => value + 1) }}>Try again</Button></div>}
    {loading && <p role="status">Loading students…</p>}
    {!loading && !error && page.items.length === 0 && <p>No students have joined yet.</p>}
    <ul className="divide-y">{page.items.map(student => <li key={student.studentId} className="py-3">{student.name}</li>)}</ul>
    {page.nextCursor && <Button variant="outline" disabled={loading} onClick={() => void more()}>Load more students</Button>}
    <p className="text-sm text-muted-foreground">Students join using the private invite code. Adding or removing members here is not available yet.</p>
  </section>
}
