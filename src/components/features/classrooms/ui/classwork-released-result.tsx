import { useEffect, useState } from 'react'
import { getClassworkReleasedResult } from '@/services/api/classwork-grading.service'

export function ClassworkReleasedResult({ submissionId }: { submissionId: string }) {
  const [result, setResult] = useState<Awaited<ReturnType<typeof getClassworkReleasedResult>>>()
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    getClassworkReleasedResult(submissionId, controller.signal).then(data => {
      if (!controller.signal.aborted) setResult(data)
    }).catch(() => {
      if (!controller.signal.aborted) setError(true)
    })
    return () => controller.abort()
  }, [submissionId])

  return <section aria-label="Your grade and feedback" className="space-y-2 rounded-xl bg-brand-soft p-4 text-sm text-brand-soft-foreground">
    <h4 className="font-semibold">Your grade and feedback</h4>
    {error ? <p role="alert">Your result couldn’t be loaded. Reload saved work to retry.</p>
      : result === undefined ? <p role="status">Loading grade…</p>
      : result === null ? <p>Your educator hasn’t released your result yet.</p>
      : <>
        {result.score !== null && result.maxPoints !== null && <p className="font-medium">{result.score} / {result.maxPoints} points</p>}
        <p className="whitespace-pre-wrap wrap-anywhere">{result.feedback || 'No written feedback.'}</p>
      </>}
  </section>
}
