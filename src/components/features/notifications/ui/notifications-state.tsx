import { BellOff, CheckCheck, CircleAlert, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { NotificationFilter } from "./notifications.types"

export function NotificationsState({ status, filter = "all", onRetry }: {
  status: "unavailable" | "loading" | "error" | "empty"
  filter?: NotificationFilter
  onRetry?: () => void
}) {
  const unreadEmpty = status === "empty" && filter === "unread"
  const Icon = status === "loading" ? LoaderCircle : status === "error" ? CircleAlert : status === "empty" ? CheckCheck : BellOff
  const title = status === "loading" ? "Loading notifications" : status === "error" ? "Notifications could not be loaded" : status === "unavailable" ? "Notification inbox is unavailable" : unreadEmpty ? "No unread notifications" : "No notifications yet"
  const description = status === "loading" ? "Checking for workspace updates." : status === "error" ? "Please try again when the notification service is available." : status === "unavailable" ? "Notification records and read status are not connected. No live account activity is shown." : unreadEmpty ? "There are no unread items in this list." : "Updates will appear here when they are available."

  return (
    <div className="flex min-h-72 flex-col items-center justify-center px-7 py-10 text-center" role={status === "error" ? "alert" : "status"}>
      <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Icon className={`size-6 ${status === "loading" ? "animate-spin motion-reduce:animate-none" : ""}`} aria-hidden="true" /></span>
      <h3 className="mt-5 text-sm font-semibold leading-6">{title}</h3>
      <p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">{description}</p>
      {status === "error" && onRetry && <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">Try again</Button>}
    </div>
  )
}
