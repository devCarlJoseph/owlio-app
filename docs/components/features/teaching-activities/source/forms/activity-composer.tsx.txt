import { useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QuizTimerSettings } from '@/components/features/classrooms/quiz-timer-settings'
import { parseTimingFields, type TimingFormResult } from '@/components/features/classrooms/quiz-timing'
import type { ActivityTiming, Classroom, CreateActivityInput } from '@/components/features/classrooms/classroom-types'
import { activityTypes, questionTypes, workspaceCopy, type TeachingRole } from './activity-workspace-model'

const schema = z.object({
  classroomId: z.string().min(1, 'Choose a teaching group.'), title: z.string().trim().min(3, 'Use at least 3 characters for the title.').max(100),
  type: z.enum(activityTypes), instructions: z.string().trim().min(1, 'Add instructions for the learner.').max(2000), dueDate: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/, 'Choose a valid due date.'),
  scoringNote: z.string().trim().max(200), responseType: z.enum(['Text', 'File', 'Link']), questionType: z.enum(questionTypes), prompt: z.string().trim().max(1000), options: z.string(),
}).superRefine((data, ctx) => {
  if (data.type !== 'Quiz' && data.type !== 'Test') return
  if (!data.prompt) ctx.addIssue({ code: 'custom', path: ['prompt'], message: 'Add a question prompt.' })
  if (['Multiple choice', 'Multiple select'].includes(data.questionType) && data.options.split(',').map(item => item.trim()).filter(Boolean).length < 2) ctx.addIssue({ code: 'custom', path: ['options'], message: 'Add at least two comma-separated options.' })
})
type Values = z.infer<typeof schema>
const selectClass = 'h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function ActivityComposer({ open, onOpenChange, classrooms, role, onCreate }: {
  open: boolean; onOpenChange: (open: boolean) => void; classrooms: Classroom[]; role: TeachingRole
  onCreate: (classroomId: string, input: CreateActivityInput) => void
}) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"><ComposerForm classrooms={classrooms} role={role} onCreate={onCreate} onCancel={() => onOpenChange(false)} /></DialogContent></Dialog>
}

