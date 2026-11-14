import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/services/api/api-error'
import { archivePersonalSubject, deletePersonalNote, getPersonalNotes, getPersonalSubjects, getPersonalTasks,
  savePersonalNote, savePersonalSubject, savePersonalTask, togglePersonalTask,
  type PersonalNote, type PersonalSubject, type PersonalTask } from '@/services/api/personal-workspace.service'
import { useAccountRecords } from './use-account-records'

const card = 'space-y-3 rounded-2xl border bg-card p-5'
type StatusProps = { loading: boolean; error: string; reload: () => void }
export function RecordStatus({ loading, error, reload }: StatusProps) {
  if (loading) return <p role="status">Loading your records…</p>
  return error ? <div role="alert" className={card}><p>{error}</p><Button variant="outline" onClick={reload}>Try again</Button></div> : null
}

export function PersonalSubjects({ subjectId }: { subjectId?: string }) {
  const state = useAccountRecords(getPersonalSubjects)
  const [editing, setEditing] = useState<PersonalSubject | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const selected = subjectId ? state.records.filter(item => item.id === subjectId) : state.records
  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    setBusy(true); setError('')
    try {
      const saved = await savePersonalSubject({ name: name.trim(), description }, editing ?? undefined)
      state.setRecords(items => editing ? items.map(item => item.id === saved.id ? saved : item) : [...items, saved])
      setEditing(null); setName(''); setDescription('')
    } catch (cause) { setError(getApiErrorMessage(cause, 'Could not save the subject. Your draft is still here.')) }
    finally { setBusy(false) }
  }
  const archive = async (item: PersonalSubject) => {
    setBusy(true); setError('')
    try { await archivePersonalSubject(item); state.setRecords(items => items.filter(record => record.id !== item.id)) }
    catch (cause) { setError(getApiErrorMessage(cause, 'Could not archive the subject.')) }
    finally { setBusy(false) }
  }
  return <section className="mx-auto max-w-5xl space-y-5">
    <header><h2 className="text-2xl font-semibold">My Learning</h2><p className="mt-2 text-sm text-muted-foreground">Your personal subjects, saved to your account.</p></header>
    {subjectId && <Link to="/students/subjects" className="underline">All subjects</Link>}
    <RecordStatus {...state} />
    {error && <p role="alert">{error} Reload the list before retrying a conflicting edit.</p>}
    {!state.loading && !state.error && <>
      <form onSubmit={event => void save(event)} className={card} aria-label="Subject editor">
        <h3 className="font-semibold">{editing ? 'Edit subject' : 'Add a subject'}</h3>
        <label className="block space-y-2"><span className="text-sm">Subject name</span><Input required maxLength={120} value={name} onChange={event => setName(event.target.value)} disabled={busy} /></label>
        <label className="block space-y-2"><span className="text-sm">Description</span><Textarea maxLength={2000} value={description} onChange={event => setDescription(event.target.value)} disabled={busy} /></label>
        <div className="flex gap-2"><Button disabled={busy || !name.trim()}>{busy ? 'Saving…' : 'Save subject'}</Button>{editing && <Button type="button" variant="outline" disabled={busy} onClick={() => { setEditing(null); setName(''); setDescription('') }}>Cancel edit</Button>}</div>
      </form>
      <div className="flex justify-end"><Button variant="outline" disabled={busy} onClick={state.reload}>Reload subjects</Button></div>
      {selected.length === 0 && <p className={card}>{subjectId ? 'This subject is not in your active subjects.' : 'No subjects yet. Add your first subject above.'}</p>}
      <div className="grid gap-4 sm:grid-cols-2">{selected.map(item => <article key={item.id} className={card}>
        <h3 className="font-semibold"><Link className="underline" to={'/students/subjects/' + item.id}>{item.name}</Link></h3><p className="whitespace-pre-wrap text-sm">{item.description || 'No description.'}</p>
        <div className="flex gap-2"><Button variant="outline" disabled={busy} onClick={() => { setEditing(item); setName(item.name); setDescription(item.description) }}>Edit</Button><Button variant="outline" disabled={busy || editing?.id === item.id} onClick={() => void archive(item)}>Archive</Button></div>
      </article>)}</div>
    </>}
  </section>
}

