import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { subjectShortcutLinks } from "./sample-subjects"

export function SubjectWorkspace() {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardHeader>
        <CardTitle>
          <h3 className="text-base font-semibold text-slate-900">Subject workspace</h3>
        </CardTitle>
        <CardDescription className="mt-1 text-slate-500">
          Everything you keep around a subject, all personal.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {subjectShortcutLinks.map(({ label, description, href, icon: Icon }) => (
          <Link
            key={href}
            to={href}
            className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900">{label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-slate-500">{description}</span>
            </span>
            <ArrowUpRight className="mt-1 size-4 shrink-0 text-slate-400" aria-hidden="true" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}