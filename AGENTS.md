# Owlio App — Agent Context

This is the repository-specific guide for work in `owlio-app`. Keep it aligned with the current source tree. `OWLIO_PRODUCT_PLAN.md` documents the product vision and target workflows; source code, confirmed backend contracts, and explicit product-owner decisions are authoritative when implementation status or requirements differ. Do not treat marketing previews, placeholder pages, or TODO-shaped UI as working backend features.

## 1. Working rules

- Inspect the relevant page, feature, shared component, route, and API contract before editing. Make focused changes and preserve unrelated user changes.
- Prefer existing project components, utilities, conventions, and installed packages. Do not add dependencies or alter configuration/security policy without a clear requirement and approval.
- Do not read, print, commit, or log `.env` contents. `.env*` is ignored except `.env.example`. Vite `VITE_*` values are bundled into client-visible code and must not contain secrets.
- Do not claim an operation succeeded on the server unless an API actually performs it. UI validation and hidden controls are not security or authorization boundaries.
- Do not invent API routes, role permissions, product flows, design requirements, or error states. Ask the owner when an unresolved product/backend decision affects the implementation.
- Keep code accessible and responsive: semantic controls, associated labels, visible focus, keyboard support, concise error/status feedback, and reduced-motion awareness where animation is used.
- Do not add comments unless needed to explain non-obvious behavior. Never suppress a failing check globally just to make it pass.

## 2. Stack, packages, and their roles

The app is a client-rendered React/TypeScript SPA built with Vite. The package manager is npm (`package-lock.json` is present); use `npm` for scripts and dependency changes.

| Package/group | Purpose in this repository |
|---|---|
| `react`, `react-dom` | React 19 UI and DOM entry point. |
| `react-router` | Browser routing, nested layouts, `Link`, `Navigate`, `Outlet`, and route state. Routes are registered in `src/main.tsx`. |
| `typescript`, `vite`, `@vitejs/plugin-react` | Type checking/build tooling and React development server with HMR. |
| `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css` | Tailwind CSS 4 styling, Vite integration, and animation utilities. |
| `@fontsource-variable/inter` | Locally bundled Inter variable font; imported by `src/styles/global.css`. |
| `@base-ui/react` | Base UI primitives used by the local UI components in `src/components/ui`. Follow those wrappers' actual APIs; do not assume Radix `asChild` conventions. |
| `shadcn`, `components.json` | shadcn component-generation/configuration tooling and local component style metadata. The checked-in UI is project-owned and built on Base UI. |
| `lucide-react`, `tech-stack-icons` | Lucide interface icons; `tech-stack-icons` supplies the Google brand mark in the login preview, not an OAuth integration. |
| `react-hook-form`, `@hookform/resolvers`, `zod` | Form state and client-side schemas/resolvers, used by auth and onboarding. Server validation remains authoritative when backend integration exists. |
| `axios` | HTTP client instance in `src/lib/axios.ts`; its base URL comes from `VITE_API_URL` with a localhost fallback and `withCredentials` enabled. `src/services/api/auth.service.ts` calls the v1 auth API and maintains the CSRF token in memory. |
| `cn`, `clsx`, `tailwind-merge`, `class-variance-authority` | Class composition/merging and variants. Follow the import pattern in the neighboring component; avoid adding another class helper. |
| `cmdk`, `input-otp` | Command and OTP UI primitives in `src/components/ui`. |
| `@tanstack/react-query`, `date-fns`, `@shadcn/react` | Installed in `package.json`, but no direct source imports were found in this snapshot. Do not assume they are part of an active data flow. |
| ESLint packages (`eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`) | Lint configuration in `eslint.config.js`. |
| Type packages (`@types/node`, `@types/react`, `@types/react-dom`) | TypeScript support for Node/Vite and React. |

`src/styles/global.css` is the Tailwind entry point and defines the semantic theme/radius/sidebar tokens and Inter font. Prefer existing tokens and local UI primitives over new one-off styling systems.

## 3. Source architecture and ownership

