import { useId, type ReactNode } from 'react'
import { Link } from 'react-router'
import { StatusIllustration } from './status-illustration'

const errorMessages: Record<number, { title: string; description: string }> = {
  400: { title: 'This request could not be completed', description: 'Check the information you entered and try again.' },
  401: { title: 'Sign in required', description: 'Please sign in to access this page.' },
  403: { title: 'Forbidden', description: 'You do not have permission to access this page or resource.' },
  404: { title: 'Page not found', description: 'Sorry, we were unable to find that page. The link may have moved or be incorrect.' },
  408: { title: 'The request timed out', description: 'Please try again when your connection is ready.' },
  409: { title: 'This information has changed', description: 'Refresh the page to review the latest information before trying again.' },
  422: { title: 'Check your information', description: 'Some information could not be accepted. Review it and try again.' },
  429: { title: 'Too many requests', description: 'Please wait a moment before trying again.' },
  500: { title: "This page isn’t working", description: 'Something went wrong on the server. Please try again later.' },
  502: { title: 'Connection interrupted', description: 'The server received an unexpected response. Please try again later.' },
  503: { title: 'Service temporarily unavailable', description: 'Owlio is temporarily unavailable. Please try again later.' },
  504: { title: 'The server took too long', description: 'The server did not respond in time. Please try again later.' },
}

type StatusPageProps = {
  title: string
  description: ReactNode
  code?: number
  illustration: 'search' | 'barrier' | 'lock' | 'server'
  action?: ReactNode
  embedded?: boolean
  bare?: boolean
}

export function StatusPage({ title, description, code, illustration, action, embedded = false, bare = false }: StatusPageProps) {
  const id = useId()
  return <section aria-labelledby={id} className={`flex items-center justify-center px-4 py-8 ${bare ? 'text-foreground' : 'bg-[#edf1f4] text-[#11102f] surface-dark:bg-background surface-dark:text-foreground'} ${embedded ? 'min-h-[65dvh] rounded-2xl' : 'min-h-dvh'}`}>
    <div className={`flex min-h-[440px] w-full max-w-xl flex-col items-center justify-center px-6 py-10 text-center sm:min-h-[480px] sm:px-12 ${bare ? '' : 'rounded-xl bg-white surface-dark:bg-card'}`}>
      <StatusIllustration kind={illustration} />
      {code !== undefined && <p className="mt-5 text-3xl font-semibold text-[#2863e8] surface-dark:text-blue-400"><span className="sr-only">Error </span>{code}</p>}
      <h1 id={id} className="mt-4 text-xl font-medium tracking-tight">{title}</h1>
      <div className="mt-4 max-w-sm text-sm leading-6 text-slate-600 surface-dark:text-muted-foreground">{description}</div>
      {action && <div className="mt-7 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  </section>
}

export const statusActionClassName = 'inline-flex min-h-9 items-center justify-center rounded-full bg-[#131137] px-6 py-2 text-xs font-medium text-white transition-colors hover:bg-[#292454] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 surface-dark:bg-primary surface-dark:text-primary-foreground'

/** Accepts any confirmed HTTP error code; specialized messages cover current app needs. */
export function HttpErrorPage({ status, title, description, action, homeHref = '/', embedded = false }: {
  status: number; title?: string; description?: ReactNode; action?: ReactNode; homeHref?: string; embedded?: boolean
}) {
  const message = errorMessages[status] ?? { title: 'The request could not be completed', description: 'Please try again or return to your dashboard.' }
  return <StatusPage code={status} title={title ?? message.title} description={description ?? message.description}
    illustration={status === 404 ? 'search' : status === 401 ? 'lock' : status === 403 || status === 503 ? 'barrier' : 'server'} embedded={embedded}
    action={action ?? <Link to={status === 401 ? '/login' : homeHref} className={statusActionClassName}>{status === 401 ? 'Go to sign in' : homeHref === '/' ? 'Go home' : 'Go to Dashboard'}</Link>} />
}
