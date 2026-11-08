import { scheduleContent } from "@/components/features/schedule/schedule-content"
import { ScheduleWorkspaceView } from "@/components/features/schedule/schedule-workspace-view"

export default function TutorSessionsView() {
  return <ScheduleWorkspaceView content={scheduleContent.tutors} />
}
