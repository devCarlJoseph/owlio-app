import { AlarmClock, CalendarClock, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ClassroomActivity } from "./classroom-types"
import { formatDateTime, formatDuration } from "./quiz-timing"

export function QuizTimingBadges({ activity }: { activity: ClassroomActivity }) {
  const { timing } = activity
  if (!timing) return null
  return (
    <>
      <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 text-primary">
        <AlarmClock aria-hidden="true" className="size-3" /> {formatDuration(timing.durationMinutes)}
      </Badge>
      {timing.closesAt && (
        <Badge variant="outline" className="gap-1">
          <CalendarClock aria-hidden="true" className="size-3" /> Closes {formatDateTime(timing.closesAt)}
        </Badge>
      )}
      {activity.showLeaderboard && (
        <Badge variant="outline" className="gap-1">
          <Trophy aria-hidden="true" className="size-3" /> Leaderboard
        </Badge>
      )}
    </>
  )
}
