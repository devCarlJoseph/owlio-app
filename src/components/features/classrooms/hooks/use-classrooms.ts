import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { getApiErrorMessage } from '@/services/api/api-error'
import { useClassroomPrototype } from '../context/classroom-prototype-context'
import { getClassroomCategory } from '../utils/classroom-list-meta'
import type { ClassroomView } from '../ui/classroom-list-ui'

export function useClassrooms() {
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
  const [sort, setSort] = useState('active')
  const pending = useRef(false)
  const codeRef = useRef<HTMLInputElement>(null)
  const joinTriggerRef = useRef<HTMLButtonElement>(null)
  const createTriggerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (error && showJoin) codeRef.current?.focus() }, [error, showJoin])
  const classrooms = getClassroomsForWorkspace(role)
  const filtered = classrooms.filter(item => [item.name, item.description, item.instructorName, item.subject, getClassroomCategory(item)].join(' ').toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === 'za' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name))
  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current || student) return
    pending.current = true; setCreating(true); setError('')
    const form = new FormData(event.currentTarget)
    try {
      const result = await createClassroom({ name: String(form.get('class-name') ?? ''), description: String(form.get('class-description') ?? '') }, role)
      setNotice(result.name + ' was created. Open it to copy its classroom invite and meeting codes.')
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
  return {
    role, student, classroomsLoading, classroomsError, reloadClassrooms,
    classrooms, filtered, query, setQuery, view, setView, sort, setSort,
    creating, joining, showCreate, setShowCreate, showJoin, setShowJoin,
    joinCode, setJoinCode, error, setError, notice, createdId,
    codeRef, joinTriggerRef, createTriggerRef, handleCreate, handleJoin,
  }
}
