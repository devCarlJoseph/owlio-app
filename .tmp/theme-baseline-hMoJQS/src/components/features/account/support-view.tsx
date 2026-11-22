import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/services/api/api-error'
import { requestOperation } from '@/services/api/contract-client'
import type { OperationData } from '@/services/api/generated-contract'
import { AccountActions, AccountHeading, AccountPage, AccountRow } from './account-page'

type Ticket = OperationData<'POST /api/v1/users/me/support-tickets'>
type TicketPage = OperationData<'GET /api/v1/users/me/support-tickets'>
const categories = [
  { value: 'ACCOUNT', label: 'Account' },
  { value: 'TECHNICAL', label: 'Technical issue' },
  { value: 'SAFETY', label: 'Safety concern' },
] satisfies { value: Ticket['category']; label: string }[]
const ticketStatuses: Record<Ticket['status'], string> = {
  OPEN: 'Open',
  IN_REVIEW: 'In review',
  RESOLVED: 'Resolved',
}

export function SupportView() {
  const [category, setCategory] = useState<Ticket['category']>('ACCOUNT')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState<Ticket[]>([])
  const [tickets, setTickets] = useState<TicketPage>()
  const [attempt, setAttempt] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const pendingPage = useRef<AbortController | null>(null)
  const [listError, setListError] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    void requestOperation('GET /api/v1/users/me/support-tickets', { signal: controller.signal, query: { limit: 20 } })
      .then(page => { if (!controller.signal.aborted) setTickets(page) })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) setListError(getApiErrorMessage(requestError, 'Could not load your support requests.'))
      })
    return () => {
      controller.abort()
      pendingPage.current?.abort()
    }
  }, [attempt])

  async function loadMore() {
    if (!tickets?.nextCursor || loadingMore) return
    const cursor = tickets.nextCursor
    const controller = new AbortController()
    pendingPage.current = controller
    setLoadingMore(true)
    setListError('')
    try {
      const page = await requestOperation('GET /api/v1/users/me/support-tickets', {
        signal: controller.signal, query: { cursor, limit: 20 },
      })
      if (controller.signal.aborted) return
      const loadedIds = new Set(tickets.items.map(ticket => ticket.id))
      setTickets({
        items: [...tickets.items, ...page.items.filter(ticket => !loadedIds.has(ticket.id))],
        nextCursor: page.nextCursor === cursor ? null : page.nextCursor,
      })
    } catch (requestError) {
      if (!controller.signal.aborted) setListError(getApiErrorMessage(requestError, 'Could not load more support requests.'))
    } finally {
      if (!controller.signal.aborted) setLoadingMore(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!subject.trim() || !message.trim() || sending) return
    setSending(true)
    setStatus('')
    setError('')
    try {
      const ticket = await requestOperation('POST /api/v1/users/me/support-tickets', {
        body: { category, subject: subject.trim(), message: message.trim() },
      })
      setSubmitted(previous => [ticket, ...previous])
      setSubject('')
      setMessage('')
      setStatus('Support request submitted.')
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not submit your support request.'))
    } finally {
      setSending(false)
    }
  }

  const loadedTickets = tickets?.items ?? []
  const loadedIds = new Set(loadedTickets.map(ticket => ticket.id))
  const visibleTickets = [...submitted.filter(ticket => !loadedIds.has(ticket.id)), ...loadedTickets]

  return (
    <AccountPage>
      <AccountHeading title="Help & Support" description="Send a request to the Owlio support team and track its status." />
      <form onSubmit={submit} className="space-y-5">
        <AccountRow label="Category" id="support-category">
          <Select items={categories} value={category} disabled={sending} onValueChange={value => { if (value) setCategory(value) }}>
            <SelectTrigger id="support-category" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{categories.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
        </AccountRow>
        <AccountRow label="Subject" id="support-subject">
          <Input id="support-subject" value={subject} onChange={event => setSubject(event.target.value)} maxLength={120} required disabled={sending} />
        </AccountRow>
        <AccountRow label="Message" id="support-message" description="Describe what happened and what you need help with.">
          <Textarea id="support-message" aria-describedby="support-message-description" value={message} onChange={event => setMessage(event.target.value)}
            rows={5} maxLength={2000} className="resize-y" required disabled={sending} />
        </AccountRow>
        <AccountActions>
          <Button type="submit" disabled={sending || !subject.trim() || !message.trim()}>{sending ? 'Submitting…' : 'Submit request'}</Button>
          {status && <p role="status" className="text-sm text-muted-foreground">{status}</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </AccountActions>
      </form>
      <section aria-labelledby="support-history" className="space-y-3 border-t pt-5">
        <h3 id="support-history" className="text-base font-semibold">Your requests</h3>
        {listError && (
          <div role="alert" className="flex flex-wrap items-center gap-3 text-sm">
            <p className="text-destructive">{listError}</p>
            {!tickets && <Button variant="outline" onClick={() => { setListError(''); setAttempt(value => value + 1) }}>Try again</Button>}
          </div>
        )}
        {!tickets && !listError && <p role="status" className="text-sm text-muted-foreground">Loading your requests…</p>}
        {tickets && !visibleTickets.length && <p className="text-sm text-muted-foreground">You haven’t submitted a request yet.</p>}
        {visibleTickets.length > 0 && (
          <ul className="divide-y rounded-lg border">
            {visibleTickets.map(ticket => (
              <li key={ticket.id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 px-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="wrap-break-word font-medium">{'subject' in ticket && typeof ticket.subject === 'string' ? ticket.subject : 'Support request'}</p>
                  <p className="text-xs text-muted-foreground">
                    {categories.find(option => option.value === ticket.category)?.label} · {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-md bg-muted px-2 py-1 text-xs">{ticketStatuses[ticket.status]}</span>
              </li>
            ))}
          </ul>
        )}
        {tickets?.nextCursor && <Button variant="outline" onClick={() => void loadMore()} disabled={loadingMore}>{loadingMore ? 'Loading…' : 'Load more'}</Button>}
      </section>
    </AccountPage>
  )
}
