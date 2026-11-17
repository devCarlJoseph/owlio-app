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
| `src/components/features/connected-workspace/` | Routed API-only overview, subjects, tasks, notes, notifications, scheduling, and unavailable-feature boundary |
| `src/lib/` | Shared utilities and configuration |
| `src/context/` | App-wide theme context and provider composition; auth remains feature-owned |
| `src/hooks/` | Cross-domain hooks, including `useTheme` |
| [global.css](../../src/styles/global.css) | Tailwind entry point, font, semantic theme tokens |

Use the `@/*` alias for `src/*`. Features use responsibility folders as needed within existing domain/subfeature boundaries. See [feature composition](feature-composition.md) for the current structure and global provider lifecycle. The [page adapter guide](../components/page-adapters.md) identifies page ownership and inline-page exceptions.

## Navigation and workspaces

Workspace roots are `/students`, `/educators`, `/tutors`, and `/esl`. Shared pages retain their role prefix, such as `/students/classrooms`. Keep route registration, navigation hrefs, active matching, title, and navigation search aligned when changing a destination. Header search currently searches navigation, not arbitrary user content. Previously disabled planned sidebar and profile-menu destinations now have role-prefixed links and searchable titles. `getPlannedDashboardPages` registers only known planned destinations, which display the shared **Under development** screen. Existing feature pages (including tutor Settings) retain their implementations. Unknown workspace paths display a 404 inside the guarded workspace shell.

`getDashboardRole` derives presentation context from a URL. Backend-assigned roles and resource authorization govern access. See [auth access](../AUTH_ROUTE_ACCESS.md) for session restoration, safe return paths, multi-role behavior, and guest-only routes. The actual root route redirects to login; `src/pages/App.tsx` is an unused placeholder, not the routed homepage.

The entry point registers the original role-specific page adapters, including Overview, Calendar, study tools, teaching tools, and Meeting Room. `ApiWorkspaceContent` preserves those layouts by default and offers a separate **Account records** view (`?source=account`) for overview, student subjects/tasks/notes, notifications, schedule, and tutor sessions. My Classes continues to use its connected implementation. Account/role/path changes remount content, and account reads are aborted on unmount. See [API connection](../API_CONNECTION.md).

Connected meetings use `MeetingRoomShell` to maintain a bounded, shrinkable flex chain inside the immersive dashboard. The stage, participant list, and chat contain their own overflow; adding messages must not resize the call or move its footer off-screen. Chat headers and the composer remain outside the scrolling message log, and unbroken message text wraps within the panel. Small screens use an overlay panel and flexible grid rows; large displays retain the stage with a side panel. Pre-join pages keep ordinary page scrolling.

Meeting chat, people, details, notices, and participant strips use the project-owned shadcn `ScrollArea` with themed scrollbars. `viewportRef` exposes the actual scroll element for chat auto-scroll; `viewportClassName` and `contentClassName` scope viewport/content styling, and `scrollbarOrientation` supports horizontal or dual-axis strips. Style the immersive dashboard's own content through these props instead of descendant selectors, which would also override nested meeting scroll areas. Participant avatars use tile width and height to stay clear of captions on short screens. Dashboard height includes a `100vh` fallback before `100dvh`.

Classroom interiors use an illustrated class banner and class summary above a reference-inspired three-column composition: a section menu, bordered content panels, and supporting class/invite details. The section menu becomes a horizontally scrollable tab strip below desktop width; supporting details stack below the content when space is limited. Styling is scoped to the classroom interior, using shared brand colors, card radius tokens, and button variants; dashboard chrome is unchanged. Interior banners use three bundled original Owlio illustrations selected deterministically from the permanent classroom ID (`getClassroomBannerUrl`). New classrooms receive a banner as soon as their API ID exists; the same class has the same banner for all roles and after reloads. This is presentation-only selection, with no new backend field, upload, or runtime AI generation. Class-list cards and list rows reuse the same banner selection as the interior, cropping the illustrated right-hand side into the existing thumbnail dimensions; the surrounding list layout and controls are unchanged. Banner source prompts are recorded in `public/classroom-banners/README.md`. About remains the default tab; query parameters, scoped meeting links, invite copying, and API-backed chat keep their existing behavior. A separate display-only member directory is available to the owner and current learners; the owner-only roster endpoint is unchanged. Unsupported sections remain explicitly unavailable. Dashboard scroll content is constrained to its viewport width so nested horizontal tabs cannot widen the page.

## UI and reference images

Full-page loading uses components/common/owlio-loading-page.tsx: a centered authentication mascot and three small brand-colored dots bouncing in sequence on the same full-page theme-aware background as the error screens. Visible loading copy and progress bars are omitted; context-specific loading details remain available to assistive technology through a live status region. The dots stay still when reduced motion is preferred. Session restoration uses this loader across guest and role routes and ends as soon as the session resolves, with no artificial delay. Session failures retain OwlioPageState with the actual error message and retry behavior. No-workspace access uses the shared HttpErrorPage with status 403 and the existing sign-out action. Unknown routes use HttpErrorPage with status 404 and a home/dashboard link instead of silently redirecting. StatusPage supplies a reference-based centered white card on a pale background, original pale vector illustrations, blue status code, dark pill action, and dark-theme variants. It also powers planned pages without an HTTP code. HttpErrorPage accepts confirmed HTTP error codes, with specific copy for common client/server errors and generic fallback copy for others; only 403 and 404 are currently connected. Session outages do not invent an HTTP status, and anonymous users retain their login redirect. A numeric code is shown only when known; session failures retain the mascot and actual error message. These components own presentation, while the feature-owned auth context retains session and retry behavior. Use the full-page loader when the entire shell is pending; retain area-specific skeletons when the workspace layout is available.

