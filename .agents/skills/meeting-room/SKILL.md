---
name: meeting-room
description: Build the Owlio classroom meeting-room experience with LiveKit while keeping chat, raised hands, presence, and media permissions safe and clearly scoped.
---

# Meeting Room

Use this skill for the shared, standalone Meeting Room used from the student, educator, ESL teacher, and tutor workflows. The room is a live learning session, not a source of official attendance or a substitute for classroom authorization. See the role plans for navigation and contextual entry: [student](../../../OWLIO_STUDENT__WORKFLOW_PLAN.md), [educator](../../../OWLIO_EDUCATOR_WORKFLOW_PLAN.md), [ESL teacher](../../../OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md), and [tutor](../../../OWLIO_TUTOR_WORKFLOW_PLAN.md).

## Current implementation

- The page lives at `src/pages/dashboard/classroom/meeting-room.tsx` and is mounted below each role-prefixed classroom route.
- `src/services/api/meeting.service.ts` creates, joins, and ends meetings through the existing API. Joining returns short-lived LiveKit credentials; `livekit-client` handles media and current room presence.
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

## Proposed ESL whiteboard boundary

The ESL plan proposes a constrained shared whiteboard inside an authorized, connected ESL Meeting Room. It is not part of the current meeting implementation and is not a generic Meeting Room feature:

- Limit the initial proposal to teacher-authored built-in prompts/simple objects and learner select/click/circle/mark responses.
- Keep teacher prompts separate from participant responses. Attribute responses using authenticated room identity, not color alone.
- Keep board state temporary and room-scoped. Do not persist, export, replay, grade, notify, or use it to mutate attendance, classwork, feedback, progress, or AI context.
- Do not add uploads, screenshots, or unrestricted freehand drawing to the initial scope. Support keyboard and touch interactions.
- Do not implement until the owner approves the changed product priority and the realtime contract defines authorization, ordering/deduplication, payload/rate limits, late-join/reconnect synchronization, concurrent actions, and failed-publish behavior. If the current LiveKit packet channel cannot support the contract, agree on a suitable transport first.
- Do not show the whiteboard for students, school educators, or tutors unless a separate role-specific plan approves it.

## UI and accessibility

- Match the dashboard's blue, slate, and white palette, Inter typography, and shared spacing/focus conventions. Use amber or rose only for status and destructive states.
- Keep controls keyboard-operable with visible focus, accessible names, pressed state, and concise error feedback.
- Make chat and participant panels usable on narrow viewports; announce newly received messages without moving focus.
- Show only the current LiveKit roster. Do not insert example attendees or activity as if they were real.

## Verification

- Run focused ESLint for changed meeting-room files and `npm run build`.
- Exercise two authorized clients to confirm room roster, data-packet permissions, chat, hand raise/lower, and disconnect cleanup.
- Verify that failed publish attempts remain visible and do not falsely update local hand or chat state.
- Treat cross-client behavior as unverified if no meeting service is available; report it rather than assuming the connection works.
