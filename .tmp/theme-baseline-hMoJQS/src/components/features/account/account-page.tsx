import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router'
import { getDashboardProfileNavigation } from '@/components/common/dashboard-navigation'

const columns = 'grid gap-2 sm:grid-cols-[minmax(8rem,_2fr)_minmax(0,_3fr)] sm:gap-6'

export function AccountPage({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <section className="mx-auto grid w-full max-w-6xl items-start gap-5 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-7">
      <nav aria-label="Account pages" className="flex flex-wrap gap-1 lg:grid lg:border-l lg:py-1">
        {getDashboardProfileNavigation(pathname).map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            end
            to={href}
            className={({ isActive }) => [
              'flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring lg:-ml-px lg:rounded-l-none lg:border-l',
              isActive ? 'border-primary bg-primary/10 text-primary' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
            ].join(' ')}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="min-w-0 space-y-6 rounded-xl border bg-card p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </section>
  )
}

export function AccountHeading({ title, description }: { title: string; description: string }) {
  return (
    <header>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </header>
  )
}

export function AccountRow({ label, id, description, children }: {
  label: string
  id?: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className={columns}>
      <div className="space-y-1">
        {id ? <label htmlFor={id} className="block text-sm font-medium">{label}</label> : <p className="text-sm font-medium">{label}</p>}
        {description && <p id={id ? id + '-description' : undefined} className="text-xs leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function AccountActions({ children }: { children: ReactNode }) {
  return <div className={columns}><div className="min-w-0 space-y-2 sm:col-start-2">{children}</div></div>
}
