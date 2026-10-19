import { ArrowRight, BookOpenCheck, CircleAlert, UsersRound } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export default function EslLearnersView() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 pb-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-800">ESL teaching workspace</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">My Learners</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            View your individual learners and groups, and keep teaching context connected to lessons and activities.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900">
          <CircleAlert className="size-3.5" aria-hidden="true" />
          Learner records unavailable
        </span>
      </header>

      <section aria-label="Learner profiles" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Learners & groups</h3>
            <p className="mt-1 text-sm text-slate-500">Your authorized teaching relationships will appear here.</p>
          </div>
        </div>

        <div className="px-5 py-8 sm:px-6 sm:py-10">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-800">
              <UsersRound className="size-7" aria-hidden="true" />
            </span>
            <h4 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">Learner profiles aren't connected yet</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Learner and group records aren't available in this workspace, so there are no profiles to show or search.
              This page won't display sample learners as real teaching relationships.
            </p>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Language levels, lesson history, attendance, and feedback will only appear when supported records are available.
            </p>
          </div>

          <div role="status" className="mx-auto mt-7 flex max-w-3xl items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden="true" />
            <p className="text-sm leading-5 text-slate-600">
              No learner data was loaded. Access to learner information depends on authorized teaching context; this view does not infer membership or permissions.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Related teaching areas" className="grid gap-4 md:grid-cols-2">
        <article className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <BookOpenCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Lesson plans</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">Prepare reusable plans separately from learner records.</p>
            </div>
          </div>
          <Button render={<Link to="/esl/lessons" />} variant="ghost" size="icon" aria-label="Go to lesson plans">
            <ArrowRight aria-hidden="true" />
          </Button>
        </article>
        <article className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <BookOpenCheck className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Activities & assessments</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">Review the activity workspace without assuming learner data is present.</p>
            </div>
          </div>
          <Button render={<Link to="/esl/classwork" />} variant="ghost" size="icon" aria-label="Go to activities and assessments">
            <ArrowRight aria-hidden="true" />
          </Button>
        </article>
      </section>
    </main>
  )
}
