import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { getNotifications } from '@/services/api/personal-workspace.service'
import { NotificationList } from './notification-list'
import type { NotificationFilter, NotificationsListState, NotificationsRole } from '../types/notifications.types'

export function ClassroomMentionNotifications({ role, filter, onNavigate }: { role: NotificationsRole; filter: NotificationFilter; onNavigate?: () => void }) {
  const [state, setState] = useState<NotificationsListState>({ status: 'loading' })
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    async function load() {
      try {
        const records = await getNotifications(controller.signal)
        if (controller.signal.aborted) return
        setState({ status: 'ready', items: records.filter(record => record.kind === 'CLASSROOM_MENTION' && record.classroomMention).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(record => {
          const mention = record.classroomMention!
          return { id: record.id, actor: mention.authorName, initials: mention.authorName.split(/\s+/).map(word => word[0]).slice(0, 2).join(''),
            action: 'Mentioned you in', context: mention.classroomName, preview: mention.body,
            category: 'classroom', unread: !record.readAt, example: false,
            timestamp: { dateTime: record.createdAt, relativeLabel: formatDistanceToNow(new Date(record.createdAt), { addSuffix: true }), fullLabel: new Date(record.createdAt).toLocaleString() },
            destination: { href: `/${role}/classrooms/${mention.classroomId}?tab=chat&message=${encodeURIComponent(mention.messageId)}`, label: 'Open mentioned message' } }
        }) })
      } catch { if (!controller.signal.aborted) setState({ status: 'error', onRetry: () => setRetry(value => value + 1) }) }
      finally { if (!controller.signal.aborted) timer = setTimeout(() => void load(), 10000) }
    }
    void load()
    return () => { controller.abort(); if (timer) clearTimeout(timer) }
  }, [role, retry])
  return <section aria-label="Classroom mention notifications"><p className="px-5 pt-3 text-xs text-muted-foreground">Classroom mentions</p><NotificationList state={state} filter={filter} onNavigate={onNavigate} /></section>
}
