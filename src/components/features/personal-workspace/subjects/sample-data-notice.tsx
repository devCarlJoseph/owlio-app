import { Info } from "lucide-react"

export function SampleDataNotice() {
  return (
    <section
      aria-label="Sample data notice"
      className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
    >
      <Info className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-blue-900">Sample data — layout preview only</p>
        <p className="mt-0.5 text-sm leading-5 text-blue-800">
          Subjects are not connected to a service yet. Every name, code, chapter, lesson, and percentage
          below is placeholder content for reviewing how this page will look.
        </p>
      </div>
    </section>
  )
}