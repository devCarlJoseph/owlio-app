# Meeting room component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(meeting-room): add organized meeting source copies`

Target: `src/components/features/meeting-room/`. All destinations below are proposed, not active imports. Apply [folder rules](../sops/component-decomposition.md) without remounting an active call.

| Proposed destination | Current files |
| --- | --- |
| `contents/` | `classroom-meeting-preview.ts`, `coaching-meeting-preview.ts` (labeled sample people only) |
| `ui/` | `audio-track.tsx`, `coaching-meeting-parts.tsx`, `meeting-whiteboard.tsx`, `meeting-room-panels.tsx`, `participant-tile.tsx` |
| `utils/` | `meeting-grid.ts`, `meeting-whiteboard-model.ts` |
| `hooks/` | `use-participant-video.ts` |
| `view/` | `classroom-meeting-screen.tsx`, `coaching-meeting-screen.tsx`, `meeting-room-hub.tsx`, `meeting-room-hub.test.tsx`, `meeting-room-screen.tsx`, `meeting-room-screen.test.tsx`, `meeting-room-view.tsx` |
| Root contract | `meeting-room-types.ts` |

`meeting-room-view.tsx` owns room lifecycle; `meeting-room-screen.tsx` dispatches by category; `coaching-meeting-screen.tsx` and `classroom-meeting-screen.tsx` own different role-specific layouts. Extract cohesive tiles/controls from the screens into `ui/` only after verifying media attachment, track cleanup, pinning and panel focus. Check whether `participant-tile.tsx` and `meeting-room-panels.tsx` still have consumers before moving or removing them. Keep the preview whiteboard disabled in a real connected call until sharing is actually implemented.

When changing imports, update the lazy route adapter in `src/pages/dashboard/classroom/meeting-room.tsx` and the docs/skill references to the meeting view. Verify student ESL/tutor/educator category routing, dashboard chrome restoration, and audio/video lifecycle. A preview is not proof of live presence or saved attendance.

[All feature plans](../component-breakdowns.md)
