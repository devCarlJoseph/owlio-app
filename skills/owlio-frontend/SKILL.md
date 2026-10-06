---
name: owlio-frontend
description: Build and maintain the Owlio React frontend according to its product planning, role boundaries, staged MVP, and existing Vite/shadcn architecture. Use for Owlio frontend features, structure, UI conventions, dependencies, or implementation planning.
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

## Repository baseline

Inspected baseline: React 19, TypeScript 6, Vite 8, React Router, Tailwind CSS 4, shadcn CLI/configuration, Base UI, lucide-react, clsx, tailwind-merge, and `@/*` alias. shadcn Button and Card exist under `src/components/ui`; `src/pages/App.tsx` is a placeholder. Existing empty markers include common/features components, context, services, and admin/auth/guest/users pages. Preserve working paths and evolve toward feature-oriented modules incrementally rather than moving everything up front.

Planned frontend packages not present in that baseline: `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `date-fns`, and later `socket.io-client`. Planned frontend test runners: Vitest and Playwright. Verify `package.json` before installation because repository state may have changed. Backend packages (Express, Prisma, DB clients, OpenAI SDK, storage SDKs, security middleware) belong in backend, not this frontend.

There are two utility modules in the baseline (`src/lib/cn.ts` and `src/lib/utils.ts`). Inspect `components.json` and component imports and maintain one agreed utility entrypoint instead of proliferating helpers.

## Architecture and implementation

- Organize product behavior by feature (auth, personal workspace, study spaces, classrooms, schedule, materials, classwork, submissions, attendance, grades, communication, notifications, progress, AI assistance). Keep `components/ui` domain-neutral; feature-specific compositions belong with the feature.
- Let pages compose route-level experiences. Preserve existing route organization until agreed changes can be made incrementally.
- Use the flow: page/component → feature hook → TanStack Query → feature API service → Owlio API. Keep server state in Query, transient UI state local, and request construction out of view components.
- Use React Hook Form + Zod with `@hookform/resolvers` for forms. Backend validation remains authoritative.
- Include appropriate loading, empty, error, success, validation, and unauthorized states. Use semantic, keyboard-accessible, responsive UI with the existing Tailwind v4/shadcn system.
- For dates and schedules, clarify API storage and timezone rules before formatting assumptions are embedded in screens.
- Add dependencies only when their stage/workflow starts; do not install already-present foundations again. Add shadcn components individually as needed.

## Before implementation

Review the current repository and the planning documents available in the project. Confirm user, workflow, route, role permissions, acceptance criteria, API data/error contract, and design conventions. Raise unresolved product choices such as educator role modeling, meeting MVP, notification delivery, file constraints, and canonical `cn()` import path with the project owner before they become hard to change.

For review readiness, align UI behavior to the final plan, cover relevant role scenarios and screen states, and run the checks requested for that change (build/lint; unit/browser checks once configured). Do not treat hidden frontend controls as access control.

For fuller Owlio planning and repository guidance, consult the repository-root OWLIO_FRONTEND_GUIDE.md; verify current repository state before relying on its baseline notes.
