import { useId } from 'react'
import { OwlioMascot } from '@/components/common/owlio-mascot/owlio-mascot'

/** Universal full-page loader. Keep in-page data skeletons inside their layouts. */
export function OwlioLoadingPage({
  title = 'Getting your space ready',
  description = 'A moment to bring your learning space together.',
}: { title?: string; description?: string }) {
  const id = useId()

  return (
    <main aria-labelledby={`${id}-title`} className="relative isolate flex min-h-screen min-h-dvh flex-col overflow-hidden bg-background px-6 text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-radial-[ellipse_at_center] from-brand-soft/60 via-background to-background" />
      <div className="flex flex-1 items-center justify-center py-16">
        <div className="flex w-full max-w-sm flex-col items-center text-center">
          <OwlioMascot state="flying" size={176} className="mb-1 sm:mb-2" />
          <p aria-label="Owlio" className="text-5xl font-bold tracking-[-0.06em]">owlio<span className="text-brand surface-dark:text-indigo-400">.</span></p>
          <div aria-hidden="true" className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-indigo-100 surface-dark:bg-indigo-400/15">
            <div className="h-full w-1/2 rounded-full bg-brand motion-safe:animate-owlio-loading-line surface-dark:bg-indigo-400" />
          </div>
          <div role="status" aria-live="polite" aria-atomic="true" className="mt-7">
            <h1 id={`${id}-title`} className="text-base font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 surface-dark:text-slate-300">{description}</p>
          </div>
        </div>
      </div>
      <footer className="pb-8 text-center text-xs leading-5 text-slate-500 surface-dark:text-slate-400">Your space to learn, teach, and grow.</footer>
    </main>
  )
}
