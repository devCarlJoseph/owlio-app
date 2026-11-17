import { useId } from 'react'
import { OwlioMascot } from '@/components/common/owlio-mascot/owlio-mascot'

/** Universal full-page loader. Keep in-page data skeletons inside their layouts. */
export function OwlioLoadingPage({
  title = 'Getting your space ready',
  description = 'A moment to bring your learning space together.',
}: { title?: string; description?: string }) {
  const id = useId()

  return (
    <main aria-labelledby={`${id}-title`} className="flex min-h-screen min-h-dvh items-center justify-center overflow-hidden bg-[#91d0f6] px-6 py-12 text-indigo-950 surface-dark:bg-slate-950 surface-dark:text-indigo-100">
        <div className="flex w-full max-w-xs flex-col items-center text-center">
          <div aria-hidden="true" className="relative mb-1 flex h-24 items-center justify-center">
            <OwlioMascot state="flying" size={64} className="translate-y-2 [&_[data-part=interaction]]:[animation-delay:-400ms] [&_[data-part=wing-left]]:[animation-delay:-200ms] [&_[data-part=wing-flight-right]]:[animation-delay:-200ms]" />
            <OwlioMascot state="flying" size={76} />
            <OwlioMascot state="flying" size={64} className="translate-y-2 [&_[data-part=interaction]]:[animation-delay:-800ms] [&_[data-part=wing-left]]:[animation-delay:-400ms] [&_[data-part=wing-flight-right]]:[animation-delay:-400ms]" />
          </div>
          <div aria-hidden="true" className="h-6 w-60 max-w-full overflow-hidden rounded-full border-[3px] border-indigo-400/70 bg-indigo-600/80 p-0.5 shadow-[inset_0_2px_3px_rgba(30,27,75,0.2)] surface-dark:border-indigo-400/50 surface-dark:bg-indigo-950">
            <div className="h-full w-1/2 rounded-l-full bg-sky-200 [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.85)_0px,rgba(255,255,255,.85)_8px,rgba(255,255,255,.2)_8px,rgba(255,255,255,.2)_16px)] [background-size:32px_32px] motion-safe:animate-owlio-loading-stripes" />
          </div>
          <div role="status" aria-live="polite" aria-atomic="true" className="mt-3">
            <h1 id={`${id}-title`} className="text-xl font-bold tracking-tight">Loading…<span className="sr-only"> {title}</span></h1>
            <p className="sr-only">{description}</p>
          </div>
        </div>
    </main>
  )
}
