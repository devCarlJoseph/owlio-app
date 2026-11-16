import { useLocation, useSearchParams } from 'react-router'
import { getDashboardRole } from '@/components/common/dashboard-navigation'
import { MeetingRoomSkeleton } from './meeting-room-skeleton'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export function MeetingRoomRouteSkeleton() {
  const [params] = useSearchParams()
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname)
  const coaching = role === 'esl' || role === 'tutors' || (role === 'students' && ['esl', 'tutors'].includes(params.get('category') ?? ''))
  if (params.get('source') === 'account') return <LoadingSkeleton label="Loading sessions…" className="mx-auto max-w-5xl"><div className="space-y-5"><Skeleton className="h-4 w-36" /><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-4/5" /><Skeleton className="h-10 w-full" /></div></LoadingSkeleton>
  const preview = params.has('layout-preview') || params.has('whiteboard-preview')
  const joining = !preview && ['join', 'session', 'room'].some(key => params.has(key))
  return <MeetingRoomSkeleton hub={!joining} coaching={coaching} />
}
