# Tutor workspace component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(tutor-workspace): add organized tutor workspace source copies`

Target: `src/components/features/tutor-workspace/`. The role-specific views remain adapters to shared features; do not duplicate whole classroom, meeting-room, notifications, or activities implementations in this folder. [Folder rules](../../../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `ui/` | `tutor-workspace-ui.tsx` |
| `view/` | `tutor-workspace.test.tsx` (keep beside its eventual shared view/fixture) |
| `activities/view/` | `tutor-activities-view.tsx` |
| `ai/view/` | `tutor-ai-assistant-view.tsx` |
| `attendance/view/` | `tutor-attendance-view.tsx` |
| `communication/view/` | `tutor-announcements-view.tsx`, `tutor-discussions-view.tsx` |
| `learners/view/` | `tutor-learner-detail-view.tsx`, `tutor-learners-view.tsx` |
| `learning-plans/view/` | `learning-plans-view.tsx` |
| `materials/view/` | `tutor-materials-view.tsx` |
| `notes/view/` | `tutor-session-notes-view.tsx` |
| `notifications/view/` | `tutor-notifications-view.tsx` |
| `overview/contents/`, `overview/view/` | `tutor-overview-content.ts` -> contents; `tutor-overview-view.tsx` -> view |
| `progress/view/` | `tutor-student-progress-view.tsx` |
| `sessions/view/` | `tutor-sessions-view.tsx` |
| `settings/view/` | `tutor-settings-view.tsx` |

Small one-file subfeatures may stay flat until they genuinely need a folder. Keep private tutor notes separate from learner-visible feedback. A view under a tutor URL does not grant educator permissions; follow data ownership and tests before moving shared imports.

[All feature plans](../../../component-breakdowns.md)

<!-- BEGIN GENERATED PAGE ADAPTERS -->

## Page adapters (`src/pages/`)

Pages only select a view, pass route parameters when needed, or preserve an existing route guard/lazy boundary. Keep component composition, forms, state, and services in the owning feature. These paths are current paths; do not create another `index.tsx` for a shared route.

### `src/pages/dashboard/tutors/ai-assistant/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import TutorAiAssistantView from "@/components/features/tutor-workspace/ai/tutor-ai-assistant-view"

export default function TutorAiAssistantPage() {
  return <TutorAiAssistantView />
}
```

### `src/pages/dashboard/tutors/announcements/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import TutorAnnouncementsView from "@/components/features/tutor-workspace/communication/tutor-announcements-view"

export default function TutorAnnouncementsPage() {
  return <TutorAnnouncementsView />
}
```

### `src/pages/dashboard/tutors/attendance/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import TutorAttendanceView from "@/components/features/tutor-workspace/attendance/tutor-attendance-view"

export default function TutorAttendancePage() {
  return <TutorAttendanceView />
}
```

### `src/pages/dashboard/tutors/classwork/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import TutorActivitiesView from "@/components/features/tutor-workspace/activities/tutor-activities-view"

export default function TutorClassworkPage() {
  return <TutorActivitiesView />
}
```

### `src/pages/dashboard/tutors/communication/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import TutorDiscussionsView from "@/components/features/tutor-workspace/communication/tutor-discussions-view"

export default function TutorCommunicationPage() {
  return <TutorDiscussionsView />
}
```

### `src/pages/dashboard/tutors/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import TutorOverviewView from "@/components/features/tutor-workspace/overview/tutor-overview-view"

export default function TutorsPage() {
  return <TutorOverviewView />
}
```

### `src/pages/dashboard/tutors/learners/detail/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import TutorLearnerDetailView from "@/components/features/tutor-workspace/learners/tutor-learner-detail-view"

export default function TutorLearnerDetailPage() {
  return <TutorLearnerDetailView />
}
```

### `src/pages/dashboard/tutors/learners/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import TutorLearnersView from "@/components/features/tutor-workspace/learners/tutor-learners-view"

export default function TutorLearnersPage() {
  return <TutorLearnersView />
}
```

### `src/pages/dashboard/tutors/learning-plans/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import LearningPlansView from "@/components/features/tutor-workspace/learning-plans/learning-plans-view"

export default function TutorLearningPlansPage() {
  return <LearningPlansView />
}
```

### `src/pages/dashboard/tutors/materials/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import TutorMaterialsView from "@/components/features/tutor-workspace/materials/tutor-materials-view"

export default function TutorMaterialsPage() {
  return <TutorMaterialsView />
}
```

### `src/pages/dashboard/tutors/notifications/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import TutorNotificationsView from "@/components/features/tutor-workspace/notifications/tutor-notifications-view"

export default function TutorNotificationsPage() {
  return <TutorNotificationsView />
}
```

### `src/pages/dashboard/tutors/progress/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import TutorStudentProgressView from "@/components/features/tutor-workspace/progress/tutor-student-progress-view"

export default function TutorProgressPage() {
  return <TutorStudentProgressView />
}
```

### `src/pages/dashboard/tutors/session-notes/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import TutorSessionNotesView from "@/components/features/tutor-workspace/notes/tutor-session-notes-view"

export default function TutorSessionNotesPage() {
  return <TutorSessionNotesView />
}
```

### `src/pages/dashboard/tutors/sessions/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import TutorSessionsView from "@/components/features/tutor-workspace/sessions/tutor-sessions-view"

export default function TutorSessionsPage() {
  return <TutorSessionsView />
}
```

### `src/pages/dashboard/tutors/settings/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import TutorSettingsView from "@/components/features/tutor-workspace/settings/tutor-settings-view"

export default function TutorSettingsPage() {
  return <TutorSettingsView />
}
```

<!-- END GENERATED PAGE ADAPTERS -->

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/tutor-workspace/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### Nested feature guides

- [`activities/`](activities/README.md)
- [`ai/`](ai/README.md)
- [`attendance/`](attendance/README.md)
- [`communication/`](communication/README.md)
- [`learners/`](learners/README.md)
- [`learning-plans/`](learning-plans/README.md)
- [`materials/`](materials/README.md)
- [`notes/`](notes/README.md)
- [`notifications/`](notifications/README.md)
- [`overview/`](overview/README.md)
- [`progress/`](progress/README.md)
- [`sessions/`](sessions/README.md)
- [`settings/`](settings/README.md)

### `tutor-workspace-ui.tsx`

Current file: `src/components/features/tutor-workspace/tutor-workspace-ui.tsx`

```tsx
import type { ReactNode } from "react"
import { CircleHelp } from "lucide-react"

export function TutorPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
      </header>
      {children}
    </div>
  )
}

export function TutorUnavailable({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 sm:p-8" aria-label={title}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <CircleHelp aria-hidden="true" className="size-4" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </section>
  )
}

export function TutorSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}
```

### `tutor-workspace.test.tsx`

Current file: `src/components/features/tutor-workspace/tutor-workspace.test.tsx`

```tsx
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
    expect(screen.getByRole("link", { name: "Open sessions" }).getAttribute("href")).toBe("/tutors/sessions")
    expect(screen.getByRole("link", { name: /Activities & evaluations/ }).getAttribute("href")).toBe("/tutors/classwork")
    expect(screen.getByRole("link", { name: /My learners/ }).getAttribute("href")).toBe("/tutors/learners")
    expect(screen.getAllByRole("link", { name: /Learning Plans/ }).every((link) => link.getAttribute("href") === "/tutors/learning-plans")).toBe(true)
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
```

<!-- END GENERATED CURRENT SOURCE -->
