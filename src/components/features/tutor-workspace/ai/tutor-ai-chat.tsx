import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { BookOpen, Bot, FilePlus2, Send, Sparkles, UserRound } from "lucide-react"

type ChatMessage = {
  id: number
  role: "tutor" | "assistant"
  text: string
  taskType?: string
  saved?: boolean
}

type RelatedTopic = {
  name: string
  stage: "Prerequisite" | "Core" | "Next step"
}

export type ChatDraft = {
  type: string
  title: string
  context: string
}

const learnerContexts = ["Sarah Johnson", "Miguel Santos", "Evening Writing Group"]

const taskTypes = ["Lesson plan", "Practice problems", "Quiz questions", "Feedback draft", "Activity draft"]

const subjectTopics: Record<string, RelatedTopic[]> = {
  Calculus: [
    { name: "Functions and graphs", stage: "Prerequisite" },
    { name: "Limits and continuity", stage: "Prerequisite" },
    { name: "Derivatives", stage: "Core" },
    { name: "Chain rule", stage: "Core" },
    { name: "Introduction to integration", stage: "Core" },
    { name: "Area under a curve", stage: "Next step" },
  ],
  Algebra: [
    { name: "Order of operations", stage: "Prerequisite" },
    { name: "Linear equations", stage: "Core" },
    { name: "Factoring quadratics", stage: "Core" },
    { name: "Systems of equations", stage: "Next step" },
  ],
  "English writing": [
    { name: "Sentence structure", stage: "Prerequisite" },
    { name: "Paragraph organization", stage: "Core" },
    { name: "Thesis statements", stage: "Core" },
    { name: "Revising for clarity", stage: "Next step" },
  ],
  Physics: [
    { name: "Units and vectors", stage: "Prerequisite" },
    { name: "Newton's laws", stage: "Core" },
    { name: "Work and energy", stage: "Core" },
    { name: "Momentum", stage: "Next step" },
  ],
}

const stageStyles: Record<RelatedTopic["stage"], string> = {
  Prerequisite: "bg-amber-50 text-amber-800",
  Core: "bg-blue-50 text-blue-800",
  "Next step": "bg-emerald-50 text-emerald-800",
}

const quickPrompts = [
  "Explain this topic in simpler steps",
  "Create 5 practice questions",
  "Suggest a 30-minute session agenda",
  "Draft encouraging feedback",
]

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: "tutor",
    text: "Help me prepare a short warm-up on derivatives for Sarah's next session.",
  },
  {
    id: 2,
    role: "assistant",
    taskType: "Activity draft",
    text: "Draft warm-up (10 minutes):\n1. Review: what does the slope of a line tell us?\n2. Estimate the slope of y = x² at x = 1 using two nearby points.\n3. Introduce the power rule and check the estimate.\n\nReview and adjust the difficulty before using it with your learner.",
  },
]

function buildPreviewReply(prompt: string, taskType: string, subject: string, learner: string) {
  const topics = subjectTopics[subject] ?? []
  const core = topics.filter((t) => t.stage === "Core").map((t) => t.name)
  const prereq = topics.find((t) => t.stage === "Prerequisite")?.name
  return [
    `Draft ${taskType.toLowerCase()} for ${learner} (${subject}):`,
    `Request: "${prompt}"`,
    "",
    prereq ? `1. Quick check on the prerequisite: ${prereq}.` : "1. Quick check on prior knowledge.",
    `2. Focus on: ${core.slice(0, 2).join(" and ") || subject}.`,
    "3. Guided example, then one independent attempt.",
    "4. Close with a short reflection question.",
    "",
    "This is a sample preview response. Edit it before using it with a learner.",
  ].join("\n")
}

