import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { Plus, Search, UserRoundPlus } from 'lucide-react'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getApiErrorMessage } from '@/services/api/api-error'
import { ClassroomListHeader, ClassroomListRow, ClassroomCard } from './classroom-card'
import { FilterPills, GridListToggle, type ClassroomView } from './classroom-list-ui'
import { ClassroomCreateDialog, ClassroomJoinDialog } from './classroom-form-dialogs'
import { useClassroomPrototype } from './classroom-prototype-context'
import { ClassroomPreviewNotice } from './classroom-preview-notice'
import { getClassroomCategory } from './classroom-list-meta'

export function ClassroomsView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  const student = role === 'students'
  const { classroomsLoading, classroomsError, getClassroomsForWorkspace, reloadClassrooms, createClassroom, joinClassroom, connectedModeEnabled } = useClassroomPrototype()
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
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('active')
  const pending = useRef(false)
  const codeRef = useRef<HTMLInputElement>(null)
  const joinTriggerRef = useRef<HTMLButtonElement>(null)
  const createTriggerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (error && showJoin) codeRef.current?.focus() }, [error, showJoin])
  const classrooms = getClassroomsForWorkspace(role)
  const categories = [{ value: 'all', label: 'All Classes' }, { value: 'educators', label: 'School Classes' }, { value: 'tutors', label: 'Tutoring' }, { value: 'esl', label: 'ESL' }]
  const filtered = classrooms.filter(item => (category === 'all' || item.ownerWorkspace === category)
    && [item.name, item.description, item.instructorName, item.subject, getClassroomCategory(item)].join(' ').toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (sort === 'active' ? Number(a.previewStatus === 'inactive') - Number(b.previewStatus === 'inactive') : 0)
      || (sort === 'za' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)))
  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current || student) return
    pending.current = true; setCreating(true); setError('')
    const form = new FormData(event.currentTarget)
    try {
      const result = await createClassroom({ name: String(form.get('class-name') ?? ''), description: String(form.get('class-description') ?? '') }, role)
      setNotice(result.name + (connectedModeEnabled ? ' was created. Open it now to copy its one-time invite code.' : ' was created in this preview. Open it to copy its demo invite code.'))
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
        setNotice(result.classroomName + ' was added to your class list.' + (connectedModeEnabled ? '' : ' Preview only; resets on refresh.'))
        setShowJoin(false); setJoinCode('')
      }
    } catch (failure) { setError(getApiErrorMessage(failure, 'Classroom enrollment failed.')) }
    finally { pending.current = false; setJoining(false) }
  }
  return <div className="mx-auto w-full max-w-7xl space-y-5">
    <section className="flex flex-wrap items-start justify-between gap-4">
      <div><h2 className="text-2xl font-semibold">My Classes</h2>
        <p className="mt-2 text-sm text-muted-foreground">{student ? 'Your learning, all in one place. Pick up where your class left off.' : 'A home for your classes and the people learning with you.'}</p></div>
      {student ? <Button ref={joinTriggerRef} aria-haspopup="dialog" onClick={() => { setError(''); setShowJoin(true) }}><UserRoundPlus aria-hidden="true" />Join a class</Button>
        : <Button ref={createTriggerRef} aria-haspopup="dialog" onClick={() => { setError(''); setShowCreate(true) }}><Plus aria-hidden="true" />Create class</Button>}
    </section>
    <ClassroomPreviewNotice role={role} />
    {notice && <div role="status" className="rounded-xl border p-4"><p>{notice}</p>
      {createdId && <Link className="mt-2 inline-block underline" to={'/' + role + '/classrooms/' + createdId}>Open created classroom</Link>}</div>}
    {classroomsError && <section role="alert" className="rounded-xl border p-4">
      <h3 className="font-semibold">Your classes could not be loaded</h3><p>{classroomsError}</p>
      <Button variant="outline" className="mt-3" onClick={reloadClassrooms}>Try again</Button></section>}
    <div className="flex flex-wrap items-center gap-3">
      <label className="relative min-w-0 flex-1 basis-64"><Search aria-hidden="true" className="absolute left-3 top-3 size-4 text-muted-foreground" /><span className="sr-only">Search classes</span>
        <Input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search classes or instructors" className="h-10 bg-card pl-10" /></label>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">Sort
        <select value={sort} onChange={event => setSort(event.target.value)} className="h-10 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {!connectedModeEnabled && <option value="active">Active first</option>}<option value={connectedModeEnabled ? 'active' : 'az'}>Name A–Z</option><option value="za">Name Z–A</option>
        </select>
      </label><GridListToggle value={view} onValueChange={setView} />
    </div>
    {student && !connectedModeEnabled && <FilterPills label="Class category" options={categories.map(item => ({ ...item, count: classrooms.filter(classroom => item.value === 'all' || classroom.ownerWorkspace === item.value).length }))} value={category} onValueChange={setCategory} />}
    {student && connectedModeEnabled && <p className="text-xs text-muted-foreground">Teaching categories and active status are unavailable from the classroom service.</p>}
    {!classroomsLoading && !classroomsError && <p role="status" className="text-sm font-medium">{student ? "Classes you’ve joined" : 'Your classes'} <span className="text-muted-foreground">({filtered.length}{filtered.length !== classrooms.length ? ` of ${classrooms.length}` : ''})</span></p>}
    {classroomsLoading ? <p role="status">Loading classes…</p> : !classroomsError && filtered.length === 0
      ? <section className="rounded-xl border border-dashed p-8 text-center"><h3>{classrooms.length ? 'No classes match your search' : student ? 'No classes joined yet' : 'No classrooms yet'}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{classrooms.length ? 'Try another category or clear your search.' : student ? 'Ask your teacher for a classroom invite code.' : 'Create your first classroom to get started.'}</p>
        {classrooms.length > 0 && <Button variant="outline" className="mt-4" onClick={() => { setQuery(''); setCategory('all') }}>Clear filters</Button>}</section>
      : view === 'grid' ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(classroom => <ClassroomCard key={classroom.id} classroom={classroom} role={role} href={'/' + role + '/classrooms/' + classroom.id} />)}</div>
      : <div role="table" aria-label="Classes" className="overflow-hidden rounded-xl border"><ClassroomListHeader role={role} /><div role="rowgroup">{filtered.map(classroom => <ClassroomListRow key={classroom.id} classroom={classroom} role={role} href={'/' + role + '/classrooms/' + classroom.id} />)}</div></div>}
    {!connectedModeEnabled && student && <p className="text-xs text-muted-foreground">Try a new enrollment: use demo invite code <span className="select-all font-mono">OWL-CONVERSATION</span> to join the ESL conversation club.</p>}
    <ClassroomCreateDialog preview={!connectedModeEnabled} open={showCreate} onOpenChange={setShowCreate} onSubmit={handleCreate} pending={creating} error={error} finalFocus={() => createTriggerRef.current ?? false} />
    <ClassroomJoinDialog open={showJoin} onOpenChange={setShowJoin} onSubmit={handleJoin} code={joinCode} onCodeChange={setJoinCode}
      joining={joining} error={error} disclosure={connectedModeEnabled ? 'Your account is enrolled only after the classroom service confirms the invite code.' : 'This enrolls Alex Rivera in a demo classroom in this tab only. Try OWL-CONVERSATION. Changes reset on refresh.'} inputRef={codeRef} finalFocus={() => joinTriggerRef.current ?? false} />
  </div>
}
