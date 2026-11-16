import { Info } from "lucide-react"

export function SampleDataNotice({ hasExamples = true }: { hasExamples?: boolean }) {
  return (
    <section
      aria-label="Sample data notice"
      className="flex items-start gap-2.5 rounded-lg border border-border bg-background px-3 py-2.5 text-muted-foreground"
    >
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <div>
        <p className="text-xs leading-5"><span className="font-medium text-foreground">Browser preview.</span> {hasExamples ? "Includes example subjects. " : ""}Your subjects and topic progress stay in this browser, separate from classroom records.</p>
      </div>
    </section>
  )
}
