import type { ReactNode } from "react"
import { Link } from "react-router"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AuthShowcase } from "./auth-showcase"
import type { AuthShowcaseContext } from "./auth-showcase-content"

type AuthShowcaseLayoutProps = {
  children: ReactNode
  context: AuthShowcaseContext
}

export function AuthShowcaseLayout({ children, context }: AuthShowcaseLayoutProps) {
  return (
    <div className="min-h-svh bg-white lg:grid lg:h-svh lg:grid-cols-2 lg:gap-4 lg:overflow-hidden lg:p-3">
      <main className="min-h-svh lg:h-full lg:min-h-0 lg:overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex min-h-svh flex-col px-6 py-6 sm:px-10 lg:min-h-full lg:px-8 lg:py-5">
            <Link to="/" aria-label="Owlio home" className="flex w-fit items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
              <img src="/mascot/owlio-mark.png" alt="" width={128} height={116} className="h-8 w-auto" />
              <span className="text-xl font-bold tracking-tight text-[#1d4ed8]">Owlio</span>
            </Link>
            <div className="flex flex-1 items-center justify-center py-10 lg:py-6">
              <section className="w-full max-w-[400px]">{children}</section>
            </div>
          </div>
        </ScrollArea>
      </main>
      <AuthShowcase key={context} context={context} />
    </div>
  )
}
