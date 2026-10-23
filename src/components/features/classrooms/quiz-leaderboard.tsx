import { Medal, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { LeaderboardEntry } from "./quiz-timing"
import { PersonAvatar } from "./classroom-ui"

const podium = [
  { label: "1st place", row: "bg-gradient-to-r from-amber-100 via-amber-50 to-transparent", icon: "text-amber-500" },
  { label: "2nd place", row: "bg-gradient-to-r from-slate-200 via-slate-100 to-transparent", icon: "text-slate-400" },
  { label: "3rd place", row: "bg-gradient-to-r from-orange-100 via-orange-50 to-transparent", icon: "text-orange-500" },
]

function ordinal(rank: number) {
  return rank === 1 ? "1st" : rank === 2 ? "2nd" : rank === 3 ? "3rd" : `${rank}th`
}

export function QuizLeaderboard({
  enabled,
  entries,
  currentLearnerId,
}: {
  enabled: boolean
  entries: LeaderboardEntry[]
  currentLearnerId: string
}) {
  if (!enabled) {
    return (
      <Card className="border-dashed">
        <CardContent className="items-center gap-2 py-10 text-center">
          <Trophy aria-hidden="true" className="size-8 text-muted-foreground" />
          <h3 className="text-base font-semibold text-foreground">Leaderboard not enabled</h3>
          <p className="max-w-sm text-sm text-muted-foreground">Your educator has not turned on the leaderboard for this quiz. Your own result is still private to you.</p>
        </CardContent>
      </Card>
    )
  }

  if (entries.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="items-center gap-2 py-10 text-center">
          <Trophy aria-hidden="true" className="size-8 text-muted-foreground" />
          <h3 className="text-base font-semibold text-foreground">No ranked results yet</h3>
          <p className="max-w-sm text-sm text-muted-foreground">Rankings appear after your educator returns scored results.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <ol aria-label="Quiz leaderboard" className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {entries.map((entry) => {
        const mine = entry.learnerId === currentLearnerId
        const tier = entry.rank <= 3 ? podium[entry.rank - 1] : null
        return (
          <li key={entry.learnerId} className={`flex items-center gap-3 px-4 py-3 ${tier?.row ?? ""}`}>
            <span className="flex w-7 shrink-0 items-center justify-center text-sm font-semibold text-muted-foreground">
              {tier ? <Medal aria-hidden="true" className={`size-5 ${tier.icon}`} /> : entry.rank}
              <span className="sr-only">{tier?.label ?? `${ordinal(entry.rank)} place`}</span>
            </span>
            <PersonAvatar name={entry.displayName} />
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
              {mine ? "You" : entry.displayName}
            </p>
            <span className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-semibold tabular-nums">{entry.score} pts</span>
          </li>
        )
      })}
    </ol>
  )
}
