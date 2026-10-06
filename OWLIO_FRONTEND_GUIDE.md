# Owlio Frontend Development Guide

> **Audience:** Owlio frontend developers, UI/UX, QA, and technical leads  
> **Planning sources:** `ROLE Project Manager - Rhean Baguio Documentation - Bhebie Jane Miras - Kimberly…` and `OWLIO - UNIFIED TEACHING, LEARNING & STUDY PLATFORM Category Education Technology…` (the second document is treated as the final system plan when priorities conflict).  
> **Repository inspected:** Vite + React + TypeScript frontend at the time this guide was prepared.

## 1. Product direction

Owlio is a unified learning environment for people who study independently and educators who manage formal classes, ESL lessons, or tutoring. It should support four connected experiences:

1. **Personal student workspace** — subjects, tasks, notes, materials, schedules, and personal progress.
2. **Student-created study spaces** — peer collaboration, shared resources, tasks, discussions, and polls.
3. **Educator-led classrooms** — enrollment, lessons, learning materials, classwork, submissions, attendance, grades, feedback, and progress.
4. **Tutoring and ESL classrooms** — flexible lessons, schedules, activities, evaluations, and learner progress.

The central product principle is that a student should get value without an instructor. When an educator joins, the system should support a structured classroom or tutoring workflow. Build the learning workflow first; layer real-time meeting features and AI assistance onto a stable foundation.

### Product boundaries that affect frontend behavior

- Student-managed notes, tasks, resources, and personal progress are distinct from official classroom records.
- Grades, official attendance, feedback, classwork, and classroom progress are educator-controlled records. Students must not be shown controls that imply they can edit them.
- A study space is collaborative, but it is not an official academic classroom.
- Educators can represent teachers, college instructors, ESL teachers, tutors, and freelance educators. Prefer adaptable labels and classroom types over assumptions tied to one school model.
- Role-based UI improves clarity; it is never the security boundary. The backend must authorize every protected read and write.
- AI-generated teaching material and evaluation suggestions remain reviewable and editable by the educator.

## 2. Current frontend baseline

The inspected repository currently contains:

- React 19, TypeScript 6, Vite 8, npm, and React Router.
- Tailwind CSS 4 through `@tailwindcss/vite` and `src/styles/global.css`.
- The `@/*` source alias in Vite and TypeScript configuration.
- shadcn configuration in `components.json`; shadcn-generated Button and Card files under `src/components/ui`.
- `lucide-react`, Base UI, `clsx`, `tailwind-merge`, and `cn` dependencies.
- A `cn()` helper in `src/lib/cn.ts` and another helper module, `src/lib/utils.ts`. Check which helper the generated components and shadcn config use before adding or changing utility aliases; keep one agreed public utility entrypoint to avoid divergent helpers.
- A placeholder route/page in `src/pages/App.tsx`; the main UI is not yet an implemented Owlio workflow.
- Starter directories for common/features components, context, services, and admin/auth/guest/users pages. Most are empty markers, not working feature modules.

### Planned frontend dependencies not yet present

| Capability | Planned packages | Status in inspected repo |
|---|---|---|
| Server state, caching, request lifecycle | `@tanstack/react-query` | Missing |
| Forms and validation | `react-hook-form`, `zod`, `@hookform/resolvers` | Missing; resolver is the adapter used to connect RHF and Zod |
| Date formatting and calculations | `date-fns` | Missing |
| Real-time client events, later phase | `socket.io-client` | Missing |
| Browser meeting media | Native WebRTC / MediaDevices APIs | Browser APIs, no package install required |
| Component/unit and browser testing | `vitest`, `@playwright/test` | Missing; plan for these when the team establishes test configuration |

Do not install backend-only packages in this frontend project. Express, Prisma, database drivers, OpenAI SDK/API keys, security middleware, and file-storage server SDKs belong in the backend. The frontend calls Owlio's backend API; it must not call OpenAI directly or contain secret keys.

### Suggested npm installation sequence

Install the core data/form/date dependencies when the team begins API-backed workflows:

```powershell
npm install @tanstack/react-query react-hook-form zod @hookform/resolvers date-fns
```

Install the socket client when implementing the planned real-time notification/discussion/meeting signaling work:

```powershell
npm install socket.io-client
```

Add the planned frontend test runners when test configuration is ready:

```powershell
npm install -D vitest @playwright/test
```

The repo already has Tailwind, shadcn setup, icons, and class utilities. Add shadcn components as needed (for example, `npx shadcn@latest add input dialog table`); do not reinstall those existing foundations. Review generated changes and verify aliases before committing.

## 3. Frontend architecture

Use feature-oriented modules for product behavior. Keep shared primitives separate from domain workflows, and keep pages focused on composing features and defining route-level layout.

A practical direction for the existing `src/` tree is:

```text
src/
  app/                 providers, router, application shell
  components/
    ui/                shadcn primitives; generic and reusable
    common/            shared application-level components
  features/
    auth/
    personal-workspace/
    study-spaces/
    classrooms/
    schedule/
    materials/
    classwork/
    submissions/
    attendance/
    grades/
    communication/
    notifications/
    progress/
    ai-assistance/
  pages/               route-level screens, grouped by experience/role
  services/            API client and feature API modules
  hooks/               shared hooks only; feature hooks stay with features
  schemas/             shared schemas only; feature schemas stay with features
  types/               shared domain types only; feature types stay with features
  lib/                 cn helper, date/format utilities, constants
  styles/              global styles and theme tokens
```

This is a target direction, not a requirement to move files before implementation. The repo currently has role-oriented `pages/admin`, `pages/auth`, `pages/guest`, and `pages/users` plus generic `features` folders. Preserve working paths while introducing coherent feature boundaries incrementally; decide route and role terminology with the team before building out role dashboards.

