import { Lock } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { libraryKindIcons, librarySourceMeta } from "./library-records"
import type { LibraryResource } from "./library-types"

type ResourceCardProps = {
  resource: LibraryResource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const sourceMeta = librarySourceMeta[resource.source]
  const KindIcon = libraryKindIcons[resource.kind]
  const isAvailable = resource.availability === "available"

  return (
    <Card
      className={
        isAvailable
          ? "group/resource relative h-full border border-slate-200 bg-white shadow-sm ring-0 transition hover:border-slate-300 hover:shadow-md motion-reduce:transition-none"
          : "border border-dashed border-slate-300 bg-slate-50/60 shadow-none ring-0"
      }
    >
      <CardContent className="gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${
              isAvailable ? sourceMeta.iconClassName : "bg-slate-200 text-slate-500"
            }`}
          >
            {isAvailable ? (
              <KindIcon aria-hidden="true" className="size-4" />
            ) : (
              <Lock aria-hidden="true" className="size-4" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-900">
              {isAvailable ? (
                <Link
                  to={resource.contextHref}
                  className="rounded outline-none after:absolute after:inset-0 after:content-[''] hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {resource.title}
                </Link>
              ) : (
                "Resource unavailable"
              )}
            </h4>
            <p className="mt-0.5 text-xs text-slate-500">
              {sourceMeta.shortLabel} · {resource.context}
            </p>
          </div>

          {isAvailable && (
            <Badge variant="outline" className="shrink-0 border-slate-200 bg-slate-50 text-slate-600">
              {resource.kind}
            </Badge>
          )}
        </div>

        <p className={`text-sm leading-6 ${isAvailable ? "text-slate-600" : "text-slate-500"}`}>
          {isAvailable
            ? resource.summary
            : "This resource is not available in your account right now. Open the context that owns it to see what is shared with you."}
        </p>

        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500">
            {isAvailable
              ? `${resource.owner}${resource.updated ? ` · ${resource.updated}` : ""}`
              : "No details are shown for resources you cannot open."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
