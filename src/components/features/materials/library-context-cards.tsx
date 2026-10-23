import { ArrowRight } from "lucide-react"
import { Link } from "react-router"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { librarySourceMeta, librarySources } from "./library-records"

export function LibraryContextCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {librarySources.map((source) => {
        const meta = librarySourceMeta[source]
        const Icon = meta.icon

        return (
          <Card
            key={source}
            className={cn(
              "group relative h-full border shadow-sm ring-0 transition duration-200 hover:shadow-md motion-reduce:transition-none",
              meta.cardClassName,
            )}
          >
            <CardContent className="flex-1 gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${meta.iconClassName}`}
                >
                  <Icon aria-hidden="true" className="size-5" />
                </span>

                <h3 className="text-base font-semibold tracking-tight text-slate-900">
                  <Link
                    to={meta.libraryHref}
                    className="rounded-md outline-none after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {meta.label}
                  </Link>
                </h3>

                <Badge variant="outline" className={`ml-auto ${meta.badgeClassName}`}>
                  {meta.ownerLabel}
                </Badge>
              </div>

              <p className="text-sm leading-6 text-slate-700">{meta.description}</p>

              <div className="mt-auto flex items-center gap-2 border-t border-white/70 pt-3">
                <Link
                  to={meta.libraryHref}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "relative z-10",
                    meta.buttonClassName,
                  )}
                >
                  Open library
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
