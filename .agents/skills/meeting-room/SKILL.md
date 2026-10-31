---
name: meeting-room
description: Build the Owlio classroom meeting-room experience with LiveKit while keeping chat, raised hands, presence, and media permissions safe and clearly scoped.
---

# Meeting Room

Use this skill for the shared, standalone Meeting Room used from the student, educator, ESL teacher, and tutor workflows. The room is a live learning session, not a source of official attendance or a substitute for classroom authorization. See the role plans for navigation and contextual entry: [student](../../../OWLIO_STUDENT__WORKFLOW_PLAN.md), [educator](../../../OWLIO_EDUCATOR_WORKFLOW_PLAN.md), [ESL teacher](../../../OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md), and [tutor](../../../OWLIO_TUTOR_WORKFLOW_PLAN.md).

Follow the [product Meeting Room and whiteboard scope](../../../OWLIO_PRODUCT_PLAN.md#standalone-meeting-room-and-temporary-esl-whiteboard) and the affected role plan's meeting flow/acceptance criteria. Use [owlio-core](../owlio-core/SKILL.md) for shared runtime and record boundaries.

## Current implementation

- The page lives at `src/pages/dashboard/classroom/meeting-room.tsx` and is mounted below each role-prefixed classroom route.
- `src/services/api/meeting.service.ts` preserves create/join/end clients. When enabled and successful, joining returns short-lived LiveKit credentials and `livekit-client` handles media/presence. Check `src/lib/api-mode.ts`: requests are currently paused globally for UI work, so the preserved implementation is not currently enabled connected behavior. Do not change this mode as a side effect of UI work.
- The backend implementation is not in this frontend repository. Confirm its contracts and permissions before adding routes, roles, or server-side behavior.
- Chat and raised hands use small, reliable LiveKit data packets in the connected room. They are transient UI state, not persisted chat or official participation records. Do not claim delivery or retention guarantees.
- Publishing data requires the issued LiveKit token to permit it. Surface a recoverable message when the service rejects a packet; never work around server permissions in the client.
- The attendee list reflects LiveKit's connected participants. It is not an attendance register and must not be used to create official attendance.
- A tutor session should link here only when it is an online session with a valid meeting room. A role-prefixed URL is not permission to create or end a room.

## Interaction and privacy rules

- Keep microphone and camera disabled until the participant explicitly enables them. Request browser permissions only from those controls.
- Derive participant identity and names from the connected room, not from message payloads. Validate and bound every received packet before rendering it.
- Keep chat attached to the active room, clear transient room state when leaving, and do not store chat or tokens in browser storage.
- Participant pinning changes only the current user's layout. It must not be broadcast as a room-wide state change.
- Represent hand-raise state as a request to speak; do not treat it as a permission change or educator approval.
- Never infer classroom membership, host authority, or educator permissions from route prefixes or hidden controls. The backend remains the authorization boundary.
- Do not record, persist, export, or notify about meeting activity unless an approved API and privacy contract supports it.

## ESL whiteboard workflow boundary

The aligned product and ESL plans include a constrained temporary whiteboard inside an authorized, connected ESL Meeting Room. A local preview exists under `src/components/features/esl-teaching/meeting-room/` and is selected through the meeting page's preview query; it does not establish synchronized room behavior or expanded connected scope:

- Limit the initial proposal to teacher-authored built-in prompts/simple objects and learner select/click/circle/mark responses.
- Keep teacher prompts separate from participant responses. Attribute responses using authenticated room identity, not color alone.
- Keep board state temporary and room-scoped. Do not persist, export, replay, grade, notify, or use it to mutate attendance, classwork, feedback, progress, or AI context.
- Do not add uploads, screenshots, or unrestricted freehand drawing to the initial scope. Support keyboard and touch interactions.
- The constrained feature is already included in the aligned workflow priority; connected implementation still requires a realtime contract defining authorization, ordering/deduplication, payload/rate limits, late-join/reconnect synchronization, concurrent actions, and failed-publish behavior. If the current LiveKit packet channel cannot support the contract, agree on a suitable transport first.
- Scope the tool to an authorized ESL teaching session, not simply the viewer's workspace role. Authorized student learners may respond to that session's teacher prompts under room permissions. Do not enable the tool in non-ESL sessions or infer teacher controls from a route prefix or preview role selector.

## UI and accessibility

- Preserve the dashboard header/sidebar rather than covering it with a viewport-fixed meeting or whiteboard container. The shared entry offers Classroom, Tutor, and ESL categories using existing workspace-scoped classes; student category links retain the student prefix. Preview classes are not live rooms. Connected category discovery requires backend teaching-category and linked-meeting fields; retain invite entry without inferring categories or permissions from URLs.

- Match the dashboard's blue, slate, and white palette, Inter typography, and shared spacing/focus conventions. Use amber or rose only for status and destructive states.
- Keep controls keyboard-operable with visible focus, accessible names, pressed state, and concise error feedback.
- Make chat and participant panels usable on narrow viewports; announce newly received messages without moving focus.
- Show only the current LiveKit roster. Do not insert example attendees or activity as if they were real.

## Verification

- Run focused ESLint for changed meeting-room files and `npm run build`.
- Exercise two authorized clients to confirm room roster, data-packet permissions, chat, hand raise/lower, and disconnect cleanup.
- Verify that failed publish attempts remain visible and do not falsely update local hand or chat state.
- Treat cross-client behavior as unverified if no meeting service is available; report it rather than assuming the connection works.
