import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/services/api/api-error'
import { getPeriodGrades, releasePeriodGrade } from '@/services/api/classroom-gradebook.service'
import { gradingPeriodLabels, gradingPeriods, type GradingPeriod } from '../contents/grading-periods'

type PeriodItems = Awaited<ReturnType<typeof getPeriodGrades>>
type Release = Awaited<ReturnType<typeof releasePeriodGrade>>

export function PeriodGrades({ classroomId, studentId, owned }: { classroomId: string; studentId: string; owned: boolean }) {
  const [items, setItems] = useState<PeriodItems | null>(null)
  const [releases, setReleases] = useState<Partial<Record<GradingPeriod, Release>>>({})
  const [confirm, setConfirm] = useState<GradingPeriod | null>(null)
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    getPeriodGrades(classroomId, studentId, owned, controller.signal).then(data => {
      if (!controller.signal.aborted) setItems(data)
    }).catch(cause => {
      if (!controller.signal.aborted) setError(getApiErrorMessage(cause, 'Could not load semester grades.'))
    })
    return () => controller.abort()
  }, [classroomId, owned, revision, studentId])

  async function release(period: GradingPeriod, earned: number, possible: number) {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    try {
      const saved = await releasePeriodGrade(classroomId, studentId, { period, expectedEarned: earned, expectedPossible: possible })
      if (saved.period !== period) throw new Error('The released grade could not be confirmed.')
      setReleases(current => ({ ...current, [period]: saved }))
      setConfirm(null)
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Could not confirm release. Refresh semester grades before trying again.'))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && <div className="space-y-1">
        <p role="alert" className="text-xs text-destructive">{error}</p>
        <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => {
          setError('')
          setItems(null)
          setConfirm(null)
          setRevision(value => value + 1)
        }}>Reload semester grades</Button>
      </div>}
      {!items && !error && <p role="status" className="text-xs text-muted-foreground">Loading semester grades…</p>}
      {items && <ul aria-label="Semester grading periods" className="space-y-1.5">
        {gradingPeriods.map(period => {
          const item = items.find(value => value.period === period)
          const preview = item?.preview
          const released = releases[period] ?? item?.released
          const ready = !!preview?.possible && !preview.pending && !preview.open
          return <li key={period} className="space-y-1 rounded-lg bg-card px-2.5 py-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium">{gradingPeriodLabels[period]}</span>
              <span className="tabular-nums">{released?.percentage != null ? `${released.percentage.toFixed(2)}%` : (
                <span className="text-muted-foreground">{owned ? preview?.possible ? 'Pending release' : 'No scored work' : 'Not released'}</span>
              )}</span>
            </div>
            {released && <p className="text-muted-foreground">{released.earned} / {released.possible} points</p>}
            {owned && !released && preview && ready && (
              confirm === period ? <div className="space-y-1">
                <p>Release ${''}{preview.percentage?.toFixed(2)}% ({preview.earned} / {preview.possible}) to this student?</p>
                <div className="flex flex-wrap gap-1">
                  <Button type="button" size="xs" disabled={busy} onClick={() => void release(period, preview.earned, preview.possible)}>Confirm release</Button>
                  <Button type="button" size="xs" variant="ghost" disabled={busy} onClick={() => setConfirm(null)}>Cancel</Button>
                </div>
              </div> : <Button type="button" size="xs" variant="outline" disabled={busy}
                onClick={() => setConfirm(period)}>Release {gradingPeriodLabels[period]} grade</Button>
            )}
            {owned && !released && preview && !ready && preview.possible > 0 && (
              <p className="text-muted-foreground">
                {preview.open > 0 ? `${preview.open} scored activities still open. ` : ''}
                {preview.pending > 0 ? `${preview.pending} submitted grades awaiting release.` : ''}
              </p>
            )}
          </li>
        })}
      </ul>}
    </div>
  )
}
