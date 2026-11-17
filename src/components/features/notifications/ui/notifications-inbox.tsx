import { useContext, useState, type ReactNode } from "react"
import { AuthSessionContext } from '@/components/features/auth/context/auth-session-context'
import { ClassroomMentionNotifications } from './classroom-mention-notifications'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { NotificationFilters } from "./notification-filters"
import { NotificationList } from "./notification-list"
import { notificationsContent } from "../contents/notifications-content"
import type { NotificationFilter, NotificationsListState, NotificationsRole } from "../types/notifications.types"

export function NotificationsInbox({ role, title, headerAction, className = "", onNavigate }: {
  role: NotificationsRole
  title?: ReactNode
  headerAction?: ReactNode
  className?: string
  onNavigate?: () => void
}) {
  const [filter, setFilter] = useState<NotificationFilter>("all")
  const session = useContext(AuthSessionContext)
  const content = notificationsContent[role]
  const state: NotificationsListState = { status: "unavailable" }

  return (
    <Tabs value={filter} onValueChange={(value) => { if (value === "all" || value === "unread") setFilter(value) }} className={`flex min-h-0 flex-1 flex-col gap-0 ${className}`}>
      <div className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-3 border-b border-border/70 px-5 py-4">
        <div className="min-w-0 flex-1">{title ?? <h3 className="text-base font-semibold tracking-tight">Notifications</h3>}</div>
        <div className="order-3 w-full sm:order-none sm:w-auto"><NotificationFilters /></div>
        {headerAction}
      </div>
      <div className="shrink-0 border-b border-border/60 bg-muted/20 px-5 py-3">
        <p className="text-[11px] font-medium text-muted-foreground">{content.workspace}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{content.description}</p>
      </div>
      {(["all", "unread"] as const).map((value) => (
        <TabsContent key={value} value={value} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ScrollArea className="min-h-0 flex-1" role="region" aria-label="Notification feed">
            {session?.user ? <ClassroomMentionNotifications key={session.user.id} role={role} filter={value} onNavigate={onNavigate} /> : <NotificationList state={state} filter={value} onNavigate={onNavigate} />}
            {<div className="flex flex-wrap justify-center gap-2 px-5 pb-7" aria-label="Workspace notification contexts">{content.categories.map((category) => <span key={category} className="rounded-full border border-border/70 px-2.5 py-1 text-[10px] text-muted-foreground">{category}</span>)}</div>}
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  )
}
