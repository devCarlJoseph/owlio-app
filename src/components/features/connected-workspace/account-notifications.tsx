import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/api-error'
import { getNotifications, markNotificationRead } from '@/services/api/personal-workspace.service'
import { RecordStatus } from './personal-workspace'
import { useAccountRecords } from './use-account-records'

const labels: Record<string, string> = { EVALUATION_RELEASED: 'New evaluation released', SESSION_REMINDER: 'Session reminder', ANNOUNCEMENT_PUBLISHED: 'New announcement' }
export function AccountNotifications() {
  const state = useAccountRecords(getNotifications)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const markRead = async (id: string) => {
    setBusy(true); setError('')
    try { const saved = await markNotificationRead(id); state.setRecords(items => items.map(item => item.id === id ? { ...item, readAt: saved.readAt } : item)) }
    catch (cause) { setError(getApiErrorMessage(cause, 'Could not mark the notification as read.')) }
    finally { setBusy(false) }
  }
  return <section className="mx-auto max-w-5xl space-y-5"><h2 className="text-2xl font-semibold">Notifications</h2>
    <RecordStatus {...state} />{error && <p role="alert">{error}</p>}
    {!state.loading && !state.error && <><Button variant="outline" disabled={busy} onClick={state.reload}>Refresh</Button>
      {state.records.length === 0 && <p className="rounded-2xl border p-6">You have no notifications.</p>}
      <ul className="space-y-3">{[...state.records].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5">
        <div><p className="font-medium">{labels[item.kind] ?? 'Account update'}</p><time className="text-sm text-muted-foreground" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time></div>
        {item.readAt ? <span className="text-sm text-muted-foreground">Read</span> : <Button variant="outline" disabled={busy} onClick={() => void markRead(item.id)}>Mark as read</Button>}
      </li>)}</ul></>}
  </section>
}
