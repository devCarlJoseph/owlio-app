import { Info, Plus } from "lucide-react"
import { Link } from "react-router"
import { cn } from "cn"
import { buttonVariants } from "@/components/ui/button"
import { subjectShortcutLinks } from "./subject-records"

const workspacePillIcons = [subjectShortcutLinks[0].icon, subjectShortcutLinks[1].icon, subjectShortcutLinks[2].icon]

type SubjectsHeroProps = {
  intro: string
  onCreate: () => void
}

export function SubjectsHero({ intro, onCreate }: SubjectsHeroProps) {
  return (
    <section className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-100 via-sky-50 to-blue-200 p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-slate-500">Personal workspace</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            My Subjects
          </h2>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "rounded-full bg-white/80 text-slate-800 shadow-sm ring-1 ring-white/70 hover:bg-white",
          )}
        >
          <Plus aria-hidden="true" />
          New subject
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/60 pt-4">
        <ul className="flex flex-wrap gap-2">
          {subjectShortcutLinks.map(({ label, href, icon: Icon }, index) => {
            const PillIcon = workspacePillIcons[index] ?? Icon

            return (
              <li key={href}>
                <Link
                  to={href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm outline-none transition hover:bg-white hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <PillIcon aria-hidden="true" className="size-4" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          aria-label="About My Subjects"
          className="group/info relative inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/70 text-slate-500 shadow-sm ring-1 ring-white/70 outline-none transition hover:bg-white hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Info aria-hidden="true" className="size-4" />
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 w-64 rounded-xl bg-slate-900 p-3 text-left text-xs leading-5 text-white opacity-0 shadow-lg transition-opacity group-hover/info:opacity-100 group-focus-visible/info:opacity-100"
          >
            {intro}
          </span>
        </button>
      </div>
    </section>
  )
}