### Data flow

Keep the frontend flow predictable:

```text
Page / component → feature hook → TanStack Query → feature API service → Owlio Express API
```

- Use TanStack Query for backend-owned data such as classrooms, enrollments, submissions, grades, attendance, notifications, and progress.
- Keep local UI state (open dialog, selected tab, unsaved input) in React state or a narrowly scoped context. Do not duplicate server state in global context.
- Put request construction and response typing in API service modules, not in view components.
- Use query keys that include resource identity and relevant filters. Invalidate or update affected queries after mutations.
- Model loading, empty, error, success, and permission-denied states in each important screen.
- Keep dates and time zones explicit in scheduling and deadline displays; store/API format conventions should be agreed with backend before implementation.

### Forms and validation

Use React Hook Form for complex forms and Zod schemas for client-side validation. Connect them with `@hookform/resolvers/zod`. Reuse schemas where practical, but treat backend validation as authoritative. Show field-level messages and preserve user input when server requests fail. Do not put validation rules only in decorative UI components.

### UI and accessibility

- Use shadcn components in `src/components/ui` as editable primitives, then compose Owlio-specific patterns in feature components.
- Use the configured Tailwind v4 theme and tokens; avoid scattered hard-coded colors and one-off spacing conventions.
- Use semantic HTML, visible focus states, keyboard-operable dialogs and menus, associated form labels, and accessible status/error announcements.
- Design responsive layouts for student and educator workflows. Tables and dashboards should have a usable narrow-screen behavior.
- Keep shared components domain-neutral. A classroom-specific assignment card belongs with classwork, not in the generic UI primitives folder.

## 4. Recommended delivery order

Treat the second, final system planning document as the scope authority. The detailed development planning document contains a broader sequence; where it schedules full meeting implementation earlier or expands the MVP, keep the final plan's staged scope.

### Stage 0 — Foundation

- Confirm route structure, app shell, design tokens, component conventions, API contract, environment approach, and frontend/backend origin.
- Add the planned query/form/date dependencies as their workflows are started.
- Establish reusable loading, empty, error, and not-found patterns.

### Stage 1 — User foundation

- Authentication screens, profile setup, role-aware navigation, and route guards for user experience.
- Support student and educator accounts; model educator specialization without splitting the entire app into unrelated products.

### Stage 2 — Student independence

- Personal subjects, tasks, notes, materials, and personal progress.
- Ensure this workflow is usable without joining a classroom.

### Stage 3 — Study spaces and classrooms

- Create/join study spaces; invite members and collaborate.
- Educator classroom creation; join codes/links/invitations; enrollment and classroom dashboard.
- Keep study-space records and official classroom records separate in screens, labels, and data models.

### Stage 4 — Teaching and learning workflow

- Schedule lessons, organize materials, create/publish classwork, accept file/link submissions, grade work, and provide feedback.
- Build educator and student views around the same lesson/classwork records while respecting their different permissions.

### Stage 5 — Classroom management

- Attendance, announcements, discussions, polls, notifications, learner management, and basic progress/report views.
- Keep the first version focused on workflows in the final MVP rather than advanced analytics.

### Stage 6 — AI assistance

- Build educator-facing question, instruction, activity, and evaluation assistance through backend endpoints.
- Make generated results reviewable, editable, and rejectable. Show provenance/status in the UI when content is AI-generated.

### Later scope

The final plan lists full native video conferencing, a collaborative whiteboard, advanced AI tutor/personalization, advanced analytics, plagiarism detection, mobile applications, school-wide administration/integrations, and payments as future enhancements. Begin with schedules and external meeting links if needed. Implement WebRTC, Socket.IO signaling, TURN infrastructure, and media recording only when the meeting scope is approved and backend signaling/security requirements are defined.

## 5. Frontend team workflow

For each feature, align on the user and workflow first, then define route/screen, data contract, permissions, component states, and acceptance criteria with product/design/backend/QA. Build the smallest complete vertical slice, not just a static dashboard.

A frontend feature is ready for review when:

- Its user flow and role permissions match the final system plan.
- It handles loading, empty, error, success, validation, and unavailable/unauthorized states that apply.
- It works at target desktop and mobile widths and with keyboard navigation.
- API request/response types and query invalidation behavior are defined.
- It does not expose secrets or treat hidden controls as access control.
- QA can verify the acceptance criteria with realistic student and educator scenarios.
- The relevant project checks (build/lint and, once configured, unit/browser checks) pass.

Coordinate changes to route names, classroom terminology, shared components, data contracts, and design tokens before multiple features depend on them. Keep pull requests focused on one workflow or cohesive infrastructure change.

## 6. Important unresolved decisions to record before implementation

The planning materials do not fully specify the API contract or operational conventions. The team should document these with backend/product before the dependent UI work:

- Final role names and whether educator subtypes are profile attributes or separate permission roles.
- Route naming and whether the current admin/guest/users page folders correspond to actual product roles.
- API response/error envelope, auth/session mechanism, pagination, and query filter conventions.
- Date/time-zone storage and classroom locale rules.
- File upload constraints, allowed file types, size limits, and upload lifecycle.
- Exact MVP line for meeting functionality: external links/scheduling versus native real-time meetings.
- Which notification events are in MVP and whether they require polling, sockets, or both.
- The agreed single `cn()` utility import path; current repository has both `src/lib/cn.ts` and `src/lib/utils.ts`.

## 7. Source-of-truth and change control

Use the final system planning document for product scope, user experiences, role access, MVP, and future enhancements. Use the detailed development planning document for technical architecture and proposed implementation order where it does not conflict with final scope. If a new request conflicts with either, surface the conflict and ask the project owner to resolve it before implementing a structural product change.
