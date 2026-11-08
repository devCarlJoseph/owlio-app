import {
  CalendarDays,
  CheckCheck,
  ClipboardCheck,
  Clock3,
  UsersRound,
} from "lucide-react"

const summaryItems = [
  { label: "Sessions", icon: CalendarDays },
  { label: "Learners", icon: UsersRound },
  { label: "Recorded", icon: CheckCheck },
  { label: "To review", icon: Clock3 },
]

function AttendanceSummary() {
  return (
    <section
      aria-label="Attendance summary"
      className="grid grid-cols-2 divide-x divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-4 sm:divide-y-0"
    >
      {summaryItems.map(({ label, icon: Icon }) => (
        <article key={label} className="flex min-h-24 items-center gap-3 px-4 py-4 sm:px-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xl font-semibold tracking-tight text-slate-700" aria-label={`${label}: unavailable`}>
              —
            </p>
            <p className="text-xs font-medium text-slate-600">{label}</p>
          </div>
        </article>
      ))}
    </section>
  )
}

export default function EslAttendanceView() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 pb-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-800">
            Teaching
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Lesson attendance
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            Review educator-recorded participation in the context of an ESL lesson or session.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900">
          <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
          Attendance data unavailable
        </div>
      </header>

      <AttendanceSummary />

      <section
        aria-labelledby="attendance-register-heading"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 id="attendance-register-heading" className="text-base font-semibold text-slate-900">
              Attendance register
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a scheduled lesson or session to review its authorized learner or group records.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
            <span>Session selection unavailable</span>
          </div>
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <caption className="sr-only">Attendance by learner and scheduled lesson or session</caption>
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-6 py-3">Learner or group</th>
                <th scope="col" className="px-6 py-3">Lesson or session</th>
                <th scope="col" className="px-6 py-3">Date and time</th>
                <th scope="col" className="px-6 py-3">Attendance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-6 py-16">
                  <EmptyRegister />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="px-4 py-10 sm:hidden">
          <EmptyRegister />
        </div>
      </section>

      <p className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
        <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" />
        <span>
          Attendance must be recorded through an approved service. Meeting Room presence, chat, and other live activity do not establish attendance.
        </span>
      </p>
    </main>
  )
}

function EmptyRegister() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
        <CalendarDays className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">No attendance records to show</h3>
      <p className="mt-1.5 text-sm leading-6 text-slate-500">
        ESL lesson sessions and attendance history are not connected yet. No learner records or summary totals are available here.
      </p>
    </div>
  )
}
