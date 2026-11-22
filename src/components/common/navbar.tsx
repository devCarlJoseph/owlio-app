import { Link } from "react-router"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <header className="relative z-10 border-b border-slate-200/70 surface-dark:border-border/70 bg-white/80 surface-dark:bg-card/80 backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="Owlio home" className="flex items-center gap-2.5 font-semibold tracking-tight text-slate-950 surface-dark:text-foreground">
          <img src="/logo.png" alt="" className="h-10 w-auto object-contain" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/login" className="text-sm font-semibold text-slate-700 surface-dark:text-foreground transition hover:text-indigo-700 surface-dark:hover:text-indigo-300">
            Sign in
          </Link>
          <Button render={<Link to="/register" />} className="rounded-full px-5">
            Get started <ArrowUpRight aria-hidden="true" />
          </Button>
        </div>
      </nav>
    </header>
  )
}
