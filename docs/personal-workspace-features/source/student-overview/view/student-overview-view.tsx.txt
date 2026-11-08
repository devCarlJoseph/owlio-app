import { DashboardOverview } from "@/components/features/dashboard-overview/dashboard-overview"
import { studentOverviewContent } from "./student-overview-content"
import { getTimeGreeting } from "./time-greeting"

export function StudentOverviewView({ userName }: { userName?: string }) {
  const content = userName
    ? { ...studentOverviewContent, headline: `${getTimeGreeting()}, ${userName}` }
    : studentOverviewContent

  return <DashboardOverview content={content} />
}
