import { Construction } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { getInitials } from "../utils/classroom-utils"

const avatarTones = [
  "bg-blue-100 surface-dark:bg-surface-blue-soft text-blue-800 surface-dark:text-blue-300",
  "bg-indigo-100 surface-dark:bg-surface-indigo-soft text-indigo-800 surface-dark:text-indigo-300",
  "bg-emerald-100 surface-dark:bg-surface-emerald-soft text-emerald-800 surface-dark:text-emerald-300",
  "bg-amber-100 surface-dark:bg-surface-amber-soft text-amber-800 surface-dark:text-amber-300",
  "bg-rose-100 surface-dark:bg-surface-rose-soft text-rose-800 surface-dark:text-rose-300",
  "bg-sky-100 surface-dark:bg-surface-sky-soft text-sky-800 surface-dark:text-sky-300",
]

export function PersonAvatar({ name, size = "default", className = "" }: { name: string; size?: "default" | "sm" | "lg"; className?: string }) {
  const tone = avatarTones[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarTones.length]
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback className={`${tone} text-xs font-semibold`}>{getInitials(name)}</AvatarFallback>
    </Avatar>
  )
}

export function UnderDevelopment({ title }: { title: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="items-center gap-2 py-12 text-center">
        <Construction aria-hidden="true" className="size-8 text-slate-400 surface-dark:text-muted-foreground" />
        <h3 className="text-base font-semibold text-slate-900 surface-dark:text-foreground">{title}</h3>
        <p className="max-w-sm text-sm text-slate-600 surface-dark:text-muted-foreground">This section is under development.</p>
      </CardContent>
    </Card>
  )
}
