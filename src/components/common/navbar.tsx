import { Link } from "react-router"
import { ArrowUpRight, BookOpenCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <header className="relative z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="Owlio home" className="flex items-center gap-2.5 font-semibold tracking-tight text-slate-950">
          <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
            <BookOpenCheck aria-hidden="true" className="size-5" />
          </span>
          <span className="text-xl">owlio<span className="text-indigo-600">.</span></span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/auth/login" className="text-sm font-semibold text-slate-700 transition hover:text-indigo-700">
            Sign in
          </Link>
          <Button render={<Link to="/auth/register" />} className="rounded-full bg-indigo-600 px-5 text-white hover:bg-indigo-700">
            Get started <ArrowUpRight aria-hidden="true" />
          </Button>
        </div>
      </nav>
    </header>
  )
}
