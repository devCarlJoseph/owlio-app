import { ArrowRight, BookOpen, Layers3 } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { getSubjectCoverColor, getSubjectMilestoneState, sortSubjects, type SubjectRecord } from "./subject-records"

export function ContinueLearning({ subjects }: { subjects: SubjectRecord[] }) {
  const ongoing = sortSubjects(subjects).filter((subject) => {
    const progress = getSubjectMilestoneState(subject)
    return progress.total > 0 && !progress.allDone && (subject.progressStarted || progress.completed > 0 || progress.active !== null)
  }).slice(0, 2)
  if (ongoing.length === 0) return null

  return (
    <section aria-labelledby="continue-learning-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="continue-learning-heading" className="text-lg font-semibold tracking-tight text-foreground">Continue learning</h2>
        <a href="#subject-library" className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-muted-foreground outline-none hover:text-brand focus-visible:ring-2 focus-visible:ring-ring">Browse all subjects <ArrowRight aria-hidden="true" className="size-3.5" /></a>
      </div>
      <ul className="grid gap-4 xl:grid-cols-2">
        {ongoing.map((subject) => {
          const progress = getSubjectMilestoneState(subject)
          const next = progress.active ?? subject.milestones.find((item) => item.status !== "completed")
          if (!next) return null
          const href = `/students/subjects/${subject.id}?topic=${encodeURIComponent(next.id)}`
          return (
            <li key={subject.id} className="overflow-hidden rounded-xl border border-border bg-background shadow-xs">
              <div className="flex items-center gap-4 p-3 sm:p-4">
                <div aria-hidden="true" className={`relative hidden h-28 w-36 shrink-0 overflow-hidden rounded-lg sm:block ${getSubjectCoverColor(subject.coverColor).className}`}>
                  {subject.coverImage ? <img src={subject.coverImage} alt="" className="size-full object-cover" /> : null}
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-slate-950/65 px-1.5 py-1 text-[10px] text-white"><Layers3 className="size-3" />{progress.total} topics</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><BookOpen aria-hidden="true" className="size-3.5 text-brand" />Personal subject</span>
                  <h3 className="mt-1 truncate text-sm font-semibold text-foreground">{subject.name}</h3>
                  <div className="mt-4 flex items-end gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="mb-2 text-[11px] text-muted-foreground">Topic progress <span className="font-medium text-foreground">{progress.progress}%</span></p>
                      <div role="progressbar" aria-label={`${subject.name} topic progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.progress} className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress.progress}%` }} /></div>
                    </div>
                    <Button nativeButton={false} role="link" variant="outline" size="sm" render={<Link to={href} aria-label={`Continue studying ${subject.name}`} />} className="rounded-lg px-3">Continue</Button>
                  </div>
                </div>
              </div>
              <Link to={href} aria-label={`Next topic for ${subject.name}: ${next.title}`} className="flex items-center gap-2 border-t border-border bg-muted/40 px-4 py-2.5 text-xs outline-none hover:bg-brand-soft focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                <BookOpen aria-hidden="true" className="size-3.5 shrink-0 text-brand" /><span className="shrink-0 text-muted-foreground">Up next</span><span className="truncate font-medium text-brand">{next.title}</span><ArrowRight aria-hidden="true" className="ml-auto size-3.5 shrink-0 text-brand" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