function localDateTime(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export function PersonalTasks() {
  const state = useAccountRecords(getPersonalTasks)
  const [editing, setEditing] = useState<PersonalTask | null>(null)
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    setBusy(true); setError('')
    try {
      const saved = await savePersonalTask({ title: title.trim(), dueAt: due ? new Date(due).toISOString() : null }, editing ?? undefined)
      state.setRecords(items => editing ? items.map(item => item.id === saved.id ? saved : item) : [...items, saved])
      setEditing(null); setTitle(''); setDue('')
    } catch (cause) { setError(getApiErrorMessage(cause, 'Could not save the task. Your draft is still here.')) }
    finally { setBusy(false) }
  }
  const toggle = async (item: PersonalTask) => {
    setBusy(true); setError('')
    try { const saved = await togglePersonalTask(item); state.setRecords(items => items.map(record => record.id === saved.id ? saved : record)) }
    catch (cause) { setError(getApiErrorMessage(cause, 'Could not update the task. Reload before retrying.')) }
    finally { setBusy(false) }
  }
  return <section className="mx-auto max-w-5xl space-y-5">
    <header><h2 className="text-2xl font-semibold">My Tasks</h2><p className="mt-2 text-sm text-muted-foreground">Personal learning tasks. Completion does not affect classroom grades.</p></header>
    <RecordStatus {...state} />{error && <p role="alert">{error}</p>}
    {!state.loading && !state.error && <>
      <form className={card} onSubmit={event => void save(event)} aria-label="Task editor">
        <h3 className="font-semibold">{editing ? 'Edit task' : 'Add a task'}</h3>
        <label className="block space-y-2"><span className="text-sm">Title</span><Input required maxLength={120} value={title} onChange={event => setTitle(event.target.value)} disabled={busy} /></label>
        <label className="block space-y-2"><span className="text-sm">Due date and time (optional)</span><Input type="datetime-local" value={due} onChange={event => setDue(event.target.value)} disabled={busy} /></label>
        <div className="flex gap-2"><Button disabled={busy || !title.trim()}>{busy ? 'Saving…' : 'Save task'}</Button>{editing && <Button type="button" variant="outline" disabled={busy} onClick={() => { setEditing(null); setTitle(''); setDue('') }}>Cancel edit</Button>}</div>
      </form>
      <Button variant="outline" disabled={busy} onClick={state.reload}>Reload tasks</Button>
      {state.records.length === 0 && <p className={card}>No tasks yet.</p>}
      <ul className="space-y-3">{state.records.map(item => <li key={item.id} className={card}>
        <h3 className="font-semibold">{item.title}</h3><p className="text-sm">{item.completedAt ? 'Complete' : 'To do'}{item.dueAt ? ' · Due ' + new Date(item.dueAt).toLocaleString() : ''}</p>
        <div className="flex gap-2"><Button variant="outline" disabled={busy || editing?.id === item.id} onClick={() => void toggle(item)}>{item.completedAt ? 'Reopen' : 'Mark complete'}</Button><Button variant="outline" disabled={busy} onClick={() => { setEditing(item); setTitle(item.title); setDue(localDateTime(item.dueAt)) }}>Edit</Button></div>
      </li>)}</ul>
    </>}
  </section>
}

export function PersonalNotes() {
  const state = useAccountRecords(getPersonalNotes)
  const subjects = useAccountRecords(getPersonalSubjects)
  const [editing, setEditing] = useState<PersonalNote | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<PersonalNote | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const clear = () => { setEditing(null); setTitle(''); setContent(''); setSubjectId('') }
  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    setBusy(true); setError('')
    try {
      const saved = await savePersonalNote({ title: title.trim(), content, subjectId: subjectId || null }, editing ?? undefined)
      state.setRecords(items => editing ? items.map(item => item.id === saved.id ? saved : item) : [...items, saved])
      clear()
    } catch (cause) { setError(getApiErrorMessage(cause, 'Could not save the note. Your draft is still here.')) }
    finally { setBusy(false) }
  }
  const remove = async () => {
    if (!deleteTarget || busy) return
    setBusy(true); setError('')
    try { await deletePersonalNote(deleteTarget); state.setRecords(items => items.filter(item => item.id !== deleteTarget.id)); setDeleteTarget(null) }
    catch (cause) { setError(getApiErrorMessage(cause, 'Could not delete the note. Reload before retrying.')) }
    finally { setBusy(false) }
  }
  return <section className="mx-auto max-w-5xl space-y-5">
    <header><h2 className="text-2xl font-semibold">My Notes</h2><p className="mt-2 text-sm text-muted-foreground">Private notes saved to your account.</p></header>
    <RecordStatus {...state} />{error && <p role="alert">{error}</p>}
    {!state.loading && !state.error && <>
      <form className={card} onSubmit={event => void save(event)} aria-label="Note editor">
        <h3 className="font-semibold">{editing ? 'Edit note' : 'Add a note'}</h3>
        <label className="block space-y-2"><span className="text-sm">Title</span><Input required maxLength={120} value={title} onChange={event => setTitle(event.target.value)} disabled={busy} /></label>
        <label className="block space-y-2"><span className="text-sm">Subject (optional)</span><select value={subjectId} onChange={event => setSubjectId(event.target.value)} disabled={busy || subjects.loading || Boolean(subjects.error)} className="h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="">No subject</option>{editing?.subjectId && !subjects.records.some(item => item.id === editing.subjectId) && <option value={editing.subjectId}>Current subject</option>}{subjects.records.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        {subjects.error && <RecordStatus {...subjects} />}
        <label className="block space-y-2"><span className="text-sm">Content</span><Textarea rows={8} maxLength={12000} value={content} onChange={event => setContent(event.target.value)} disabled={busy} /></label>
        <div className="flex gap-2"><Button disabled={busy || !title.trim()}>{busy ? 'Saving…' : 'Save note'}</Button>{editing && <Button type="button" variant="outline" disabled={busy} onClick={clear}>Cancel edit</Button>}</div>
      </form>
      <Button variant="outline" disabled={busy} onClick={state.reload}>Reload notes</Button>
      {deleteTarget && <section role="alertdialog" aria-label="Delete note" aria-describedby="delete-note-description" className={card}><p id="delete-note-description">Delete “{deleteTarget.title}” from your account?</p><div className="flex gap-2"><Button disabled={busy} onClick={() => void remove()}>Delete note</Button><Button variant="outline" disabled={busy} onClick={() => setDeleteTarget(null)}>Keep note</Button></div></section>}
      {state.records.length === 0 && <p className={card}>No notes yet.</p>}
      <div className="grid gap-4 sm:grid-cols-2">{state.records.map(item => <article key={item.id} className={card}>
        <h3 className="font-semibold">{item.title}</h3><p className="whitespace-pre-wrap break-words text-sm">{item.content || 'Empty note.'}</p>
        <div className="flex gap-2"><Button variant="outline" disabled={busy} onClick={() => { setEditing(item); setTitle(item.title); setContent(item.content); setSubjectId(item.subjectId ?? '') }}>Edit</Button><Button variant="outline" disabled={busy || editing?.id === item.id} onClick={() => setDeleteTarget(item)}>Delete</Button></div>
      </article>)}</div>
    </>}
  </section>
}
