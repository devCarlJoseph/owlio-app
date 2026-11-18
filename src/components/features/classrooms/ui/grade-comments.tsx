import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/services/api/api-error'
import { getGradeComments, sendGradeComment, type GradeCommentPage } from '@/services/api/classroom-gradebook.service'
import { formatClassworkDate } from '../utils/classwork-deadline'

export function GradeComments({ submissionId, accountId, owned }: { submissionId: string; accountId: string; owned: boolean }) {
  const [page, setPage] = useState<GradeCommentPage | null>(null)
  const [cursor, setCursor] = useState<string>()
  const [seenCursors, setSeenCursors] = useState<string[]>([])
  const [revision, setRevision] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState('')
  const pending = useRef(false)
  const lastRequest = useRef<{ body: string; id: string } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    getGradeComments(submissionId, cursor, controller.signal).then(data => {
      if (controller.signal.aborted) return
      setPage(current => {
        if (!cursor || !current) return data
        const existing = new Set(current.items.map(item => item.id))
        return { ...data, items: [...current.items, ...data.items.filter(item => !existing.has(item.id))] }
      })
    }).catch(cause => {
      if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Could not load grade comments.'))
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false)
    })
    return () => controller.abort()
  }, [cursor, revision, submissionId])

  function refresh() {
    setLoading(true)
    setError('')
    setCursor(undefined)
    setSeenCursors([])
    setRevision(value => value + 1)
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = draft.trim()
    if (!body || pending.current || !page || loading) return
    pending.current = true
    setSending(true)
    setError('')
    try {
      if (lastRequest.current?.body !== body) lastRequest.current = { body, id: crypto.randomUUID() }
      const posted = await sendGradeComment(submissionId, body, lastRequest.current.id)
      if (posted.actorId !== accountId || posted.body !== body) throw new Error('The comment could not be confirmed.')
      setPage(current => current && ({ ...current, items: [posted, ...current.items.filter(item => item.id !== posted.id)] }))
      setDraft('')
      lastRequest.current = null
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Could not send the comment. Your draft is still here.'))
    } finally {
      setSending(false)
      pending.current = false
    }
  }

  return <div className="mt-2 space-y-2.5">
    <p className="text-xs text-muted-foreground">Visible to the student and classroom owner.</p>
    {loading && !page && <p role="status" className="text-xs text-muted-foreground">Loading comments…</p>}
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    {page?.items.length ? <ul aria-label="Private grade comments" className="max-h-56 space-y-2 overflow-y-auto">
      {page.items.map(item => <li key={item.id} className="space-y-1 rounded-lg bg-card p-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-1 text-xs">
          <span className="font-semibold">{item.actorId === accountId ? 'You' : owned ? 'Student' : 'Educator'}</span>
          <time dateTime={item.createdAt} className="text-muted-foreground">{formatClassworkDate(item.createdAt)}</time>
        </div>
        <p className="text-sm whitespace-pre-wrap wrap-anywhere">{item.body}</p>
      </li>)}
    </ul> : page && <p className="text-xs text-muted-foreground">No comments yet.</p>}
    <div className="flex flex-wrap gap-1">
      {(page || error) && <Button type="button" size="xs" variant="ghost" onClick={refresh} disabled={loading || sending}>Refresh comments</Button>}
      {page?.nextCursor && !seenCursors.includes(page.nextCursor) && <Button type="button" size="xs" variant="ghost" disabled={loading || sending} onClick={() => {
        if (!page.nextCursor) return
        setLoading(true)
        setError('')
        setSeenCursors(current => [...current, page.nextCursor!])
        setCursor(page.nextCursor)
      }}>Older comments</Button>}
    </div>
    {page && <form className="space-y-2" onSubmit={send}>
      <Label htmlFor="grade-comment">Private comment</Label>
      <Textarea id="grade-comment" maxLength={2000} value={draft} disabled={sending} placeholder="Ask about this grade or leave a reply"
        onChange={event => setDraft(event.currentTarget.value)} className="min-h-18 bg-card" />
      <Button type="submit" size="sm" disabled={!draft.trim() || sending || loading}>{sending ? 'Sending…' : 'Send comment'}</Button>
    </form>}
  </div>
}
