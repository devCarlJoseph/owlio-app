import { LoadingSkeleton, SkeletonLines } from '@/components/ui/loading-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/api-error'
import { addClassComment, editClassComment, getClassComments, type DiscussionCommentRecord, type DiscussionCursor } from '@/services/api/classroom-discussion.service'
import { DiscussionComposer } from '../forms/discussion-composer'
import { PersonAvatar } from './classroom-ui'
import { DiscussionEntryBody } from './discussion-entry-body'

const merge = (current: DiscussionCommentRecord[], added: DiscussionCommentRecord[]) => [...new Map([...current, ...added].map(item => [item.id, item])).values()]
  .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))

export function ClassComments({ classroomId, postId, currentUserId, authorName, disabled, onComment }: {
  classroomId: string; postId: string; currentUserId?: string; authorName: string; disabled: boolean; onComment: () => void
}) {
  const [comments, setComments] = useState<DiscussionCommentRecord[]>([])
  const [next, setNext] = useState<DiscussionCursor | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const active = useRef<AbortController | null>(null)
  const retry = useRef<{ body: string; requestId: string } | null>(null)
  const pending = useRef(false)
  const revision = useRef(0)
  const reload = useRef<() => Promise<void>>(async () => {})
  useEffect(() => {
    const controller = new AbortController()
    active.current = controller
    let first = true
    let timer: ReturnType<typeof setTimeout> | undefined
    const load = async () => {
      if (pending.current) return
      const requestedRevision = revision.current
      try {
        const page = await getClassComments(classroomId, postId, undefined, controller.signal)
        if (controller.signal.aborted || requestedRevision !== revision.current) return
        setComments(current => merge(current, page.items)); if (first) setNext(page.next)
        first = false; setError('')
      } catch (cause) {
        if (controller.signal.aborted || requestedRevision !== revision.current) return
        if (axios.isAxiosError(cause) && [401, 403, 404].includes(cause.response?.status ?? 0)) {
          setComments([]); setNext(null); first = true
        }
        setError(getApiErrorMessage(cause, 'Class comments could not be loaded.'))
      }
      finally { if (!controller.signal.aborted) setLoading(false) }
    }
    reload.current = load
    const poll = async () => { await load(); if (!controller.signal.aborted) timer = setTimeout(() => void poll(), 10000) }
    void poll()
    return () => { controller.abort(); if (timer) clearTimeout(timer) }
  }, [classroomId, postId])
  const older = async () => {
    const controller = active.current
    if (!next || !controller || controller.signal.aborted || pending.current) return
    pending.current = true; revision.current++; setBusy(true)
    try {
      const page = await getClassComments(classroomId, postId, next, controller.signal)
      if (!controller.signal.aborted) { setComments(current => merge(current, page.items)); setNext(page.next) }
    } catch (cause) { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Older comments could not be loaded.')) }
    finally { pending.current = false; if (!controller.signal.aborted) setBusy(false) }
  }
  const send = async (body: string) => {
    const controller = active.current
    if (!controller || controller.signal.aborted || pending.current || disabled) return false
    pending.current = true; revision.current++; setBusy(true); setError('')
    if (retry.current?.body !== body) retry.current = { body, requestId: crypto.randomUUID() }
    try {
      const comment = await addClassComment(classroomId, postId, retry.current.requestId, body)
      if (controller.signal.aborted) return false
      setComments(current => merge(current, [comment])); retry.current = null; onComment()
      return true
    } catch (cause) { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Comment was not confirmed. Your draft is still here.')); return false }
    finally { pending.current = false; if (!controller.signal.aborted) setBusy(false) }
  }
  const edit = async (commentId: string, body: string, expectedEditedAt: string | null) => {
    const controller = active.current
    if (!controller || controller.signal.aborted || pending.current || disabled) return false
    pending.current = true; revision.current++; setBusy(true)
    try {
      const saved = await editClassComment(classroomId, postId, commentId, { body, expectedEditedAt })
      if (controller.signal.aborted) return false
      setComments(current => merge(current, [saved]))
      return true
    } finally { pending.current = false; if (!controller.signal.aborted) setBusy(false) }
  }
  return <section aria-label="Class comments" className="min-w-0 space-y-4">
    {loading && <LoadingSkeleton label="Loading class comments…"><div className="space-y-4">{[0, 1].map(i => <div key={i} className="flex gap-2.5"><Skeleton className="size-8 shrink-0 rounded-full" /><SkeletonLines /></div>)}</div></LoadingSkeleton>}
    {next && <Button variant="ghost" size="sm" disabled={busy} onClick={() => void older()}>Load older comments</Button>}
    {comments.map(comment => <div key={comment.id} className="flex items-start gap-2.5">
      <PersonAvatar name={comment.authorName} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1"><p className="text-xs font-semibold">{comment.authorName}{comment.authorRole === 'educator' && <span className="ml-1.5 font-normal text-muted-foreground">Educator</span>}</p><time dateTime={comment.createdAt} className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time></div>
        <DiscussionEntryBody entry={comment} kind="comment" disabled={disabled || busy}
          onSave={comment.authorId === currentUserId ? (body, expectedEditedAt) => edit(comment.id, body, expectedEditedAt) : undefined} />
      </div>
    </div>)}
    {error && <div role="alert" className="text-xs text-destructive"><p>{error}</p><Button variant="ghost" size="sm" onClick={() => void reload.current()}>Retry loading comments</Button></div>}
    <DiscussionComposer id={`comment-${postId}`} label="Write a class comment" placeholder="Add a class comment…" authorName={authorName} disabled={disabled || busy || loading} onSubmit={send} submitOnEnter />
  </section>
}
