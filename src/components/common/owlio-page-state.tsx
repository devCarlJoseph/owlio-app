import { useId, type ReactNode } from 'react'
import { BookOpenCheck, TriangleAlert } from 'lucide-react'
import { OwlioMascotArtwork } from '@/components/common/owlio-mascot/owlio-mascot-artwork'

type OwlioPageStateProps = {
  title: string
  description: ReactNode
  tone?: 'error' | 'info'
  action?: ReactNode
}

/** Shared presentation for states that replace the entire application shell. */
export function OwlioPageState({ title, description, tone = 'info', action }: OwlioPageStateProps) {
  const id = useId()
  const Icon = tone === 'error' ? TriangleAlert : BookOpenCheck

  return (
    <main className="relative isolate flex min-h-screen min-h-dvh flex-col overflow-hidden bg-indigo-100 text-slate-950 surface-dark:bg-slate-950 surface-dark:text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-radial-[at_50%_35%] from-white via-indigo-50 to-indigo-200/70 surface-dark:from-indigo-950 surface-dark:via-slate-950 surface-dark:to-indigo-950/60" />
      <header className="flex items-center gap-2.5 px-6 py-6 sm:px-10">
        <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20"><BookOpenCheck className="size-5" aria-hidden="true" /></span>
        <span className="text-2xl font-bold tracking-tight">owlio<span className="text-indigo-600 surface-dark:text-indigo-400">.</span></span>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 py-8 sm:py-12">
        <section aria-labelledby={`${id}-title`} className="w-full max-w-lg overflow-hidden rounded-3xl border border-white bg-white shadow-xl shadow-indigo-950/10 surface-dark:border-indigo-400/20 surface-dark:bg-slate-900 surface-dark:shadow-black/20">
          <div aria-hidden="true" className="relative flex h-48 items-center justify-center overflow-hidden bg-indigo-600 sm:h-56">
            <div className="absolute size-72 rounded-full border border-white/15" />
            <div className="absolute size-96 rounded-full border border-white/10" />
            <div className="relative size-56 sm:size-64"><OwlioMascotArtwork id={`${id}-owl`} /></div>
            <span className="absolute bottom-5 right-6 size-3 rounded-full bg-amber-300" />
            <span className="absolute left-8 top-8 size-2 rounded-full bg-indigo-200" />
          </div>

          <div className="px-6 py-8 text-center sm:px-10 sm:py-10">
            <div role={tone === 'error' ? 'alert' : 'status'} aria-live={tone === 'error' ? 'assertive' : 'polite'} aria-atomic="true">
              <span className={tone === 'error'
                ? 'mx-auto mb-5 flex size-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 surface-dark:bg-amber-400/15 surface-dark:text-amber-300'
                : 'mx-auto mb-5 flex size-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 surface-dark:bg-indigo-400/15 surface-dark:text-indigo-300'}>
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h1 id={`${id}-title`} className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
              <div className="mt-3 break-words text-sm leading-6 text-slate-600 surface-dark:text-slate-300">{description}</div>
            </div>
            {action && <div className="mt-7 flex flex-wrap justify-center gap-3">{action}</div>}
          </div>
        </section>
      </div>
      <footer className="px-6 pb-7 text-center text-xs font-medium tracking-wide text-indigo-800 surface-dark:text-indigo-300">A little space to learn. A world of possibility.</footer>
    </main>
  )
}
