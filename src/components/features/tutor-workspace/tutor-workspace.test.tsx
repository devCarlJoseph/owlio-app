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
  it("shows an honest overview and links to tutor workspaces", () => {
    renderPage(<TutorOverviewView />)

    expect(screen.getByRole("heading", { name: "Your day, in focus" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Upcoming sessions" })).toBeTruthy()
    expect(screen.getByText("Session details aren't available yet")).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Activity review" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Learner follow-ups" })).toBeTruthy()
    expect(screen.getByRole("link", { name: /Open sessions/ }).getAttribute("href")).toBe("/tutors/sessions")
    expect(screen.getByRole("link", { name: /Open activities/ }).getAttribute("href")).toBe("/tutors/classwork")
    expect(screen.getByRole("link", { name: /Open learners/ }).getAttribute("href")).toBe("/tutors/learners")
    expect(screen.getByRole("link", { name: /Learning Plans/ }).getAttribute("href")).toBe("/tutors/learning-plans")
    expect(screen.queryByText("--")).toBeNull()
    expect(screen.queryByText("Active learners")).toBeNull()
    expect(screen.queryByRole("link", { name: /Meeting Room/ })).toBeNull()
  })

  it("keeps individual learners and groups distinct without implying connected records", () => {
    renderPage(<TutorLearnersView />)

    expect(screen.getByRole("heading", { name: "Individual learners" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Learning groups" })).toBeTruthy()
    expect(screen.getByText("Directory unavailable")).toBeTruthy()
    expect(screen.getByText("Individual learner profiles are not connected.")).toBeTruthy()
    expect(screen.getByText("Group records and membership are not connected.")).toBeTruthy()
    expect(screen.getByText(/each member's private records/)).toBeTruthy()
    expect(screen.queryByText("Group A")).toBeNull()
    expect(screen.queryByText("Attendance rate")).toBeNull()
    expect(screen.queryByRole("textbox")).toBeNull()
    expect(screen.queryByRole("button", { name: /add learner/i })).toBeNull()
    expect(screen.getByRole("link", { name: /Learning Plans/ }).getAttribute("href")).toBe("/tutors/learning-plans")
    expect(screen.getByRole("link", { name: /Sessions & Schedule/ }).getAttribute("href")).toBe("/tutors/sessions")
    expect(screen.getByRole("link", { name: /Activities & Evaluations/ }).getAttribute("href")).toBe("/tutors/classwork")
  })

  it("shows a plan-list and detail layout without fabricated plan data", () => {
    renderPage(<LearningPlansView />)

    expect(screen.getByRole("heading", { name: "Your plans" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Plan details" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Learning Plans are not connected" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Goals and outcomes" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Milestones and next steps" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Related sessions and materials" })).toBeTruthy()
    expect(screen.getByText(/Plan details, creation, and saving are unavailable/)).toBeTruthy()
    expect(screen.queryByText("65%")).toBeNull()
    expect(screen.queryByRole("button", { name: /create|save/i })).toBeNull()
  })

  it("shows an activity-list and detail layout without fabricated evaluation data", () => {
    renderPage(<TutorActivitiesView />)

    expect(screen.getByRole("heading", { name: "Activity library" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Activity details" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Activities and learner work are unavailable" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Practice and activities" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Learner responses" })).toBeTruthy()
    expect(screen.getByRole("heading", { name: "Evaluation and feedback" })).toBeTruthy()
    expect(screen.queryByText("75%")).toBeNull()
    expect(screen.queryByText("Evaluated")).toBeNull()
    expect(screen.queryByRole("textbox")).toBeNull()
    expect(screen.queryByRole("button", { name: /create|publish|evaluate/i })).toBeNull()
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
      "/tutors/session-notes",
      "/tutors/classrooms/meeting-room",
      "/tutors/announcements",
      "/tutors/materials",
      "/tutors/progress",
      "/tutors/ai-assistant",
    ]) {
      expect(hrefs.has(href)).toBe(true)
    }

    for (const path of ["attendance", "communication", "notifications", "settings", "account/security"]) {
      expect(hrefs.has(`/tutors/${path}`)).toBe(false)
    }

    expect(links.every(({ href }) => href.startsWith("/tutors"))).toBe(true)
  })
})