```text
src/
  main.tsx
  pages/
    auth/<flow>/index.tsx
    onboarding/index.tsx
    dashboard/
      layout.tsx
      students/
        index.tsx
        subjects/index.tsx
        tasks/index.tsx
        notes/index.tsx
        study-spaces/index.tsx
        classwork/index.tsx
      educators/
        index.tsx
        classwork/index.tsx
        attendance/index.tsx
        learners/index.tsx
      tutors/
        index.tsx
        sessions/index.tsx
        classwork/index.tsx
        attendance/index.tsx
        learners/index.tsx
      esl/
        index.tsx
        lessons/index.tsx
        classwork/index.tsx
        attendance/index.tsx
        learners/index.tsx
      classroom/index.tsx          Shared classroom view (plural URL)
      schedule/index.tsx
      materials/index.tsx
      communication/index.tsx
      notifications/index.tsx
      progress/index.tsx
      ai-assistant/index.tsx
  components/
    common/
      app-sidebar.tsx
      dashboard-navigation.ts     Role/shared menu data and route resolution
      ...
    features/auth/
    features/onboarding/
    ui/                            Domain-neutral Base UI/shadcn wrappers
  lib/
  services/api/                    Health/error/types foundation only
  styles/global.css
```

Conventions:

- Route adapters stay thin; screen/page behavior belongs under `src/components/features/<domain>/` or the role page's own folder when that is the current convention.
- Reusable domain-neutral controls belong in `src/components/ui/`. Reuse `Button`, `Card`, `Field`, `Input`, `Label`, `ScrollArea`, `Avatar`, etc. before creating parallel primitives.
- Use the `@/*` alias for `src/*`. `components.json` configures Tailwind CSS at `src/styles/global.css`, Lucide icons, and the `base-vega` style.
- Role dashboards share `src/pages/dashboard/layout.tsx` through a pathless React Router layout route. Workspace roots are `/students`, `/educators`, `/tutors`, and `/esl`; each role owns a page tree under `src/pages/dashboard/<role>/`.
- Put role-specific page modules under `src/pages/dashboard/<role>/<feature>/index.tsx`. Current student modules are `subjects`, `tasks`, `notes`, `study-spaces`, and `classwork`; educator modules are `classwork`, `attendance`, and `learners`; tutor modules are `sessions`, `classwork`, `attendance`, and `learners`; ESL modules are `lessons`, `classwork`, `attendance`, and `learners`.
- Shared dashboard page components live at `src/pages/dashboard/<feature>/index.tsx` (currently `classroom`, `schedule`, `materials`, `communication`, `notifications`, `progress`, and `ai-assistant`). The same shared component is mounted below each role path, for example `/students/classrooms` and `/tutors/classrooms`. Keep the role prefix so the sidebar retains its workspace context; do not replace these with root-level shared URLs unless a persistent user-role/session model is added.
- `src/components/common/dashboard-navigation.ts` is the navigation source for role and shared items. `getDashboardRole` derives the menu context from the URL prefix for presentation only; it is not authentication or authorization. Keep its hrefs in sync with `src/main.tsx`.
- The header in `src/pages/dashboard/layout.tsx` uses existing shadcn-style wrappers, a date, a search that filters the current workspace's navigation links, a Ctrl/Meta+K focus shortcut, and a role-scoped notifications link. The avatar/account label is generic presentation, not authenticated user data.
- Dashboard pages currently provide role-specific UI scaffolds and empty states; there are no feature data services or dashboard queries wired in this snapshot. Do not add sample metrics/activity as live data or claim CRUD, notifications, search over content, classroom management, or AI generation works unless the relevant service/API is implemented and approved. Add future role features as nested routes/files under the relevant role instead of restoring a catch-all content file.
- The `/` page in `src/pages/App.tsx` is currently a placeholder, not a complete marketing site or authenticated dashboard.
- `README.md` is still the stock React/Vite starter guide; do not treat it as the product architecture or workflow specification.

## 4. Current routes and application workflows

Routes are defined in `src/main.tsx`:

| URL | Current page/flow | Current integration status |
|---|---|---|
| `/` | `src/pages/App.tsx` | Placeholder heading. |
| `/onboarding` | `OnboardingView` in `src/components/features/onboarding/` | Local React Hook Form wizard; the route passes `needsOnboarding={true}` explicitly. This is not server-driven onboarding gating. |
| `/register` | Registration view/form/schema | Calls `POST /api/v1/auth/register`; accepted account types are `student` and `educator`. Successful registration proceeds to email verification. |
| `/login` | Login view/form/schema | Calls `POST /api/v1/auth/login`; JWT/refresh cookies are HttpOnly and the in-memory auth session is established. Google mark/button remains a visual placeholder, not OAuth. |
| `/email-verification` | Verification/resend view | Reads a verification token from the email-link query, removes it from the visible URL, then posts it to the API; resend calls the API. |
| `/forgot-password` | Recovery form | Calls `POST /api/v1/auth/forgot-password` and shows the generic account-safe response. |
| `/password-reset` | Password-reset form when a `token` query parameter exists; otherwise a request-link CTA | Captures and removes the token from the URL, then posts the new password to the API. |
| `/students/*`, `/educators/*`, `/tutors/*`, `/esl/*` | Role-specific and role-prefixed shared pages inside `PlatformLayout` | Protected by the frontend auth-session check; feature-specific pages remain UI scaffolds with no dashboard data services wired. Frontend guards are not backend authorization. See the route/file map in section 3. |
| `/auth/*` | `AuthRouteRedirect` compatibility handler | Redirects known legacy auth URLs to canonical top-level paths and preserves search/hash; unknown `/auth/*` paths return to `/`. |

