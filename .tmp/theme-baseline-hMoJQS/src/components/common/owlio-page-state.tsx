import { useId, type ReactNode } from 'react'

type OwlioPageStateProps = {
  title: string
  description: ReactNode
  tone?: 'error' | 'info'
  code?: number
  action?: ReactNode
}

/** Full-page errors show a confirmed status code, or the mascot when no code is known. */
export function OwlioPageState({ title, description, tone = 'info', code, action }: OwlioPageStateProps) {
  const id = useId()

  return (
    <main className="flex min-h-screen min-h-dvh bg-background text-foreground">
      <div className="flex w-full flex-col">
        <header className="flex items-center gap-2 px-6 py-6 sm:px-10">
          <img src="/logo.png" alt="Owlio" className="h-10 w-auto object-contain surface-dark:rounded-lg surface-dark:bg-white surface-dark:px-2" />
        </header>
        <section aria-labelledby={id + '-title'} className="flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-8 text-center sm:pb-24">
          {code !== undefined
            ? <p className="text-[clamp(6rem,18vw,11rem)] leading-none font-bold tracking-[-0.06em] text-slate-200 surface-dark:text-slate-600"><span className="sr-only">Error </span>{code}</p>
            : <img src="/mascot/owlio-owl.png" alt="" width={385} height={420} className="mb-3 h-44 w-auto rounded-2xl object-contain sm:h-52" />}
          <div role={tone === 'error' ? 'alert' : 'status'} aria-live={tone === 'error' ? 'assertive' : 'polite'} aria-atomic="true" className="mt-4 w-full max-w-md">
            <h1 id={id + '-title'} className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
            <div className="mt-3 break-words text-sm leading-6 text-slate-600 surface-dark:text-slate-300">{description}</div>
          </div>
          {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
        </section>
      </div>
    </main>
  )
}
