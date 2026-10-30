import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { libraryKindIcons, librarySourceMeta } from "./library-records"
import type { LibraryResource } from "./library-types"

type ResourceListRowProps = {
  resource: LibraryResource
}

export function ResourceListRow({ resource }: ResourceListRowProps) {
  const KindIcon = libraryKindIcons[resource.kind]
  const sourceMeta = librarySourceMeta[resource.source]

  return (
    <li className="group/resource relative flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:shadow-sm">
      <span
        aria-hidden="true"
        className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg ${sourceMeta.iconClassName}`}
      >
        <KindIcon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          <Link
            to={resource.contextHref}
            className="rounded outline-none after:absolute after:inset-0 after:content-[''] hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {resource.title}
          </Link>
        </p>
        <p className="truncate text-xs text-slate-500">
          {resource.context}
          {resource.owner ? ` · ${resource.owner}` : ""}
        </p>
      </div>

      <Badge variant="outline" className="shrink-0 border-slate-200 bg-slate-50 text-slate-600">
        {resource.kind}
      </Badge>

      {resource.updated ? (
        <span className="hidden shrink-0 text-xs text-slate-400 sm:inline">{resource.updated}</span>
      ) : null}
    </li>
  )
}
