import { useState } from "react"
import { MoreHorizontal, X } from "lucide-react"
import { cn } from "cn"

type NoteLabelsProps = {
  labels: string[]
  onLabelClick?: (label: string) => void
  onRemove?: (label: string) => void
  max?: number
  className?: string
}

export function NoteLabels({
  labels,
  onLabelClick,
  onRemove,
  max = 2,
  className,
}: NoteLabelsProps) {
  const [open, setOpen] = useState(false)

  if (labels.length === 0) return null

  const visible = labels.slice(0, max)
  const hidden = labels.slice(max)

  return (
    <div className={cn("relative flex items-center gap-1.5 overflow-hidden", className)}>
      {visible.map((label) => (
        <span
          key={label}
          className="inline-flex max-w-40 shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
        >
          <button
            type="button"
            onClick={() => onLabelClick?.(label)}
            className="truncate rounded outline-none hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {label}
          </button>
          {onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(label)}
              aria-label={`Remove label ${label}`}
              className="rounded-full p-0.5 outline-none hover:bg-slate-300/70 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          ) : null}
        </span>
      ))}

      {hidden.length > 0 ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-label={`${hidden.length} more ${hidden.length === 1 ? "label" : "labels"}`}
            aria-expanded={open}
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 outline-none transition hover:bg-slate-200 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <MoreHorizontal aria-hidden="true" className="size-3.5" />
          </button>

          {open ? (
            <div
              role="menu"
              aria-label="More labels"
              className="absolute bottom-full left-0 z-20 mb-1 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
            >
              {hidden.map((label) => (
                <button
                  key={label}
                  type="button"
                  role="menuitem"
                  onClick={() => onLabelClick?.(label)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium uppercase tracking-wide text-slate-600 outline-none hover:bg-slate-100 focus-visible:bg-slate-100"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
