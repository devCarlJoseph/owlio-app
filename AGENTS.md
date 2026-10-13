# Owlio App — Agent Context

This is the repository-specific guide for work in `owlio-app`. Keep it aligned with the current source tree. Source code and explicit product-owner instructions are authoritative when this guide or a skill is stale. Do not treat marketing previews, placeholder pages, or TODO-shaped UI as working backend features.

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
| `axios` | HTTP client instance in `src/lib/axios.ts`; its base URL comes from `VITE_API_URL` with a localhost fallback. Current feature forms do not call auth services. |
| `cn`, `clsx`, `tailwind-merge`, `class-variance-authority` | Class composition/merging and variants. Follow the import pattern in the neighboring component; avoid adding another class helper. |
| `cmdk`, `input-otp` | Command and OTP UI primitives in `src/components/ui`. |
| `@tanstack/react-query`, `date-fns`, `@shadcn/react` | Installed in `package.json`, but no direct source imports were found in this snapshot. Do not assume they are part of an active data flow. |
| ESLint packages (`eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`) | Lint configuration in `eslint.config.js`. |
| Type packages (`@types/node`, `@types/react`, `@types/react-dom`) | TypeScript support for Node/Vite and React. |

`src/styles/global.css` is the Tailwind entry point and defines the semantic theme/radius/sidebar tokens and Inter font. Prefer existing tokens and local UI primitives over new one-off styling systems.

## 3. Source architecture and ownership

```text
src/
  main.tsx                         BrowserRouter and route registration
  pages/                           Thin route entry points
    auth/<flow>/index.tsx          Auth page adapters
    dashboard/layout.tsx           Shared shell for role pages
    dashboard/{students,educators,tutors,esl}/index.tsx
    onboarding/index.tsx           Onboarding route adapter
  components/
    common/                        Cross-feature navigation/layout utilities
    features/auth/                 Auth views, forms, schemas, shared showcase
    features/onboarding/           Multi-step onboarding workflow
    ui/                            Domain-neutral shadcn-style components
  lib/                             Shared HTTP and class utilities
  services/api/                    API health/error/types foundation
  styles/global.css                Tailwind/theme/font entry point
```

Conventions:

- Route adapters stay thin; screen/page behavior belongs under `src/components/features/<domain>/` or the role page's own folder when that is the current convention.
- Reusable domain-neutral controls belong in `src/components/ui/`. Reuse `Button`, `Card`, `Field`, `Input`, `Label`, `ScrollArea`, `Avatar`, etc. before creating parallel primitives.
- Use the `@/*` alias for `src/*`. `components.json` configures Tailwind CSS at `src/styles/global.css`, Lucide icons, and the `base-vega` style.
- Role dashboards share `src/pages/dashboard/layout.tsx` through a pathless React Router layout route. Current direct role URLs are `/students`, `/educators`, `/tutors`, and `/esl`; each has its own route module. These pages are UI scaffolds, not data-backed dashboards. Add future role features as nested routes/files under the relevant role instead of restoring a single catch-all content file.
- The `/` page in `src/pages/App.tsx` is currently a placeholder, not a complete marketing site or authenticated dashboard.
- `README.md` is still the stock React/Vite starter guide; do not treat it as the product architecture or workflow specification.

## 4. Current routes and application workflows

Routes are defined in `src/main.tsx`:

| URL | Current page/flow | Current integration status |
|---|---|---|
| `/` | `src/pages/App.tsx` | Placeholder heading. |
| `/onboarding` | `OnboardingView` in `src/components/features/onboarding/` | Local React Hook Form wizard; the route passes `needsOnboarding={true}` explicitly. This is not server-driven onboarding gating. |
| `/register` | Registration view/form/schema | UI and client validation only; current view passes a no-op submit handler. |
| `/login` | Login view/form/schema | UI only; current view passes a no-op submit handler. The Google mark/button is not OAuth. |
| `/email-verification` | Verification/resend view | UI states only; token presence is read from the query string but is not verified by a backend here. |
| `/forgot-password` | Recovery form | UI only; current submit handler is a no-op. |
| `/password-reset` | Password-reset form when a `token` query parameter exists; otherwise a request-link CTA | UI only; token presence is not validation and current submit handler is a no-op. |
| `/students`, `/educators`, `/tutors`, `/esl` | Role pages inside `PlatformLayout` | Placeholder/static UI; no dashboard data services are wired. |
| `/auth/*` | `AuthRouteRedirect` compatibility handler | Redirects known legacy auth URLs to canonical top-level paths and preserves search/hash; unknown `/auth/*` paths return to `/`. |

