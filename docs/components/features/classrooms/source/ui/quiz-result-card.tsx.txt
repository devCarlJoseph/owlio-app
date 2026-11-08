import { Award, Clock, Hash, ListChecks } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { ClassroomActivity, ClassroomSubmission } from "./classroom-types"
import { PersonAvatar } from "./classroom-ui"
import { formatDuration, type LeaderboardEntry } from "./quiz-timing"

function Tile({ icon: Icon, label, value }: { icon: typeof Award; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
      <dd className="mt-2 text-lg font-semibold tabular-nums text-foreground">{value}</dd>
      <dt className="text-xs text-muted-foreground">{label}</dt>
    </div>
  )
}

export function QuizResultCard({
  activity,
  submission,
  myEntry,
  learnerName,
}: {
  activity: ClassroomActivity
  submission?: ClassroomSubmission
  myEntry?: LeaderboardEntry
  learnerName: string
}) {
  const released = Boolean(submission?.released)
  return (
    <Card>
      <CardContent className="gap-4 p-5">
        <div className="flex flex-col items-center text-center">
          <PersonAvatar name={learnerName} size="lg" />
          <p className="mt-2 text-sm font-semibold text-foreground">{learnerName}</p>
          <p className="text-xs text-muted-foreground">Your result</p>
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <Tile icon={ListChecks} label="Status" value={submission ? (released ? "Returned" : "Submitted") : "Not started"} />
          <Tile icon={Award} label="Points" value={released && typeof submission?.score === "number" ? String(submission.score) : "—"} />
          <Tile icon={Hash} label="Ranking" value={myEntry ? String(myEntry.rank) : "—"} />
          <Tile icon={Clock} label="Time limit" value={activity.timing ? formatDuration(activity.timing.durationMinutes) : "None"} />
        </dl>
        {submission && !released && (
          <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">Your educator has not returned results yet.</p>
        )}
        {released && (submission?.evaluation || submission?.feedback) && (
          <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-950">
            {submission?.evaluation && <p className="font-semibold">{submission.evaluation}</p>}
            {submission?.feedback && <p className="mt-1 whitespace-pre-wrap">{submission.feedback}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
