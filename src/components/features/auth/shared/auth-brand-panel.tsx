import { BookOpenCheck, NotebookPen, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-indigo-50/70 px-10 py-12 lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-14" aria-label="About Owlio">
      <div className="absolute -right-20 top-24 size-72 rounded-full bg-indigo-200/30 blur-3xl" aria-hidden="true" />
      <div className="relative z-10 flex items-center gap-2.5 font-semibold tracking-tight text-slate-950">
        <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <BookOpenCheck className="size-5" aria-hidden="true" />
        </span>
        <span className="text-2xl">owlio<span className="text-indigo-600">.</span></span>
      </div>
      <div className="relative z-10 mx-auto w-full max-w-lg py-12">
        <div className="mb-8 flex items-center gap-3 text-indigo-700">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-sm"><NotebookPen aria-hidden="true" /></span>
          <span className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm"><Sparkles aria-hidden="true" /></span>
        </div>
        <h2 className="text-4xl font-semibold tracking-tight text-slate-950 xl:text-5xl">Make room for learning.</h2>
        <p className="mt-5 max-w-md text-lg leading-8 text-slate-600">A calm space for students and educators to bring learning together.</p>
        <Card className="mt-10 rotate-1 rounded-2xl border-white/80 bg-white/80 p-5 shadow-sm ring-0">
          <p className="text-sm font-medium text-slate-800">One learning space, shaped around you.</p>
          <div className="mt-4 flex gap-2" aria-hidden="true">
            <span className="h-2 w-20 rounded-full bg-indigo-200" />
            <span className="h-2 w-12 rounded-full bg-slate-200" />
            <span className="h-2 w-16 rounded-full bg-slate-100" />
          </div>
        </Card>
      </div>
      <p className="relative z-10 text-xs text-slate-500">A little more space to learn, teach, and grow.</p>
    </aside>
  )
}
