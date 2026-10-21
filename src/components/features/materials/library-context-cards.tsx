import { ArrowRight } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { librarySourceMeta, librarySources } from "./library-records"
import { ResourceContextLink } from "./resource-context-link"
import type { LibraryResource } from "./library-types"

type LibraryContextCardsProps = {
  resources: LibraryResource[]
}

export function LibraryContextCards({ resources }: LibraryContextCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {librarySources.map((source) => {
        const meta = librarySourceMeta[source]
        const Icon = meta.icon
        const count = resources.filter((resource) => resource.source === source).length

        return (
          <Card
            key={source}
            className="h-full border border-slate-200 bg-white shadow-sm ring-0 transition duration-200 hover:border-slate-300 hover:shadow-md motion-reduce:transition-none"
          >
            <CardContent className="flex-1 gap-3">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${meta.iconClassName}`}
                >
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <Badge variant="outline" className={meta.badgeClassName}>
                  {meta.ownerLabel}
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-semibold tracking-tight text-slate-900">
                  <Link
                    to={meta.libraryHref}
                    className="rounded-md outline-none hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {meta.label}
                  </Link>
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{meta.description}</p>
              </div>

              <p className="text-xs leading-5 text-slate-500">{meta.ownerNote}</p>

              <div className="mt-auto space-y-3 border-t border-slate-100 pt-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-500">
                    {count} {count === 1 ? "resource" : "resources"} listed
                  </p>

                  <Button
                    size="sm"
                    nativeButton={false}
                    render={<Link to={meta.libraryHref} />}
                    className="bg-blue-700 text-white hover:bg-blue-800"
                  >
                    Open {meta.shortLabel.toLowerCase()} library
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>

                <ResourceContextLink href={meta.ownerHref} label={meta.ownerAction} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
