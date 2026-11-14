# Capability status

Source review: 14 November 2026. Source and configuration establish implementation; browser reads and mocked tests establish different verification scopes.

## Operating mode

The routed application is API-only. Auth/session and role guards always run. The compatibility export in `src/lib/api-mode.ts` is true; it no longer controls the guards or providers. There is no preview bypass, sample-data fallback, or local onboarding route.

`ApiWorkspaceContent` renders connected features and blocks older local/sample screens from mounting. Existing browser-local work remains in storage without automatic import or deletion. Unconnected destinations show an unavailable state.

## Capability map

| Area | Current routed behavior | Evidence |
| --- | --- | --- |
| Authentication and account security | Cookie/CSRF-backed forms, session refresh, Google callback/linking and API-derived role guards. `/onboarding` redirects to registration. | [Auth access](../AUTH_ROUTE_ACCESS.md), `src/components/features/auth/`, `src/services/api/auth.service.ts` |
| Overview | Server identity and classroom list/count; no sample metrics. | `connected-workspace/api-workspace-content.tsx` |
| Classrooms | API list/create/join/detail and owner roster; account cleanup and one-time invite codes in memory. | [Classroom integration](../CLASSROOM_API_INTEGRATION.md) |
| Student subjects/tasks/notes | Account collections and confirmed mutations, including versioned edits and task transitions. Existing local records are retained but not read or imported. | `connected-workspace/personal-workspace.tsx`, `personal-workspace.service.ts` |
| Notifications | API list and mark-one-read across roles; header links to the same connected inbox. | `connected-workspace/account-notifications.tsx` |
| Schedule and tutor sessions | Classroom-scoped calendar window with pagination; owner scheduling and meeting links. | `connected-workspace/classroom-sessions.tsx`, `meeting.service.ts` |
| Meeting Room | Scheduled-session open/join/end with LiveKit media; HTTP room state, names, latest chat and own-hand changes. Requires backend flag/provider/session eligibility. No layout or whiteboard previews. Host admission/moderation and whiteboard UI are not connected. | `meeting-room/meeting-room-view.tsx`, `meeting.service.ts`, [API connection](../API_CONNECTION.md) |
| Other learning/teaching tools | Unavailable in the routed app until their frontend integration is implemented. This includes study spaces, materials/editors, classwork, discussions, academic records, teaching plans and profile/settings. Backend source may already contain corresponding routes. | `connected-workspace/api-workspace-content.tsx` |
| AI | Unavailable. No inference provider or credentials in the browser. | [AI plan](../../OWLIO_AI_IMPLEMENTATION_PLAN.md) |

## Verification

See [API connection](../API_CONNECTION.md) for contract evidence, feature limits, and the distinction between mocked tests, browser reads, and live persistence/media checks. Older component guides and dated reports may describe retired previews or local tools; they do not override the current route boundary.

[Frontend architecture](frontend.md) | [Product overview](../product/overview.md)
