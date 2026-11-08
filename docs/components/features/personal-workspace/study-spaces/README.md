# Study Spaces component breakdown

Target: `src/components/features/personal-workspace/study-spaces/`. Keep the existing `detail/` subfeature. These are **proposed** destinations; a move must not change stored spaces, avatar data, 3D interactions, audio cleanup, or fallbacks. Follow the [general guide](../../../../sops/component-decomposition.md).

## Explore/list root

| Proposed destination within `study-spaces/` | Current files |
| --- | --- |
| `forms/` | `create-space-dialog.tsx`, `join-space-dialog.tsx` |
| `ui/` | `city-buildings.tsx`, `city-plaza.tsx`, `city-traffic.tsx`, `room-plan-preview.tsx`, `space-card-grid.tsx`, `space-map-art.tsx`, `space-map.tsx`, `space-map.test.tsx`, `study-hall-world.tsx` |
| `utils/` | `city-layout.ts`, `city-layout.test.ts`, `space-format.ts`, `space-map-layout.ts`, `space-roster.ts`, `traffic-paths.ts`, `traffic-paths.test.ts` |
| `hooks/` | `use-walk-keys.ts` |
| `model/` | `study-spaces-records.ts` (browser-local records) |
| `view/` | `study-spaces-view.tsx`, `study-spaces-flow.test.tsx` |
| `detail/` test | `study-space-room-features.test.ts` -> keep near the room behavior it tests, with `detail/view/` if it exercises the whole screen |

## Room `detail/`

| Proposed destination within `study-spaces/detail/` | Current files |
| --- | --- |
| `forms/` | `character-dialog.tsx` |
| `ui/` | `character-figure.tsx`, `drawer-panel.tsx`, `focus-music-panel.tsx`, `locker-panel.tsx`, `nap-banner.tsx`, `pomodoro-chip.tsx`, `room-chat-panel.tsx`, `room-extras.tsx`, `room-garden.tsx`, `room-zones.tsx`, `seat-panel.tsx`, `space-room-scene.tsx`, `task-board-panel.tsx`, `tv-panel.tsx` |
| `model/` | `drawer-storage.ts`, `room-ambience.ts`, `room-lockers.ts`, `room-tasks.ts`, `room-tv.ts`, `study-space-seats.ts` |
| `audio/` | `focus-music.ts` (Web Audio engine lifecycle, not a pure utility) |
| `hooks/` | `use-focus-music.ts`, `use-pomodoro.ts` |
| `view/` | `study-space-detail-view.tsx`, `study-space-detail.test.tsx` |

The current `study-spaces/{contents,forms,ui,view}/notes.md` files are placeholders, not implementation. Do not use them as proof the component move has already happened.

Split the large Three.js scene only by stable geometry/input ownership; never extract arbitrary JSX if it recreates textures, disposes shared resources, breaks raycast/seating or loses the WebGL fallback. Test navigation in/out, keyboard release, timers/audio cleanup, and preservation of browser-local records. For measured rendering problems follow the Study Spaces performance skill; a directory move is not a performance optimization.

[Personal workspace plans](../README.md)