export function TutorAiChat({ onSaveDraft }: { onSaveDraft: (draft: ChatDraft) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [prompt, setPrompt] = useState("")
  const [learner, setLearner] = useState(learnerContexts[0])
  const [subject, setSubject] = useState("Calculus")
  const [taskType, setTaskType] = useState(taskTypes[0])
  const [isResponding, setIsResponding] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<number | undefined>(undefined)
  const nextIdRef = useRef(initialMessages.length + 1)

  const topics = subjectTopics[subject] ?? []

  useEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [messages, isResponding])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const sendPrompt = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isResponding) return
    const tutorMessage: ChatMessage = { id: nextIdRef.current++, role: "tutor", text: trimmed }
    const replyId = nextIdRef.current++
    setMessages((prev) => [...prev, tutorMessage])
    setPrompt("")
    setIsResponding(true)
    const replyContext = { taskType, subject, learner }
    timerRef.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: replyId,
          role: "assistant",
          taskType: replyContext.taskType,
          text: buildPreviewReply(trimmed, replyContext.taskType, replyContext.subject, replyContext.learner),
        },
      ])
      setIsResponding(false)
    }, 700)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    sendPrompt(prompt)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      sendPrompt(prompt)
    }
  }

  const applyTopic = (topic: string) => {
    setPrompt(`Help me prepare a ${taskType.toLowerCase()} on "${topic}" for ${learner}.`)
    inputRef.current?.focus()
  }

  const saveMessage = (message: ChatMessage) => {
    const firstLine = message.text.split("\n")[0].replace(/:$/, "")
    onSaveDraft({
      type: message.taskType ?? taskType,
      title: firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine,
      context: `${subject} - ${learner}`,
    })
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, saved: true } : m)))
  }

  const selectClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section aria-label="AI Tutor chat" className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-purple-50">
              <Sparkles aria-hidden="true" className="size-4 text-purple-700" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Ask the AI Tutor Assistant</h3>
              <p className="text-xs text-slate-500">Responses are editable drafts for the tutor only.</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">Preview responses</span>
        </header>

        <div className="grid gap-3 border-b border-slate-200 px-5 py-3 sm:grid-cols-3">
          <label className="text-xs font-medium text-slate-600">
            Learner or group
            <select value={learner} onChange={(e) => setLearner(e.target.value)} className={`mt-1 ${selectClass}`}>
              {learnerContexts.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600">
            Subject
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className={`mt-1 ${selectClass}`}>
              {Object.keys(subjectTopics).map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600">
            Task type
            <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className={`mt-1 ${selectClass}`}>
              {taskTypes.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>

        <div
          ref={logRef}
          role="log"
          aria-label="Chat messages"
          aria-live="polite"
          className="h-[420px] space-y-4 overflow-y-auto bg-slate-50/60 px-5 py-4"
        >
          {messages.map((message) =>
            message.role === "tutor" ? (
              <div key={message.id} className="flex justify-end gap-2">
                <p className="max-w-[80%] whitespace-pre-line rounded-2xl rounded-br-sm bg-blue-600 px-4 py-2.5 text-sm leading-6 text-white">
                  {message.text}
                </p>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <UserRound aria-hidden="true" className="size-4 text-blue-700" />
                </span>
              </div>
            ) : (
              <div key={message.id} className="flex gap-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <Bot aria-hidden="true" className="size-4 text-purple-700" />
                </span>
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-purple-700">
                    Draft suggestion{message.taskType ? ` · ${message.taskType}` : ""}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{message.text}</p>
                  <button
                    type="button"
                    onClick={() => saveMessage(message)}
                    disabled={message.saved}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-default disabled:text-emerald-700"
                  >
                    <FilePlus2 aria-hidden="true" className="size-3.5" />
                    {message.saved ? "Saved to drafts" : "Save as draft"}
                  </button>
                </div>
              </div>
            ),
          )}
          {isResponding && (
            <div className="flex gap-2" role="status">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
                <Bot aria-hidden="true" className="size-4 text-purple-700" />
              </span>
              <p className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-500">Preparing a draft…</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 border-t border-slate-200 px-5 py-4">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => sendPrompt(quick)}
                disabled={isResponding}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition-colors hover:border-blue-200 hover:text-blue-700 disabled:opacity-50"
              >
                {quick}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <label htmlFor="tutor-ai-prompt" className="sr-only">
              Message the AI Tutor Assistant
            </label>
            <textarea
              id="tutor-ai-prompt"
              ref={inputRef}
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for a lesson plan, practice questions, or feedback draft…"
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isResponding}
              aria-label="Send message"
              className="inline-flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300"
            >
              <Send aria-hidden="true" className="size-4" />
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Enter to send, Shift+Enter for a new line. Do not include private learner or session information.
          </p>
        </form>
      </section>

      <aside aria-label="Related topics" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <BookOpen aria-hidden="true" className="size-4 text-blue-700" />
          <h3 className="text-base font-semibold text-slate-900">Related topics</h3>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Topics needed for {subject}. Select one to start a prompt.
        </p>
        <ul className="mt-4 space-y-2">
          {topics.map((topic) => (
            <li key={topic.name}>
              <button
                type="button"
                onClick={() => applyTopic(topic.name)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-left text-sm text-slate-800 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
              >
                <span>{topic.name}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${stageStyles[topic.stage]}`}>
                  {topic.stage}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
