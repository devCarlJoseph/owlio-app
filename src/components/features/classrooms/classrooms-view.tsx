import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { Plus, Search, UserRoundPlus } from 'lucide-react'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/services/api/api-error'
import { ClassroomListHeader, ClassroomListRow, ClassroomCard } from './classroom-card'
import { GridListToggle, type ClassroomView } from './classroom-list-ui'
import { ClassroomCreateDialog, ClassroomJoinDialog } from './classroom-form-dialogs'
import { useClassroomPrototype } from './classroom-prototype-context'

export function ClassroomsView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const student = role === 'students'
  const { classroomsLoading, classroomsError, getClassroomsForWorkspace, reloadClassrooms, createClassroom, joinClassroom } = useClassroomPrototype()
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [createdId, setCreatedId] = useState('')
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ClassroomView>('grid')
  const pending = useRef(false)
  const codeRef = useRef<HTMLInputElement>(null)
  const joinTriggerRef = useRef<HTMLButtonElement>(null)
  const createTriggerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (error && showJoin) codeRef.current?.focus() }, [error, showJoin])
  const classrooms = getClassroomsForWorkspace(role)
  const filtered = classrooms.filter(item => (item.name + ' ' + item.description).toLowerCase().includes(query.trim().toLowerCase()))
  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current || student) return
    pending.current = true; setCreating(true); setError('')
    const form = new FormData(event.currentTarget)
    try {
      const result = await createClassroom({ name: String(form.get('class-name') ?? ''), description: String(form.get('class-description') ?? '') }, role)
      setNotice(result.name + ' was created. Open it now to copy its one-time invite code.')
      setCreatedId(result.id); setShowCreate(false)
    } catch (failure) { setError(getApiErrorMessage(failure, 'Classroom creation failed.')) }
    finally { pending.current = false; setCreating(false) }
  }
  async function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current) return
    pending.current = true; setJoining(true); setError('')
    try {
      const result = await joinClassroom(joinCode)
      if (result.status === 'joined') {
        setNotice(result.classroomName + ' was added to your class list.')
        setShowJoin(false); setJoinCode('')
      }
    } catch (failure) { setError(getApiErrorMessage(failure, 'Classroom enrollment failed.')) }
    finally { pending.current = false; setJoining(false) }
  }
  return <div className="mx-auto w-full max-w-7xl space-y-5">
    <section className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="text-2xl font-semibold">My Classes</h2>
        <p className="mt-2 text-sm text-muted-foreground">{student ? 'Your enrolled classrooms.' : 'Create and manage your own classrooms.'}</p></div>
      {student ? <Button ref={joinTriggerRef} aria-haspopup="dialog" onClick={() => { setError(''); setShowJoin(true) }}><UserRoundPlus aria-hidden="true" />Join a class</Button>
        : <Button ref={createTriggerRef} aria-haspopup="dialog" onClick={() => { setError(''); setShowCreate(true) }}><Plus aria-hidden="true" />Create class</Button>}
    </section>
    {notice && <div role="status" className="rounded-xl border p-4"><p>{notice}</p>
      {createdId && <Link className="mt-2 inline-block underline" to={'/' + role + '/classrooms/' + createdId}>Open created classroom</Link>}</div>}
    {classroomsError && <section role="alert" className="rounded-xl border p-4">
      <h3 className="font-semibold">Your classes could not be loaded</h3><p>{classroomsError}</p>
      <Button variant="outline" className="mt-3" onClick={reloadClassrooms}>Try again</Button></section>}
    <label className="flex items-center gap-2"><Search aria-hidden="true" className="size-4" /><span className="sr-only">Search classes</span>
      <Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search classes" /></label>
    <GridListToggle value={view} onValueChange={setView} />
    {classroomsLoading ? <p role="status">Loading classes…</p> : !classroomsError && filtered.length === 0
      ? <section className="rounded-xl border border-dashed p-8 text-center"><h3>{classrooms.length ? 'No classes match your search' : student ? 'No classes joined yet' : 'No classrooms yet'}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{student ? 'Ask your teacher for a classroom invite code.' : 'Create your first classroom to get started.'}</p></section>
      : view === 'grid' ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(classroom => <ClassroomCard key={classroom.id} classroom={classroom} role={role} href={'/' + role + '/classrooms/' + classroom.id} />)}</div>
      : <div role="table" aria-label="Classes" className="overflow-hidden rounded-xl border"><ClassroomListHeader role={role} /><div role="rowgroup">{filtered.map(classroom => <ClassroomListRow key={classroom.id} classroom={classroom} role={role} href={'/' + role + '/classrooms/' + classroom.id} />)}</div></div>}
    <ClassroomCreateDialog open={showCreate} onOpenChange={setShowCreate} onSubmit={handleCreate} pending={creating} error={error} finalFocus={() => createTriggerRef.current ?? false} />
    <ClassroomJoinDialog open={showJoin} onOpenChange={setShowJoin} onSubmit={handleJoin} code={joinCode} onCodeChange={setJoinCode}
      joining={joining} error={error} disclosure="Your account is enrolled only after the classroom service confirms the invite code." inputRef={codeRef} finalFocus={() => joinTriggerRef.current ?? false} />
  </div>
}
