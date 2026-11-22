import { Button } from "@/components/ui/button"
import type { NoteLabelGroup } from "../contents/note-records"

type NoteLabelChipsProps = {
  groups: NoteLabelGroup[]
  activeLabel: string | null
  onSelectLabel: (label: string | null) => void
}

export function NoteLabelChips({ groups, activeLabel, onSelectLabel }: NoteLabelChipsProps) {
  if (groups.length === 0) {
    return (
      <p className="text-xs leading-5 text-slate-500 surface-dark:text-muted-foreground">
        Add a label such as <span className="font-semibold text-blue-700 surface-dark:text-blue-300">physics</span> to a note to
        group it here.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-slate-500 surface-dark:text-muted-foreground">Labels</span>

      <Button
        type="button"
        size="xs"
        variant="outline"
        aria-pressed={activeLabel === null}
        onClick={() => onSelectLabel(null)}
        className={
          activeLabel === null
            ? "border-brand bg-brand text-brand-foreground hover:bg-brand/90"
            : "border-slate-200 surface-dark:border-border text-slate-600 surface-dark:text-muted-foreground hover:bg-slate-50 surface-dark:hover:bg-background"
        }
      >
        All
      </Button>

      {groups.map((group) => {
        const isActive = activeLabel === group.label

        return (
          <Button
            key={group.label}
            type="button"
            size="xs"
            variant="outline"
            aria-pressed={isActive}
            onClick={() => onSelectLabel(isActive ? null : group.label)}
            className={
              isActive
                ? "border-brand bg-brand text-brand-foreground hover:bg-brand/90"
                : "border-slate-200 surface-dark:border-border text-slate-600 surface-dark:text-muted-foreground hover:bg-slate-50 surface-dark:hover:bg-background"
            }
          >
            {group.label}
            <span className="tabular-nums opacity-70">{group.notes.length}</span>
          </Button>
        )
      })}
    </div>
  )
}
