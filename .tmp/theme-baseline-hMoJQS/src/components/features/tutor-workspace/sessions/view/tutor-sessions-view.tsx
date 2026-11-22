import { scheduleContent } from "@/components/features/schedule/contents/schedule-content"
import { ScheduleWorkspaceView } from "@/components/features/schedule/view/schedule-workspace-view"

export default function TutorSessionsView() {
  return <ScheduleWorkspaceView content={scheduleContent.tutors} />
}
