---
name: owlio-product-ui
description: Design, implement, and review UI across the Owlio learning product using its official landing page, product boundaries, role workflows, and frontend conventions as guidance.
---

# Owlio Product UI

Use this skill for product UI work across Owlio: shared navigation and workspace shells, student experiences, educator classrooms, tutoring/ESL workflows, and connected learning features. Apply the official [Owlio landing page](https://owlio-landing-page.vercel.app/) as the current brand and product-framing reference, and use `OWLIO_FRONTEND_GUIDE.md` as the authority for product scope, permissions, and technical conventions.

The landing page is a public product overview with interactive previews; it is not evidence that every previewed feature is already implemented in this application. Inspect the current code and API contracts before claiming or wiring functionality.

## 1. Product principles

Owlio brings learning and teaching workflows into a connected experience, but it serves multiple needs rather than treating every user as a school-classroom user:

1. **Student personal workspace** — subjects, tasks, notes, resources, schedule, and personal progress. It should be useful even without joining a class.
2. **Student-created study spaces** — peer collaboration and shared resources. A study space is not an official academic classroom.
3. **Educator-led classrooms** — classes, learners, lessons, materials, classwork, submissions, attendance, grades, feedback, and progress.
4. **Tutoring and ESL classrooms** — adaptable lesson, schedule, activity, evaluation, and learner-progress workflows for tutors, ESL teachers, and independent educators.

Keep personal/student-managed data separate from official classroom records. Official grades, attendance, feedback, classwork, and classroom progress are educator-controlled. Backend authorization is the security boundary; hiding a UI control does not secure an operation. AI-generated teaching or evaluation content must remain reviewable and editable by the educator.

## 2. Official landing page as a reference

The landing page communicates Owlio's product through connected classroom examples, student and educator workspace previews, tutoring/ESL scenarios, and sections for classwork, learning materials, attendance, progress, conversations, live classes, AI assistance, and community/early access.

Use those references to guide information hierarchy and product continuity:

- Keep related tasks and context together (for example, a class with its materials, discussions, work, and progress) rather than scattering every action into unrelated screens.
- Make the next useful action and relevant context easy to find. Use summaries and previews to help users orient, not to replace the detailed workflow.
- Give students and educators purpose-built views of shared classroom data while preserving each role's allowed actions.
- Provide a coherent experience across desktop and mobile, adapting navigation and density to the device.
- Treat community/waitlist content as landing-page content unless a product requirement explicitly brings it into the signed-in application.

Do not copy the landing page's exact marketing copy, demo data, names, numerical dashboard values, or preview interactions into production screens as if they were real. Do not imply a feature is available until its implementation and API support are verified.

## 3. Owlio visual language

Use the landing page's visual identity as the reference, then verify current local tokens and shared components before coding:

- Owlio wordmark and owl mark; do not substitute another product's branding.
- White and light-neutral surfaces, soft lavender/periwinkle section treatments, dark navy text, and vivid indigo/periwinkle emphasis for key actions and highlights.
- Inter typography, generous spacing, clear heading hierarchy, rounded cards, subtle borders/shadows, and compact data visualizations that remain readable.
- Use semantic tokens from `src/styles/global.css` and existing primitives in `src/components/ui`. Check how the current components implement colors and radius; don't scatter hard-coded colors or make a global theme change just to match a screenshot.
- Preserve contrast and visible focus. Color alone must not convey selection, status, priority, or permission.

The landing page can evolve. If it differs from the current local theme, inspect the latest source and ask before changing global tokens or replacing the current design system.

## 4. Role-aware product patterns

### Student

Make upcoming classes, tasks, materials, schedule, and personal progress scannable. Keep independent workspace tasks available without a teacher or classroom. Explain when an item belongs to a classroom versus a personal study space.

### Educator

Support an at-a-glance view of classrooms and learners, with actionable review queues for classwork, attendance, and learner progress. Keep class context attached to lessons, resources, messages, submissions, and feedback. Avoid implying that every educator follows one school calendar or grade structure.

### Tutor, ESL teacher, or independent educator

Reuse classroom concepts where they fit, but allow flexible class size, learner level, session format, and scheduling. Labels and interaction patterns must not assume a school institution. Do not split these educators into separate product roles unless product/backend requirements explicitly establish that model.

### Shared classroom and study-space boundaries

- Make official class records visibly distinct from student-created study-space content.
- Do not expose controls that imply students can change official grades, attendance, educator feedback, or other protected records.
- Keep discussion and communication attached to a class or study space so context and permissions are clear.
- Use role-aware labels and actions for clarity, but rely on backend authorization for access control.

## 5. UI implementation workflow

For each Owlio UI request, follow this sequence:

1. **Confirm the user and job.** Identify persona (student, educator, tutor/ESL, or guest), task, entry point, and desired outcome. If role or product behavior is unclear, check the frontend guide and ask rather than inventing requirements.
2. **Inspect the reference and current implementation.** Review the relevant part of the official landing page, its product preview, the route and feature components, shared primitives, theme tokens, related services/types, and any applicable project skills. Treat marketing examples as visual/product context, not an API contract.
3. **Define scope and boundaries.** Decide whether the UI is public marketing, a personal workspace, a student-created study space, or an official classroom. Record who owns the data, who can act on it, and which workflow is in scope.
4. **Map the complete task flow.** Specify entry/exit states, screens, primary/secondary actions, navigation, validation, permissions, and loading/empty/error/success/unavailable states that apply. Keep each step focused and provide clear next actions.
5. **Translate the landing-page pattern to Owlio.** Preserve Owlio's brand, role-specific language, product requirements, and information architecture. Borrow only useful concepts such as connected context, glanceable summaries, clear feature grouping, and a consistent dashboard preview; do not reproduce exact layouts, content, demo data, or unsupported features.
6. **Build a cohesive vertical slice.** Keep route pages thin; place domain UI beside its feature under `src/components/features/`; use existing shared components for neutral UI. Follow the guide's data flow for real API-backed workflows, and keep API request construction out of view components.
7. **Implement the states and safeguards.** Model applicable loading, empty, error, validation, permission-denied, and completed states. Keep server state in the established data layer. Do not use local mock data as a substitute for a real production contract or treat hidden controls as authorization.
8. **Review across roles and devices.** Check keyboard operation, focus, semantic labels, screen-reader feedback, contrast, mobile behavior, and role-specific permissions. Confirm shared UI does not leak controls from one role into another.
9. **Verify and report.** Run relevant project checks, inspect the final diff, and report only checks actually performed. Keep work limited to the requested feature and preserve existing user changes.

## 6. Architecture and implementation rules

- Current stack: React, TypeScript, React Router, Tailwind CSS 4, shadcn-style primitives, and the dependencies recorded in `package.json`. Verify current availability before introducing a library.
- Keep page components as route-level composition points. Put feature-specific behavior and view components with their feature; keep `src/components/ui` domain-neutral.
- For API-backed features, follow the project flow: page/component → feature hook → TanStack Query → feature API service → Owlio API. Keep transient UI state local and server-owned state in the query layer.
- Use React Hook Form and Zod for complex forms where appropriate; client validation improves usability but server validation is authoritative.
- Confirm API contracts, role permissions, date/time-zone behavior, upload constraints, and relevant route conventions before encoding assumptions into the interface.
- Do not add backend-only packages, expose secrets, call AI providers directly from the frontend, or make UI visibility the access-control mechanism.

## 7. Inspiration and scope guardrails

Classora or any other third-party product may be used as pattern-level inspiration only when specifically requested. Owlio's own landing page, `OWLIO_FRONTEND_GUIDE.md`, existing routes/components, and backend contracts take precedence.

Do not copy another product's brand, text, art, exact screen, product taxonomy, pricing, or feature claims. Do not import features from a reference (such as payments, institution administration, or advanced AI) unless Owlio's scope explicitly includes them. Where the landing page depicts a planned or preview-only capability, identify it as such and confirm implementation status before presenting it as live.

## 8. Review checklist

- [ ] The UI solves the specified Owlio user task and follows the relevant student/educator/tutor workflow.
- [ ] Personal workspace, study-space, and official classroom data remain distinct.
- [ ] Role-specific actions respect educator control of official class records; backend remains the security boundary.
- [ ] Landing-page previews are not mistaken for existing APIs or completed features.
- [ ] Owlio branding, current local tokens, and shared UI conventions are preserved.
- [ ] Screens handle relevant loading, empty, error, validation, unavailable, and permission states.
- [ ] UI is responsive, keyboard-operable, and accessible.
- [ ] Only requested feature files changed; applicable checks and final diff were reviewed.

## 9. Verified Owlio frontend structure

This is the repository structure inspected for this skill revision. It describes the current frontend snapshot, not every feature shown on Owlio's landing page. Reinspect the routes and files before future changes; do not treat planned product domains as existing components.

### Current source tree

```text
src/
├── assets/
│   ├── hero.png
│   ├── react.svg
│   └── vite.svg
├── components/
│   ├── common/
│   │   ├── footer.tsx
│   │   ├── navbar.tsx
│   │   └── require-onboarding.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── email-verification/
│   │   │   │   ├── email-verification-view.tsx
│   │   │   │   ├── email-verification.schema.ts
│   │   │   │   └── resend-verification-form.tsx
│   │   │   ├── forgot-password/
│   │   │   │   ├── forgot-password-view.tsx
│   │   │   │   ├── forgot-password-form.tsx
│   │   │   │   └── forgot-password.schema.ts
│   │   │   ├── login/
│   │   │   │   ├── login-view.tsx
│   │   │   │   ├── login-form.tsx
│   │   │   │   └── login.schema.ts
│   │   │   ├── password-reset/
│   │   │   │   ├── password-reset-view.tsx
│   │   │   │   ├── password-reset-form.tsx
│   │   │   │   └── password-reset.schema.ts
│   │   │   ├── register/
│   │   │   │   ├── register-view.tsx
│   │   │   │   ├── register-form.tsx
│   │   │   │   ├── account-type-selector.tsx
│   │   │   │   └── register.schema.ts
│   │   │   └── shared/
│   │   │       ├── auth-brand-panel.tsx
│   │   │       ├── auth-feedback.tsx
│   │   │       ├── auth-form-actions.tsx
│   │   │       ├── auth-layout.tsx
│   │   │       ├── auth-preview-controls.tsx
│   │   │       ├── auth-status-page.tsx
│   │   │       ├── password-field.tsx
│   │   │       ├── password-guidance.tsx
│   │   │       ├── password-rules.ts
│   │   │       └── session-expired-state.tsx
│   │   └── onboarding/
│   │       ├── completed/onboarding-completed.tsx
│   │       ├── educator/educator-details-step.tsx
│   │       ├── entity-select/
│   │       │   ├── entity-card.tsx
│   │       │   └── entity-select-step.tsx
│   │       ├── others/others-details-step.tsx
│   │       ├── profile-basics/profile-basics-step.tsx
│   │       ├── review/review-step.tsx
│   │       ├── shared/
│   │       │   ├── choice-checkbox-group.tsx
│   │       │   ├── field-error.tsx
│   │       │   ├── onboarding-layout.tsx
│   │       │   ├── onboarding-stepper.tsx
│   │       │   ├── optional-badge.tsx
│   │       │   ├── step-actions.tsx
│   │       │   └── tag-input.tsx
│   │       ├── student/student-details-step.tsx
│   │       ├── onboarding-view.tsx
│   │       ├── onboarding.constants.ts
│   │       ├── onboarding.schema.ts
│   │       └── onboarding.types.ts
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── field.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       └── spinner.tsx
├── context/.gitkeep
├── lib/
│   ├── axios.ts
│   ├── cn.ts
│   └── utils.ts
├── pages/
│   ├── admin/.gitkeep
│   ├── auth/
│   │   ├── email-verification/index.tsx
│   │   ├── forgot-password/index.tsx
│   │   ├── login/index.tsx
│   │   ├── password-reset/index.tsx
│   │   └── register/index.tsx
│   ├── guest/.gitkeep
│   ├── onboarding/index.tsx
│   ├── users/.gitkeep
│   └── App.tsx
├── services/api/
│   ├── api-error.ts
│   ├── api-health.service.ts
│   └── api.types.ts
├── styles/global.css
└── main.tsx
```

`.gitkeep` entries are placeholders, not implemented features. `components/features/.gitkeep` is also present; current feature implementations are in `auth/` and `onboarding/`.

### Registered routes and page composition

Routes are registered directly in `src/main.tsx` using React Router:

| Path | Route page | Composed UI | Current status |
|---|---|---|---|
| `/` | `src/pages/App.tsx` | `HomePage` | Placeholder heading only; this is not the full landing page or signed-in dashboard. |
| `/onboarding` | `src/pages/onboarding/index.tsx` | `RequireOnboarding` → `OnboardingView` | Local form wizard; route currently passes `needsOnboarding={true}` explicitly. This is not server-driven gating. |
| `/auth/register` | `src/pages/auth/register/index.tsx` | `RegisterView` → `RegisterForm` | UI/validation and preview states; no auth API call from the current feature code. |
| `/auth/login` | `src/pages/auth/login/index.tsx` | `LoginView` → `LoginForm` | UI/validation and preview states; no auth API call from the current feature code. |
| `/auth/email-verification` | `src/pages/auth/email-verification/index.tsx` | `EmailVerificationView` → `ResendVerificationForm` | UI-only verification/resend states. |
| `/auth/forgot-password` | `src/pages/auth/forgot-password/index.tsx` | `ForgotPasswordView` → `ForgotPasswordForm` | UI-only recovery states. |
| `/auth/password-reset` | `src/pages/auth/password-reset/index.tsx` | `PasswordResetView` → `PasswordResetForm` | UI-only reset states. |

The current `src/services/` tree contains only API health/error/types modules; there is no `src/services/auth/` or product-domain service folder in this snapshot. Do not describe the auth previews or onboarding guard as backend-connected or production authorization.

### Existing product feature modules

- **Authentication UI:** registration/account type/password controls; login and session-expired presentation; email verification and resend; forgot-password and reset-password forms; shared auth layout, status/feedback, and preview controls.
- **Onboarding UI:** entity selection (Student/Educator/Others), shared profile basics, entity-specific details for students/educators/others, review/edit, and local Done state; shared stepper, actions, validation, option constants, and types.
- **Shared UI:** common navbar/footer/onboarding guard plus the domain-neutral Button, Card, Field, Input, Label, Select, Separator, and Spinner primitives.
- **API foundation:** Axios client, API health service, error extraction, and shared API/auth response types only. Product dashboards, classroom services, and app-wide state providers are not present in this source snapshot.

### Product domains described by the guide, not yet implemented as route modules

The following are Owlio product areas from `OWLIO_FRONTEND_GUIDE.md` and the official landing page. They are product direction, not existing pages/components in the current `src/` tree:

- Student personal workspace (subjects, tasks, notes, materials, schedule, personal progress).
- Student-created study spaces (members, shared resources, tasks, discussions, polls).
- Educator classrooms (enrollment, lessons, classwork, submissions, attendance, grades, feedback, communication, progress).
- Tutoring and ESL workflows (flexible lessons, scheduling, activities, learner levels/evaluations, progress).
- Shared/planned domains such as schedule, materials, classwork, submissions, attendance, grades, communication, notifications, progress, and AI assistance.

When implementing these areas, add routes and feature modules incrementally using the existing page-to-feature convention and approved API contracts. Do not invent a full target directory tree as though it already exists; document proposed paths separately and label them as proposed until they appear in the repository.

### Structure maintenance rules

- Treat the current source tree and route registration as the factual inventory; refresh this section when files or routes change.
- Keep route pages thin and compose feature views from `src/components/features/<domain>/`.
- Put generic reusable controls in `src/components/ui/`; keep domain-specific workflows in their feature module.
- Keep the public marketing landing page, the app's `/` route, and future signed-in workspaces distinct unless the product owner explicitly combines them.
