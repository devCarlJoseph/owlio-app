# Capability status

Source review: 15 November 2026. Source and configuration establish implementation; browser reads and mocked tests establish different verification scopes.

## Operating mode

Auth/session and role guards always run. The compatibility export in `src/lib/api-mode.ts` is true; it no longer controls the guards or providers. There is no authentication preview bypass or local onboarding route. Original workspace layouts and browser-local tools are restored behind these guards.

`ApiWorkspaceContent` renders the original page adapters by default. **Account records** (`?source=account`) opens the separate connected overview, student subjects/tasks/notes, notifications, schedule, and tutor sessions. Browser-local work is accessible in the original tools without automatic import or deletion. Existing preview notices continue to identify example/unconnected content.

## Capability map

| Area | Current routed behavior | Evidence |
| --- | --- | --- |
| Authentication and account security | Cookie/CSRF-backed forms, session refresh, Google callback/linking and API-derived role guards. `/onboarding` redirects to registration. | [Auth access](../AUTH_ROUTE_ACCESS.md), `src/components/features/auth/`, `src/services/api/auth.service.ts` |
| Overview | Original role overview; separate Account records view retains server identity and classroom count. | `dashboard-overview/`, `connected-workspace/api-workspace-content.tsx` |
| Classrooms | API list/create/join/detail and owner roster; persisted enrollment and reusable meeting codes; classroom-only chat/history/replies with five-second refresh and account cleanup. | [Classroom integration](../CLASSROOM_API_INTEGRATION.md) |
| Student subjects/tasks/notes | Original device editors plus separate account collections and confirmed mutations. No automatic migration between them. | `personal-workspace/`, `connected-workspace/personal-workspace.tsx` |
| Notifications | Restored panel/inbox preview; separate account list and confirmed mark-one-read remain accessible. | `notifications/`, `connected-workspace/account-notifications.tsx` |
| Schedule and tutor sessions | Original calendar/workspace; Account records retains classroom/month selection, owner scheduling, and meeting links. | `schedule/`, `connected-workspace/classroom-sessions.tsx` |
| Meeting Room | Existing category hub and isolated layout/ESL whiteboard previews. Reusable classroom meeting codes open/reuse a host-owned session; enrolled learners resolve the same code. Scheduled-session open/join/end, LiveKit, HTTP room state, names, chat, and own-hand changes remain connected. Previews do not request media or mutate meetings. Host admission/moderation and whiteboard UI are not connected. Live media depends on API/provider/worker configuration. | `meeting-room/meeting-room-view.tsx`, `meeting.service.ts`, [API connection](../API_CONNECTION.md) |
| Other learning/teaching tools | Original layouts, local tools, and disclosed examples are routed again. This restoration does not add server persistence for their unconnected actions. | `src/main.tsx`, original feature components |
| AI | Original draft/example screens are routed; no inference provider or credentials in the browser. | [AI plan](../../OWLIO_AI_IMPLEMENTATION_PLAN.md) |

## Verification

See [API connection](../API_CONNECTION.md) for contract evidence, feature limits, and the distinction between mocked tests, browser reads, and live persistence/media checks. Historical integration checks describe the app at their recorded date, before the original layouts were restored.

[Frontend architecture](frontend.md) | [Product overview](../product/overview.md)
