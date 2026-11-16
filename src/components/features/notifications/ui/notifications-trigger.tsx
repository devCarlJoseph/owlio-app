import { useContext, useState } from "react"
import { AuthSessionContext } from '@/components/features/auth/context/auth-session-context'
import { ClassroomMentionBadge } from './classroom-mention-badge'
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { NotificationsPanel } from "./notifications-panel"
import type { NotificationsRole } from "../types/notifications.types"

export function NotificationsTrigger({ role }: { role: NotificationsRole }) {
  const [open, setOpen] = useState(false)
  const session = useContext(AuthSessionContext)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="relative size-10 rounded-full text-slate-600 surface-dark:text-muted-foreground hover:bg-slate-100 surface-dark:hover:bg-muted" />} aria-label="Notifications" title="Notifications">
        <Bell aria-hidden="true" />
        {session?.user && <ClassroomMentionBadge key={session.user.id} />}
      </DialogTrigger>
      <NotificationsPanel role={role} onNavigate={() => setOpen(false)} />
    </Dialog>
  )
}