The authentication views use `AuthShowcaseLayout` and `AuthShowcase`. Pass the correct `AuthShowcaseContext` (`login`, `register`, `forgot-password`, `email-verification`, or `password-reset`). The owl/art panel stays shared; page-specific carousel/guide copy lives in `auth-showcase-content.ts`. Preserve each left-side page's own heading, copy, and form.

Current auth navigation is navbar → `/login` or `/register`; login links to `/forgot-password` and `/register`; forgot-password, password-reset, and email-verification screens link back to `/login`. Password-reset without a `token` offers a link back to recovery. These are navigation affordances only: every current auth submit handler is a no-op, the Google button is not OAuth, email tokens are not verified, and no registration→verification→authenticated transition is implemented.

Onboarding's current UX is a four-step local wizard: entity selection → profile basics → entity details → review → local Done screen. `onboarding-view.tsx` owns step state and navigation; constants/types/schemas and step components live beside it. Finish currently changes local state after a short delay; it does not save to an API or browser storage.

### Important role-contract mismatch

The current registration selector/schema uses `student`, `teacher`, and `other`; onboarding uses `student`, `educator`, and `others` (with tutor/ESL/freelance subtypes). These do not match. Do not silently normalize or expand role values. Confirm the intended product/backend contract before connecting registration, onboarding, dashboard routing, or authorization.

### API foundation and security

`src/services/api/` currently contains API types, error extraction, and an API health request. `src/lib/axios.ts` configures Axios with `VITE_API_URL` and `withCredentials`; there is no auth service, server-session provider, or role-aware authorization layer in the current frontend. Do not describe the auth/onboarding UI as API-backed or protected.

- Never expose secrets in source, documentation, client-side environment variables, logs, commits, or screenshots. Never inspect `.env` values during routine work.
- Verification/reset tokens are sensitive. Do not log, render, persist, or send tokens except through an approved API flow; preserve query parameters during the existing legacy URL redirect.
- Client-side role selection, form validation, route visibility, and onboarding guards are UX only. Backend authorization must enforce access when API integration is implemented.
- Keep error copy generic where account existence could be disclosed. Never display raw server payloads or stack traces to users.

## 5. Skills and when to consult them

Repository skill documents are plain Markdown under `skills/`; the current Devin skill registry did not discover them automatically. Read the relevant file directly for its domain, but verify its claims against the current source because some passages are aspirational or stale.

| Work area | Skill file | Use it for |
|---|---|---|
| Auth forms, routing UX, verification/recovery states, auth visual language | `skills/owlio-authentication/SKILL.md` | UI/UX and security-conscious presentation. It explicitly excludes API/session wiring. Its sample `/auth/*` routes are stale; current canonical routes are in `src/main.tsx`. |
| Onboarding steps, role selection, local validation and completion | `skills/owlio-onboarding/SKILL.md` | Onboarding workflow and Phase 1 UI constraints. Only implement its API Phase 2 when explicitly requested and after confirming the backend contract. |
| Shared product UI, student/educator/tutor/ESL boundaries, brand and role-aware UX | `skills/owlio-product-ui/SKILL.md` | Product-wide UI decisions and role-specific workflows. Treat landing-page examples as inspiration, not proof of shipped features. |

The skills refer to `OWLIO_FRONTEND_GUIDE.md`, which is not present in this repository snapshot. Do not assume that file or any service/tree described only by a skill exists. Current source, package scripts, this guide, and explicit owner/backend contracts take precedence.

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

