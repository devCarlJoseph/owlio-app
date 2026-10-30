import { Info } from "lucide-react"

export function SampleDataNotice() {
  return (
    <section
      aria-label="Sample data notice"
      className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-white px-4 py-3 shadow-sm shadow-violet-100/40"
    >
      <Info className="mt-1 size-4 shrink-0 text-[#8a60f1]" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-[#39256b]">Example subjects — add your own</p>
        <p className="mt-0.5 text-sm leading-5 text-violet-900/80">
          The subjects below are examples for reviewing the layout. Subjects you create are kept in
          this browser, are never sent to a server, and are not shared with any classroom.
        </p>
      </div>
    </section>
  )
}
