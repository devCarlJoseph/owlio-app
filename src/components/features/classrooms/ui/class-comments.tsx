import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/api-error'
import { addClassComment, getClassComments, type DiscussionCommentRecord, type DiscussionCursor } from '@/services/api/classroom-discussion.service'
import { DiscussionComposer } from '../forms/discussion-composer'
import { PersonAvatar } from './classroom-ui'
import { DiscussionText } from './discussion-text'

const merge = (current: DiscussionCommentRecord[], added: DiscussionCommentRecord[]) => [...new Map([...current, ...added].map(item => [item.id, item])).values()]
  .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))

export function ClassComments({ classroomId, postId, authorName, disabled, onComment }: {
  classroomId: string; postId: string; authorName: string; disabled: boolean; onComment: () => void
}) {
  const [comments, setComments] = useState<DiscussionCommentRecord[]>([])
  const [next, setNext] = useState<DiscussionCursor | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const active = useRef<AbortController | null>(null)
  const retry = useRef<{ body: string; requestId: string } | null>(null)
  const pending = useRef(false)
  const reload = useRef<() => Promise<void>>(async () => {})
  useEffect(() => {
    const controller = new AbortController()
    active.current = controller
    let first = true
    let timer: ReturnType<typeof setTimeout> | undefined
    const load = async () => {
      try {
        const page = await getClassComments(classroomId, postId, undefined, controller.signal)
        if (controller.signal.aborted) return
        setComments(current => merge(current, page.items)); if (first) setNext(page.next)
        first = false; setError('')
      } catch (cause) { if (!controller.signal.aborted) { setComments([]); setError(getApiErrorMessage(cause, 'Class comments could not be loaded.')) } }
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
    pending.current = true; setBusy(true)
    try {
      const page = await getClassComments(classroomId, postId, next, controller.signal)
      if (!controller.signal.aborted) { setComments(current => merge(current, page.items)); setNext(page.next) }
    } catch (cause) { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Older comments could not be loaded.')) }
    finally { pending.current = false; if (!controller.signal.aborted) setBusy(false) }
  }
  const send = async (body: string) => {
    const controller = active.current
    if (!controller || controller.signal.aborted || pending.current || disabled) return false
    pending.current = true; setBusy(true); setError('')
    if (retry.current?.body !== body) retry.current = { body, requestId: crypto.randomUUID() }
    try {
      const comment = await addClassComment(classroomId, postId, retry.current.requestId, body)
      if (controller.signal.aborted) return false
      setComments(current => merge(current, [comment])); retry.current = null; onComment()
      return true
    } catch (cause) { if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Comment was not confirmed. Your draft is still here.')); return false }
    finally { pending.current = false; if (!controller.signal.aborted) setBusy(false) }
  }
  return <section aria-label="Class comments" className="min-w-0 space-y-4">
    {loading && <p role="status" className="text-xs text-muted-foreground">Loading class comments…</p>}
    {next && <Button variant="ghost" size="sm" disabled={busy} onClick={() => void older()}>Load older comments</Button>}
    {comments.map(comment => <div key={comment.id} className="flex items-start gap-2.5">
      <PersonAvatar name={comment.authorName} size="sm" />
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline gap-x-2 gap-y-1"><p className="text-xs font-semibold">{comment.authorName}{comment.authorRole === 'educator' && <span className="ml-1.5 font-normal text-muted-foreground">Educator</span>}</p><time dateTime={comment.createdAt} className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</time></div><DiscussionText text={comment.body} className="mt-1 text-sm leading-6 text-foreground/80 [overflow-wrap:anywhere]" /></div>
    </div>)}
    {error && <div role="alert" className="text-xs text-destructive"><p>{error}</p><Button variant="ghost" size="sm" onClick={() => void reload.current()}>Retry loading comments</Button></div>}
    <DiscussionComposer id={`comment-${postId}`} label="Write a class comment" placeholder="Add a class comment…" authorName={authorName} disabled={disabled || busy || loading} onSubmit={send} />
  </section>
}
