import { Link } from "react-router"
import { BookOpenCheck } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 surface-dark:border-border bg-white surface-dark:bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-7 text-sm text-slate-500 surface-dark:text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link to="/" aria-label="Owlio home" className="flex w-fit items-center gap-2 font-semibold text-slate-800 surface-dark:text-foreground">
          <BookOpenCheck aria-hidden="true" className="size-4 text-indigo-600 surface-dark:text-indigo-300" />
          Owlio
        </Link>
        <p>Make every study session count.</p>
        <p>© {new Date().getFullYear()} Owlio</p>
      </div>
    </footer>
  )
}
