import { ChevronRight, GraduationCap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Classroom } from '../types/classroom-types'

export function ClassroomInformation({ classroom, owned, notice, onAbout, onCopyCode }: {
  classroom: Classroom
  owned: boolean
  notice: string
  onAbout: () => void
  onCopyCode: () => void
}) {
  return (
    <aside aria-label="Classroom information" className="min-w-0 space-y-4 xl:sticky xl:top-0">
      <section className="rounded-xl border border-border bg-card shadow-none overflow-hidden">
        <h3 className="border-b border-border px-4 py-3 text-xs font-semibold">Class details</h3>
        <div className="p-4">
          <p className="line-clamp-4 break-words text-sm leading-6 text-muted-foreground">{classroom.description || 'No description provided.'}</p>
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <p className="flex items-start gap-2 text-sm"><GraduationCap aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><span>{classroom.instructorName || 'Instructor details unavailable'}</span></p>
            <p className="flex items-center gap-2 text-sm"><Users aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />{owned ? 'Teaching workspace' : 'Enrolled member'}</p>
          </div>
          <Button variant="ghost" className="mt-4 h-auto w-full justify-between bg-muted/60 px-2 py-2 text-xs whitespace-normal" onClick={onAbout}>View class information<ChevronRight aria-hidden="true" className="size-4" /></Button>
        </div>
      </section>
      <details className="rounded-xl border border-border bg-card shadow-none p-4">
        <summary className="cursor-pointer rounded-md text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">Classroom invite</summary>
        <section aria-label="Classroom invite" className="mt-4 space-y-3">
          <h3 className="text-sm font-semibold">Student invite code</h3>
          {classroom.joinCode ? (
            <>
              <code className="block select-all break-all rounded-lg bg-muted p-3 text-sm">{classroom.joinCode}</code>
              <Button variant="outline" className="w-full" onClick={onCopyCode}>Copy invite code</Button>
              <p className="text-xs leading-5 text-muted-foreground">Share this code only with students invited to this classroom.</p>
            </>
          ) : <p className="text-sm leading-6 text-muted-foreground">This classroom has a legacy invite. Its owner must rotate the code before it can be displayed here.</p>}
          {notice && <p role="status" className="text-sm">{notice}</p>}
        </section>
      </details>
      {classroom.meetingCode && (
        <details className="rounded-xl border border-border bg-card shadow-none p-4">
          <summary className="cursor-pointer rounded-md text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">Classroom meeting code</summary>
          <code className="mt-3 block select-all break-all rounded-lg bg-muted p-3 text-sm">{classroom.meetingCode}</code>
        </details>
      )}
      <p className="px-1 text-xs leading-5 text-muted-foreground">Your classroom, your learning community.</p>
    </aside>
  )
}