Loading placeholders follow the layout of the area awaiting data: classroom cards/list rows, account editors and records, notification rows, session lists, teaching activities, and classwork review panels. Lazy meeting routes distinguish the directory from classroom/coaching pre-join layouts; study-space placeholders reserve the scene and toolbar area. Existing classroom-interior and student-overview skeletons remain in place. Static local pages do not introduce artificial loading delays. The shared Skeleton honors reduced motion; loading regions expose status text and hide decorative shapes from assistive technology. Loading visuals do not replace errors, empty states, or mutation progress.

Classroom chat uses a [Messenger-inspired conversation design](https://about.fb.com/news/2020/10/a-new-look-for-messenger/) with brand-colored outgoing bubbles, grouped authors, actual message dates/times, and a collapsible conversation-details/member panel. Chat scrolls through the shadcn viewport while its header and composer stay outside it. The cover/header is reduced on the Chat tab, which stays visible in the section menu or mobile tab strip when selected or resized. The banner displays instructor identity and action buttons beneath the classroom title. Missing instructor names are resolved from the authorized member directory, matching both owner ID and owner role, with paginated and cancellable reads. The directory panels still load only when opening Members or expanding Chat members; chat continues using its existing API and retry semantics. Unsupported local preview reactions are omitted from chat.

Read the local component API before using it; Base UI wrappers do not imply Radix `asChild` support. Reuse behavior and accessibility while adapting variants, dimensions, and composition to the requested design.

Use the shared `src/components/ui/date-time-picker.tsx` for custom local-date/time selection and the existing shadcn/Base UI Select for menus. The Schedule composer uses these for Starts, Ends, and Mode; Classwork's deadline adapter reuses the same picker while retaining its closing-time defaults and form field. The picker supports keyboard day navigation, month changes, AM/PM, clearing, disabled states, and hidden local datetime form values. Browser-native date/time pickers and select menus are excluded from new or changed UI under AGENTS.md; semantic HTML remains appropriate for structure and component internals.

Inter, the owl/wordmark, semantic tokens, and Auth Showcase are existing defaults. Unchanged areas retain their design. An explicit reference implementation/redesign may change the requested area's appearance without separate permission for each styling choice. Scope new styles so shared screens do not drift accidentally.

The original auth showcase includes rotating feature artwork, a practice question, and contextual guidance. These illustrations and examples are separate from authenticated account activity. Preserve the real forms, validation, and session flow when changing its layout.

Theme selection is browser-local via `src/lib/theme.ts`, not an account-profile update. Implement component styling with Tailwind utilities rather than standalone stylesheets or CSS modules. Prefer semantic color tokens; explicit `surface-dark:` variants preserve the existing dark palette while excluding authored content marked with `data-theme-content`. The Tailwind entry file owns imports, theme tokens, base `@apply` defaults, and animation tokens/keyframes. Keep inline styles only for runtime values such as drawing coordinates, user-selected colors, and calculated geometry.

## Data and persistence

Classroom chat read positions are account/classroom API records, not browser storage. Chat exposes server total/unread/mention counts and cursor-paginated navigation to unread or notification-linked messages. Scoped member mentions and owner-only `@students` create durable in-app alerts. The notification bell/panel/inbox displays authorized classroom mentions; other notification categories retain their separate account-record view and explicit examples. Migration/release requirements and unread acknowledgment behavior are recorded in the [classroom integration contract](../CLASSROOM_API_INTEGRATION.md).

Read [capability status](capability-status.md) before changing data behavior. Distinguish account-backed API records, browser-local records, tab-memory previews, and transient live-room events. A component/provider name containing `prototype` does not establish its current data mode.

Authentication, My Classes, account-record views, and live meetings use the API. Original browser-local editors are routed again and retain their existing storage keys and notices. Device and account records stay separate: there is no automatic import, deletion, or account assignment. Other restored pages retain their existing example/unavailable disclosures; their appearance does not establish API integration.

Preserve existing storage keys and data shapes when redesigning local tools. Changes to stored formats need an explicit compatibility/recovery approach; local data must not disappear because a screen was restyled. Inspect the editor's revision checks, save-error recovery, and backup flow before changing it.

## Authentication and service boundaries

The [Axios client](../../src/lib/axios.ts) uses a client-visible API base URL and credentialed requests. Auth uses HttpOnly cookies and an in-memory CSRF token. Use the existing service helpers; do not introduce browser-stored credentials or directly access server-only providers.

- Never read/print private `.env` values for routine work. `.env.example` is the public configuration reference; `VITE_*` values are bundled into browser code.
- Preserve verification/reset token handling: remove sensitive tokens from visible URLs after capture, send only through the matching API request, and keep them out of logs and persistent storage.
- Preserve safe login return paths, account-switch cleanup, stale-request handling, and existing retry limits. Do not blindly replay feature mutations after session errors.
- Registration password validation currently requires 8 characters minimum and 72 UTF-8 bytes maximum; inspect `auth/shared/password-rules.ts` and the confirmed contract before changing it.
- `/onboarding` redirects to API registration. Retained local-wizard source does not assign authenticated roles and is not mounted.

Classroom contract details live in [classroom integration](../CLASSROOM_API_INTEGRATION.md). Meeting calls live in [meeting.service.ts](../../src/services/api/meeting.service.ts); media/presence uses LiveKit. Backend source and deployment readiness are outside this repository.

[Product overview](../product/overview.md) | [Verification](../sops/verification.md)
