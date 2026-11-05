# Capability status

Source review: 3 November 2026. This is a navigation aid, not a live-environment certification. Recheck the affected source and runtime flag before implementation. Historical plans and integration reports can describe an earlier snapshot.

## Current operating mode

[api-mode.ts](../../src/lib/api-mode.ts) currently sets `API_INTEGRATION_ENABLED = false`. Auth guards allow registered-page previews and API-backed actions are paused. This setting also affects built bundles. Preserve it unless changing integration mode is part of the request.

Connected clients remain implemented, but their existence does not prove a deployed backend is available. Browser-local tools and tab-memory previews have their own behavior while API integration is paused.

## Capability map

| Area | Implemented path and current limits | Evidence to inspect |
| --- | --- | --- |
| Authentication and account security | API-backed forms, cookie/CSRF session flow, Google callback/linking, and role guards; paused by global mode. Onboarding is local, not a saved profile. | [Auth access](../AUTH_ROUTE_ACCESS.md), [auth service](../../src/services/api/auth.service.ts), `src/components/features/auth/` |
| Classroom list/create/join/detail/owner roster | API clients and connected provider exist. Global preview mode selects a separate in-memory example provider. One-time connected join codes stay in memory. | [Connected provider](../../src/components/features/classrooms/classroom-prototype-provider.tsx), [preview provider](../../src/components/features/classrooms/classroom-preview-provider.tsx), [integration details](../CLASSROOM_API_INTEGRATION.md) |
| Classroom activities, discussions, attendance, and results | Preview provider supports selected illustrative interactions that reset on reload. Connected mode leaves unsupported operations unavailable. | `src/components/features/classrooms/` |
| Educator/ESL/tutor activities | Shared preview authoring/review reads the classroom preview store. No activity/submission API or account save; connected mode shows unavailable services. | [Teaching activities](../../src/components/features/teaching-activities/teaching-activities-view.tsx) |
| Standalone Meeting Room | API create/join/end clients and LiveKit media/presence exist; API mode pauses connection actions. Layout preview does not establish a connected call. All in-call views hide the dashboard chrome. Design follows the workspace; students follow the `category` URL parameter (esl/tutors → coaching design, otherwise the Meet-style classroom design). Layout previews show labeled sample participants. The ESL/tutor "find the shape" whiteboard (teacher/student switch; student-only for students) lives in tab memory only, is not synced or saved, and is disabled in live rooms. Chat/hand raises are transient. | [Meeting view](../../src/components/features/meeting-room/meeting-room-view.tsx), [meeting service](../../src/services/api/meeting.service.ts) |
| ESL whiteboard | Existing preview is not evidence of synchronized multi-user transport or persistence. | `src/components/features/esl-teaching/meeting-room/` |
| Student subjects, tasks, and notes | Browser-local editing and example content; not account-synced, classroom assignments, or official records. | `src/components/features/personal-workspace/{subjects,tasks,notes}/` |
| Personal document/presentation editors | Browser-local files with revision/save recovery and Owlio JSON backup; no Google sync or DOCX/PPTX integration. | [Work records](../../src/components/features/materials/workspace/work-records.ts), `src/components/features/materials/workspace/` |
| Study Spaces | Browser-local records, discovery examples, and 3D hall/room interactions; not a confirmed multi-user collaboration service. | [Space records](../../src/components/features/personal-workspace/study-spaces/study-spaces-records.ts), `src/components/features/personal-workspace/study-spaces/` |
| Student personal progress | Read-only summaries of existing local personal tasks. Official classroom results require a service; no implied grade/attendance sync. | [Student progress](../../src/components/features/progress/student-progress-view.tsx) |
| Calendar/schedule | Date navigation, filters, and optional fictional examples. Saved scheduling is unavailable. | [Schedule view](../../src/components/features/schedule/schedule-workspace-view.tsx) |
| AI assistance | Informational/unavailable UI; no model generation service. Student generation remains gated. | [Shared AI page](../../src/pages/dashboard/ai-assistant/index.tsx), [AI plan](../../OWLIO_AI_IMPLEMENTATION_PLAN.md) |
| Other role tools, notifications, announcements, materials, and insights | Mixed scaffolds/previews; inspect each view. A menu entry or rendered card does not establish delivery, uploads, saved notes, analytics, or account persistence. | Corresponding `src/components/features/` view and `src/services/api/` |

## How to update status

Record the affected capability's data source, persistence scope, operating mode, and unavailable actions. Link to source or a confirmed contract. Keep implementation, configuration, and live verification separate: a mocked test establishes client behavior, not deployment readiness.

The classroom integration report describes connected-mode behavior. The current source also contains a separate preview provider; it must not be mistaken for either live classroom records or an API-error fallback.

[Frontend architecture](frontend.md) | [Product overview](../product/overview.md)
