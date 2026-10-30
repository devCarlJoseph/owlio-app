import { ArrowRight, X } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { NotificationsInbox } from "./notifications-inbox"
import type { NotificationsRole } from "./notifications.types"

export function NotificationsPanel({ role, onNavigate }: { role: NotificationsRole; onNavigate: () => void }) {
  return (
    <DialogContent showCloseButton={false} className="bottom-4 left-4 right-4 top-4 flex w-auto max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-3xl border border-border bg-card p-0 shadow-2xl ring-0 motion-reduce:animate-none sm:bottom-auto sm:left-auto sm:right-6 sm:top-[4.5rem] sm:h-[min(42rem,calc(100dvh-6rem))] sm:w-[26.25rem] sm:max-w-[calc(100%-3rem)]">
      <DialogDescription className="sr-only">Workspace notifications. Notification delivery and read status are not connected. Examples are available for layout review.</DialogDescription>
      <NotificationsInbox role={role} onNavigate={onNavigate} title={<DialogTitle className="text-base font-semibold tracking-tight">Notifications</DialogTitle>} headerAction={<DialogClose render={<Button variant="ghost" size="icon-sm" className="rounded-lg" />} aria-label="Close notifications"><X className="size-4" aria-hidden="true" /></DialogClose>} />
      <Link to={`/${role}/notifications`} onClick={onNavigate} className="flex min-h-14 shrink-0 items-center justify-center gap-2 border-t border-border/70 bg-card px-5 py-3 text-xs font-semibold text-brand outline-none hover:bg-brand-soft/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand">
        View all notifications<ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </DialogContent>
  )
}
