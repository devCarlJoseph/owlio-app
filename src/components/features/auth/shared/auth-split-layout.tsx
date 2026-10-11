import type { ReactNode, RefObject } from "react"
import { BookOpen, Check, Clock3, FileText, Folder, GraduationCap, Grid2X2, Plus, Search, Users } from "lucide-react"
import { Card } from "@/components/ui/card"

type AuthSplitLayoutProps = {
  title: string
  description?: string
  headingRef: RefObject<HTMLHeadingElement | null>
  footer: ReactNode
  children: ReactNode
  contentClassName?: string
}

const files = [
  { name: "Week 04 · Cell structure", type: "Lesson notes", tone: "bg-blue-50 text-blue-600", icon: FileText },
  { name: "The living world", type: "Study guide", tone: "bg-emerald-50 text-emerald-600", icon: BookOpen },
  { name: "Midterm review", type: "Worksheet", tone: "bg-violet-50 text-violet-600", icon: FileText },
]

function WorkspacePreview() {
  return (
    <Card className="mx-auto w-full max-w-[720px] overflow-hidden rounded-xl border border-slate-200/80 bg-white !p-0 shadow-[0_24px_70px_-30px_rgba(31,48,84,0.28)] ring-0">
      <div className="flex min-h-[min(390px,calc(100svh-220px))]">
        <aside className="hidden w-[150px] shrink-0 border-r border-slate-100 bg-white px-3 py-4 min-[860px]:flex min-[860px]:flex-col">
          <div className="flex items-center gap-2 px-2 pb-4 text-[11px] font-bold tracking-[0.12em] text-slate-700">
            <span className="flex size-6 items-center justify-center rounded-md bg-blue-600 text-white"><GraduationCap className="size-4" /></span>
            OWLIO
          </div>
          <div className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Workspace</div>
          <div className="space-y-1 text-[10px] text-slate-600">
            <div className="flex items-center gap-2 rounded-md px-2 py-2"><Grid2X2 className="size-3.5" /> Overview</div>
            <div className="flex items-center gap-2 rounded-md bg-blue-50 px-2 py-2 font-semibold text-blue-700"><Folder className="size-3.5" /> My library</div>
            <div className="flex items-center gap-2 rounded-md px-2 py-2"><Users className="size-3.5" /> Study groups</div>
            <div className="flex items-center gap-2 rounded-md px-2 py-2"><Clock3 className="size-3.5" /> Recent activity</div>
          </div>
          <div className="mt-auto rounded-lg bg-slate-50 p-2.5">
            <div className="flex items-center justify-between text-[9px] font-semibold text-slate-700"><span>Your storage</span><span>68%</span></div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-2/3 rounded-full bg-blue-500" /></div>
            <div className="mt-1.5 text-[8px] text-slate-500">6.8 GB of 10 GB used</div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="flex h-12 items-center justify-between border-b border-slate-100 px-4 sm:px-5">
            <div className="flex items-center gap-2 text-[10px] text-slate-400"><span className="text-slate-700">Library</span><span>/</span><span>All resources</span></div>
            <div className="flex items-center gap-2 text-slate-400"><Search className="size-3.5" /><span className="hidden size-6 items-center justify-center rounded-full bg-slate-100 text-[9px] font-semibold text-slate-600 sm:flex">MC</span></div>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[9px] font-medium text-slate-400">TUESDAY, OCTOBER 12</p><h3 className="mt-1 text-base font-semibold tracking-tight text-slate-800 sm:text-lg">My learning space</h3></div>
              <div aria-hidden="true" className="flex h-7 shrink-0 items-center gap-1 rounded-md bg-blue-600 px-2 text-[9px] font-semibold text-white"><Plus className="size-3" /> New resource</div>
            </div>
            <div className="mt-5 flex items-center justify-between border-b border-slate-100 text-[9px]">
              <div className="flex gap-4"><span className="border-b-2 border-blue-600 pb-2 font-semibold text-blue-700">All files</span><span className="pb-2 text-slate-500">Shared with me</span><span className="hidden pb-2 text-slate-500 sm:block">Starred</span></div>
              <span className="mb-1 rounded border border-slate-200 px-1.5 py-1 text-slate-500">Recent</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {files.map(({ name, type, tone, icon: Icon }) => (
                <div key={name} className="min-w-0 rounded-lg border border-slate-100 bg-white p-2.5 sm:p-3">
                  <div className={`flex size-7 items-center justify-center rounded-md ${tone}`}><Icon className="size-3.5" /></div>
                  <p className="mt-3 truncate text-[9px] font-semibold text-slate-700">{name}</p>
                  <p className="mt-1 text-[8px] text-slate-400">{type}</p>
                </div>
              ))}
              <div className="hidden rounded-lg border border-dashed border-slate-200 p-3 sm:block"><div className="flex size-7 items-center justify-center rounded-md bg-amber-50 text-amber-600"><Check className="size-3.5" /></div><p className="mt-3 text-[9px] font-semibold text-slate-700">Reading list</p><p className="mt-1 text-[8px] text-slate-400">4 saved items</p></div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50/70 px-3 py-2.5 text-[9px] text-blue-800"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white"><Check className="size-3 text-blue-600" /></span><span><strong className="font-semibold">You're all caught up.</strong> Your learning space is ready for you.</span></div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function AuthSplitLayout({ title, description, headingRef, footer, children, contentClassName = "max-w-[320px]" }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-svh bg-white">
      <div className="grid min-h-svh grid-cols-1 md:grid-cols-[46%_54%]">
        <main className="flex min-h-svh min-w-0 flex-col px-5 pb-6 pt-6 sm:px-10 md:px-8 lg:px-[8%]">
          <div className="mb-6 flex items-center gap-2.5 font-semibold tracking-tight text-slate-900 md:hidden" aria-label="Owlio">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white"><GraduationCap className="size-5" /></span>
            <span className="text-xl">owlio<span className="text-blue-600">.</span></span>
          </div>
          <div className="flex flex-1 items-center justify-center py-4">
            <section className={`w-full ${contentClassName}`}>
              <h1 ref={headingRef} tabIndex={-1} className="text-[28px] font-semibold tracking-tight text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-ring">{title}</h1>
              {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}
              <div className={description ? "mt-5" : "mt-6"}>{children}</div>
            </section>
          </div>
          <footer className="mt-auto pt-5 text-center text-xs text-slate-500 sm:text-sm">{footer}</footer>
        </main>
        <aside className="relative hidden min-h-svh flex-col overflow-hidden bg-[linear-gradient(145deg,#f1f5ff_0%,#f2f4fc_52%,#fff5ef_100%)] px-8 pb-6 pt-8 md:flex lg:px-[8.5%]" aria-label="A preview of Owlio">
          <div className="pointer-events-none absolute -right-24 top-10 size-80 rounded-full bg-blue-200/20 blur-3xl" />
          <figure className="relative z-10 mx-auto w-full max-w-[600px]">
            <blockquote className="max-w-[520px] text-sm font-semibold leading-5 text-slate-700">Owlio has been a game-changer for our learning community, helping us keep every lesson, resource, and idea in one place.</blockquote>
            <figcaption className="mt-2 text-[10px] text-slate-500">— Maya Chen, Educator</figcaption>
          </figure>
          <div className="relative z-10 mt-8 w-full flex-1">
            <WorkspacePreview />
          </div>
          <p className="relative z-10 mx-auto mt-3 w-full max-w-[600px] text-[10px] text-slate-400">A calmer place to learn, teach, and grow.</p>
        </aside>
      </div>
    </div>
  )
}
