import { NotificationItem } from "./notification-item"
import { NotificationsState } from "./notifications-state"
import type { NotificationFilter, NotificationsListState } from "./notifications.types"

export function NotificationList({ state, filter, onNavigate }: { state: NotificationsListState; filter: NotificationFilter; onNavigate?: () => void }) {
  if (state.status !== "ready") return <NotificationsState status={state.status} onRetry={state.status === "error" ? state.onRetry : undefined} />
  const items = filter === "unread" ? state.items.filter((item) => item.unread) : state.items
  if (items.length === 0) return <NotificationsState status="empty" filter={filter} />

  return (
    <ul aria-label="Notifications" className="divide-y divide-border/70">
      {items.map((item) => <NotificationItem key={item.id} item={item} onNavigate={onNavigate} />)}
    </ul>
  )
}
