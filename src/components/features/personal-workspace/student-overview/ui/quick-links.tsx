import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { personalSpaceLinks } from "../contents/student-overview-copy"

export function PersonalSpacePromo() {
  return (
    <Card className="border border-blue-100 surface-dark:border-surface-blue-border bg-gradient-to-br from-blue-50 surface-dark:from-surface-blue-soft to-indigo-50 surface-dark:to-surface-indigo-soft shadow-sm ring-0">
      <CardContent className="gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 surface-dark:text-foreground">Make this space your own</h3>
          <p className="mt-1 text-sm leading-5 text-slate-600 surface-dark:text-muted-foreground">
            Independent learning comes first. A classroom is optional.
          </p>
        </div>
        {personalSpaceLinks.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className="flex items-center gap-3 rounded-lg bg-white/80 surface-dark:bg-card/80 p-3 text-sm font-medium text-slate-800 surface-dark:text-foreground outline-none hover:bg-white surface-dark:hover:bg-card focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Icon className="size-4 text-blue-700 surface-dark:text-blue-300" aria-hidden="true" />
            {label}
            <ArrowUpRight className="ml-auto size-4 text-blue-700 surface-dark:text-blue-300" aria-hidden="true" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}