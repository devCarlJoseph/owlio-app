import { Info } from "lucide-react"

export function SampleDataNotice() {
  return (
    <section
      aria-label="Sample data notice"
      className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
    >
      <Info className="mt-1 size-4 shrink-0 text-blue-700" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-blue-900">Example subjects — add your own</p>
        <p className="mt-0.5 text-sm leading-5 text-blue-800">
          The subjects below are examples for reviewing the layout. Subjects you create are kept in
          this browser, are never sent to a server, and are not shared with any classroom.
        </p>
      </div>
    </section>
  )
}
