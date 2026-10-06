import { Link } from "react-router"
import { ArrowRight, BookOpen, Check, Clock3, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ApiConnectionStatus from "./api-connection-status"

const focusItems = ["Review biology notes", "Practice Spanish vocabulary", "Prepare for tomorrow"]

export default function WelcomeHero() {
  return (
    <section className="relative isolate mx-auto grid min-h-[calc(100svh-9.5rem)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
      <div className="pointer-events-none absolute -left-36 top-10 -z-10 size-80 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/3 -z-10 size-72 rounded-full bg-cyan-100/70 blur-3xl" />

      <div className="max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3.5 py-2 text-sm font-medium text-indigo-800 shadow-sm">
          <Sparkles aria-hidden="true" className="size-4" />
          Your learning, all in one place
        </div>
        <h1 className="text-5xl leading-[1.08] font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">
          A little more focus. <span className="text-indigo-600">A lot more</span> progress.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl">
          Welcome to Owlio — a calmer space to organize your studies, learn with others, and keep moving toward your goals.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button render={<Link to="/auth/register" />} size="lg" className="h-12 rounded-full bg-indigo-600 px-6 text-base text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">
            Create your free account <ArrowRight aria-hidden="true" />
          </Button>
          <Button render={<Link to="/auth/login" />} variant="outline" size="lg" className="h-12 rounded-full border-slate-300 bg-white/70 px-6 text-base">
            I already have an account
          </Button>
        </div>
        <p className="mt-3 text-sm text-slate-500">For independent learners, classrooms, and tutoring.</p>
        <ApiConnectionStatus />
      </div>

      <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
        <div aria-hidden="true" className="absolute -right-5 -top-6 size-24 rounded-3xl bg-amber-200/80 rotate-12" />
        <div aria-hidden="true" className="absolute -bottom-7 -left-6 size-28 rounded-full bg-indigo-200/80" />
        <Card className="relative rounded-[2rem] border-white/80 bg-white/90 p-2 shadow-2xl shadow-indigo-950/10 ring-1 ring-slate-200/80 backdrop-blur">
          <CardContent className="gap-6 p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Your study space</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">A good day to learn</h2>
              </div>
              <span className="flex size-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <BookOpen aria-hidden="true" className="size-5" />
              </span>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-5 text-white sm:p-6">
              <div className="flex items-center justify-between text-indigo-100">
                <span className="text-sm font-medium">Weekly focus</span>
                <Clock3 aria-hidden="true" className="size-4" />
              </div>
              <div className="mt-5 flex items-end gap-2">
                <span className="text-4xl font-semibold tracking-tight">4.5</span>
                <span className="pb-1 text-sm text-indigo-100">hours set aside</span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-3/5 rounded-full bg-white" />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">A few things to get started</h3>
                <span className="text-xs font-medium text-slate-400">TODAY</span>
              </div>
              <ul className="space-y-2.5">
                {focusItems.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 text-sm text-slate-700">
                    <span className={`flex size-6 shrink-0 items-center justify-center rounded-full ${index === 0 ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-400 ring-1 ring-slate-200"}`}>
                      {index === 0 ? <Check aria-hidden="true" className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
        <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-lg sm:block">
          <p className="text-xs text-slate-500">Small steps add up</p>
          <p className="mt-1 font-semibold text-slate-900">Keep your learning moving ✨</p>
        </div>
      </div>
    </section>
  )
}
