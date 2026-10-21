import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router"
import type { ComponentType, ReactNode } from "react"
import { getDashboardNavigation } from "@/components/common/dashboard-navigation"
import TutorOverviewView from "./overview/tutor-overview-view"
import TutorLearnersView from "./learners/tutor-learners-view"
import TutorLearnerDetailView from "./learners/tutor-learner-detail-view"
import TutorActivitiesView from "./activities/tutor-activities-view"
import TutorAiAssistantView from "./ai/tutor-ai-assistant-view"
import TutorAttendanceView from "./attendance/tutor-attendance-view"
import TutorAnnouncementsView from "./communication/tutor-announcements-view"
import TutorDiscussionsView from "./communication/tutor-discussions-view"
import TutorMaterialsView from "./materials/tutor-materials-view"
import TutorSessionNotesView from "./notes/tutor-session-notes-view"
import TutorNotificationsView from "./notifications/tutor-notifications-view"
import TutorStudentProgressView from "./progress/tutor-student-progress-view"
import TutorSessionsView from "./sessions/tutor-sessions-view"
import TutorSettingsView from "./settings/tutor-settings-view"
import LearningPlansView from "./learning-plans/learning-plans-view"

afterEach(cleanup)

function renderPage(page: ReactNode) {
  return render(<MemoryRouter>{page}</MemoryRouter>)
}

const disconnectedPages: [string, ComponentType, string][] = [
  ["Learner details", TutorLearnerDetailView, "Learner details are unavailable"],
  ["Learning Plans", LearningPlansView, "Learning Plans are not connected"],
  ["Activities & Evaluations", TutorActivitiesView, "Activities and learner work are unavailable"],
  ["Sessions & Schedule", TutorSessionsView, "Session scheduling is unavailable"],
  ["Session Attendance", TutorAttendanceView, "Attendance records are unavailable"],
  ["Session Notes", TutorSessionNotesView, "Notes and feedback are unavailable"],
  ["Teaching Materials", TutorMaterialsView, "The materials library is not connected"],
  ["Student Progress", TutorStudentProgressView, "Progress evidence is unavailable"],
  ["Discussions", TutorDiscussionsView, "Discussions are not connected"],
  ["Announcements", TutorAnnouncementsView, "Announcements are unavailable"],
  ["Notifications", TutorNotificationsView, "Notification inbox is unavailable"],
  ["AI Tutor Assistant", TutorAiAssistantView, "AI generation is not connected"],
  ["Profile & Settings", TutorSettingsView, "Profile settings are unavailable"],
]

describe("tutor workspace pages", () => {
  it("shows the overview without fabricated metrics and links to tutor workflows", () => {
    renderPage(<TutorOverviewView />)

    expect(screen.getByRole("heading", { name: "Your tutoring at a glance" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Upcoming sessions are unavailable" })).toBeTruthy()
    expect(screen.getByRole("link", { name: /Review learners/ }).getAttribute("href")).toBe("/tutors/learners")
    expect(screen.getByRole("link", { name: /Prepare a learning plan/ }).getAttribute("href")).toBe("/tutors/learning-plans")
    expect(screen.getByRole("link", { name: /Meeting Room/ }).getAttribute("href")).toBe("/tutors/classrooms/meeting-room")
    expect(screen.queryByText("--")).toBeNull()
    expect(screen.queryByText("Active learners")).toBeNull()
  })

  it("does not display fabricated learner groups or learner metrics", () => {
    renderPage(<TutorLearnersView />)

    expect(screen.getByRole("heading", { name: "Individual learners" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Learning groups" })).toBeTruthy()
    expect(screen.queryByText("Group A")).toBeNull()
    expect(screen.queryByText("Attendance rate")).toBeNull()
    expect(screen.getByText(/No learner profiles are available/)).toBeTruthy()
  })

  it("keeps private notes and learner-visible feedback distinct", () => {
    renderPage(<TutorSessionNotesView />)

    expect(screen.getByRole("heading", { name: "Private tutor notes" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Learner-visible feedback" })).toBeTruthy()
    expect(screen.getByText(/Creating, saving, or publishing records is unavailable/)).toBeTruthy()
  })

  it.each(disconnectedPages)("renders %s with an honest unavailable state", (_name, Page, unavailableState) => {
    renderPage(<Page />)

    expect(screen.getByRole("heading", { name: unavailableState })).toBeTruthy()
  })

  it("exposes the tutor plan destinations under tutor-prefixed URLs", () => {
    const links = getDashboardNavigation("/tutors").flatMap(({ items }) => items)
    const hrefs = new Set(links.map(({ href }) => href))

    for (const href of [
      "/tutors",
      "/tutors/learners",
      "/tutors/learning-plans",
      "/tutors/classwork",
      "/tutors/sessions",
      "/tutors/attendance",
      "/tutors/session-notes",
      "/tutors/classrooms/meeting-room",
      "/tutors/communication",
      "/tutors/announcements",
      "/tutors/notifications",
      "/tutors/materials",
      "/tutors/progress",
      "/tutors/ai-assistant",
      "/tutors/settings",
    ]) {
      expect(hrefs.has(href)).toBe(true)
    }

    expect(links.every(({ href }) => href.startsWith("/tutors"))).toBe(true)
  })
})
