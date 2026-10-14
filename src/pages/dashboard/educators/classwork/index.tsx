import { useMemo, useState } from "react"
import {
  BookOpen,
  ChevronDown,
  FileUp,
  FlaskConical,
  Hammer,
  ListChecks,
  MessagesSquare,
  MonitorPlay,
  NotebookPen,
  Search,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type WeekNumber = 1 | 2 | 3
type ViewMode = "week" | "table" | "list"
type ActivityType = "Quiz" | "Assignment" | "File submission" | "Discussion" | "Reading activity" | "Project" | "Lab work" | "Presentation"
type ActivityStatus = "Draft" | "Assigned" | "Submissions to review" | "Returned"
type Activity = {
  id: string
  week: WeekNumber
  day: string
  title: string
  type: ActivityType
  classroom: string
  status: ActivityStatus
  submissionsTotal: number
  submissionsReviewed: number
}

const weeks: WeekNumber[] = [1, 2, 3]

const activityTypes: Record<ActivityType, { icon: LucideIcon; chip: string }> = {
  Quiz: { icon: ListChecks, chip: "border-sky-200 bg-sky-50 text-sky-700" },
  Assignment: { icon: NotebookPen, chip: "border-violet-200 bg-violet-50 text-violet-700" },
  "File submission": { icon: FileUp, chip: "border-cyan-200 bg-cyan-50 text-cyan-700" },
  Discussion: { icon: MessagesSquare, chip: "border-teal-200 bg-teal-50 text-teal-700" },
  "Reading activity": { icon: BookOpen, chip: "border-indigo-200 bg-indigo-50 text-indigo-700" },
  Project: { icon: Hammer, chip: "border-amber-200 bg-amber-50 text-amber-700" },
  "Lab work": { icon: FlaskConical, chip: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  Presentation: { icon: MonitorPlay, chip: "border-rose-200 bg-rose-50 text-rose-700" },
}

const activityStatuses: Record<ActivityStatus, string> = {
  Draft: "border-slate-200 bg-slate-100 text-slate-600",
  Assigned: "border-sky-200 bg-sky-50 text-sky-700",
  "Submissions to review": "border-amber-200 bg-amber-50 text-amber-700",
  Returned: "border-emerald-200 bg-emerald-50 text-emerald-700",
}

const avatarTones = [
  "bg-amber-200 text-amber-900",
  "bg-sky-200 text-sky-900",
  "bg-emerald-200 text-emerald-900",
] as const

const sampleActivities: Activity[] = [
  { id: "w1-mo-quiz", week: 1, day: "Monday", title: "Fractions quiz", type: "Quiz", classroom: "3A", status: "Submissions to review", submissionsTotal: 27, submissionsReviewed: 18 },
  { id: "w1-mo-read", week: 1, day: "Monday", title: "Chapter 4 reading", type: "Reading activity", classroom: "3C", status: "Returned", submissionsTotal: 22, submissionsReviewed: 22 },
  { id: "w1-mo-file", week: 1, day: "Monday", title: "Worksheet scan", type: "File submission", classroom: "3B", status: "Assigned", submissionsTotal: 22, submissionsReviewed: 0 },
  { id: "w1-tu-disc", week: 1, day: "Tuesday", title: "Class discussion: sources", type: "Discussion", classroom: "3D", status: "Submissions to review", submissionsTotal: 20, submissionsReviewed: 6 },
  { id: "w1-tu-lab", week: 1, day: "Tuesday", title: "Reaction rates lab", type: "Lab work", classroom: "3C", status: "Assigned", submissionsTotal: 22, submissionsReviewed: 0 },
  { id: "w1-we-proj", week: 1, day: "Wednesday", title: "Local history project", type: "Project", classroom: "3D", status: "Submissions to review", submissionsTotal: 20, submissionsReviewed: 11 },
  { id: "w1-we-quiz", week: 1, day: "Wednesday", title: "Poetry analysis quiz", type: "Quiz", classroom: "3C", status: "Draft", submissionsTotal: 22, submissionsReviewed: 0 },
  { id: "w1-th-asm", week: 1, day: "Thursday", title: "Algebra assignment", type: "Assignment", classroom: "3A", status: "Submissions to review", submissionsTotal: 27, submissionsReviewed: 19 },
  { id: "w1-th-lab", week: 1, day: "Thursday", title: "Plant growth lab report", type: "Lab work", classroom: "3E", status: "Assigned", submissionsTotal: 25, submissionsReviewed: 0 },
  { id: "w1-fr-pres", week: 1, day: "Friday", title: "Group presentation", type: "Presentation", classroom: "3E", status: "Draft", submissionsTotal: 25, submissionsReviewed: 0 },
  { id: "w2-mo-read", week: 2, day: "Monday", title: "Poetry anthology", type: "Reading activity", classroom: "3C", status: "Assigned", submissionsTotal: 22, submissionsReviewed: 0 },
  { id: "w2-mo-file", week: 2, day: "Monday", title: "Field notes upload", type: "File submission", classroom: "3D", status: "Draft", submissionsTotal: 20, submissionsReviewed: 0 },
  { id: "w2-tu-quiz", week: 2, day: "Tuesday", title: "Ratios quiz", type: "Quiz", classroom: "3A", status: "Assigned", submissionsTotal: 27, submissionsReviewed: 0 },
  { id: "w2-we-disc", week: 2, day: "Wednesday", title: "Discussion: peer feedback", type: "Discussion", classroom: "3B", status: "Draft", submissionsTotal: 22, submissionsReviewed: 0 },
  { id: "w2-th-proj", week: 2, day: "Thursday", title: "Bridge design project", type: "Project", classroom: "3E", status: "Draft", submissionsTotal: 25, submissionsReviewed: 0 },
  { id: "w2-fr-asm", week: 2, day: "Friday", title: "Week review assignment", type: "Assignment", classroom: "3B", status: "Draft", submissionsTotal: 22, submissionsReviewed: 0 },
  { id: "w3-mo-lab", week: 3, day: "Monday", title: "Titration lab", type: "Lab work", classroom: "3C", status: "Draft", submissionsTotal: 22, submissionsReviewed: 0 },
  { id: "w3-tu-read", week: 3, day: "Tuesday", title: "Source evaluation reading", type: "Reading activity", classroom: "3D", status: "Draft", submissionsTotal: 20, submissionsReviewed: 0 },
  { id: "w3-we-quiz", week: 3, day: "Wednesday", title: "Energy quiz", type: "Quiz", classroom: "3C", status: "Draft", submissionsTotal: 22, submissionsReviewed: 0 },
  { id: "w3-fr-pres", week: 3, day: "Friday", title: "Experiment showcase", type: "Presentation", classroom: "3E", status: "Draft", submissionsTotal: 25, submissionsReviewed: 0 },
]

const views: { value: ViewMode; label: string }[] = [
  { value: "week", label: "Classrooms" },
  { value: "table", label: "Table" },
  { value: "list", label: "List" },
]

const classroomDetails: Record<string, { subject: string; learners: string[]; learnerCount: number }> = {
  "3A": { subject: "Mathematics", learners: ["AN", "JW", "MP"], learnerCount: 27 },
  "3B": { subject: "Science", learners: ["BC", "KL", "DR"], learnerCount: 22 },
  "3C": { subject: "English Language", learners: ["CD", "TB", "NC"], learnerCount: 22 },
  "3D": { subject: "History", learners: ["DF", "EM", "FR"], learnerCount: 20 },
  "3E": { subject: "Creative Arts", learners: ["EG", "IL", "PS"], learnerCount: 25 },
}

const weekItems = weeks.map((week) => ({ value: String(week), label: `Sample week ${week}` }))

function getClassrooms(activities: Activity[]) {
  return Array.from(new Set(activities.map(({ classroom }) => classroom))).sort()
}

export default function EducatorClassworkPage() {
  const [week, setWeek] = useState<WeekNumber>(1)
  const [view, setView] = useState<ViewMode>("week")
  const [search, setSearch] = useState("")
  const [classroom, setClassroom] = useState("all")

  const classrooms = getClassrooms(sampleActivities)
  const classroomItems = [
    { value: "all", label: "All classrooms" },
    ...classrooms.map((name) => ({ value: name, label: `Classroom ${name}` })),
  ]

  const visibleActivities = useMemo(() => {
    const query = search.trim().toLowerCase()

    return sampleActivities.filter((activity) => {
      const matchesWeek = activity.week === week
      const matchesQuery = query.length === 0 || activity.title.toLowerCase().includes(query) || activity.type.toLowerCase().includes(query)
      const matchesClassroom = classroom === "all" || activity.classroom === classroom

      return matchesWeek && matchesQuery && matchesClassroom
    })
  }, [week, search, classroom])

  const clearFilters = () => {
    setSearch("")
    setClassroom("all")
  }

  const stepWeek = (direction: 1 | -1) => {
    setWeek((current) => {
      const next = current + direction

      return weeks.includes(next as WeekNumber) ? (next as WeekNumber) : current
    })
  }

  const classroomsInView = visibleActivities.map(({ classroom: name }) => name).filter((name, index, all) => all.indexOf(name) === index)

  const renderClassroomView = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {classroomsInView.map((name) => {
        const classroomActivities = visibleActivities.filter((activity) => activity.classroom === name)
        const details = classroomDetails[name]
        const toReview = classroomActivities.filter(({ status }) => status === "Submissions to review").length
        const submissionsTotal = classroomActivities.reduce((total, activity) => total + activity.submissionsTotal, 0)
        const submissionsReviewed = classroomActivities.reduce((total, activity) => total + activity.submissionsReviewed, 0)
        const types = Array.from(new Set(classroomActivities.map(({ type }) => type)))

        return (
          <Card key={name} className="flex h-full flex-col gap-3 border border-amber-200 bg-amber-50/40 px-4 py-4 shadow-sm ring-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-700">Classroom</p>
                <h3 className="mt-0.5 truncate text-base font-semibold text-slate-900">{name} · {details?.subject ?? "Subject not set"}</h3>
              </div>
              <Badge variant="outline" className="border-dashed border-slate-300 bg-white/80 text-slate-500">Sample</Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AvatarGroup>
                {(details?.learners ?? []).map((initials, index) => (
                  <Avatar key={initials} size="sm" className="size-6">
                    <AvatarFallback className={`text-[10px] font-semibold ${avatarTones[index % avatarTones.length]}`}>{initials}</AvatarFallback>
                  </Avatar>
                ))}
                <AvatarGroupCount className="text-[10px] font-semibold text-slate-700">
                  +{Math.max((details?.learnerCount ?? 0) - (details?.learners.length ?? 0), 0)}
                </AvatarGroupCount>
              </AvatarGroup>
              <p className="text-xs text-slate-500">{details?.learnerCount ?? 0} learners</p>
            </div>

            <dl className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                { value: String(classroomActivities.length), label: classroomActivities.length === 1 ? "activity" : "activities" },
                { value: String(toReview), label: "to review" },
              ].map((metric) => (
                <div key={metric.label} className="flex items-baseline gap-1.5">
                  <dd className="text-lg font-semibold leading-none text-slate-900">{metric.value}</dd>
                  <dt className="text-xs text-slate-500">{metric.label}</dt>
                </div>
              ))}
            </dl>

            <div className="flex items-center gap-3">
              <Progress
                value={submissionsTotal === 0 ? 0 : (submissionsReviewed / submissionsTotal) * 100}
                className="flex-1 gap-0 [&_[data-slot=progress-indicator]]:bg-amber-500 [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-amber-100"
              />
              <p className="shrink-0 text-xs text-slate-500">{submissionsReviewed} of {submissionsTotal} reviewed</p>
            </div>

            <ul className="flex flex-wrap gap-1.5" aria-label={`Activity types in classroom ${name}`}>
              {types.map((type) => (
                <li key={type}>
                  <Badge variant="outline" className={activityTypes[type].chip}>{type}</Badge>
                </li>
              ))}
            </ul>

            <Collapsible className="mt-auto">
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-lg border border-amber-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-amber-700 outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-blue-500 [&[data-panel-open]_svg]:rotate-180">
                {classroomActivities.length > 0 ? `View activities (${classroomActivities.length})` : "No activities this week"}
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </CollapsibleTrigger>
              {classroomActivities.length > 0 && (
                <CollapsibleContent className="mt-3 border-t border-amber-200 pt-3">
                  <ul className="space-y-2">
                    {classroomActivities.map((activity) => {
                      const TypeIcon = activityTypes[activity.type].icon

                      return (
                        <li key={activity.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                          <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${activityTypes[activity.type].chip}`}><TypeIcon className="size-4" aria-hidden="true" /></span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                            <p className="text-xs text-slate-500">{activity.day} · sample week {activity.week}</p>
                          </div>
                          <div className="ml-auto flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline" className={activityStatuses[activity.status]}>{activity.status}</Badge>
                            <Badge variant="outline" className="border-dashed border-slate-300 bg-slate-50 text-slate-500">Sample</Badge>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </CollapsibleContent>
              )}
            </Collapsible>
          </Card>
        )
      })}
    </div>
  )

  const renderTableView = () => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableCaption className="px-4 pt-4 text-left text-slate-500">Sample activities — sample week {week}.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Day</TableHead>
            <TableHead scope="col">Activity</TableHead>
            <TableHead scope="col">Type</TableHead>
            <TableHead scope="col">Classroom</TableHead>
            <TableHead scope="col">Status</TableHead>
            <TableHead scope="col">Reviewed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleActivities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell className="whitespace-nowrap text-slate-600">{activity.day}</TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{activity.title}</span>
                  <Badge variant="outline" className="border-dashed border-slate-300 bg-slate-50 text-slate-500">Sample</Badge>
                </span>
              </TableCell>
              <TableCell><Badge variant="outline" className={activityTypes[activity.type].chip}>{activity.type}</Badge></TableCell>
              <TableCell className="whitespace-nowrap text-slate-600">{activity.classroom}</TableCell>
              <TableCell><Badge variant="outline" className={activityStatuses[activity.status]}>{activity.status}</Badge></TableCell>
              <TableCell className="whitespace-nowrap text-slate-600">{activity.submissionsReviewed} of {activity.submissionsTotal}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderListView = () => (
    <ul className="space-y-2" aria-label="Sample activities list">
      {visibleActivities.map((activity, index) => {
        const TypeIcon = activityTypes[activity.type].icon

        return (
          <li key={activity.id}>
            {index > 0 && <Separator />}
            <div className="flex flex-wrap items-center gap-3 rounded-xl px-3 py-3">
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${activityTypes[activity.type].chip}`}><TypeIcon className="size-4" aria-hidden="true" /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{activity.title}</p>
                <p className="truncate text-xs text-slate-500">{activity.day} · Classroom {activity.classroom}</p>
              </div>
              <Badge variant="outline" className="border-dashed border-slate-300 bg-slate-50 text-slate-500">Sample</Badge>
              <Badge variant="outline" className={activityStatuses[activity.status]}>{activity.status}</Badge>
            </div>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white p-6 shadow-sm sm:p-8">
        <Badge variant="secondary" className="bg-amber-100 text-amber-700">Educator workspace</Badge>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Classwork and assessment</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Prepare activities, review learner submissions, and provide evaluations or feedback in the classrooms you own or are authorized to manage.</p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Weekly classwork</h3>
            <p className="mt-1 text-sm text-slate-600">Classwork grouped by classroom for the selected sample week.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => stepWeek(-1)} disabled={week === weeks[0]} className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800">Previous</Button>
            <Select value={String(week)} onValueChange={(value) => setWeek(Number(value) as WeekNumber)} items={weekItems}>
              <SelectTrigger aria-label="Select sample week" className="w-40 justify-between rounded-full bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {weeks.map((value) => (
                  <SelectItem key={value} value={String(value)}>Sample week {value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => stepWeek(1)} disabled={week === weeks[weeks.length - 1]} className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800">Next</Button>
            <ToggleGroup
              variant="outline"
              size="sm"
              value={[view]}
              onValueChange={(next) => {
                const [nextView] = next
                if (nextView) setView(nextView as ViewMode)
              }}
            >
              {views.map((item) => (
                <ToggleGroupItem key={item.value} value={item.value} aria-label={`${item.label} view`}>{item.label}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <Card className="border border-slate-200 bg-white px-4 py-4 shadow-sm ring-0 sm:px-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:w-auto lg:flex-1">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="activity-search" className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Search activities</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <Input
                    id="activity-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    aria-describedby="activity-search-note"
                    autoComplete="off"
                    placeholder="Search by title or type"
                    className="h-9 rounded-full bg-slate-50 pl-9"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="activity-classroom" className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Classroom</label>
                <Select value={classroom} onValueChange={(value) => setClassroom(value ?? "all")} items={classroomItems}>
                  <SelectTrigger id="activity-classroom" aria-describedby="activity-search-note" className="w-full justify-between rounded-full bg-slate-50 sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All classrooms</SelectItem>
                    {classrooms.map((name) => (
                      <SelectItem key={name} value={name}>Classroom {name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Badge variant="outline" className="border-dashed border-slate-300 bg-slate-50 text-slate-500">Sample data</Badge>
          </div>
          <p id="activity-search-note" className="mt-2 text-xs leading-5 text-slate-500" role="status">Search and filters apply to the sample board only.</p>
        </Card>

        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle className="font-semibold">Example board</AlertTitle>
          <AlertDescription className="text-amber-800">The activities, classrooms, counts, and progress below are sample content. They are not connected to the classwork service and no submission, evaluation, or feedback has been recorded.</AlertDescription>
        </Alert>

        {visibleActivities.length === 0 ? (
          <Empty className="border border-dashed border-slate-300 bg-white">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-amber-50 text-amber-700"><Search aria-hidden="true" /></EmptyMedia>
              <EmptyTitle className="text-base font-semibold text-slate-900">No activities match this view</EmptyTitle>
              <EmptyDescription>Adjust the search term or classroom filter, or pick another sample week.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" size="sm" onClick={clearFilters} className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800">
                <X aria-hidden="true" /> Clear filters
              </Button>
            </EmptyContent>
          </Empty>
        ) : view === "week" ? (
          renderClassroomView()
        ) : view === "table" ? (
          renderTableView()
        ) : (
          renderListView()
        )}

        <p className="text-xs leading-5 text-slate-500" role="status">Activity statuses are placeholders and will be aligned with the classwork API contract. Grades, evaluations, and feedback are educator-controlled records and are not connected yet — AI suggestions remain editable and can never publish a final grade.</p>
      </section>
    </div>
  )
}