The authentication views use `AuthShowcaseLayout` and `AuthShowcase`. Pass the correct `AuthShowcaseContext` (`login`, `register`, `forgot-password`, `email-verification`, or `password-reset`). The owl/art panel stays shared; page-specific carousel/guide copy lives in `auth-showcase-content.ts`. Preserve each left-side page's own heading, copy, and form.

Current auth navigation is navbar → `/login` or `/register`; login links to `/forgot-password` and `/register`; forgot-password, password-reset, and email-verification screens link back to `/login`. Password-reset without a `token` offers a link back to recovery. Auth forms now call the backend v1 auth API; successful registration proceeds to verification, verification/reset query tokens are consumed through API requests, and login/logout update the in-memory session context. The Google button remains a visual placeholder, not OAuth. Onboarding remains a local-only wizard.

Onboarding's current UX is a four-step local wizard: entity selection → profile basics → entity details → review → local Done screen. `onboarding-view.tsx` owns step state and navigation; constants/types/schemas and step components live beside it. Finish currently changes local state after a short delay; it does not save to an API or browser storage.

### Important role-contract mismatch

Registration now uses `student` and `educator`, matching the v1 auth API. Onboarding still uses `student`, `educator`, and `others` with tutor/ESL/freelance subtypes; those subtypes are not persisted by authentication. Do not infer or route educator subtypes until the backend profile contract is defined. Frontend route guards are UX only; resource authorization remains a backend responsibility.

### API foundation and security

`src/services/api/` contains API types, error extraction, health, and authentication services. `src/lib/axios.ts` configures Axios with `VITE_API_URL` and `withCredentials`. `AuthSessionProvider` restores the user through `/me` and refresh, auth mutations use the CSRF header and HttpOnly cookies, and dashboard routes are guarded against anonymous access. These are frontend session/UX controls only; they do not replace backend authorization. Onboarding remains local-only, and dashboard feature data is still not API-backed.

- Never expose secrets in source, documentation, client-side environment variables, logs, commits, or screenshots. Never inspect `.env` values during routine work.
- Verification/reset tokens are sensitive. Read tokens from approved email-link query parameters, remove them from the visible URL, send them only in the corresponding API request body, and never log or store them in local storage. Preserve query parameters through the legacy auth redirect so email links continue to work.
- Client-side role selection, form validation, route visibility, and onboarding guards are UX only. Backend authorization must enforce access when API integration is implemented.
- Keep error copy generic where account existence could be disclosed. Never display raw server payloads or stack traces to users.

## 5. Skills and when to consult them

Project agent skills live under `.agents/skills/<name>/SKILL.md`. They provide focused workflow guidance; they do not override this file, current source, or confirmed backend contracts. Treat roadmap capabilities as planned until their implementation and API support are verified.

