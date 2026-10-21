import { Link } from "react-router"
import { Plus, Users } from "lucide-react"
import type { StudySpaceRecord } from "./study-spaces-records"

export type SpaceRailAction = {
  label: string
  onAction: () => void
}

export function SpaceActionCircle({
  label,
  onAction,
}: {
  label: string
  onAction: () => void
}) {
  return (
    <button
      type="button"
      onClick={onAction}
      className="flex w-20 shrink-0 flex-col items-center gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <span className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-blue-300 bg-white text-blue-700 transition-colors hover:bg-blue-50">
        <Plus className="size-5" aria-hidden="true" />
      </span>
      <span className="text-center text-xs font-medium leading-4 text-blue-700">{label}</span>
    </button>
  )
}

function SpaceCircle({ space }: { space: StudySpaceRecord }) {
  return (
    <Link
      to={`/students/study-spaces/${space.id}`}
      aria-label={`Open ${space.name} study space`}
      className="flex w-20 shrink-0 flex-col items-center gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <span
        aria-hidden="true"
        className={`flex size-16 items-center justify-center rounded-full text-lg font-semibold transition-transform hover:scale-105 ${
          space.role === "owner"
            ? "bg-blue-700 text-white"
            : "border border-blue-100 bg-blue-50 text-blue-700"
        }`}
      >
        {space.name.slice(0, 1).toUpperCase()}
      </span>
      <span className="w-full truncate text-center text-xs font-medium leading-4 text-slate-700" title={space.name}>
        {space.name}
      </span>
    </Link>
  )
}

type SpaceCircleRailProps = {
  label: string
  spaces: StudySpaceRecord[]
  action?: SpaceRailAction
}

export function SpaceCircleRail({ label, spaces, action }: SpaceCircleRailProps) {
  return (
    <div
      role="group"
      aria-label={label}
      tabIndex={0}
      className="-mx-6 overflow-x-auto px-6 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div className="flex w-max items-center gap-4">
        {action ? <SpaceActionCircle label={action.label} onAction={action.onAction} /> : null}

        {action && spaces.length > 0 ? (
          <span aria-hidden="true" className="h-20 w-px shrink-0 rounded-full bg-slate-200" />
        ) : null}

        {spaces.map((space) => (
          <SpaceCircle key={space.id} space={space} />
        ))}
      </div>
    </div>
  )
}

export function SpaceRailEmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Users className="size-4" aria-hidden="true" />
      </span>
      <p className="text-sm leading-5 text-slate-600">{message}</p>
    </div>
  )
}