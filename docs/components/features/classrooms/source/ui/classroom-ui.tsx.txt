import { Construction } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { getInitials } from "./classroom-utils"

const avatarTones = [
  "bg-blue-100 text-blue-800",
  "bg-indigo-100 text-indigo-800",
  "bg-emerald-100 text-emerald-800",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-800",
  "bg-sky-100 text-sky-800",
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
        <Construction aria-hidden="true" className="size-8 text-slate-400" />
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="max-w-sm text-sm text-slate-600">This section is under development.</p>
      </CardContent>
    </Card>
  )
}
