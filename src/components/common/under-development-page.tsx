import { Link, useLocation } from 'react-router'
import { getDashboardPageTitle, getDashboardWorkspace } from './dashboard-navigation'
import { StatusPage, statusActionClassName } from './http-error-page'

export function UnderDevelopmentPage() {
  const { pathname } = useLocation()
  const title = getDashboardPageTitle(pathname)
  return <StatusPage embedded illustration="barrier" title="Under development"
    description={<><p className="font-medium text-foreground">{title}</p><p className="mt-1">We’re building this page. Check back later for updates.</p></>}
    action={<Link to={getDashboardWorkspace(pathname)?.homeHref ?? '/'} className={statusActionClassName}>Go to Dashboard</Link>} />
}
