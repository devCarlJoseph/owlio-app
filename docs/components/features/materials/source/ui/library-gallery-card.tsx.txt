import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router"
import { Card } from "@/components/ui/card"
import { libraryKindIcons, librarySourceMeta } from "./library-records"
import type { LibraryResource } from "./library-types"
import styles from './library-theme.module.css'

export function LibraryGalleryCard({ resource }: { resource: LibraryResource }) {
  const meta = librarySourceMeta[resource.source]
  const KindIcon = libraryKindIcons[resource.kind]
  const SourceIcon = meta.icon

  return (
    <Card className="group/resource relative h-full gap-0 rounded-xl border border-border/70 bg-card p-2 shadow-none ring-0 transition-shadow hover:shadow-md motion-reduce:transition-none">
      <div aria-hidden="true" data-source={resource.source} className={`${styles.cover} relative h-36 overflow-hidden rounded-lg px-5 pt-4`}>
        <div className={`mx-auto min-h-44 max-w-48 rounded-t border border-border/60 bg-card p-4 shadow-sm transition-transform duration-200 group-hover/resource:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none ${resource.kind === "Template" ? "rotate-3" : resource.kind === "Reading" ? "-rotate-3" : ""}`}>
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <span className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">{resource.context}</span>
            <KindIcon className={`${styles.icon} size-5 shrink-0 rounded p-1`} />
          </div>
          <p className="mt-2 text-[11px] font-semibold leading-4 text-card-foreground">{resource.title}</p>
          {resource.kind === "Worksheet" || resource.kind === "Template" ? (
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {[0, 1, 2, 3].map((item) => <div key={item} className="h-5 rounded-sm border border-border bg-background" />)}
            </div>
          ) : (
            <div className="mt-3 space-y-1.5">
              <div className={`${styles.accent} h-5 rounded-sm`} />
              <div className="h-1 rounded-full bg-muted" />
              <div className="h-1 w-4/5 rounded-full bg-muted" />
              <div className="h-1 w-3/5 rounded-full bg-muted" />
            </div>
          )}
        </div>
        <span className="absolute bottom-2 right-2 rounded border border-border/50 bg-card px-1.5 py-0.5 text-[9px] font-medium text-card-foreground">{resource.kind}</span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-1.5 pb-2 pt-3">
        <div className="flex items-start justify-between gap-1">
          <h4 className="text-sm font-medium leading-5 text-foreground">
            <Link to={resource.contextHref} className="rounded outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] hover:underline focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2">{resource.title}</Link>
          </h4>
          <ArrowUpRight aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground">{resource.kind} · {resource.context}</p>
        <p className="mt-auto flex items-start gap-1.5 pt-1 text-[11px] leading-4 text-muted-foreground"><SourceIcon aria-hidden="true" className="mt-0.5 size-3 shrink-0" />{meta.shortLabel} · {resource.owner}</p>
      </div>
    </Card>
  )
}
