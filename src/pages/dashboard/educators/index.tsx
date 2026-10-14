import { ArrowUpRight, CalendarDays, ChartNoAxesCombined, ClipboardList, FolderOpen, MessagesSquare, School, Sparkles, Users } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"

const teachingShortcuts = [
  {
    title: "Classwork & assessment",
    description: "Create activities and review submissions.",
    href: "/educators/classwork",
    icon: ClipboardList,
    card: "border-indigo-200 bg-indigo-50/70 hover:border-indigo-300 hover:bg-indigo-50",
    tile: "bg-indigo-100 text-indigo-700",
    accent: "text-indigo-700",
  },
  {
    title: "Attendance",
    description: "Record and confirm attendance for your sessions.",
    href: "/educators/attendance",
    icon: CalendarDays,
    card: "border-emerald-200 bg-emerald-50/70 hover:border-emerald-300 hover:bg-emerald-50",
    tile: "bg-emerald-100 text-emerald-700",
    accent: "text-emerald-700",
  },
  {
    title: "Learners",
    description: "Learners inside the classrooms you manage.",
    href: "/educators/learners",
    icon: Users,
    card: "border-rose-200 bg-rose-50/70 hover:border-rose-300 hover:bg-rose-50",
    tile: "bg-rose-100 text-rose-700",
    accent: "text-rose-700",
  },
  {
    title: "Materials",
    description: "Publish classroom resources and lesson files.",
    href: "/educators/materials",
    icon: FolderOpen,
    card: "border-cyan-200 bg-cyan-50/70 hover:border-cyan-300 hover:bg-cyan-50",
    tile: "bg-cyan-100 text-cyan-700",
    accent: "text-cyan-700",
  },
  {
    title: "Schedule",
    description: "Lessons, deadlines, and teaching time.",
    href: "/educators/schedule",
    icon: CalendarDays,
    card: "border-amber-200 bg-amber-50/70 hover:border-amber-300 hover:bg-amber-50",
    tile: "bg-amber-100 text-amber-700",
    accent: "text-amber-700",
  },
  {
    title: "Communication",
    description: "Announcements, discussions, and polls.",
    href: "/educators/communication",
    icon: MessagesSquare,
    card: "border-teal-200 bg-teal-50/70 hover:border-teal-300 hover:bg-teal-50",
    tile: "bg-teal-100 text-teal-700",
    accent: "text-teal-700",
  },
] as const

const workspaceAreas = ["Classrooms", "Classwork and assessment", "Attendance", "Learners"] as const

const attentionItems = [
  {
    title: "Submissions to review",
    description: "Submission data is not connected yet.",
    href: "/educators/classwork",
    icon: ClipboardList,
    tile: "bg-indigo-100 text-indigo-700",
    accent: "text-indigo-700",
  },
  {
    title: "Attendance to confirm",
    description: "Attendance records are not connected yet.",
    href: "/educators/attendance",
    icon: CalendarDays,
    tile: "bg-emerald-100 text-emerald-700",
    accent: "text-emerald-700",
  },
] as const

