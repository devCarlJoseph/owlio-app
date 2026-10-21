import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { librarySources } from "./library-records"
import type { LibraryFilter } from "./library-records"

type ResourceSourceFilterProps = {
  counts: Record<LibraryFilter, number>
}

export function ResourceSourceFilter({ counts }: ResourceSourceFilterProps) {
  const options: { value: LibraryFilter; label: string }[] = [
    { value: "all", label: "All sources" },
    ...librarySources.map((source) => ({
      value: source as LibraryFilter,
      label:
        source === "personal"
          ? "Personal"
          : source === "classroom"
            ? "Classroom"
            : "Study spaces",
    })),
  ]

  return (
    <TabsList
      variant="line"
      className="h-auto w-full flex-wrap justify-start gap-1 border-b border-slate-200 pb-px"
    >
      {options.map((option) => (
        <TabsTrigger
          key={option.value}
          value={option.value}
          className="flex-none gap-2"
        >
          {option.label}
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-slate-500 group-data-[variant=line]/tabs-list:data-active:bg-blue-50 group-data-[variant=line]/tabs-list:data-active:text-blue-700">
            {counts[option.value]}
          </span>
        </TabsTrigger>
      ))}
    </TabsList>
  )
}
