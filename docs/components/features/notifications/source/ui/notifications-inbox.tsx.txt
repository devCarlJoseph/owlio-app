import { useState, type ReactNode } from "react"
import { FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { NotificationFilters } from "./notification-filters"
import { NotificationList } from "./notification-list"
import { notificationsContent } from "./notifications-content"
import { getNotificationExamples } from "./notifications-examples"
import type { NotificationFilter, NotificationsListState, NotificationsRole } from "./notifications.types"

export function NotificationsInbox({ role, title, headerAction, className = "", onNavigate }: {
  role: NotificationsRole
  title?: ReactNode
  headerAction?: ReactNode
  className?: string
  onNavigate?: () => void
}) {
  const [filter, setFilter] = useState<NotificationFilter>("all")
  const [showExamples, setShowExamples] = useState(false)
  const content = notificationsContent[role]
  const state: NotificationsListState = showExamples ? { status: "ready", items: getNotificationExamples(role) } : { status: "unavailable" }

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
      {showExamples && <p className="shrink-0 border-b border-amber-100 bg-amber-50 px-5 py-2.5 text-[11px] leading-5 text-amber-950" role="status">Example notifications · Fictional content. No items are saved or marked as read.</p>}
      {(["all", "unread"] as const).map((value) => (
        <TabsContent key={value} value={value} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ScrollArea className="min-h-0 flex-1" role="region" aria-label="Notification feed">
            <NotificationList state={state} filter={value} onNavigate={onNavigate} />
            {!showExamples && <div className="flex flex-wrap justify-center gap-2 px-5 pb-7" aria-label="Workspace notification contexts">{content.categories.map((category) => <span key={category} className="rounded-full border border-border/70 px-2.5 py-1 text-[10px] text-muted-foreground">{category}</span>)}</div>}
          </ScrollArea>
        </TabsContent>
      ))}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-muted/15 px-5 py-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground"><FlaskConical className="size-3" aria-hidden="true" />{showExamples ? "Example mode" : "Preview the layout"}</span>
        <Button variant="outline" size="sm" aria-pressed={showExamples} onClick={() => setShowExamples((current) => !current)} className="h-9 rounded-lg bg-card px-3 text-xs">{showExamples ? "Hide examples" : "Show examples"}</Button>
      </div>
    </Tabs>
  )
}
