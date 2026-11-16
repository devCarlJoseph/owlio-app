import { DashboardOverview } from "@/components/features/dashboard-overview/view/dashboard-overview"
import { educatorOverviewContent } from "../contents/educator-overview-content"

export function EducatorOverviewView() {
  return <DashboardOverview content={educatorOverviewContent} />
}
