import type { ReactNode } from "react"
import { BookOpenCheck } from "lucide-react"
import { Link } from "react-router"

import { AuthShowcase } from "./auth-showcase"

type AuthLayoutProps = {
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ children, footer }: AuthLayoutProps) {
  return (
    <main className="relative isolate flex h-dvh items-center justify-center overflow-hidden bg-[#080611] p-2 sm:p-4 lg:p-5">
      <div aria-hidden="true" className="pointer-events-none absolute -left-36 top-1/4 size-96 rounded-full bg-fuchsia-600/20 blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 bottom-[-5rem] size-[30rem] rounded-full bg-blue-600/20 blur-[120px]" />

      <div className="relative grid h-full max-h-[760px] w-full max-w-[1180px] grid-cols-1 overflow-hidden rounded-[24px] bg-background p-1.5 shadow-[0_30px_100px_rgba(0,0,0,0.48)] ring-1 ring-white/20 sm:rounded-[30px] sm:p-2 lg:grid-cols-2">
        <AuthShowcase />

        <section className="flex min-h-0 flex-col px-5 py-4 sm:px-10 sm:py-5 lg:px-10 xl:px-[4.5rem] [@media(max-height:760px)]:py-2">
          <header className="flex items-center justify-center [@media(max-height:760px)]:hidden">
            <Link aria-label="Owlio home" className="inline-flex items-center gap-2.5" to="/">
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
                <BookOpenCheck aria-hidden="true" className="size-[18px]" />
              </span>
              <span className="text-lg font-semibold tracking-tight">owlio</span>
            </Link>
          </header>

          <div className="mx-auto flex min-h-0 w-full max-w-[410px] flex-1 flex-col justify-center py-3 sm:py-4 [@media(max-height:760px)]:py-0">
            {children}
          </div>

          <footer className="pb-1 text-center text-sm text-muted-foreground">
            {footer}
          </footer>
        </section>
      </div>
    </main>
  )
}
