import { ArrowUpRight, CalendarCheck, GraduationCap, LockKeyhole, MessageSquareText, NotebookPen } from "lucide-react"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "@/components/ui/empty"

const recordTypes = [
  { icon: NotebookPen, title: "Released results", description: "School grades and tutoring evaluations, identified by their class and activity." },
  { icon: MessageSquareText, title: "Published feedback", description: "Feedback your educator has deliberately shared with you." },
  { icon: CalendarCheck, title: "Permitted attendance", description: "Attendance records you’re allowed to view, recorded by your educator." },
]

export function ClassroomResultsSection() {
  return (
    <section aria-labelledby="classroom-results-title" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="classroom-results-title" className="text-lg font-semibold">Results shared with you</h2>
        <Badge variant="outline" className="rounded-full py-1 font-normal text-muted-foreground">Unavailable</Badge>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <Card className="rounded-2xl border border-border shadow-none ring-0">
          <Empty className="min-h-88 px-5 py-12 sm:py-16">
            <EmptyHeader>
              <EmptyMedia className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand-soft-foreground"><GraduationCap aria-hidden="true" className="size-7" /></EmptyMedia>
              <h3 className="text-xl font-semibold tracking-tight">Classroom results aren’t connected yet</h3>
              <EmptyDescription>Grades, evaluations, feedback, and attendance can’t be loaded here yet. This doesn’t tell you whether results have been released in your classes.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent><Button render={<Link to="/students/classrooms" />} variant="outline" className="mt-2 min-h-11 px-5">Open My Classes <ArrowUpRight aria-hidden="true" /></Button></EmptyContent>
          </Empty>
        </Card>
        <aside aria-label="About classroom results" className="space-y-5">
          <Card className="rounded-2xl border border-border shadow-none ring-0">
            <CardHeader><h3 className="font-semibold">A separate place for class records</h3></CardHeader>
            <CardContent className="gap-5">{recordTypes.map(item => <div key={item.title} className="flex items-start gap-3"><item.icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" /><div><h4 className="text-sm font-medium">{item.title}</h4><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p></div></div>)}</CardContent>
          </Card>
          <p className="flex items-start gap-2 px-1 text-xs leading-5 text-muted-foreground"><LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0" />Only your permitted, released records belong here. Private teaching notes stay private.</p>
        </aside>
      </div>
    </section>
  )
}