export default function EducatorsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-5 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div className="max-w-2xl">
          <Badge variant="secondary" className="bg-violet-100 text-violet-700">Educator workspace</Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Your teaching day, in one place.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Bring your classes, learners, classwork, attendance, and progress into a single view. Everything here stays limited to classrooms you are authorized to manage.</p>
        </div>
        <Button render={<Link to="/educators/classrooms" />} variant="outline" className="w-fit border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:text-violet-800">
          Open classrooms <ArrowUpRight aria-hidden="true" />
        </Button>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
        <div className="space-y-5">
          <Card className="border border-sky-200 bg-sky-50/50 shadow-sm ring-0">
            <CardHeader>
              <CardTitle><h3 className="text-base font-semibold text-slate-900">Continue teaching</h3></CardTitle>
              <CardDescription>Classes you are actively teaching will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              <Empty className="border border-sky-200 bg-white">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-sky-100 text-sky-700"><School aria-hidden="true" /></EmptyMedia>
                  <EmptyTitle className="text-base font-semibold text-slate-900">No classrooms yet</EmptyTitle>
                  <EmptyDescription>Classroom lists and lesson progress are not connected yet, so no class progress is being displayed.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button render={<Link to="/educators/classrooms" />} variant="outline" size="sm" className="border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800">View classrooms</Button>
                </EmptyContent>
              </Empty>
              <p className="text-xs leading-5 text-slate-500" role="status">When connected, each class will show its subject, lessons recorded, and next session — no estimated numbers.</p>
            </CardContent>
          </Card>

          <section aria-label="Teaching shortcuts" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {teachingShortcuts.map(({ title, description, href, icon: Icon, card, tile, accent }) => (
              <Link key={href} to={href} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                <Card size="sm" className={`h-full min-h-44 gap-4 border shadow-sm ring-0 transition-[border-color,background-color,box-shadow] ${card}`}>
                  <CardContent className="h-full gap-4">
                    <span className={`flex size-10 items-center justify-center rounded-xl ${tile}`}><Icon className="size-5" aria-hidden="true" /></span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                      <p className="mt-1 text-sm leading-5 text-slate-600">{description}</p>
                    </div>
                    <span className={`mt-auto inline-flex items-center gap-1 text-xs font-semibold ${accent}`}>Open page <ArrowUpRight className="size-3.5" aria-hidden="true" /></span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </section>

          <Card className="border border-teal-200 bg-teal-50/40 shadow-sm ring-0">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle><h3 className="text-base font-semibold text-slate-900">Teaching activity</h3></CardTitle>
                  <CardDescription className="mt-1">A place for your classroom activity over time.</CardDescription>
                </div>
                <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">No activity data</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-dashed border-teal-200 bg-white/70">
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-evenly" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((line) => <span key={line} className="w-full border-t border-teal-100" />)}
                </div>
                <div className="relative mx-4 max-w-sm rounded-xl border border-teal-200 bg-white p-5 text-center shadow-sm">
                  <ChartNoAxesCombined className="mx-auto size-8 text-teal-600" aria-hidden="true" />
                  <h4 className="mt-3 text-sm font-semibold text-slate-900">Your teaching activity will appear here</h4>
                  <p className="mt-1 text-sm leading-5 text-slate-500">Classwork, attendance, and progress records are not connected yet, so there are no live statistics to display.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="border border-violet-200 bg-white shadow-sm ring-0">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle><h3 className="text-base font-semibold text-slate-900">Your teaching workspace</h3></CardTitle>
                  <CardDescription className="mt-1">What this workspace covers.</CardDescription>
                </div>
                <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">Not connected</Badge>
              </div>
            </CardHeader>
            <CardContent className="gap-3">
              <ul className="space-y-2">
                {workspaceAreas.map((area) => (
                  <li key={area} className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="size-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden="true" />
                    {area}
                  </li>
                ))}
              </ul>
              <p className="text-xs leading-5 text-slate-500" role="status">Classroom counts and insights will appear here once the classroom service is connected.</p>
            </CardContent>
          </Card>

          <Card className="border border-amber-200 bg-amber-50/40 shadow-sm ring-0">
            <CardHeader>
              <CardTitle><h3 className="text-base font-semibold text-slate-900">Needs attention</h3></CardTitle>
              <CardDescription>Classroom records you would review next.</CardDescription>
            </CardHeader>
            <CardContent className="gap-0">
              {attentionItems.map(({ title, description, href, icon: Icon, tile, accent }, index) => (
                <div key={href}>
                  {index > 0 && <Separator />}
                  <div className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tile}`}><Icon className="size-4" aria-hidden="true" /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{title}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-500" role="status">{description}</p>
                      <Link to={href} className={`mt-2 inline-flex items-center gap-1 rounded text-xs font-semibold outline-none underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${accent}`}>
                        Go to page <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 shadow-sm ring-0">
            <CardHeader>
              <CardTitle><h3 className="text-base font-semibold text-slate-900">Draft faster with AI assistance</h3></CardTitle>
              <CardDescription>Generate question ideas and feedback drafts, then review and edit before you use them.</CardDescription>
            </CardHeader>
            <CardContent className="gap-3">
              <Link to="/educators/ai-assistant" className="flex items-center gap-3 rounded-lg bg-white/80 p-3 text-sm font-medium text-slate-800 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-blue-500">
                <Sparkles className="size-4 text-violet-700" aria-hidden="true" />Open AI Assistant <ArrowUpRight className="ml-auto size-4 text-violet-700" aria-hidden="true" />
              </Link>
              <p className="text-xs leading-5 text-slate-500" role="status">AI assistance is not connected yet. Nothing is generated in the browser, and drafts always need your review.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}