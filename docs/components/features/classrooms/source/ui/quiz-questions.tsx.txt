import { Textarea } from "@/components/ui/textarea"
import type { ActivityQuestion } from "./classroom-types"
import { isAnswered } from "./quiz-answers"

export function QuizQuestions({
  questions,
  answers,
  disabled = false,
  onAnswer,
}: {
  questions: ActivityQuestion[]
  answers: Record<string, string>
  disabled?: boolean
  onAnswer: (questionId: string, value: string) => void
}) {
  return (
    <>
      {questions.map((question, index) => (
        <fieldset id={`quiz-question-${question.id}`} key={question.id} disabled={disabled} className="grid scroll-mt-24 gap-3 rounded-xl border border-border bg-card p-4 disabled:opacity-70">
          <legend className="px-1 text-sm font-semibold text-foreground">Question {index + 1} · {question.type}</legend>
          <p className="text-sm leading-6 text-foreground/80">{question.prompt}</p>
          {question.type === "Multiple choice" ? (
            <select
              aria-label={`Answer question ${index + 1}`}
              value={answers[question.id] ?? ""}
              onChange={(event) => onAnswer(question.id, event.currentTarget.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Choose an answer</option>
              {question.options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          ) : question.type === "True or false" ? (
            <div className="flex flex-wrap gap-4">
              {["True", "False"].map((answer) => (
                <label key={answer} className="inline-flex items-center gap-2 text-sm text-foreground/80">
                  <input type="radio" name={`answer-${question.id}`} value={answer} checked={answers[question.id] === answer} onChange={() => onAnswer(question.id, answer)} />
                  {answer}
                </label>
              ))}
            </div>
          ) : question.type === "Multiple select" ? (
            <div className="grid gap-2">
              {question.options.map((option) => {
                const selected = (answers[question.id] ?? "").split("\n").includes(option)
                return (
                  <label key={option} className="inline-flex items-center gap-2 text-sm text-foreground/80">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => {
                        const current = (answers[question.id] ?? "").split("\n").filter(Boolean)
                        onAnswer(question.id, (event.currentTarget.checked
                          ? [...current, option]
                          : current.filter((item) => item !== option)
                        ).join("\n"))
                      }}
                    />
                    {option}
                  </label>
                )
              })}
            </div>
          ) : (
            <Textarea
              aria-label={`Answer question ${index + 1}`}
              value={answers[question.id] ?? ""}
              onChange={(event) => onAnswer(question.id, event.currentTarget.value)}
              maxLength={4000}
              placeholder="Write your response…"
            />
          )}
        </fieldset>
      ))}
    </>
  )
}

export function QuestionNavigator({ questions, answers }: { questions: ActivityQuestion[]; answers: Record<string, string> }) {
  if (questions.length < 2) return null
  const answeredCount = questions.filter((question) => isAnswered(answers[question.id])).length
  return (
    <nav aria-label="Question navigator" className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">{answeredCount} of {questions.length} answered</span>
      {questions.map((question, index) => {
        const done = isAnswered(answers[question.id])
        return (
          <button
            key={question.id}
            type="button"
            aria-label={`Question ${index + 1}, ${done ? "answered" : "not answered"}`}
            onClick={() => document.getElementById(`quiz-question-${question.id}`)?.scrollIntoView({ block: "center" })}
            className={`inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring ${done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}
          >
            {done ? <span aria-hidden="true">✓</span> : index + 1}
          </button>
        )
      })}
    </nav>
  )
}
