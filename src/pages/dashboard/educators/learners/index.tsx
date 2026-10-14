import { useMemo, useState } from "react"
import {
  CalendarCheck,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  MessagesSquare,
  Search,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

type LensKey = "membership" | "activity" | "progress"
type ViewMode = "board" | "table" | "list"
type LensField = { key: string; label: string; icon: LucideIcon }
type LensColumn = { label: string; dot: string; panel: string; card: string }
type FocusArea = {
  key: LensKey
  label: string
  description: string
  columns: LensColumn[]
}
type SampleLearner = {
  id: string
  name: string
  initials: string
  classroom: string
  subject: string
  sharedClasses: number
} & Record<LensKey, { status: string; metrics: Record<string, string> }>

const lensFields: Record<LensKey, LensField[]> = {
  membership: [
    { key: "joined", label: "Joined", icon: CalendarCheck },
    { key: "role", label: "Role", icon: Users },
  ],
  activity: [
    { key: "lastActive", label: "Last active", icon: CalendarDays },
    { key: "submissions", label: "Submissions", icon: ClipboardCheck },
    { key: "attendance", label: "Attendance", icon: Users },
  ],
  progress: [
    { key: "results", label: "Results", icon: ChartNoAxesCombined },
    { key: "feedback", label: "Feedback", icon: MessagesSquare },
  ],
}

const focusAreas: FocusArea[] = [
  {
    key: "membership",
    label: "Classroom membership",
    description: "Enrollment and classroom membership status for learners in your classrooms.",
    columns: [
      { label: "Invited", dot: "bg-rose-500", panel: "border-rose-200 bg-rose-50/60", card: "border-rose-100 bg-rose-50" },
      { label: "Enrolled", dot: "bg-violet-500", panel: "border-violet-200 bg-violet-50/60", card: "border-violet-100 bg-violet-50" },
      { label: "Completed", dot: "bg-slate-400", panel: "border-slate-200 bg-slate-50", card: "border-slate-200 bg-slate-50" },
    ],
  },
  {
    key: "activity",
    label: "Learning activity",
    description: "Relevant classwork, participation, and attendance.",
    columns: [
      { label: "No activity yet", dot: "bg-slate-400", panel: "border-slate-200 bg-slate-50", card: "border-slate-200 bg-slate-50" },
      { label: "Participating", dot: "bg-sky-500", panel: "border-sky-200 bg-sky-50/60", card: "border-sky-100 bg-sky-50" },
      { label: "Needs review", dot: "bg-amber-500", panel: "border-amber-200 bg-amber-50/60", card: "border-amber-100 bg-amber-50" },
    ],
  },
  {
    key: "progress",
    label: "Progress and feedback",
    description: "Classroom results and educator feedback for authorized learners.",
    columns: [
      { label: "No results yet", dot: "bg-slate-400", panel: "border-slate-200 bg-slate-50", card: "border-slate-200 bg-slate-50" },
      { label: "Results released", dot: "bg-emerald-500", panel: "border-emerald-200 bg-emerald-50/60", card: "border-emerald-100 bg-emerald-50" },
      { label: "Feedback pending", dot: "bg-amber-500", panel: "border-amber-200 bg-amber-50/60", card: "border-amber-100 bg-amber-50" },
    ],
  },
]

const avatarTones = [
  "bg-sky-200 text-sky-900",
  "bg-emerald-200 text-emerald-900",
  "bg-amber-200 text-amber-900",
  "bg-rose-200 text-rose-900",
  "bg-violet-200 text-violet-900",
] as const

const sampleLearners: SampleLearner[] = [
  {
    id: "ana-navarro",
    name: "Ana Navarro",
    initials: "AN",
    classroom: "3A",
    subject: "Mathematics",
    sharedClasses: 1,
    membership: { status: "Invited", metrics: { joined: "Invited 12 Sep", role: "Student" } },
    activity: { status: "No activity yet", metrics: { lastActive: "Not active yet", submissions: "0 submitted", attendance: "Not recorded" } },
    progress: { status: "No results yet", metrics: { results: "No released results", feedback: "0 feedback notes" } },
  },
  {
    id: "ben-carter",
    name: "Ben Carter",
    initials: "BC",
    classroom: "3B",
    subject: "Science",
    sharedClasses: 2,
    membership: { status: "Invited", metrics: { joined: "Invited 13 Sep", role: "Student" } },
    activity: { status: "No activity yet", metrics: { lastActive: "Not active yet", submissions: "0 submitted", attendance: "Not recorded" } },
    progress: { status: "No results yet", metrics: { results: "No released results", feedback: "0 feedback notes" } },
  },
  {
    id: "chloe-daniels",
    name: "Chloe Daniels",
    initials: "CD",
    classroom: "3C",
    subject: "English Language",
    sharedClasses: 1,
    membership: { status: "Enrolled", metrics: { joined: "Enrolled 02 Sep", role: "Student" } },
    activity: { status: "Participating", metrics: { lastActive: "Active 2 days ago", submissions: "4 of 5 submitted", attendance: "Present 5 of 6" } },
    progress: { status: "Results released", metrics: { results: "2 results released", feedback: "1 feedback note" } },
  },
  {
    id: "daniel-fisher",
    name: "Daniel Fisher",
    initials: "DF",
    classroom: "3D",
    subject: "History",
    sharedClasses: 3,
    membership: { status: "Enrolled", metrics: { joined: "Enrolled 28 Aug", role: "Student" } },
    activity: { status: "Participating", metrics: { lastActive: "Active today", submissions: "6 of 6 submitted", attendance: "Present 6 of 6" } },
    progress: { status: "Feedback pending", metrics: { results: "1 result released", feedback: "3 feedback notes pending" } },
  },
  {
    id: "elena-garcia",
    name: "Elena Garcia",
    initials: "EG",
    classroom: "3E",
    subject: "Creative Arts",
    sharedClasses: 1,
    membership: { status: "Enrolled", metrics: { joined: "Enrolled 04 Sep", role: "Student" } },
    activity: { status: "Needs review", metrics: { lastActive: "Active 6 days ago", submissions: "2 of 5 submitted", attendance: "Absent 3 of 6" } },
    progress: { status: "Feedback pending", metrics: { results: "1 result released", feedback: "2 feedback notes pending" } },
  },
  {
    id: "farid-haddad",
    name: "Farid Haddad",
    initials: "FH",
    classroom: "3F",
    subject: "Music",
    sharedClasses: 2,
    membership: { status: "Enrolled", metrics: { joined: "Enrolled 30 Aug", role: "Student" } },
    activity: { status: "Participating", metrics: { lastActive: "Active yesterday", submissions: "5 of 5 submitted", attendance: "Late 1 of 6" } },
    progress: { status: "Results released", metrics: { results: "3 results released", feedback: "2 feedback notes" } },
  },
  {
    id: "gita-rahman",
    name: "Gita Rahman",
    initials: "GR",
    classroom: "3G",
    subject: "Computer Studies",
    sharedClasses: 1,
    membership: { status: "Completed", metrics: { joined: "Completed 15 Sep", role: "Student" } },
    activity: { status: "Participating", metrics: { lastActive: "Active 3 days ago", submissions: "7 of 7 submitted", attendance: "Present 7 of 7" } },
    progress: { status: "Results released", metrics: { results: "4 results released", feedback: "3 feedback notes" } },
  },
  {
    id: "hana-sato",
    name: "Hana Sato",
    initials: "HS",
    classroom: "3H",
    subject: "Physical Education",
    sharedClasses: 2,
    membership: { status: "Completed", metrics: { joined: "Completed 11 Sep", role: "Student" } },
    activity: { status: "Needs review", metrics: { lastActive: "Active 8 days ago", submissions: "3 of 5 submitted", attendance: "Excused 2 of 6" } },
    progress: { status: "No results yet", metrics: { results: "No released results", feedback: "1 feedback note" } },
  },
]

const views: { value: ViewMode; label: string }[] = [
  { value: "board", label: "Board" },
  { value: "table", label: "Table" },
  { value: "list", label: "List" },
]

function getClassrooms(learners: SampleLearner[]) {
  return Array.from(new Set(learners.map(({ classroom }) => classroom))).sort()
}

export default function EducatorLearnersPage() {
  const [focusArea, setFocusArea] = useState<LensKey>("membership")
  const [view, setView] = useState<ViewMode>("board")
  const [search, setSearch] = useState("")
  const [classroom, setClassroom] = useState("all")

  const area = focusAreas.find((item) => item.key === focusArea) ?? focusAreas[0]
  const fields = lensFields[area.key]
  const classrooms = getClassrooms(sampleLearners)
  const classroomItems = [
    { value: "all", label: "All classrooms" },
    ...classrooms.map((name) => ({ value: name, label: `Classroom ${name}` })),
  ]

  const visibleLearners = useMemo(() => {
    const query = search.trim().toLowerCase()

    return sampleLearners.filter((learner) => {
      const matchesQuery = query.length === 0 || learner.name.toLowerCase().includes(query)
      const matchesClassroom = classroom === "all" || learner.classroom === classroom

      return matchesQuery && matchesClassroom
    })
  }, [search, classroom])

  const clearFilters = () => {
    setSearch("")
    setClassroom("all")
  }

  const renderBoard = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {area.columns.map((column) => {
        const learners = visibleLearners.filter((learner) => learner[area.key].status === column.label)

        return (
          <section key={column.label} className={`flex flex-col gap-3 rounded-2xl border p-3 ${column.panel}`} aria-label={`${column.label} learners`}>
            <div className="flex items-center gap-2 px-1">
              <span className={`size-2.5 shrink-0 rounded-full ${column.dot}`} aria-hidden="true" />
              <h4 className="text-sm font-semibold text-slate-900">{column.label}</h4>
              <Badge variant="outline" className="border-white bg-white/80 text-slate-600">{learners.length}</Badge>
            </div>
            {learners.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-3 py-6 text-center text-sm text-slate-500">No learners</p>
            ) : (
              <ul className="space-y-3">
                {learners.map((learner) => (
                  <li key={learner.id}>
                    <Card className={`flex h-full flex-col gap-3 border px-4 py-4 shadow-sm ring-0 ${column.card}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-full border border-white/80 bg-white/70 px-2 py-0.5 text-xs font-medium text-slate-700">
                          {learner.classroom} · {learner.subject}
                        </span>
                        <Badge variant="outline" className="border-dashed border-slate-300 bg-white/70 text-slate-500">Sample</Badge>
                      </div>
                      <h5 className="text-sm font-semibold text-slate-900">{learner.name}</h5>
                      <ul className="space-y-1.5">
                        {fields.map(({ key, label, icon: Icon }) => (
                          <li key={key} className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                            <span className="text-slate-500">{label}:</span>
                            <span className="truncate font-medium text-slate-700">{learner[area.key].metrics[key]}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                        <AvatarGroup>
                          <Avatar size="sm" className="size-6">
                            <AvatarFallback className={`text-[10px] font-semibold ${avatarTones[0]}`}>{learner.initials}</AvatarFallback>
                          </Avatar>
                          <AvatarGroupCount className={`text-[10px] font-semibold ${avatarTones[2]}`}>+{learner.sharedClasses}</AvatarGroupCount>
                        </AvatarGroup>
                        <Badge variant="outline" className="border-white bg-white/80 text-slate-700">{learner[area.key].status}</Badge>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )

  const renderTable = () => (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Table>
        <TableCaption className="px-4 pt-4 text-left text-slate-500">Sample learners — {area.label.toLowerCase()}.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Learner</TableHead>
            <TableHead scope="col">Classroom</TableHead>
            <TableHead scope="col">Stage</TableHead>
            {fields.map((field) => (
              <TableHead key={field.key} scope="col">{field.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleLearners.map((learner) => (
            <TableRow key={learner.id}>
              <TableCell>
                <span className="flex items-center gap-2">
                  <Avatar size="sm" className="size-6">
                    <AvatarFallback className={`text-[10px] font-semibold ${avatarTones[0]}`}>{learner.initials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-slate-900">{learner.name}</span>
                  <Badge variant="outline" className="border-dashed border-slate-300 bg-slate-50 text-slate-500">Sample</Badge>
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap text-slate-600">{learner.classroom} · {learner.subject}</TableCell>
              <TableCell>
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">{learner[area.key].status}</Badge>
              </TableCell>
              {fields.map((field) => (
                <TableCell key={field.key} className="text-slate-600">{learner[area.key].metrics[field.key]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderList = () => (
    <ul className="space-y-2" aria-label="Sample learners list">
      {visibleLearners.map((learner, index) => (
        <li key={learner.id}>
          {index > 0 && <Separator />}
          <div className="flex flex-wrap items-center gap-3 rounded-xl px-3 py-3">
            <Avatar size="sm" className="size-7">
              <AvatarFallback className={`text-[10px] font-semibold ${avatarTones[0]}`}>{learner.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{learner.name}</p>
              <p className="truncate text-xs text-slate-500">{learner.classroom} · {learner.subject}</p>
            </div>
            <p className="ml-auto truncate text-xs text-slate-600">{learner[area.key].metrics[fields[0].key]}</p>
            <Badge variant="outline" className="border-dashed border-slate-300 bg-slate-50 text-slate-500">Sample</Badge>
            <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">{learner[area.key].status}</Badge>
          </div>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="flex flex-col gap-5 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div className="max-w-2xl">
          <Badge variant="secondary" className="bg-sky-100 text-sky-700">Educator workspace</Badge>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Learners</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Review learner status, activity, and progress in the classrooms you own or are authorized to manage.</p>
        </div>
      </section>

      <Card className="border border-slate-200 bg-white px-4 py-4 shadow-sm ring-0 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3 sm:grid-cols-2 lg:w-auto lg:flex-1">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="learner-search" className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Search learners</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <Input
                  id="learner-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                  aria-describedby="learner-search-note"
                  autoComplete="off"
                  placeholder="Search by learner name"
                  className="h-9 rounded-full bg-slate-50 pl-9"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="learner-classroom" className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Classroom</label>
              <Select value={classroom} onValueChange={(value) => setClassroom(value ?? "all")} items={classroomItems}>
                <SelectTrigger id="learner-classroom" aria-describedby="learner-search-note" className="w-full justify-between rounded-full bg-slate-50 sm:w-48">
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
        <p id="learner-search-note" className="mt-2 text-xs leading-5 text-slate-500" role="status">Search and filters apply to the sample board only.</p>
      </Card>

      <Tabs value={focusArea} onValueChange={(value) => setFocusArea((value ?? "membership") as LensKey)} className="gap-5">
        <TabsList variant="line" className="w-full flex-wrap justify-start gap-1 border-b border-slate-200 pb-px">
          {focusAreas.map((item) => (
            <TabsTrigger key={item.key} value={item.key} className="flex-none">{item.label}</TabsTrigger>
          ))}
        </TabsList>

        {focusAreas.map((item) => (
          <TabsContent key={item.key} value={item.key} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="sr-only">{item.label}</h3>
              <p className="text-sm text-slate-600">{item.description}</p>
              <Badge variant="outline" className="border-dashed border-slate-300 bg-slate-50 text-slate-500">Sample data</Badge>
            </div>

            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
              <Users aria-hidden="true" />
              <AlertTitle className="font-semibold">Example board</AlertTitle>
              <AlertDescription className="text-amber-800">The learners, classrooms, and counts below are sample content. They are not connected to the classroom or learner services and are not real records.</AlertDescription>
            </Alert>

            {visibleLearners.length === 0 ? (
              <Empty className="border border-dashed border-slate-300 bg-white">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-sky-50 text-sky-700"><Search aria-hidden="true" /></EmptyMedia>
                  <EmptyTitle className="text-base font-semibold text-slate-900">No learners match this view</EmptyTitle>
                  <EmptyDescription>Adjust the search term or classroom filter to see sample learners again.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button variant="outline" size="sm" onClick={clearFilters} className="border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800">
                    <X aria-hidden="true" /> Clear filters
                  </Button>
                </EmptyContent>
              </Empty>
            ) : view === "board" ? (
              renderBoard()
            ) : view === "table" ? (
              renderTable()
            ) : (
              renderList()
            )}

            <p className="text-xs leading-5 text-slate-500" role="status">Learner and classroom records must be authorized and isolated by the backend when integrated.</p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}