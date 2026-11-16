import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { CircleCheck, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { getClassroomMessageReaders, type ChatReader } from '@/services/api/classroom-chat.service'
import { PersonAvatar } from './classroom-ui'

export function ChatMessageReceipt({ classroomId, messageId, seenCount }: { classroomId: string; messageId: string; seenCount?: number | null }) {
  const [open, setOpen] = useState(false)
  const [retry, setRetry] = useState(0)
  if (!seenCount) return <span className="inline-flex items-center gap-1" title="Saved to the classroom"><CircleCheck aria-hidden="true" className="size-3" />Sent</span>
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger render={<button type="button" className="inline-flex items-center gap-1 rounded-sm text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring" />} aria-label={`Seen by ${seenCount}. View readers`}>
      <CheckCheck aria-hidden="true" className="size-3" />Seen by {seenCount}
    </DialogTrigger>
    <DialogContent>
      <div className="space-y-2 pr-8"><DialogTitle>Seen by</DialogTitle><DialogDescription>Class members who have read this message.</DialogDescription></div>
      {open && <Readers key={`${messageId}:${seenCount}:${retry}`} classroomId={classroomId} messageId={messageId} onRetry={() => setRetry(value => value + 1)} />}
    </DialogContent>
  </Dialog>
}

function Readers({ classroomId, messageId, onRetry }: { classroomId: string; messageId: string; onRetry: () => void }) {
  const [items, setItems] = useState<ChatReader[]>([])
  const [next, setNext] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const controller = useRef<AbortController | null>(null)
  const pending = useRef(false)
  const cursors = useRef(new Set<string>())
  useEffect(() => {
    const active = new AbortController()
    controller.current = active
    cursors.current.clear()
    void getClassroomMessageReaders(classroomId, messageId, undefined, active.signal).then(page => {
      if (active.signal.aborted) return
      setItems(page.items); setNext(page.nextCursor)
      if (page.nextCursor) cursors.current.add(page.nextCursor)
    }).catch(() => { if (!active.signal.aborted) setError('Readers could not be loaded.') })
      .finally(() => { if (!active.signal.aborted) setLoading(false) })
    return () => active.abort()
  }, [classroomId, messageId])
  const more = async () => {
    const active = controller.current
    if (!active || active.signal.aborted || !next || pending.current) return
    pending.current = true; setLoading(true); setError('')
    try {
      const page = await getClassroomMessageReaders(classroomId, messageId, next, active.signal)
      if (active.signal.aborted) return
      if (page.nextCursor && cursors.current.has(page.nextCursor)) throw new Error('Repeated cursor')
      if (page.nextCursor) cursors.current.add(page.nextCursor)
      setItems(current => [...new Map([...current, ...page.items].map(item => [item.id, item])).values()]); setNext(page.nextCursor)
    } catch (cause) {
      if (!active.signal.aborted) {
        if (axios.isAxiosError(cause) && [401, 403, 404].includes(cause.response?.status ?? 0)) { setItems([]); setNext(null) }
        setError('Readers could not be loaded.')
      }
    } finally { pending.current = false; if (!active.signal.aborted) setLoading(false) }
  }
  return <div className="space-y-3">
    {error && <div role="alert" className="text-sm text-destructive">{error}<Button variant="link" size="sm" onClick={onRetry}>Retry</Button></div>}
    <ul aria-label="Message readers" className="max-h-[50dvh] space-y-3 overflow-y-auto">{items.map(reader => <li key={reader.id} className="flex items-center gap-3"><PersonAvatar name={reader.name} size="sm" /><span className="min-w-0 break-words text-sm">{reader.name}</span></li>)}</ul>
    {loading && <p role="status" className="text-xs text-muted-foreground">Loading readers…</p>}
    {!loading && !error && items.length === 0 && <p className="text-sm text-muted-foreground">No current class members have seen this message yet.</p>}
    {next && <Button variant="outline" size="sm" disabled={loading} onClick={() => void more()}>Load more readers</Button>}
  </div>
}
