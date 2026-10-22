import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { libraryKinds } from "./library-records"
import type { LibraryResourceKind } from "./library-types"

type LibraryCategoryRowProps = {
  selectedKinds: LibraryResourceKind[]
  onToggleKind: (kind: LibraryResourceKind) => void
  onClearKinds: () => void
  layout: "grid" | "list"
  onLayoutChange: (layout: "grid" | "list") => void
}

export function LibraryCategoryRow({
  selectedKinds,
  onToggleKind,
  onClearKinds,
  layout,
  onLayoutChange,
}: LibraryCategoryRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Categories</span>

        <Button
          type="button"
          size="xs"
          variant="outline"
          aria-pressed={selectedKinds.length === 0}
          onClick={onClearKinds}
          className={
            selectedKinds.length === 0
              ? "border-blue-700 bg-blue-700 text-white hover:bg-blue-800"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }
        >
          All
        </Button>

        {libraryKinds.map((kind) => {
          const isActive = selectedKinds.includes(kind)

          return (
            <Button
              key={kind}
              type="button"
              size="xs"
              variant="outline"
              aria-pressed={isActive}
              onClick={() => onToggleKind(kind)}
              className={
                isActive
                  ? "border-blue-700 bg-blue-700 text-white hover:bg-blue-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }
            >
              {kind}
            </Button>
          )
        })}
      </div>

      <div
        role="group"
        aria-label="Resource layout"
        className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1"
      >
        {(
          [
            { value: "grid" as const, label: "Grid view", icon: LayoutGrid },
            { value: "list" as const, label: "List view", icon: List },
          ] as const
        ).map((option) => {
          const OptionIcon = option.icon
          const isActive = layout === option.value

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              aria-label={option.label}
              onClick={() => onLayoutChange(option.value)}
              className={`inline-flex size-8 items-center justify-center rounded-md outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <OptionIcon aria-hidden="true" className="size-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
