import type { ReactNode, RefObject } from "react"
import { BookOpenCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { AuthBrandPanel } from "./auth-brand-panel"

type AuthLayoutProps = {
  title: string
  description: string
  headingRef: RefObject<HTMLHeadingElement | null>
  children: ReactNode
}

export function AuthLayout({ title, description, headingRef, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <AuthBrandPanel />
      <main className="flex min-w-0 flex-col items-center px-4 py-6 sm:px-8 sm:py-10 lg:justify-center lg:px-10 xl:px-16">
        <div className="mb-8 flex w-full max-w-xl items-center gap-2.5 font-semibold tracking-tight text-slate-950 lg:hidden" aria-label="Owlio">
          <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <BookOpenCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="text-xl">owlio<span className="text-indigo-600">.</span></span>
        </div>
        <Card className="w-full max-w-xl overflow-visible rounded-2xl border-border/70 shadow-sm">
          <CardHeader className="gap-2 px-5 pt-6 sm:px-8 sm:pt-8">
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-semibold tracking-tight text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-3xl">
              {title}
            </h1>
            <CardDescription className="text-sm leading-6 sm:text-base">{description}</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
            {children}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
