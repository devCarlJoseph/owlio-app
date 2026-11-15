import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { NotificationsPanel } from "./notifications-panel"
import type { NotificationsRole } from "./notifications.types"

export function NotificationsTrigger({ role }: { role: NotificationsRole }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="relative size-10 rounded-full text-slate-600 hover:bg-slate-100" />} aria-label="Notifications" title="Notifications">
        <Bell aria-hidden="true" />
      </DialogTrigger>
      <NotificationsPanel role={role} onNavigate={() => setOpen(false)} />
    </Dialog>
  )
}
