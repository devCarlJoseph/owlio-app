import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { Maximize2, Minimize2, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useClassroomPrototype } from "./classroom-prototype-context"
import type { Classroom, ClassroomActivity } from "./classroom-types"
import { QuizCountdown } from "./quiz-countdown"
import { QuizLeaderboard } from "./quiz-leaderboard"
import { isAnswered } from "./quiz-answers"
import { QuestionNavigator, QuizQuestions } from "./quiz-questions"
import { QuizResultCard } from "./quiz-result-card"
import { buildLeaderboard, formatDuration, getQuizTimingState, type QuizPhase } from "./quiz-timing"
import { useNow } from "./use-now"

const LEARNER_LABEL = "You"

const phaseMessages: Partial<Record<QuizPhase, string>> = {
  ready: "Press Start quiz when you are ready. The questions appear once the timer begins.",
  "not-open": "This quiz is not open yet.",
  closed: "This quiz is closed and can no longer be started.",
  submitted: "You have submitted this quiz. Retakes are not available.",
}

export function QuizWorkspace({ classroom, activity }: { classroom: Classroom; activity: ClassroomActivity }) {
  const { submitActivity, startActivityAttempt, currentLearnerId } = useClassroomPrototype()
  const timing = activity.timing
  const submission = activity.submissions.find((item) => item.learnerId === currentLearnerId)
  const attempt = activity.attempts?.find((item) => item.learnerId === currentLearnerId)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [status, setStatus] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [tab, setTab] = useState("quiz")
  const [autoSubmitted, setAutoSubmitted] = useState(false)
  const answersRef = useRef<Record<string, string>>({})
  const autoSubmittedRef = useRef(false)

  const timedAndOpen = Boolean(timing) && !(timing && submission)
  const now = useNow(timedAndOpen)
  const timingState = timing ? getQuizTimingState(timing, attempt?.startedAt, now, Boolean(submission)) : null
  const phase: QuizPhase = timingState?.phase ?? "running"
  const questionsVisible = phase === "running" || phase === "expired"
  const locked = phase === "expired"
  const leaderboard = useMemo(() => buildLeaderboard(activity), [activity])
  const myEntry = leaderboard.find((entry) => entry.learnerId === currentLearnerId)
  const unanswered = activity.questions.filter((question) => !isAnswered(answers[question.id])).length
  const autoSubmitOnTimeUp = Boolean(timing?.autoSubmitOnTimeUp)

  const sendSubmission = (message: string) => {
    submitActivity(classroom.id, activity.id, JSON.stringify(answers))
    setConfirming(false)
    setStatus(message)
  }

  useEffect(() => {
    if (phase !== "expired" || !autoSubmitOnTimeUp || autoSubmittedRef.current) return
    autoSubmittedRef.current = true
    submitActivity(classroom.id, activity.id, JSON.stringify(answersRef.current))
    setAutoSubmitted(true)
  }, [phase, autoSubmitOnTimeUp, submitActivity, classroom.id, activity.id])

  useEffect(() => {
    if (phase !== "running") return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [phase])

  const setAnswer = (questionId: string, value: string) => {
    answersRef.current = { ...answersRef.current, [questionId]: value }
    setAnswers(answersRef.current)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!Object.values(answers).some(isAnswered) && phase !== "expired") {
      setStatus("Answer at least one question before submitting.")
      return
    }
    if (!confirming && unanswered > 0 && phase === "running") {
      setConfirming(true)
      return
    }
    sendSubmission("Quiz submitted in this preview session only. It was not uploaded or saved.")
  }

  return (
    <div className="space-y-5">
      {!focusMode && (
        <section
          aria-labelledby="quiz-hero-title"
          className="relative isolate overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-primary/10 via-background to-background px-5 py-8 text-center sm:py-10"
        >
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-10 left-1/2 -z-10 flex size-40 -translate-x-1/2 items-center justify-center rounded-full bg-primary/10 text-primary/40">
            <Trophy className="size-20" />
          </span>
          <h2 id="quiz-hero-title" className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{activity.title}</h2>
          <p className="mx-auto mt-2 max-w-xl whitespace-pre-wrap text-sm text-muted-foreground">{activity.instructions}</p>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted-foreground">
            {timing ? `Time allowed: ${formatDuration(timing.durationMinutes)} · ` : ""}
            {activity.questions.length} {activity.questions.length === 1 ? "question" : "questions"} · {classroom.name}
            {activity.dueDate ? ` · Due ${activity.dueDate}` : ""}
          </p>
        </section>
      )}

      <Tabs value={tab} onValueChange={(value) => setTab(String(value))} className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="quiz" className="px-4">{activity.type}</TabsTrigger>
            <TabsTrigger value="leaderboard" className="px-4">Leaderboard</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">Demo workspace</Badge>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-pressed={focusMode}
              aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
              onClick={() => setFocusMode((current) => !current)}
            >
              {focusMode ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
            </Button>
          </div>
        </div>

        <TabsContent value="quiz" className="pt-4">
          <div className={focusMode ? "grid gap-5" : "grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]"}>
            <div className="min-w-0 space-y-4">
              {timing && timingState && (
                <div className={phase === "running" ? "sticky top-2 z-10" : ""}>
                  <QuizCountdown timing={timing} state={timingState} onStart={() => startActivityAttempt(classroom.id, activity.id)} />
                </div>
              )}
              {!timing && (
                <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">No time limit was set for this {activity.type.toLowerCase()}.</p>
              )}

              {phaseMessages[phase] && (
                <p className="rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">{phaseMessages[phase]}</p>
              )}

              {questionsVisible && activity.questions.length > 0 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <QuestionNavigator questions={activity.questions} answers={answers} />
                  <QuizQuestions questions={activity.questions} answers={answers} disabled={locked} onAnswer={setAnswer} />
                  {locked && !submission && (
                    <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-900">Time is up. Your answers are locked. Submit what you have.</p>
                  )}
                  {confirming && (
                    <div role="alertdialog" aria-label="Confirm submission" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                      <p>You have {unanswered} unanswered {unanswered === 1 ? "question" : "questions"}. Submit anyway?</p>
                      <div className="mt-3 flex gap-2">
                        <Button type="button" size="sm" onClick={() => sendSubmission("Quiz submitted in this preview session only. It was not uploaded or saved.")}>Submit now</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setConfirming(false)}>Keep working</Button>
                      </div>
                    </div>
                  )}
                  {status && <p role="status" className="text-sm text-amber-800">{status}</p>}
                  {!confirming && <Button type="submit">{submission ? "Update demo response" : "Submit quiz"}</Button>}
                </form>
              )}

              {!questionsVisible && status && <p role="status" className="text-sm text-amber-800">{status}</p>}
              {phase === "submitted" && !status && autoSubmitted && (
                <p role="status" className="text-sm text-amber-800">Time ran out and your answers were submitted automatically in this preview.</p>
              )}
            </div>
            {!focusMode && (
              <aside aria-label="Your result" className="min-w-0">
                <QuizResultCard activity={activity} submission={submission} myEntry={myEntry} learnerName={LEARNER_LABEL} />
              </aside>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="pt-4">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <QuizLeaderboard enabled={Boolean(activity.showLeaderboard)} entries={leaderboard} currentLearnerId={currentLearnerId ?? ""} />
            <aside aria-label="Your result" className="min-w-0">
              <QuizResultCard activity={activity} submission={submission} myEntry={myEntry} learnerName={LEARNER_LABEL} />
            </aside>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
