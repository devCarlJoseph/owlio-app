import { BookOpen, Check, GraduationCap, Users, Video } from 'lucide-react'
import { Link } from 'react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import type { Classroom } from '../types/classroom-types'
import { getClassroomBannerUrl } from '../utils/classroom-covers'
import { getClassroomCategory } from '../utils/classroom-list-meta'

export function ClassroomDetailHeader({ classroom, owned, meetingHref, onClasswork }: {
  classroom: Classroom
  owned: boolean
  meetingHref: string | null
  onClasswork: () => void
}) {
  return (
    <section aria-label="Classroom group header" className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="relative isolate flex min-h-52 items-start overflow-hidden bg-brand-soft sm:min-h-60 lg:min-h-64">
        <img src={getClassroomBannerUrl(classroom.id)} alt="" fetchPriority="high" className="pointer-events-none absolute inset-y-0 right-0 -z-20 h-full w-auto max-w-none select-none" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-brand-soft via-brand-soft/85 to-brand-soft/80 sm:via-brand-soft/30 sm:to-transparent dark:via-brand-soft/70" />
        <div className="min-w-0 max-w-full p-5 sm:max-w-[65%] sm:p-7 lg:p-8">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-brand-soft-foreground"><GraduationCap aria-hidden="true" className="size-3.5" />{getClassroomCategory(classroom)}</p>
          <h2 className="break-words text-2xl font-bold tracking-tight sm:text-[1.75rem]">{classroom.name}</h2>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"><Users aria-hidden="true" className="size-3.5" /><span>Classroom group</span><span aria-hidden="true">·</span><span>{owned ? 'You manage this classroom' : 'You’re enrolled in this classroom'}</span></p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border p-5 sm:px-7 sm:py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-card"><GraduationCap className="size-4 text-muted-foreground" /></span>
          <div className="min-w-0"><p className="truncate text-xs font-semibold">{classroom.instructorName || 'Instructor details unavailable'}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{owned ? 'Teaching workspace' : 'Enrolled member'}</p></div>
          <span className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[10px] font-medium"><Check aria-hidden="true" className="size-3" />{owned ? 'Class owner' : 'Enrolled'}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={onClasswork}><BookOpen aria-hidden="true" />View classwork</Button>
          {meetingHref && <Link className={buttonVariants({ className: 'bg-brand text-brand-foreground hover:bg-brand/90' })} to={meetingHref}><Video aria-hidden="true" />Meeting room</Link>}
        </div>
      </div>
    </section>
  )
}
