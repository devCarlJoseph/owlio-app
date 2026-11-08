import { useEffect, useRef, useState } from "react"
import { Atom, BookOpen, Calculator, CheckCircle2, FlaskConical, Globe, GraduationCap, Lightbulb, PencilLine, RotateCcw, Ruler, XCircle, type LucideIcon } from "lucide-react"
import { authShowcaseContent, type AuthShowcaseContext } from "./auth-showcase-content"
import { OwlioOwl } from "./owlio-owl"

const patternIcons: Array<{ icon: LucideIcon; className: string }> = [
  { icon: Globe, className: "left-[10%] top-[18%] size-10" },
  { icon: Atom, className: "left-[22%] top-[6%] size-9" },
  { icon: Calculator, className: "right-[12%] top-[38%] size-8" },
  { icon: PencilLine, className: "right-[16%] top-[8%] size-8" },
  { icon: FlaskConical, className: "left-[6%] top-[44%] size-8" },
  { icon: Ruler, className: "right-[30%] top-[22%] size-7" },
  { icon: Lightbulb, className: "left-[36%] top-[30%] size-7" },
  { icon: BookOpen, className: "right-[6%] top-[58%] size-9" },
]

const rotationDelay = 6500

export function AuthShowcase({ context }: { context: AuthShowcaseContext }) {
  const celebrateTimer = useRef(0)
  const [activeFeature, setActiveFeature] = useState(0)
  const [paused, setPaused] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [celebrating, setCelebrating] = useState(false)
  const content = authShowcaseContent[context]
  const { features, questions } = content

  const feature = features[activeFeature]
  const question = questions?.[questionIndex] ?? null
  const FeatureIcon = feature.icon
  const GuideIcon = content.guide?.icon ?? GraduationCap
  const answered = question !== null && selected !== null
  const isCorrect = question !== null && selected === question.answer

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = window.setInterval(() => setActiveFeature((index) => (index + 1) % features.length), rotationDelay)
    return () => window.clearInterval(timer)
  }, [features, paused])

  useEffect(() => () => window.clearTimeout(celebrateTimer.current), [])

  function choose(option: number) {
    if (!question || answered) return
    setSelected(option)
    if (option !== question.answer) return
    setCorrectCount((count) => count + 1)
    setCelebrating(true)
    window.clearTimeout(celebrateTimer.current)
    celebrateTimer.current = window.setTimeout(() => setCelebrating(false), 900)
  }

  function nextQuestion() {
    if (!questions) return
    setSelected(null)
    setQuestionIndex((index) => (index + 1) % questions.length)
  }

  return (
    <aside
      className="relative isolate hidden h-full flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#4f7be8_0%,#3f6bdc_45%,#5b86ec_100%)] p-5 text-white lg:flex xl:p-6"
      aria-label={content.asideLabel}
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.16)_1px,transparent_0)] [background-size:22px_22px]" />
        {patternIcons.map(({ icon: Icon, className }) => <Icon key={className} strokeWidth={1.2} className={`absolute text-white/25 ${className}`} />)}
        <div className="absolute -bottom-16 -left-10 h-56 w-[70%] rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-10 right-0 h-48 w-[60%] rounded-full bg-sky-200/20 blur-2xl" />
        <div className="absolute -right-20 -top-24 size-80 rounded-full bg-indigo-300/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-end pt-2">
        <div className="relative -mb-1 flex w-[clamp(150px,calc((100svh-440px)*1.1),396px)] flex-col items-center">
            <div className="relative z-10 -mb-[5%] w-[83%]">
              <OwlioOwl className="w-full" />
              <span key={feature.badge} className="absolute left-[86%] animate-in fade-in zoom-in-75 slide-in-from-bottom-2 duration-300 motion-reduce:animate-none top-[10%] flex items-center gap-2 whitespace-nowrap rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.5)]" aria-hidden="true">
                <span className="flex size-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><FeatureIcon className="size-4" /></span>
                {feature.badge}
              </span>
              {celebrating && <span className="absolute right-[86%] animate-in fade-in zoom-in-75 slide-in-from-bottom-2 duration-300 motion-reduce:animate-none top-[6%] whitespace-nowrap rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-emerald-950 shadow-lg" aria-hidden="true">+1 correct!</span>}
            </div>
            <svg viewBox="0 0 320 92" className="relative w-full drop-shadow-[0_10px_14px_rgba(23,37,84,0.28)]" aria-hidden="true">
              <rect x="22" y="62" width="276" height="28" rx="7" fill="#f59e0b" />
              <rect x="34" y="67" width="252" height="18" rx="3" fill="#fff7ed" />
              <rect x="276" y="62" width="22" height="28" rx="6" fill="#d97706" />
              <rect x="34" y="33" width="252" height="30" rx="7" fill="#1d4ed8" />
              <rect x="46" y="39" width="228" height="18" rx="3" fill="#eff6ff" />
              <rect x="34" y="33" width="22" height="30" rx="6" fill="#1e3a8a" />
              <rect x="46" y="4" width="228" height="30" rx="7" fill="#dbeafe" />
              <rect x="46" y="4" width="228" height="10" rx="5" fill="#eef4ff" />
              <rect x="58" y="16" width="204" height="13" rx="3" fill="#ffffff" />
              <rect x="252" y="4" width="22" height="30" rx="6" fill="#93c5fd" />
              <path d="M226 4h11v34l-5.5-5.5L226 38z" fill="#f59e0b" />
            </svg>
        </div>
      </div>

      <div
        className="relative shrink-0 rounded-2xl border border-white/30 bg-white/15 px-5 py-4 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.6)] backdrop-blur-md"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div key={activeFeature} className="animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none" aria-live="polite">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-100"><FeatureIcon className="size-3.5" aria-hidden="true" />{feature.eyebrow}</p>
          <p className="mt-1.5 text-base font-semibold leading-snug xl:text-lg">{feature.title}</p>
          <p className="mt-1 text-sm leading-6 text-blue-50/90 [@media(max-height:700px)]:hidden">{feature.description}</p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-blue-100">
          <span>{content.footer}</span>
          <div className="flex items-center gap-1.5">
            {features.map((item, index) => (
              <button
                key={item.eyebrow}
                type="button"
                onClick={() => setActiveFeature(index)}
                aria-label={`Show ${item.eyebrow}`}
                aria-current={index === activeFeature}
                className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${index === activeFeature ? "w-6 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {question ? (
        <section className="relative mt-3 shrink-0 rounded-2xl bg-white p-4 text-slate-800 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.6)]" aria-labelledby="showcase-guide-title">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><GraduationCap className="size-5" aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 id="showcase-guide-title" className="text-sm font-semibold">{content.questionTitle ?? "Warm-up question"}</h2>
                <span className="text-[11px] font-medium text-slate-500">{correctCount} correct</span>
              </div>
              <p className="mt-0.5 text-[13px] leading-5 text-slate-600">{question.prompt}</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {question.options.map((option, index) => {
                  const state = !answered ? "idle" : index === question.answer ? "correct" : index === selected ? "wrong" : "muted"
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => choose(index)}
                      disabled={answered}
                      aria-pressed={selected === index}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        state === "correct" ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : state === "wrong" ? "border-rose-400 bg-rose-50 text-rose-700"
                            : state === "muted" ? "border-slate-200 text-slate-400"
                              : "border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              <div className="mt-2 empty:hidden" aria-live="polite">
                {answered && (
                  <div className="flex items-center justify-between gap-3">
                    <p className={`flex items-start gap-1.5 text-xs leading-5 ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                      {isCorrect ? <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /> : <XCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />}
                      <span><strong className="font-semibold">{isCorrect ? "Nice work!" : "Not quite."}</strong> {question.explanation}</span>
                    </p>
                    <button type="button" onClick={nextQuestion} className="flex shrink-0 items-center gap-1 rounded text-xs font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                      <RotateCcw className="size-3" aria-hidden="true" />Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : content.guide ? (
        <section className="relative mt-3 shrink-0 rounded-2xl bg-white p-4 text-slate-800 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.6)]" aria-labelledby="showcase-guide-title">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600"><GuideIcon className="size-5" aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2 id="showcase-guide-title" className="text-sm font-semibold">{content.guide.title}</h2>
                <span className="text-[11px] font-medium text-slate-500">{content.guide.steps.length} steps</span>
              </div>
              <ol className="mt-2 space-y-1.5">
                {content.guide.steps.map(({ title, description }, index) => (
                  <li key={title} className="flex items-start gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-semibold text-blue-700">{index + 1}</span>
                    <span className="min-w-0 text-xs leading-5"><strong className="font-semibold">{title}.</strong> <span className="text-slate-600">{description}</span></span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      ) : null}
    </aside>
  )
}
