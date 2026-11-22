import { DashboardOverview } from "@/components/features/dashboard-overview/view/dashboard-overview"
import { studentOverviewContent } from "../contents/student-overview-content"
import { getTimeGreeting } from "../utils/time-greeting"

export function StudentOverviewView({ userName }: { userName?: string }) {
  const content = userName
    ? { ...studentOverviewContent, headline: `${getTimeGreeting()}, ${userName}` }
    : studentOverviewContent

  return <DashboardOverview content={content} />
}
