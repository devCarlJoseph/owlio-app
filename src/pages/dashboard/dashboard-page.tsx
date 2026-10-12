import { BookOpenCheck, CalendarDays, ChartNoAxesCombined, Languages } from "lucide-react"
const audiencePages = {
  students: {
    label: "Students",
    title: "Your learning, all in one place.",
    description: "Keep learning materials, upcoming work, and progress together in your student workspace.",
    cards: [
      { title: "My learning", description: "Your courses and learning resources will appear here.", icon: BookOpenCheck },
      { title: "Coming up", description: "Upcoming lessons and tasks will appear here.", icon: CalendarDays },
      { title: "My progress", description: "Track your learning activity and milestones here.", icon: ChartNoAxesCombined },
    ],
  },
  educators: {
    label: "Educators",
    title: "Everything for your teaching day.",
    description: "Bring your classes, learning materials, and student progress together in one workspace.",
    cards: [
      { title: "My classes", description: "Your classes and learner groups will appear here.", icon: BookOpenCheck },
      { title: "Coming up", description: "Upcoming lessons and teaching tasks will appear here.", icon: CalendarDays },
      { title: "Class progress", description: "Review learning activity and milestones here.", icon: ChartNoAxesCombined },
    ],
  },
  tutors: {
    label: "Tutors",
    title: "A flexible space for every learner.",
    description: "Organize tutoring sessions, learning materials, and learner progress in one place.",
    cards: [
      { title: "My learners", description: "Your learners and learning groups will appear here.", icon: BookOpenCheck },
      { title: "Coming up", description: "Upcoming tutoring sessions will appear here.", icon: CalendarDays },
      { title: "Learner progress", description: "Review learner activity and milestones here.", icon: ChartNoAxesCombined },
    ],
  },
  esl: {
    label: "ESL",
    title: "Support every step of language learning.",
    description: "Organize ESL lessons, resources, and learner progress in a dedicated teaching workspace.",
    cards: [
      { title: "My learners", description: "Your ESL learners and groups will appear here.", icon: BookOpenCheck },
      { title: "Coming up", description: "Upcoming language lessons will appear here.", icon: CalendarDays },
      { title: "Learner progress", description: "Review language-learning activity and milestones here.", icon: ChartNoAxesCombined },
    ],
  },
} as const

const overview = {
  label: "Overview",
  title: "Welcome to your Owlio workspace.",
  description: "Choose a workspace from the sidebar to get started. Your dashboard layout stays consistent as you move between roles.",
  cards: [
    { title: "Students", description: "A focused home for lessons, tasks, and personal learning progress.", icon: BookOpenCheck },
    { title: "Educators", description: "A shared space for classes, teaching materials, and learner progress.", icon: CalendarDays },
    { title: "Tutors & ESL", description: "Flexible tools for tutoring, language learning, and learner support.", icon: Languages },
  ],
}

type DashboardPageProps = {
  audience?: "students" | "educators" | "tutors" | "esl"
}

export default function DashboardPage({ audience }: DashboardPageProps) {
  const page = audience ? audiencePages[audience] : overview

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{page.label} workspace</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{page.title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{page.description}</p>
      </section>

      <section aria-label={`${page.label} dashboard sections`} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {page.cards.map(({ title, description, icon: Icon }) => (
          <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-sm leading-5 text-slate-500">{description}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