| Work area | Skill file | Use it for |
|---|---|---|
| Cross-product principles, security, architecture, and ownership boundaries | `.agents/skills/owlio-core/SKILL.md` | Shared decisions across Owlio experiences. |
| Student personal workspace and classroom participation | `.agents/skills/student-workflows/SKILL.md` | Student-owned work and learner-facing classroom flows. |
| Student-created peer collaboration | `.agents/skills/study-spaces/SKILL.md` | Shared study-space membership, content, and boundaries. |
| Educator-led classroom lifecycle | `.agents/skills/educator-classroom/SKILL.md` | Classroom and lesson workflows across educator types. |
| Flexible tutoring | `.agents/skills/tutoring-workflows/SKILL.md` | One-to-one/group sessions and non-institutional teaching. |
| Language-learning workflows | `.agents/skills/esl-teaching/SKILL.md` | ESL activities and language-specific learner needs. |
| Activity creation, submissions, grading, and feedback | `.agents/skills/classwork-assessment/SKILL.md` | Form and non-form classwork and evaluation. |
| Educator-facing AI assistance | `.agents/skills/ai-assistant/SKILL.md` | AI-generated teaching/assessment drafts and human review. |
| Authentication UX and security-conscious states | `.agents/skills/owlio-authentication/SKILL.md` | Registration, login, verification, and recovery UI. |
| Local onboarding wizard | `.agents/skills/owlio-onboarding/SKILL.md` | Entity selection, profile setup, validation, and local completion. |
| Calendar, schedules, and deadlines | `.agents/skills/schedule-calendar/SKILL.md` | Personal, classroom, and tutoring time workflows. |
| Learning resources | `.agents/skills/learning-materials/SKILL.md` | Personal, shared, classroom, and lesson materials. |
| Classroom/session attendance | `.agents/skills/attendance/SKILL.md` | Attendance UX and educator-controlled records. |
| Discussions, announcements, polls, and alerts | `.agents/skills/communication-notifications/SKILL.md` | Contextual communication and notification workflows. |
| Progress summaries and exports | `.agents/skills/learner-progress-reporting/SKILL.md` | Personal progress, educator insights, and authorized reports. |

Verify skill guidance against current source because role contracts, API capabilities, and product direction can change. Do not assume a feature, service, endpoint, or permission exists merely because a skill describes the planned workflow. Current source, this guide, and explicit owner/backend contracts take precedence.

## 6. UI and implementation invariants

- Preserve the Owlio owl/wordmark, Inter, existing Auth Showcase/layout patterns, current palette/theme tokens, and responsive behavior unless the request asks for a design change.
- Keep auth showcase context-specific copy in its content configuration; do not duplicate or replace the shared owl artwork when only the page guidance should change.
- Keep student personal work distinct from official educator-controlled class records. A student-created study space is not an official classroom. Tutors/ESL need flexible wording and must not be forced into a school-only model.
- Use `src/components/ui` wrappers with their actual Base UI APIs. Keep focus visible, labels associated, errors described, controls keyboard-operable, and decorative icons hidden from assistive technology.
- Use React Hook Form/Zod for complex forms where consistent with adjacent code. Keep schemas next to their feature. Client validation does not replace server validation.
- Current registration password UX requires at least 8 characters and caps input at 72 UTF-8 bytes. Do not weaken or contradict these rules without contract review.
- Keep query tokens out of logs/DOM/storage. For legacy auth redirects, preserve `search` and `hash` so reset links retain their token.
- Do not claim demo numbers, sample quiz states, fixed placeholder dashboards, or disabled onboarding destinations are live user data or production functionality.
- Avoid adding comments, dependencies, global theme overrides, or broad route/tree rewrites unless they are necessary for the requested task.

## 7. Verification and handoff

Scripts from `package.json`:

```sh
npm run dev       # Vite development server
npm run build     # TypeScript project build, then Vite production build
npm run lint      # ESLint across the repository
npm run preview   # Preview the Vite production output
```

There is no test script and no test/spec files were found in this snapshot. Do not claim tests passed when none ran. For every change:

1. Run focused ESLint on touched TS/TSX files.
2. Run `npm run build` for TypeScript and production bundling when feasible.
3. Run `npm run lint` for full-repository status; separate pre-existing failures from newly introduced ones and do not disable rules broadly.
4. Run `git diff --check`, inspect the final diff/status, and verify routes/links or UI states relevant to the change.
5. Report commands actually run, pass/fail, and known blockers. `npx vite build` alone does not replace the TypeScript check in `npm run build`.

At context capture on 2026-10-14, `npm run lint` reported 13 `react-refresh/only-export-components` errors in `src/components/ui/{badge,button,combobox,marker,message-scroller,navigation-menu,tabs,toast,toggle}.tsx`. Re-run lint before relying on this baseline; do not assume it remains current or attribute unrelated findings to a feature change.

Handoff summary should include: behavior changed, key files/routes, verification run and results, unimplemented/backend dependencies, and any product decisions that need owner input. Mention if a request was intentionally kept UI-only.

## 8. Agent/parallel-work protocol

- Do not delegate or start subagents unless the session's higher-priority instructions or the user explicitly permit it.
- When parallel agents are authorized, give each a self-contained task and disjoint file ownership. Avoid concurrent edits to shared route/config/layout files.
- The coordinating agent owns route/API contract decisions, integration, conflict resolution, final diff review, and verification. Never assume a delegated search result is correct without checking relevant source.
- Before handoff, list modified files and verification outcomes; identify unresolved assumptions rather than silently choosing incompatible role/API contracts.

