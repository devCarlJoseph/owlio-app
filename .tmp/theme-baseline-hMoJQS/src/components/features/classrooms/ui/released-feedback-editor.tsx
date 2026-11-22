import { useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/services/api/api-error'
import { reviseGradebookFeedback } from '@/services/api/classroom-gradebook.service'
import type { ClassworkEvaluation } from '@/services/api/classwork-grading.service'

export function ReleasedFeedbackEditor({ evaluation, onSave }: { evaluation: ClassworkEvaluation; onSave: (value: ClassworkEvaluation) => void }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(evaluation.feedback)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const pending = useRef(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending.current || draft.trim() === evaluation.feedback) return
    pending.current = true
    setBusy(true)
    setError('')
    const feedback = draft.trim()
    try {
      const result = await reviseGradebookFeedback(evaluation.submissionId, feedback, evaluation.version)
      if (result.submissionId !== evaluation.submissionId || result.status !== 'RELEASED' || result.feedback !== feedback) {
        throw new Error('The revised feedback could not be confirmed.')
      }
      onSave(result)
      setEditing(false)
      setSaved(true)
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Could not update feedback. Your edits are still here.'))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return editing ? <form onSubmit={submit} className="mt-3 space-y-2">
    <Label htmlFor="revise-grade-feedback">Feedback for the student</Label>
    <Textarea id="revise-grade-feedback" className="bg-card" value={draft} maxLength={6000} disabled={busy}
      required={evaluation.maxPoints === null} onChange={event => setDraft(event.currentTarget.value)} />
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    <div className="flex flex-wrap gap-1.5">
      <Button type="submit" size="sm" disabled={busy || draft.trim() === evaluation.feedback || (evaluation.maxPoints === null && !draft.trim())}>
        {busy ? 'Saving…' : 'Update feedback'}
      </Button>
      <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setEditing(false)}>Cancel</Button>
    </div>
  </form> : <div className="mt-2 space-y-1">
    {saved && <p role="status" className="text-xs">Updated feedback is visible to the student.</p>}
    <Button type="button" size="sm" variant="outline" onClick={() => {
      setDraft(evaluation.feedback)
      setError('')
      setSaved(false)
      setEditing(true)
    }}>Edit released feedback</Button>
  </div>
}
