import type { ReactNode } from "react"
import { Link } from "react-router"
import { cn } from "cn"
import { OutlineCard } from "@/components/common/outline-card"

type DataTableCardProps = {
  title: string
  viewAll?: { label: string; to: string }
  columns: string[]
  children: ReactNode
  empty?: ReactNode
  className?: string
}

export function DataTableCard({ title, viewAll, columns, children, empty, className }: DataTableCardProps) {
  return (
    <OutlineCard className={cn("p-0", className)}>
      <div className="flex items-center justify-between gap-3 px-6 pt-5">
        <h2 className="text-lg font-semibold text-panel-foreground">{title}</h2>
        {viewAll && (
          <Link to={viewAll.to} className="rounded text-sm font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-brand/50">
            {viewAll.label}
          </Link>
        )}
      </div>
      {empty ?? (
        <div className="overflow-x-auto px-6 pb-4 pt-3">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-slate-500">
                {columns.map((column) => (
                  <th key={column} scope="col" className="pb-2 font-normal">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody className="[&>tr]:border-t [&>tr]:border-slate-200 [&_td]:py-3">{children}</tbody>
          </table>
        </div>
      )}
    </OutlineCard>
  )
}
