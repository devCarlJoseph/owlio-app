import { Link, useLocation } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { UnderDevelopment } from './classroom-ui'

export function ClassroomActivityView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname) ?? 'students'
  return <div className="space-y-4"><Link className="underline" to={'/' + role + '/classrooms'}>Back to classrooms</Link>
    <UnderDevelopment title="Classroom activities are not available yet" /></div>
}
