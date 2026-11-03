# Frontend architecture

Use this document for source boundaries, shared UI, navigation, persistence, or authentication changes. Inspect neighboring code before choosing a pattern.

## Runtime and source map

Owlio is a client-rendered React/TypeScript SPA with Vite, npm, React Router, Tailwind CSS, and project-owned Base UI/shadcn wrappers. Installed packages alone are not evidence of an active integration.

| Location | Responsibility |
| --- | --- |
| [src/main.tsx](../../src/main.tsx) | DOM entry, providers, registered routes, auth/role boundaries |
| [src/pages/dashboard/layout.tsx](../../src/pages/dashboard/layout.tsx) | Shared workspace shell; a route can hide its header/sidebar with `useImmersiveDashboard` (ESL/tutor calls) |
| [dashboard-navigation.ts](../../src/components/common/dashboard-navigation.ts) | Role menu definitions, active context, navigation search |
| `src/pages/` | Route adapters; keep new/refactored adapters thin |
| `src/components/features/<domain>/` | Feature views, forms, schemas, state, and orchestration |
| `src/components/common/` | Shared application components |
| `src/components/ui/` | Domain-neutral UI primitives and variants |
| `src/services/api/` | Typed HTTP contracts, adapters, and error handling |
| `src/lib/` | Shared utilities and configuration |
| [global.css](../../src/styles/global.css) | Tailwind entry point, font, semantic theme tokens |
| [dark-surfaces.css](../../src/styles/dark-surfaces.css) | Compatibility styles for existing palette-based surfaces |

Use the `@/*` alias for `src/*`. Keep existing migration exceptions local to the requested change. Feature work does not require a repository-wide directory rewrite.

## Navigation and workspaces

Workspace roots are `/students`, `/educators`, `/tutors`, and `/esl`. Shared pages retain their role prefix, such as `/students/classrooms`. Keep route registration, navigation hrefs, active matching, title, and navigation search aligned when changing a destination. Header search currently searches navigation, not arbitrary user content.

`getDashboardRole` derives presentation context from a URL. Backend-assigned roles and resource authorization govern access. See [auth access](../AUTH_ROUTE_ACCESS.md) for session restoration, safe return paths, multi-role behavior, and guest-only routes. The actual root route redirects to login; `src/pages/App.tsx` is an unused placeholder, not the routed homepage.

## UI and reference images

Read the local component API before using it; Base UI wrappers do not imply Radix `asChild` support. Reuse behavior and accessibility while adapting variants, dimensions, and composition to the requested design.

Inter, the owl/wordmark, semantic tokens, and Auth Showcase are existing defaults. Unchanged areas retain their design. An explicit reference implementation/redesign may change the requested area's appearance without separate permission for each styling choice. Scope new styles so shared screens do not drift accidentally.

For auth copy-only changes, use the existing showcase context and content configuration. For a requested auth redesign, preserve the real forms, validation, and session flow while changing layout.

Theme selection is browser-local via `src/lib/theme.ts`, not an account-profile update. When adding palette utilities covered by the existing dark compatibility mechanism, inspect/run `node scripts/sync-dark-utilities.mjs` and review the generated CSS. New UI can use semantic tokens or scoped reference-specific styles. Authored presentation surfaces and the ESL drawing canvas use `data-theme-content` to preserve content colors.

## Data and persistence

Read [capability status](capability-status.md) before changing data behavior. Distinguish account-backed API records, browser-local records, tab-memory previews, and transient live-room events. A component/provider name containing `prototype` does not establish its current data mode.

Preserve existing storage keys and data shapes when redesigning local tools. Changes to stored formats need an explicit compatibility/recovery approach; local data must not disappear because a screen was restyled. Inspect the editor's revision checks, save-error recovery, and backup flow before changing it.

## Authentication and service boundaries

The [Axios client](../../src/lib/axios.ts) uses a client-visible API base URL and credentialed requests. Auth uses HttpOnly cookies and an in-memory CSRF token. Use the existing service helpers; do not introduce browser-stored credentials or directly access server-only providers.

- Never read/print private `.env` values for routine work. `.env.example` is the public configuration reference; `VITE_*` values are bundled into browser code.
- Preserve verification/reset token handling: remove sensitive tokens from visible URLs after capture, send only through the matching API request, and keep them out of logs and persistent storage.
- Preserve safe login return paths, account-switch cleanup, stale-request handling, and existing retry limits. Do not blindly replay feature mutations after session errors.
- Registration password validation currently requires 8 characters minimum and 72 UTF-8 bytes maximum; inspect `auth/shared/password-rules.ts` and the confirmed contract before changing it.
- Onboarding is a local wizard; its `others`/subtype choices do not assign authenticated tutor/ESL roles.

Classroom contract details live in [classroom integration](../CLASSROOM_API_INTEGRATION.md). Meeting calls live in [meeting.service.ts](../../src/services/api/meeting.service.ts); media/presence uses LiveKit. Backend source and deployment readiness are outside this repository.

[Product overview](../product/overview.md) | [Verification](../sops/verification.md)
