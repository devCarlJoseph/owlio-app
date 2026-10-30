import { useLocation } from "react-router"
import { getDashboardRole } from "@/components/common/dashboard-navigation"
import { scheduleContent } from "./schedule-content"
import { ScheduleWorkspaceView } from "./schedule-workspace-view"

export function RoleScheduleView() {
  const { pathname } = useLocation()
  const role = getDashboardRole(pathname)

  return role ? <ScheduleWorkspaceView key={role} content={scheduleContent[role]} /> : null
}
