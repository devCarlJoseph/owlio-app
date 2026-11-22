import { Link, useLocation } from 'react-router'
import { getDashboardPageTitle, getDashboardWorkspace } from './dashboard-navigation'
import { StatusPage } from './http-error-page'
import { Button } from '@/components/ui/button'

export function UnderDevelopmentPage() {
  const { pathname } = useLocation()
  const title = getDashboardPageTitle(pathname)
  return <StatusPage embedded bare illustration="barrier" title="Under development"
    description={<><p className="font-medium text-foreground">{title}</p><p className="mt-1">We’re building this page. Check back later for updates.</p></>}
    action={<Button render={<Link to={getDashboardWorkspace(pathname)?.homeHref ?? '/'} />} className="rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand/90 focus-visible:ring-brand/50">Go to Dashboard</Button>} />
}
