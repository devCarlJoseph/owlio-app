import { Link } from "react-router"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { notificationAppearance } from "./notifications-content"
import type { NotificationItemViewModel } from "./notifications.types"

export function NotificationItem({ item, onNavigate }: { item: NotificationItemViewModel; onNavigate?: () => void }) {
  const { icon: Icon, avatar, badge } = notificationAppearance[item.category]
  const body = (
    <>
      <span className="relative mt-0.5 shrink-0" aria-hidden="true">
        <Avatar className="size-11"><AvatarFallback className={`text-xs font-semibold ${avatar}`}>{item.initials}</AvatarFallback></Avatar>
        <span className={`absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full ring-2 ring-card ${badge}`}><Icon className="size-3" /></span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-[13px] font-semibold leading-5 text-foreground">{item.actor}</span>
          {item.example ? <span className="text-[11px] text-muted-foreground">Example</span> : item.timestamp && <time dateTime={item.timestamp.dateTime} title={item.timestamp.fullLabel} className="text-[11px] text-muted-foreground">{item.timestamp.relativeLabel}</time>}
        </span>
        <span className="mt-1 block text-[13px] leading-5 text-foreground">{item.action} <strong className="font-semibold">{item.context}</strong></span>
        <span className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.preview}</span>
        {item.destination && <span className="sr-only">{item.destination.label}</span>}
      </span>
      <span className="mt-2 flex size-3 shrink-0 items-center justify-center">
        {item.unread ? <><span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" /><span className="sr-only">Unread</span></> : <span className="sr-only">Read</span>}
      </span>
    </>
  )
  const classes = "flex w-full items-start gap-3 px-5 py-5 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:bg-brand-soft/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand motion-reduce:transition-none"

  return <li>{item.destination ? <Link to={item.destination.href} onClick={onNavigate} className={classes}>{body}</Link> : <div className={classes}>{body}</div>}</li>
}
