import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { personalSpaceLinks } from "./student-overview-copy"

export function PersonalSpacePromo() {
  return (
    <Card className="border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm ring-0">
      <CardContent className="gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Make this space your own</h3>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            Independent learning comes first. A classroom is optional.
          </p>
        </div>
        {personalSpaceLinks.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className="flex items-center gap-3 rounded-lg bg-white/80 p-3 text-sm font-medium text-slate-800 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Icon className="size-4 text-blue-700" aria-hidden="true" />
            {label}
            <ArrowUpRight className="ml-auto size-4 text-blue-700" aria-hidden="true" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}