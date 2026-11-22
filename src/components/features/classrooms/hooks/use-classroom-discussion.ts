import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { getApiErrorMessage } from '@/services/api/api-error'
import { createClassroomPost, editClassroomPost, getClassroomPosts, setClassReaction, type DiscussionCursor, type DiscussionPostRecord } from '@/services/api/classroom-discussion.service'

const merge = (current: DiscussionPostRecord[], added: DiscussionPostRecord[]) =>
  [...new Map([...current, ...added].map(post => [post.id, post])).values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))

// The route keys this view by account/classroom. Late reads and writes are ignored.
export function useClassroomDiscussion(classroomId: string) {
  const [posts, setPosts] = useState<DiscussionPostRecord[]>([])
  const [next, setNext] = useState<DiscussionCursor | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [readOnly, setReadOnly] = useState(true)
  const active = useRef<AbortController | null>(null)
  const pending = useRef(false)
  const revision = useRef(0)
  const retry = useRef<{ body: string; requestId: string } | null>(null)
  const reloadRef = useRef<() => Promise<void>>(async () => {})
  useEffect(() => {
    const controller = new AbortController()
    active.current = controller
    let timer: ReturnType<typeof setTimeout> | undefined
    let first = true
    const load = async () => {
      const requestedRevision = revision.current
      if (pending.current) return
      try {
        const page = await getClassroomPosts(classroomId, undefined, controller.signal)
        if (controller.signal.aborted || requestedRevision !== revision.current) return
        setPosts(current => merge(current, page.items)); setReadOnly(page.readOnly)
        if (first) setNext(page.next)
        first = false; setError('')
      } catch (cause) {
        if (controller.signal.aborted || requestedRevision !== revision.current) return
        setError(getApiErrorMessage(cause, 'Class discussion could not be loaded. Please retry.'))
        if (axios.isAxiosError(cause) && [401, 403, 404].includes(cause.response?.status ?? 0)) {
          setPosts([]); setNext(null); setReadOnly(true)
        }
      } finally { if (!controller.signal.aborted) setLoading(false) }
    }
    reloadRef.current = load
    const poll = async () => { await load(); if (!controller.signal.aborted) timer = setTimeout(() => void poll(), 10000) }
    void poll()
    return () => { controller.abort(); if (timer) clearTimeout(timer) }
  }, [classroomId])
  const loadOlder = async () => {
    const controller = active.current
    if (!next || !controller || controller.signal.aborted || pending.current) return
    pending.current = true; revision.current++; setBusy(true)
    try {
      const page = await getClassroomPosts(classroomId, next, controller.signal)
      if (!controller.signal.aborted) { setPosts(current => merge(current, page.items)); setNext(page.next); setReadOnly(page.readOnly) }
    } catch (cause) { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Older posts could not be loaded.')) }
    finally { pending.current = false; if (!controller.signal.aborted) setBusy(false) }
  }
  const create = async (body: string) => {
    const controller = active.current
    if (!controller || controller.signal.aborted || pending.current || readOnly) return false
    pending.current = true; revision.current++; setBusy(true); setError('')
    if (retry.current?.body !== body) retry.current = { body, requestId: crypto.randomUUID() }
    try {
      const saved = await createClassroomPost(classroomId, retry.current.requestId, body)
      if (controller.signal.aborted) return false
      setPosts(current => merge(current, [saved])); retry.current = null
      return true
    } catch (cause) { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Post was not confirmed. Your draft is still here.')); return false }
    finally { pending.current = false; if (!controller.signal.aborted) setBusy(false) }
  }
  const react = async (postId: string, emoji: string, desired: boolean) => {
    const controller = active.current
    if (!controller || controller.signal.aborted || pending.current || readOnly) return
    pending.current = true; revision.current++; setBusy(true); setError('')
    try {
      const saved = await setClassReaction(classroomId, postId, emoji, desired)
      if (!controller.signal.aborted) setPosts(current => merge(current, [saved]))
    } catch (cause) { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Reaction was not confirmed. Try again.')) }
    finally { pending.current = false; if (!controller.signal.aborted) setBusy(false) }
  }
  const edit = async (postId: string, body: string, expectedEditedAt: string | null) => {
    const controller = active.current
    if (!controller || controller.signal.aborted || pending.current || readOnly) return false
    pending.current = true; revision.current++; setBusy(true)
    try {
      const saved = await editClassroomPost(classroomId, postId, { body, expectedEditedAt })
      if (controller.signal.aborted) return false
      setPosts(current => merge(current, [saved]))
      return true
    } finally { pending.current = false; if (!controller.signal.aborted) setBusy(false) }
  }
  return { posts, next, loading, busy, error, readOnly, create, react, edit, loadOlder, reload: () => reloadRef.current() }
}
