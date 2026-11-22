import { ClassroomListSkeleton } from '../ui/classroom-list-skeleton'
import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { Plus, UserRoundPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getApiErrorMessage } from '@/services/api/api-error'
import { ClassroomListHeader, ClassroomListRow, ClassroomCard } from '../ui/classroom-card'
import { ClassroomListToolbar } from '../ui/classroom-list-toolbar'
import { ClassroomCreateDialog, ClassroomJoinDialog } from '../forms/classroom-form-dialogs'

import { useClassrooms } from '../hooks/use-classrooms'
import { useClassroomPrototype } from '../context/classroom-prototype-context'
import type { Classroom } from '../types/classroom-types'

export function ClassroomsView() {
  const {
    role, student, classroomsLoading, classroomsError, reloadClassrooms,
    classrooms, filtered, query, setQuery, view, setView, sort, setSort,
    creating, joining, showCreate, setShowCreate, showJoin, setShowJoin,
    joinCode, setJoinCode, error, setError, notice, createdId,
    codeRef, joinTriggerRef, createTriggerRef, handleCreate, handleJoin,
  } = useClassrooms()
  const { manageClassroom } = useClassroomPrototype()
  const [selected, setSelected] = useState<Classroom | null>(null)
  const [managementError, setManagementError] = useState('')
  const [managementNotice, setManagementNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const pending = useRef(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const deleting = Boolean(selected?.archivedAt)

  function managementAction(classroom: Classroom) {
    if (student || classroom.isMock || classroom.access !== 'owner' || !manageClassroom) return undefined
    return () => { setManagementError(''); setSelected(classroom) }
  }

  async function confirmManagement() {
    if (!selected || !manageClassroom || pending.current) return
    pending.current = true
    setSaving(true)
    setManagementError('')
    try {
      await manageClassroom(selected.id, deleting ? 'delete' : 'end')
      setManagementNotice(deleting ? `${selected.name} was deleted for everyone.` : `${selected.name} has ended.`)
      setSelected(null)
    } catch (cause) {
      setManagementError(getApiErrorMessage(cause, deleting ? 'Could not delete the classroom.' : 'Could not end the classroom.'))
    } finally {
      pending.current = false
      setSaving(false)
    }
  }
  return <div className="mx-auto w-full max-w-7xl space-y-5">
    <section className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="text-2xl font-semibold">My Classes</h2>
        <p className="mt-2 text-sm text-muted-foreground">{student ? 'Your learning, all in one place. Pick up where your class left off.' : 'A home for your classes and the people learning with you.'}</p></div>
      {student ? <Button ref={joinTriggerRef} aria-haspopup="dialog" onClick={() => { setError(''); setShowJoin(true) }}><UserRoundPlus aria-hidden="true" />Join a class</Button>
        : <Button ref={createTriggerRef} aria-haspopup="dialog" onClick={() => { setError(''); setShowCreate(true) }}><Plus aria-hidden="true" />Create class</Button>}
    </section>
    {notice && <div role="status" className="rounded-xl border p-4"><p>{notice}</p>
      {createdId && <Link className="mt-2 inline-block underline" to={'/' + role + '/classrooms/' + createdId}>Open created classroom</Link>}</div>}
    {managementNotice && <p role="status" className="rounded-xl border p-4">{managementNotice}</p>}
    {classroomsError && <section role="alert" className="rounded-xl border p-4">
      <h3 className="font-semibold">Your classes could not be loaded</h3><p>{classroomsError}</p>
      <Button variant="outline" className="mt-3" onClick={reloadClassrooms}>Try again</Button></section>}
    <ClassroomListToolbar query={query} onQueryChange={setQuery} sort={sort} onSortChange={setSort} view={view} onViewChange={setView} />
    {student && classrooms.some(classroom => classroom.ownerWorkspace === null) && <p className="text-xs text-muted-foreground">Some classrooms do not have a teaching category.</p>}
    {!classroomsLoading && !classroomsError && <p role="status" className="text-sm font-medium">{student ? "Classes you’ve joined" : 'Your classes'} <span className="text-muted-foreground">({filtered.length}{filtered.length !== classrooms.length ? ` of ${classrooms.length}` : ''})</span></p>}
    {classroomsLoading ? <ClassroomListSkeleton view={view} /> : !classroomsError && filtered.length === 0
      ? <section className="rounded-xl border border-dashed p-8 text-center"><h3>{classrooms.length ? 'No classes match your search' : student ? 'No classes joined yet' : 'No classrooms yet'}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{classrooms.length ? 'Clear your search to see your other classes.' : student ? 'Ask your teacher for a classroom invite code.' : 'Create your first classroom to get started.'}</p>
        {classrooms.length > 0 && <Button variant="outline" className="mt-4" onClick={() => { setQuery('') }}>Clear filters</Button>}</section>
      : view === 'grid' ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(classroom => <ClassroomCard key={classroom.id} classroom={classroom} role={role} href={'/' + role + '/classrooms/' + classroom.id} onManage={managementAction(classroom)} />)}</div>
      : <div role="table" aria-label="Classes" className="overflow-hidden rounded-xl border"><ClassroomListHeader role={role} /><div role="rowgroup">{filtered.map(classroom => <ClassroomListRow key={classroom.id} classroom={classroom} role={role} href={'/' + role + '/classrooms/' + classroom.id} onManage={managementAction(classroom)} />)}</div></div>}
    <ClassroomCreateDialog open={showCreate} onOpenChange={setShowCreate} onSubmit={handleCreate} pending={creating} error={error} finalFocus={() => createTriggerRef.current ?? false} />
    <ClassroomJoinDialog open={showJoin} onOpenChange={setShowJoin} onSubmit={handleJoin} code={joinCode} onCodeChange={setJoinCode}
      joining={joining} error={error} disclosure="Your account is enrolled only after the classroom service confirms the invite code." inputRef={codeRef} finalFocus={() => joinTriggerRef.current ?? false} />
    <Dialog open={Boolean(selected)} onOpenChange={open => { if (!open && !pending.current) setSelected(null) }}>
      <DialogContent initialFocus={cancelRef} finalFocus={() => createTriggerRef.current ?? false} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{deleting ? 'Delete classroom for everyone?' : 'End classroom?'}</DialogTitle>
          <DialogDescription>{deleting
            ? `“${selected?.name}” will be removed from your workspace and from every student's classroom list. Academic records are retained.`
            : `Ending “${selected?.name}” closes classroom invites and live meeting access. You can delete the classroom after it ends.`}</DialogDescription>
        </DialogHeader>
        {managementError && <p role="alert" className="text-destructive">{managementError}</p>}
        <DialogFooter>
          <Button ref={cancelRef} variant="outline" disabled={saving} onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="destructive" disabled={saving} onClick={() => void confirmManagement()}>
            {deleting ? (saving ? 'Deleting…' : 'Delete classroom') : (saving ? 'Ending…' : 'End classroom')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
}
