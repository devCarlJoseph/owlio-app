---
name: owlio-livekit-diagnostics
description: Diagnose and repair Owlio LiveKit connection, media, participant, or room-event lifecycle defects. Use for live-meeting behavior failures; exclude meeting-page styling and scheduling features.
---

# Owlio LiveKit diagnostics

Locate the failing layer before changing meeting behavior. Use the [bug fix SOP](../../../docs/sops/bug-fix.md); use the API SOP only when the HTTP boundary changes.

## Establish reproduction and mode

Identify the role/route, expected action, connection stage, local versus remote symptom, and whether the problem occurs on first join, reconnect, track change, or leave/rejoin. Distinguish a layout preview from a connected room.

Inspect [API mode](../../../src/lib/api-mode.ts), [meeting view](../../../src/components/features/meeting-room/meeting-room-view.tsx), [meeting service](../../../src/services/api/meeting.service.ts), and [participant tile](../../../src/components/features/meeting-room/participant-tile.tsx). API create/join/end and LiveKit media transport are separate boundaries.

Use existing tests, a local reproduction, or an authorized test room. Do not create/end a real user's meeting or request/publish media as a side effect of a layout-only task. Preserve current role permissions; UI wording does not establish host authority.

## Trace the relevant layer

| Symptom | Inspect first |
| --- | --- |
| Cannot create/join | API enablement, session/CSRF result, join response shape, then transport connection failure |
| Connected but missing video/audio | Track publication, subscription and mute state, selected camera/screen source, element attach/detach, autoplay/device failure |
| Duplicated events/messages after rejoin | Room and participant listeners, stable handler cleanup, room instance replacement, message-ID deduplication |
| Stale tiles/hand raises/pinned participant | Participant departure, reconnect/disconnect state transitions, render refresh path |
| Devices remain active after leaving | Room refs, disconnect/unmount cleanup, outstanding join attempts, local-track ownership |

Do not log join tokens, private server credentials, or message content to diagnose transport. Use sanitized error categories and lifecycle timing when needed. Separate confirmed observations from hypotheses.

## Repair lifecycle behavior

- Pair event registration/removal on the same emitter with the same handler reference. Inspect room-level and tile-level effects separately.
- Ensure late joins/events cannot repopulate an obsolete room or unmounted screen. Check the existing refs/effects before adding new state or listeners.
- Match media attach/detach to the active track and element; preserve local playback mute and screen-share contain-fit behavior.
- Preserve coherent UI transitions for connecting, connected, reconnecting, ended, and errors as supported by current source. Failed device activation must not look successful.
- Inspect duplicate-message bounds and transient state cleanup. In-room chat/hand raises do not become persisted discussions or official attendance.
- If SDK semantics remain uncertain, consult official documentation for the installed LiveKit version. Avoid changing backend, network, or deployment policy on a frontend hypothesis.

## Validate and report

Exercise the affected lifecycle transitions, including leave/rejoin or reconnect when relevant. Remote-media claims need multiple isolated participant sessions; a single layout preview or jsdom test cannot prove them. Use mocked events for deterministic cleanup/state regressions and live-room checks only when available and authorized.

Follow [verification](../../../docs/sops/verification.md). Report the failing layer, cause/evidence, lifecycle changes, mocked versus real-room checks, and remaining environment limits.

## Trigger boundaries

- Use: "Remote video disappears after reconnect"; "Each hand raise is handled twice after rejoining."
- Skip: "Restyle the meeting controls from this screenshot"; "Add a tutor appointment calendar." A meeting route alone does not require transport diagnostics.
