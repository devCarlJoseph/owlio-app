import type { ReactNode, RefObject } from "react"
import { BookOpen, Check, Clock3, FileText, Folder, GraduationCap, Grid2X2, KeyRound, MailCheck, Plus, Search, ShieldCheck, Sparkles, Users, type LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"

type AuthDesignContext = "login" | "register" | "forgot-password" | "password-reset" | "email-verification"

type SceneCard = {
  name: string
  type: string
  tone: string
  icon: LucideIcon
}

type AuthScene = {
  eyebrow: string
  leftCaption: string
  quote: string
  attribution: string
  workspaceEyebrow: string
  workspaceTitle: string
  activeNav: string
  actionLabel: string
  footer: string
  icon: LucideIcon
  cards: SceneCard[]
}

type AuthSplitLayoutProps = {
  context: AuthDesignContext
  title: string
  description?: string
  headingRef: RefObject<HTMLHeadingElement | null>
  footer: ReactNode
  children: ReactNode
}

const scenes: Record<AuthDesignContext, AuthScene> = {
  login: {
    eyebrow: "WELCOME BACK",
    leftCaption: "Pick up where you left off.",
    quote: "A focused learning space makes it easier to pick up where you left off and keep the next goal in sight.",
    attribution: "Maya Chen · Educator",
    workspaceEyebrow: "YOUR LEARNING SPACE",
    workspaceTitle: "My learning space",
    activeNav: "My library",
    actionLabel: "Open library",
    footer: "Your classes, notes, and next steps in one place.",
    icon: BookOpen,
    cards: [
      { name: "Week 04 · Cell structure", type: "Lesson notes", tone: "bg-blue-50 text-blue-600", icon: FileText },
      { name: "The living world", type: "Study guide", tone: "bg-emerald-50 text-emerald-600", icon: BookOpen },
      { name: "Midterm review", type: "Worksheet", tone: "bg-violet-50 text-violet-600", icon: FileText },
    ],
  },
  register: {
    eyebrow: "A NEW CHAPTER",
    leftCaption: "Create a space for what’s next.",
    quote: "Every great learning journey starts with a place to explore, ask questions, and grow at your own pace.",
    attribution: "Maya Chen · Educator",
    workspaceEyebrow: "GETTING STARTED",
    workspaceTitle: "Your space starts here",
    activeNav: "Getting started",
    actionLabel: "Create workspace",
    footer: "Choose your path, then make the space your own.",
    icon: Sparkles,
    cards: [
      { name: "Choose your role", type: "Student or teacher", tone: "bg-blue-50 text-blue-600", icon: Users },
      { name: "Create your space", type: "Made for you", tone: "bg-emerald-50 text-emerald-600", icon: Folder },
      { name: "Set a first goal", type: "One step at a time", tone: "bg-violet-50 text-violet-600", icon: Check },
    ],
  },
  "forgot-password": {
    eyebrow: "ACCOUNT RECOVERY",
    leftCaption: "Get back to your learning space.",
    quote: "Your notes, plans, and learning resources will be here when you’re ready to get back in.",
    attribution: "Maya Chen · Owlio educator",
    workspaceEyebrow: "ACCOUNT ACCESS",
    workspaceTitle: "Find your way back",
    activeNav: "Account recovery",
    actionLabel: "Recovery options",
    footer: "A simple path back to the work that matters to you.",
    icon: KeyRound,
    cards: [
      { name: "Confirm your email", type: "Account detail", tone: "bg-blue-50 text-blue-600", icon: MailCheck },
      { name: "Choose a new password", type: "Security", tone: "bg-amber-50 text-amber-600", icon: KeyRound },
      { name: "Return to learning", type: "Your workspace", tone: "bg-emerald-50 text-emerald-600", icon: BookOpen },
    ],
  },
  "password-reset": {
    eyebrow: "ACCOUNT SECURITY",
    leftCaption: "Protect the space you’re building.",
    quote: "A private, secure sign-in helps protect the lessons, ideas, and goals you keep in Owlio.",
    attribution: "Owlio · Your learning space",
    workspaceEyebrow: "SECURITY SETTINGS",
    workspaceTitle: "Keep your account secure",
    activeNav: "Password & security",
    actionLabel: "Security settings",
    footer: "A safer sign-in for everything you’re learning and creating.",
    icon: ShieldCheck,
    cards: [
      { name: "Create a strong password", type: "Your choice", tone: "bg-blue-50 text-blue-600", icon: KeyRound },
      { name: "Keep your account private", type: "Security", tone: "bg-violet-50 text-violet-600", icon: ShieldCheck },
      { name: "Return to your space", type: "When you’re ready", tone: "bg-emerald-50 text-emerald-600", icon: BookOpen },
    ],
  },
  "email-verification": {
    eyebrow: "EMAIL VERIFICATION",
    leftCaption: "One step closer to getting started.",
    quote: "Confirming your email helps keep your account connected to the learning community you’re building.",
    attribution: "Maya Chen · Educator",
    workspaceEyebrow: "ACCOUNT SETUP",
    workspaceTitle: "Connect your email",
    activeNav: "Verify your email",
    actionLabel: "Continue setup",
    footer: "A connected account keeps your learning space within reach.",
    icon: MailCheck,
    cards: [
      { name: "Check your inbox", type: "Find the Owlio email", tone: "bg-blue-50 text-blue-600", icon: MailCheck },
      { name: "Open the verification link", type: "Confirm your address", tone: "bg-emerald-50 text-emerald-600", icon: Check },
      { name: "Start learning", type: "Your Owlio space", tone: "bg-violet-50 text-violet-600", icon: GraduationCap },
    ],
  },
}

function WorkspacePreview({ scene }: { scene: AuthScene }) {
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
            <div className="flex items-center gap-2 rounded-md bg-blue-50 px-2 py-2 font-semibold text-blue-700"><scene.icon className="size-3.5" /> {scene.activeNav}</div>
            <div className="flex items-center gap-2 rounded-md px-2 py-2"><Users className="size-3.5" /> Shared with me</div>
            <div className="flex items-center gap-2 rounded-md px-2 py-2"><Clock3 className="size-3.5" /> Recent activity</div>
          </div>
          <div className="mt-auto rounded-lg bg-slate-50 p-2.5">
            <div className="flex items-center justify-between text-[9px] font-semibold text-slate-700"><span>Space organized</span><Check className="size-3 text-blue-600" /></div>
            <div className="mt-2 flex gap-1"><span className="h-1 w-12 rounded-full bg-blue-500" /><span className="h-1 w-6 rounded-full bg-blue-200" /><span className="h-1 w-4 rounded-full bg-slate-200" /></div>
            <div className="mt-1.5 text-[8px] text-slate-500">A little progress each day</div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="flex h-12 items-center justify-between border-b border-slate-100 px-4 sm:px-5">
            <div className="flex items-center gap-2 text-[10px] text-slate-400"><span className="text-slate-700">Owlio</span><span>/</span><span>{scene.workspaceEyebrow}</span></div>
            <div className="flex items-center gap-2 text-slate-400"><Search className="size-3.5" /><span className="hidden size-6 items-center justify-center rounded-full bg-slate-100 text-[9px] font-semibold text-slate-600 sm:flex">MC</span></div>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[9px] font-medium text-slate-400">YOUR OWLIO SPACE</p><h3 className="mt-1 text-base font-semibold tracking-tight text-slate-800 sm:text-lg">{scene.workspaceTitle}</h3></div>
              <div aria-hidden="true" className="flex h-7 shrink-0 items-center gap-1 rounded-md bg-blue-600 px-2 text-[9px] font-semibold text-white"><Plus className="size-3" /> {scene.actionLabel}</div>
            </div>
            <div className="mt-5 flex items-center justify-between border-b border-slate-100 text-[9px]">
              <div className="flex gap-4"><span className="border-b-2 border-blue-600 pb-2 font-semibold text-blue-700">Overview</span><span className="pb-2 text-slate-500">My space</span><span className="hidden pb-2 text-slate-500 sm:block">Resources</span></div>
              <span className="mb-1 rounded border border-slate-200 px-1.5 py-1 text-slate-500">For you</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {scene.cards.map(({ name, type, tone, icon: Icon }) => (
                <div key={name} className="min-w-0 rounded-lg border border-slate-100 bg-white p-2.5 sm:p-3">
                  <div className={`flex size-7 items-center justify-center rounded-md ${tone}`}><Icon className="size-3.5" /></div>
                  <p className="mt-3 truncate text-[9px] font-semibold text-slate-700">{name}</p>
                  <p className="mt-1 truncate text-[8px] text-slate-400">{type}</p>
                </div>
              ))}
              <div className="hidden rounded-lg border border-dashed border-slate-200 p-3 sm:block"><div className="flex size-7 items-center justify-center rounded-md bg-amber-50 text-amber-600"><Sparkles className="size-3.5" /></div><p className="mt-3 text-[9px] font-semibold text-slate-700">Make it yours</p><p className="mt-1 text-[8px] text-slate-400">One step at a time</p></div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-blue-50/70 px-3 py-2.5 text-[9px] text-blue-800"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white"><scene.icon className="size-3 text-blue-600" /></span><span>{scene.footer}</span></div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function AuthSplitLayout({ context, title, description, headingRef, footer, children }: AuthSplitLayoutProps) {
  const scene = scenes[context]
  const SceneIcon = scene.icon

  return (
    <div className="min-h-svh bg-white">
      <div className="grid min-h-svh grid-cols-1 md:grid-cols-[46%_54%]">
        <main className="relative flex min-h-svh min-w-0 flex-col overflow-hidden dark:bg-none dark:bg-background bg-[linear-gradient(135deg,#ffffff_10%,#f9fbff_58%,#f7f5ff_100%)] px-5 pb-6 pt-6 sm:px-10 md:px-8 lg:px-[8%]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-28 top-24 size-64 rounded-full bg-blue-100/50 blur-3xl" />
            <div className="absolute -bottom-20 right-[-4rem] size-64 rounded-full bg-violet-100/50 blur-3xl" />
          </div>
          <div className="relative z-10 mb-6 flex items-center gap-2.5 font-semibold tracking-tight text-slate-900 md:hidden" aria-label="Owlio">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white"><GraduationCap className="size-5" /></span>
            <span className="text-xl">owlio<span className="text-blue-600">.</span></span>
          </div>
          <div className="relative z-10 flex flex-1 items-center justify-center py-4">
            <section className="w-full max-w-[400px]">
              <div className="mb-6 flex items-center gap-3">
                <div className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 text-blue-700 shadow-[0_8px_24px_-12px_rgba(37,99,235,0.5)]">
                  <SceneIcon className="size-5" aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-emerald-400" />
                </div>
                <div className="min-w-0 rounded-xl border border-white/90 bg-white/75 px-3 py-2 shadow-sm backdrop-blur-sm">
                  <p className="text-[9px] font-bold tracking-[0.14em] text-blue-700">{scene.eyebrow}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{scene.leftCaption}</p>
                  <div className="mt-2 flex gap-1" aria-hidden="true"><span className="h-1 w-8 rounded-full bg-blue-300" /><span className="h-1 w-4 rounded-full bg-violet-200" /><span className="h-1 w-2 rounded-full bg-slate-200" /></div>
                </div>
              </div>
              <h1 ref={headingRef} tabIndex={-1} className="text-[28px] font-semibold tracking-tight text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-ring">{title}</h1>
              {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}
              <div className={description ? "mt-5" : "mt-6"}>{children}</div>
            </section>
          </div>
          <footer className="relative z-10 mt-auto pt-5 text-center text-xs text-slate-500 sm:text-sm">{footer}</footer>
        </main>
        <aside className="relative hidden min-h-svh flex-col overflow-hidden dark:bg-none dark:bg-card bg-[linear-gradient(145deg,#f1f5ff_0%,#f2f4fc_52%,#fff5ef_100%)] px-8 pb-6 pt-8 md:flex lg:px-[8.5%]" aria-label={`${scene.eyebrow.toLowerCase()} preview`}>
          <div className="pointer-events-none absolute -right-24 top-10 size-80 rounded-full bg-blue-200/20 blur-3xl" />
          <figure className="relative z-10 mx-auto w-full max-w-[600px]">
            <div className="mb-3 flex items-center gap-2 text-[9px] font-bold tracking-[0.14em] text-blue-700"><span className="flex size-6 items-center justify-center rounded-full bg-white shadow-sm"><SceneIcon className="size-3.5" /></span>{scene.eyebrow}</div>
            <blockquote className="max-w-[520px] text-sm font-semibold leading-5 text-slate-700">{scene.quote}</blockquote>
            <figcaption className="mt-2 text-[10px] text-slate-500">— {scene.attribution}</figcaption>
          </figure>
          <div className="relative z-10 mt-8 w-full flex-1">
            <WorkspacePreview scene={scene} />
          </div>
          <p className="relative z-10 mx-auto mt-3 w-full max-w-[600px] text-[10px] text-slate-400">{scene.footer}</p>
        </aside>
      </div>
    </div>
  )
}
