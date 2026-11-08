import { ArrowUpRight, Plus } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { subjectShortcutLinks } from "./subject-records"

type SubjectsHeroProps = { intro: string; onCreate: () => void }

export function SubjectsHero({ intro, onCreate }: SubjectsHeroProps) {
  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-brand">Personal workspace</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-foreground">My Learning</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{intro}</p>
        </div>
        <Button type="button" onClick={onCreate} className="rounded-lg bg-brand px-4 text-brand-foreground hover:bg-brand/90"><Plus aria-hidden="true" /> New subject</Button>
      </div>
      <nav aria-label="Personal learning tools" className="flex flex-wrap gap-x-6 gap-y-3 border-b border-border pb-4">
        {subjectShortcutLinks.map(({ label, href, icon: Icon }) => (
          <Link key={href} to={href} className="inline-flex items-center gap-2 rounded-sm text-xs font-medium text-muted-foreground outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Icon aria-hidden="true" className="size-4 text-brand" />{label}<ArrowUpRight aria-hidden="true" className="size-3" />
          </Link>
        ))}
      </nav>
    </header>
  )
}
