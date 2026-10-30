import { useLocation } from "react-router"
import { Bell } from "lucide-react"
import { getDashboardRole } from "@/components/common/dashboard-navigation"
import { notificationsContent } from "./notifications-content"
import { NotificationsInbox } from "./notifications-inbox"
import type { NotificationsRole } from "./notifications.types"

export function NotificationsView({ role }: { role: NotificationsRole }) {
  const content = notificationsContent[role]

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <header className="flex items-start gap-3 px-1">
        <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Bell className="size-5" aria-hidden="true" /></span>
        <div>
          <p className="text-xs text-muted-foreground">{content.workspace}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Notifications</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Your workspace updates, with the learning context that matters.</p>
        </div>
      </header>
      <section aria-label="Notification inbox" className="flex h-[42rem] max-h-[80dvh] min-h-96 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xs">
        <NotificationsInbox key={role} role={role} title={<h3 className="text-base font-semibold tracking-tight">Your updates</h3>} />
      </section>
    </div>
  )
}

export function RoleNotificationsView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname)
  return role ? <NotificationsView role={role} /> : null
}
