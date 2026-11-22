import { useLocation } from 'react-router'
import { HttpErrorPage } from './http-error-page'
import { getDashboardWorkspace } from './dashboard-navigation'

export function NotFoundPage() {
  const { pathname } = useLocation()
  const workspace = getDashboardWorkspace(pathname)
  return <HttpErrorPage status={404} homeHref={workspace?.homeHref} embedded={Boolean(workspace)} />
}
