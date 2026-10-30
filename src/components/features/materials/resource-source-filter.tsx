import { cn } from "cn"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { librarySources } from "./library-records"
import type { LibraryFilter } from "./library-records"

type ResourceSourceFilterProps = {
  counts: Record<LibraryFilter, number>
}

const sourceAccents: Record<LibraryFilter, { trigger: string; badge: string }> = {
  all: {
    trigger: "data-active:text-slate-900 data-active:after:bg-slate-900",
    badge:
      "group-data-[variant=line]/tabs-list:data-active:bg-slate-100 group-data-[variant=line]/tabs-list:data-active:text-slate-900",
  },
  personal: {
    trigger: "data-active:text-amber-800 data-active:after:bg-amber-500",
    badge:
      "group-data-[variant=line]/tabs-list:data-active:bg-amber-100 group-data-[variant=line]/tabs-list:data-active:text-amber-800",
  },
  classroom: {
    trigger: "data-active:text-sky-800 data-active:after:bg-sky-500",
    badge:
      "group-data-[variant=line]/tabs-list:data-active:bg-sky-100 group-data-[variant=line]/tabs-list:data-active:text-sky-800",
  },
  "study-space": {
    trigger: "data-active:text-emerald-800 data-active:after:bg-emerald-500",
    badge:
      "group-data-[variant=line]/tabs-list:data-active:bg-emerald-100 group-data-[variant=line]/tabs-list:data-active:text-emerald-800",
  },
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
      {options.map((option) => {
        const accent = sourceAccents[option.value]

        return (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className={cn("flex-none gap-2", accent.trigger)}
          >
            {option.label}
            <span
              className={cn(
                "rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-slate-500",
                accent.badge,
              )}
            >
              {counts[option.value]}
            </span>
          </TabsTrigger>
        )
      })}
    </TabsList>
  )
}
