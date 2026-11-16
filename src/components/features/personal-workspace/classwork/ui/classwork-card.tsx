import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  classworkStatusMeta,
  classworkTypeMeta,
  formatClassworkDueDate,
  isClassworkOverdue,
  type ClassworkRecord,
} from "../contents/sample-classwork"

export function ClassworkCard({ item }: { item: ClassworkRecord }) {
  const status = classworkStatusMeta[item.status]
  const type = classworkTypeMeta[item.type]
  const TypeIcon = type.icon
  const isOverdue = isClassworkOverdue(item)

  return (
    <Card size="sm" className="h-full border border-slate-200 surface-dark:border-border bg-white surface-dark:bg-card shadow-sm ring-0">
      <CardContent className="h-full gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 surface-dark:bg-surface-blue-soft text-blue-700 surface-dark:text-blue-300">
              <TypeIcon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h4 className="truncate text-base font-semibold text-slate-900 surface-dark:text-foreground">{item.title}</h4>
              <p className="mt-0.5 truncate text-xs text-slate-500 surface-dark:text-muted-foreground">
                {item.classroom} · {item.educator}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={`shrink-0 ${status.badge}`}>
            {status.label}
          </Badge>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-slate-600 surface-dark:text-muted-foreground">{item.note}</p>

        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-slate-100 surface-dark:bg-muted text-slate-700 surface-dark:text-foreground">
            {type.label}
          </Badge>
          <Badge variant="secondary" className="bg-slate-50 surface-dark:bg-background text-slate-600 surface-dark:text-muted-foreground">
            {item.points} points
          </Badge>
          <span className={`text-xs ${isOverdue ? "font-medium text-destructive" : "text-slate-500 surface-dark:text-muted-foreground"}`}>
            {isOverdue ? "Overdue · " : ""}
            {formatClassworkDueDate(item.dueDate)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}