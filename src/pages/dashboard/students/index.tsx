import { ArrowUpRight, Bell, BookOpenCheck, CalendarDays, ChartNoAxesCombined, ClipboardList, NotebookPen, School, Users } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const overviewLinks = [
  { title: "My subjects", description: "Keep your learning organized by subject.", href: "/students/subjects", icon: BookOpenCheck, featured: false },
  { title: "Personal tasks", description: "Make a plan for what matters next.", href: "/students/tasks", icon: ClipboardList, featured: true },
  { title: "Classrooms", description: "Follow lessons and work shared with you.", href: "/students/classrooms", icon: School, featured: false },
  { title: "Study spaces", description: "Make room to learn alongside your peers.", href: "/students/study-spaces", icon: Users, featured: false },
] as const

export default function StudentsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div className="max-w-2xl">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">Student workspace</Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Welcome to your learning space.</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Organize your own learning, keep classroom work in view, and make progress at your pace—even without an instructor on Owlio.</p>
        </div>
        <Button render={<Link to="/students/subjects" />} variant="outline" className="w-fit border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
          Explore subjects <ArrowUpRight aria-hidden="true" />
        </Button>
      </section>

      <section aria-label="Student workspace areas" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewLinks.map(({ title, description, href, icon: Icon, featured }) => (
          <Link key={href} to={href} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
            <Card size="sm" className={`h-full min-h-44 gap-4 border shadow-sm ring-0 transition-[border-color,box-shadow,background-color] ${featured ? "border-blue-700 bg-blue-700 text-white hover:bg-blue-800" : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-md"}`}>
              <CardContent className="h-full gap-4">
                <span className={`flex size-10 items-center justify-center rounded-xl ${featured ? "bg-white/15 text-white" : "bg-blue-50 text-blue-700"}`}><Icon className="size-5" aria-hidden="true" /></span>
                <div>
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className={`mt-1 text-sm leading-5 ${featured ? "text-blue-100" : "text-slate-500"}`}>{description}</p>
                </div>
                <span className={`mt-auto inline-flex items-center gap-1 text-xs font-semibold ${featured ? "text-white" : "text-blue-700"}`}>Open page <ArrowUpRight className="size-3.5" aria-hidden="true" /></span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
        <div className="space-y-5">
          <Card className="border border-slate-200 bg-white shadow-sm ring-0">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle><h3 className="text-base font-semibold text-slate-900">Learning rhythm</h3></CardTitle>
                  <CardDescription className="mt-1">A place for your study activity over time.</CardDescription>
                </div>
                <Badge variant="outline" className="text-slate-500">No activity data</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50/70">
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-evenly" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((line) => <span key={line} className="w-full border-t border-slate-200/70" />)}
                </div>
                <div className="relative mx-4 max-w-sm rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                  <ChartNoAxesCombined className="mx-auto size-8 text-blue-600" aria-hidden="true" />
                  <h4 className="mt-3 text-sm font-semibold text-slate-900">Your study activity will appear here</h4>
                  <p className="mt-1 text-sm leading-5 text-slate-500">Study time and learning history are not connected yet, so there are no live statistics to display.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm ring-0">
            <CardHeader>
              <CardTitle><h3 className="text-base font-semibold text-slate-900">Coming up</h3></CardTitle>
              <CardDescription>Keep personal plans separate from educator-assigned work.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Link to="/students/tasks" className="rounded-xl border border-slate-200 p-4 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500">
                <ClipboardList className="size-5 text-blue-700" aria-hidden="true" />
                <h4 className="mt-3 text-sm font-semibold text-slate-900">Personal tasks</h4>
                <p className="mt-1 text-sm leading-5 text-slate-500">Your own study plans and deadlines belong here.</p>
              </Link>
              <Link to="/students/classwork" className="rounded-xl border border-slate-200 p-4 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500">
                <BookOpenCheck className="size-5 text-blue-700" aria-hidden="true" />
                <h4 className="mt-3 text-sm font-semibold text-slate-900">Assigned classwork</h4>
                <p className="mt-1 text-sm leading-5 text-slate-500">Classroom activities and feedback stay in class context.</p>
              </Link>
              <p className="text-xs text-slate-500 sm:col-span-2">Deadlines are not connected yet. <Link to="/students/schedule" className="inline-flex items-center gap-1 font-semibold text-blue-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">View schedule <CalendarDays className="size-3.5" aria-hidden="true" /></Link></p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="border border-slate-200 bg-white shadow-sm ring-0">
            <CardHeader>
              <CardTitle><h3 className="text-base font-semibold text-slate-900">Recent activity</h3></CardTitle>
              <CardDescription>Classroom and study-space updates in one place.</CardDescription>
            </CardHeader>
            <CardContent className="items-start">
              <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Bell className="size-5" aria-hidden="true" /></span>
              <p className="text-sm font-medium text-slate-800">No activity is connected yet.</p>
              <p className="text-sm leading-5 text-slate-500">When updates are available, you’ll see activity from the spaces you belong to here.</p>
              <Button render={<Link to="/students/notifications" />} variant="outline" size="sm" className="mt-2">View notifications</Button>
            </CardContent>
          </Card>

          <Card className="border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm ring-0">
            <CardHeader>
              <CardTitle><h3 className="text-base font-semibold text-slate-900">Make this space your own</h3></CardTitle>
              <CardDescription>Independent learning comes first. A classroom is optional.</CardDescription>
            </CardHeader>
            <CardContent className="gap-3">
              <Link to="/students/notes" className="flex items-center gap-3 rounded-lg bg-white/80 p-3 text-sm font-medium text-slate-800 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-blue-500"><NotebookPen className="size-4 text-blue-700" aria-hidden="true" />Organize your notes <ArrowUpRight className="ml-auto size-4 text-blue-700" aria-hidden="true" /></Link>
              <Link to="/students/study-spaces" className="flex items-center gap-3 rounded-lg bg-white/80 p-3 text-sm font-medium text-slate-800 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-blue-500"><Users className="size-4 text-blue-700" aria-hidden="true" />Explore study spaces <ArrowUpRight className="ml-auto size-4 text-blue-700" aria-hidden="true" /></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
