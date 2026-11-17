import { useId } from 'react'

/** Universal full-page loader. Keep in-page data skeletons inside their layouts. */
export function OwlioLoadingPage({
  title = 'Getting your space ready',
  description = 'A moment to bring your learning space together.',
}: { title?: string; description?: string }) {
  const id = useId()

  return (
    <main aria-labelledby={id + '-title'} className="flex min-h-screen min-h-dvh flex-col bg-background text-foreground">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <img src="/mascot/owlio-owl.png" alt="" width={385} height={420} className="h-44 w-auto object-contain sm:h-52" />
        <div role="status" aria-live="polite" aria-atomic="true" className="mt-8">
          <div aria-hidden="true" className="flex h-5 items-center justify-center gap-2.5">
            <span className="size-2.5 rounded-full bg-brand motion-safe:animate-owlio-loading-dot" />
            <span className="size-2.5 rounded-full bg-brand motion-safe:animate-owlio-loading-dot motion-safe:[animation-delay:150ms]!" />
            <span className="size-2.5 rounded-full bg-brand motion-safe:animate-owlio-loading-dot motion-safe:[animation-delay:300ms]!" />
          </div>
          <h1 id={id + '-title'} className="sr-only">{title}</h1>
          <p className="sr-only">{description}</p>
        </div>
      </div>
    </main>
  )
}
