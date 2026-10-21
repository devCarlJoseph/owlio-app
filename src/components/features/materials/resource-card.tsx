import { Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { libraryKindIcons, librarySourceMeta } from "./library-records"
import { ResourceContextLink } from "./resource-context-link"
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
          ? "border border-slate-200 bg-white shadow-sm ring-0"
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
              {isAvailable ? resource.title : "Resource unavailable"}
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="min-w-0">
            {isAvailable ? (
              <>
                <p className="text-xs text-slate-500">
                  {resource.owner}
                  {resource.updated ? ` · ${resource.updated}` : ""}
                </p>
                <Badge variant="secondary" className={`mt-1.5 ${sourceMeta.badgeClassName}`}>
                  {sourceMeta.ownerLabel}
                </Badge>
              </>
            ) : (
              <p className="text-xs text-slate-500">No details are shown for resources you cannot open.</p>
            )}
          </div>

          <ResourceContextLink href={resource.contextHref} label={resource.contextAction} />
        </div>
      </CardContent>
    </Card>
  )
}
