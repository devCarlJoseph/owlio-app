import { ArrowRight } from "lucide-react"
import { Link } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { librarySourceMeta, librarySources } from "./library-records"

export function LibraryContextCards() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {librarySources.map((source) => {
        const meta = librarySourceMeta[source]
        const Icon = meta.icon

        return (
          <Card key={source} className={`group relative h-full border p-0 shadow-none ring-0 ${meta.cardClassName}`}>
            <CardContent className="h-full gap-2 p-4">
              <span className="flex items-center justify-between gap-3">
                <Icon aria-hidden="true" className="size-5 text-foreground/70" />
                <span className="text-[10px] text-muted-foreground">{meta.ownerLabel}</span>
              </span>
              <h4 className="mt-1 text-sm font-semibold text-foreground">
                <Link to={meta.libraryHref} className="rounded outline-none after:absolute after:inset-0 after:rounded-xl after:content-[''] hover:underline focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2">{meta.label}</Link>
              </h4>
              <p className="text-xs leading-5 text-muted-foreground">{meta.description}</p>
              <span className="mt-auto flex items-center gap-1 pt-2 text-xs font-medium text-foreground">Explore collection <ArrowRight aria-hidden="true" className="size-3.5" /></span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
