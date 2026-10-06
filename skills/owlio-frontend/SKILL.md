---
name: owlio-frontend
description: Build and maintain the Owlio frontend using the project’s page-to-feature component structure, UI-first workflow, product plan, and existing Vite/shadcn stack.
---

# Owlio Frontend

Use this skill for frontend work in the Owlio repository. Follow the final system planning document as the authority for product scope, workflows, permissions, MVP boundaries, and future enhancements. Use the detailed development planning document for architecture and sequencing when it does not conflict with the final plan. Ask the project owner to resolve material conflicts rather than silently expanding scope.

## Product invariants

- Owlio serves independent student organization, student-created study spaces, educator-led classrooms, and tutoring/ESL classrooms.
- Keep student-managed personal data distinct from official classroom records. Grades, official attendance, feedback, classwork, and classroom progress are educator-controlled. Study spaces are not official classrooms.
- Educators include teachers, instructors, ESL teachers, tutors, and freelance educators; do not hard-code one school model into all screens.
- Backend authorization is authoritative. Role-aware controls improve the UI but are not a security boundary.
- The student experience must remain useful without an instructor.
- AI results are educator-reviewable. The frontend calls Owlio's backend, never OpenAI directly; never expose API keys.
- Follow the final plan's MVP. Prefer schedules and external meeting links before full native WebRTC conferencing; treat advanced AI tutor, whiteboard, analytics, mobile apps, institution-wide administration, and payments as future scope unless explicitly reprioritized.

## Required component and page structure

Keep route pages thin. For each screen, put its page-level UI components in the corresponding feature folder; do not put screen-specific components in the route file or in the generic `components/ui` library.

For authentication screens, follow this pattern:

```text
src/
  pages/auth/<screen>/index.tsx
  components/features/auth/<screen>/
    <screen>-view.tsx
    <screen>-form.tsx
    ...screen-specific components
```

Use screen names that match routes, such as `login`, `register`, `forgot-password`, `password-reset`, and `email-verification`. The route page imports and composes its screen from `components/features/auth/<screen>/`. Apply the same page-to-feature ownership pattern to other domains when requested. Put genuinely reusable, domain-neutral primitives in `src/components/ui`.

## UI-first workflow

When the user asks to build UI first:

1. Inspect the supplied visual reference and the current repo primitives, theme, routing, and target page.
2. Implement the screen's layout, responsive behavior, semantics, and visible interactions in the matching feature folder. Keep its route page as a thin composition point.
3. Reuse existing shadcn primitives from `src/components/ui`. Add only primitives that the UI needs and that the project does not already have; do not reinstall existing packages.
4. Keep API calls, real authentication, external sign-in, and persistent state out of scope until the user asks for integration. Controls can be visually complete and have local presentation-only behavior, but do not imply that sign-in is connected.
5. Preserve Owlio terminology and user workflows while adapting a reference; do not copy unrelated branding or product text verbatim.

## Current repository baseline

React 19, TypeScript 6, Vite 8, React Router, Tailwind CSS 4, shadcn CLI/configuration, Base UI, lucide-react, clsx, tailwind-merge, and the `@/*` alias are in use. Existing shadcn primitives are in `src/components/ui`; inspect that folder before adding another. `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, and `date-fns` are already installed. `socket.io-client` is not installed; add it only when real-time features are in scope. Verify `package.json` and current source files before assuming this snapshot is still accurate.

Backend-only packages (Express, Prisma, DB clients, OpenAI SDK, storage SDKs, security middleware) belong in the backend, not this frontend. The longer project planning and baseline guide is `OWLIO_FRONTEND_GUIDE.md` at the repository root.

## Architecture and implementation

- Organize product behavior by feature (auth, personal workspace, study spaces, classrooms, schedule, materials, classwork, submissions, attendance, grades, communication, notifications, progress, AI assistance). Keep `components/ui` domain-neutral and screen-specific components alongside their feature screen.
- Use pages as route-level composition points following the page-to-feature structure above.
- For API-backed work, use the flow: page/component → feature hook → TanStack Query → feature API service → Owlio API. Keep server state in Query, transient UI state local, and request construction out of view components.
- Use React Hook Form + Zod with `@hookform/resolvers` for forms. Backend validation remains authoritative.
- Include relevant loading, empty, error, success, validation, and unauthorized states. Use semantic, keyboard-accessible, responsive UI with the existing Tailwind v4/shadcn system.
- For dates and schedules, clarify API storage and timezone rules before formatting assumptions are embedded in screens.
- Do not treat hidden frontend controls as access control.

## Before implementation

Review current repository state and the planning documents available in the project. Confirm the user, workflow, route, permissions, acceptance criteria, API contract, and design conventions as relevant to the task. Raise unresolved product choices such as educator role modeling, meeting MVP, notification delivery, file constraints, and canonical `cn()` import path with the project owner before they become hard to change. Run checks only when requested or needed by the task instructions.