function ComposerForm({ classrooms, role, onCreate, onCancel }: { classrooms: Classroom[]; role: TeachingRole; onCreate: (classroomId: string, input: CreateActivityInput) => void; onCancel: () => void }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState('')
  const [timingErrors, setTimingErrors] = useState<TimingFormResult['errors']>({})
  const { register, handleSubmit, control, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { classroomId: classrooms[0]?.id ?? '', title: '', type: role === 'esl' ? 'Speaking practice' : 'Assignment', instructions: '', dueDate: '', scoringNote: '', responseType: 'Text', questionType: 'Multiple choice', prompt: '', options: '' } })
  const type = useWatch({ control, name: 'type' })
  const questionType = useWatch({ control, name: 'questionType' })
  const formBased = type === 'Quiz' || type === 'Test'
  const copy = workspaceCopy[role]
  function submit(data: Values) {
    setError('')
    if (!classrooms.some(item => item.id === data.classroomId)) { setError('The selected group is no longer available. Close this form and choose an available group.'); return }
    let timing: ActivityTiming | undefined
    let showLeaderboard: boolean | undefined
    if (formBased && formRef.current) {
      const form = new FormData(formRef.current)
      const parsed = parseTimingFields({ duration: String(form.get('timer-duration') ?? ''), opensAt: String(form.get('timer-opens') ?? ''), closesAt: String(form.get('timer-closes') ?? ''), autoSubmit: form.get('timer-auto-submit') === 'on' })
      setTimingErrors(parsed.errors)
      if (!parsed.timing) return
      timing = parsed.timing
      showLeaderboard = form.get('show-leaderboard') === 'on'
    }
    try {
      onCreate(data.classroomId, { title: data.title, type: data.type, instructions: data.instructions, dueDate: data.dueDate, scoringNote: data.scoringNote, responseType: formBased ? 'Quiz' : data.responseType, questions: formBased ? [{ id: crypto.randomUUID(), type: data.questionType, prompt: data.prompt, options: ['Multiple choice', 'Multiple select'].includes(data.questionType) ? data.options.split(',').map(item => item.trim()).filter(Boolean) : [] }] : [], timing, showLeaderboard })
    } catch { setError('The preview activity couldn’t be added. Your entries are still here; check the group and try again.') }
  }
  const errorFor = (name: keyof Values) => errors[name]?.message ? <p id={`create-${name}-error`} role="alert" className="text-xs text-destructive">{String(errors[name]?.message)}</p> : null
  return <>
    <DialogHeader><DialogTitle className="text-xl font-semibold">Create preview activity</DialogTitle><DialogDescription>This creates a Published example in the selected classroom preview. Changes stay in this tab and reset on refresh.</DialogDescription></DialogHeader>
    <form ref={formRef} onSubmit={event => void handleSubmit(submit)(event)} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="create-classroom">{copy.context}</Label><select id="create-classroom" className={selectClass} {...register('classroomId')} aria-invalid={Boolean(errors.classroomId)} aria-describedby={errors.classroomId ? 'create-classroomId-error' : undefined}>{classrooms.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{errorFor('classroomId')}</div><div className="space-y-2"><Label htmlFor="create-type">Activity type</Label><select id="create-type" className={selectClass} {...register('type')}>{activityTypes.map(item => <option key={item}>{item}</option>)}</select></div></div>
      <div className="space-y-2"><Label htmlFor="create-title">Activity title</Label><Input id="create-title" {...register('title')} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'create-title-error' : undefined} placeholder={role === 'esl' ? 'e.g. Describe your favorite place' : 'e.g. Apply what we learned'} maxLength={100} />{errorFor('title')}</div>
      <div className="space-y-2"><Label htmlFor="create-instructions">Learner instructions</Label><Textarea id="create-instructions" {...register('instructions')} aria-invalid={Boolean(errors.instructions)} aria-describedby={errors.instructions ? 'create-instructions-error' : undefined} placeholder="Explain the task and what a useful response looks like…" className="min-h-28" maxLength={2000} />{errorFor('instructions')}</div>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="create-due">Due date (optional)</Label><Input id="create-due" type="date" {...register('dueDate')} aria-invalid={Boolean(errors.dueDate)} aria-describedby={errors.dueDate ? 'create-dueDate-error' : undefined} />{errorFor('dueDate')}</div><div className="space-y-2"><Label htmlFor="create-criteria">{copy.criteria} (optional)</Label><Input id="create-criteria" {...register('scoringNote')} maxLength={200} placeholder="e.g. Explain your reasoning clearly" /></div></div>
      {formBased ? <fieldset className="space-y-4 rounded-xl border border-border p-4"><legend className="px-1 text-sm font-medium">Question preview</legend><p className="text-xs text-muted-foreground">The current classroom prototype supports one question per new quiz or test.</p><div className="space-y-2"><Label htmlFor="create-question-type">Question type</Label><select id="create-question-type" className={selectClass} {...register('questionType')}>{questionTypes.map(item => <option key={item}>{item}</option>)}</select></div><div className="space-y-2"><Label htmlFor="create-prompt">Question prompt</Label><Textarea id="create-prompt" {...register('prompt')} maxLength={1000} aria-invalid={Boolean(errors.prompt)} aria-describedby={errors.prompt ? 'create-prompt-error' : undefined} />{errorFor('prompt')}</div>{['Multiple choice', 'Multiple select'].includes(questionType) && <div className="space-y-2"><Label htmlFor="create-options">Answer options, separated by commas</Label><Input id="create-options" {...register('options')} placeholder="First choice, Second choice" aria-invalid={Boolean(errors.options)} aria-describedby={errors.options ? 'create-options-error' : undefined} />{errorFor('options')}</div>}<QuizTimerSettings required isQuizOrTest errors={timingErrors} /></fieldset>
        : <div className="space-y-2"><Label htmlFor="create-response-type">Response type</Label><select id="create-response-type" className={selectClass} {...register('responseType')}><option value="Text">Written response</option><option value="Link">Link response</option><option value="File">File description preview</option></select><p className="text-[11px] leading-5 text-muted-foreground">Files are descriptive previews only. Nothing is uploaded or scanned.</p></div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-border pt-4"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit">Add to preview</Button></div>
    </form>
  </>
}
