import { useEffect, useRef, useState } from "react"
import { Circle, CircleCheck, CircleDot, Flag, MoreVertical, Pencil, Plus, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import {
  getSubjectMilestoneState,
  type SubjectMilestone,
  type SubjectRecord,
  type SubjectTheme,
} from "./subject-records"

type SubjectMilestonesCardProps = {
  subject: SubjectRecord
  theme: SubjectTheme
  canUndo: boolean
  removalLabel: string | null
  onAddMilestone: () => void
  onEditMilestone: (milestone: SubjectMilestone) => void
  onDeleteMilestone: (milestone: SubjectMilestone) => void
  onRemoveAllMilestones: () => void
  onUndoRemoval: () => void
  onStartProgress: () => void
  onCompleteMilestone: () => void
  onStartNextMilestone: () => void
  onUndoMilestones: () => void
}

const milestoneStatusMeta = {
  completed: { label: "Completed", icon: CircleCheck, className: "text-emerald-600" },
  "in-progress": { label: "In progress", icon: CircleDot, className: "text-blue-600" },
  "not-started": { label: "Not started", icon: Circle, className: "text-slate-300" },
} as const

function MilestoneActions({
  milestone,
  onEdit,
  onDelete,
}: {
  milestone: SubjectMilestone
  onEdit: (milestone: SubjectMilestone) => void
  onDelete: (milestone: SubjectMilestone) => void
}) {
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current)
    },
    []
  )

  function cancelClose() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  function scheduleClose() {
    cancelClose()
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      setOpen(false)
    }, 150)
  }

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => {
        cancelClose()
        setOpen(true)
      }}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget as Node | null
        if (nextTarget && !event.currentTarget.contains(nextTarget)) scheduleClose()
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          cancelClose()
          setOpen(false)
        }
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Options for ${milestone.title}`}
        aria-expanded={open}
        className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      >
        <MoreVertical aria-hidden="true" />
      </Button>

      {open ? (
        <div
          role="menu"
          aria-label={`Options for ${milestone.title}`}
          className="absolute right-0 top-full z-20 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              onEdit(milestone)
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-slate-700 outline-none hover:bg-slate-100 focus-visible:bg-slate-100"
          >
            <Pencil aria-hidden="true" className="size-4" />
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onDelete(milestone) }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-red-700 outline-none hover:bg-red-50 focus-visible:bg-red-50"
          >
            <Trash aria-hidden="true" className="size-4" />
            Remove
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function SubjectMilestonesCard({
  subject,
  theme,
  canUndo,
  removalLabel,
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  onRemoveAllMilestones,
  onUndoRemoval,
  onStartProgress,
  onCompleteMilestone,
  onStartNextMilestone,
  onUndoMilestones,
}: SubjectMilestonesCardProps) {
  const state = getSubjectMilestoneState(subject)

  if (state.total === 0) {
    return (
      <Card className="border border-slate-200 bg-white shadow-sm ring-0">
        <CardContent className="gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Your learning milestones</h3>
            <p className="mt-1 text-sm text-slate-500">
              Break {subject.name} into the steps you want to finish.
            </p>
          </div>

          <Empty className="border border-dashed border-slate-300 bg-slate-50/60 p-8">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-slate-100 text-slate-500">
                <Flag aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-base text-slate-900">No milestones yet</EmptyTitle>
              <EmptyDescription className="text-slate-600">
                Add the first step, then start working through them one by one.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddMilestone}
                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
              >
                <Plus aria-hidden="true" />
                Add milestone
              </Button>

              {removalLabel ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onUndoRemoval}
                  className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  {removalLabel}
                </Button>
              ) : null}
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  const isLastActive =
    state.active !== null &&
    state.active.id === subject.milestones[subject.milestones.length - 1]?.id

  let primaryAction: { label: string; onClick: () => void } | null = null

  if (!subject.progressStarted) {
    primaryAction = { label: "Start progress", onClick: onStartProgress }
  } else if (!state.allDone) {
    if (state.active === null) {
      primaryAction = { label: "Start next milestone", onClick: onStartNextMilestone }
    } else if (isLastActive) {
      primaryAction = { label: "Complete milestones", onClick: onCompleteMilestone }
    } else {
      primaryAction = { label: "Milestone completed", onClick: onCompleteMilestone }
    }
  }

  const showActionRow =
    primaryAction !== null || subject.progressStarted || removalLabel !== null

  return (
    <Card className="border border-slate-200 bg-white shadow-sm ring-0">
      <CardContent className="gap-4">
        <div>
          <p className="text-sm text-slate-500">Learning progress</p>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <p className={`text-2xl font-semibold ${theme.text}`}>
              {state.completed} of {state.total} topics
            </p>
            <p className="text-2xl font-semibold tabular-nums text-slate-900">
              {state.progress}%
            </p>
          </div>
        </div>

        <Progress
          aria-hidden="true"
          value={state.progress}
          className={`gap-0 [&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-track]]:bg-slate-100 ${theme.bar}`}
        />

        {showActionRow ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {subject.progressStarted ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onUndoMilestones}
                  disabled={!canUndo}
                  className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  Undo milestones
                </Button>
              ) : null}

              {removalLabel ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onUndoRemoval}
                  className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  {removalLabel}
                </Button>
              ) : null}
            </div>

            {primaryAction ? (
              <Button
                type="button"
                size="sm"
                onClick={primaryAction.onClick}
                className={`${theme.button} text-white ${theme.buttonHover}`}
              >
                {primaryAction.label}
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className="border-t border-slate-100 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-900">Your learning milestones</h3>
            <div className="flex flex-wrap items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemoveAllMilestones}
                className="text-slate-500 hover:bg-red-50 hover:text-red-700"
              >
                <Trash aria-hidden="true" />
                Remove all
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onAddMilestone}
                className={`text-slate-600 hover:bg-slate-100 ${theme.hoverText}`}
              >
                <Plus aria-hidden="true" />
                Add milestone
              </Button>
            </div>
          </div>

          <ul className="mt-3 space-y-3">
            {subject.milestones.map((item) => {
              const meta = milestoneStatusMeta[item.status]
              const StatusIcon = meta.icon

              return (
                <li key={item.id} className="group/milestone flex items-start gap-3">
                  <StatusIcon
                    aria-hidden="true"
                    className={`mt-0.5 size-5 shrink-0 ${
                      item.status === "in-progress" ? theme.icon : meta.className
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{meta.label}</p>
                  </div>
                  <MilestoneActions
                    milestone={item}
                    onEdit={onEditMilestone}
                    onDelete={onDeleteMilestone}
                  />
                </li>
              )
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
