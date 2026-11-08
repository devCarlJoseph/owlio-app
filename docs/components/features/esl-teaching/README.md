# ESL teaching component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(esl-teaching): add organized ESL source copies`

Target: `src/components/features/esl-teaching/`. Keep the existing `activities/`, `lesson-plans/`, `meeting-room/`, and other subfeature owners. A single-file subfeature can remain flat until it grows. [Folder rules](../../../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `activities/view/` | `esl-activities-view.tsx` |
| `attendance/view/` | `esl-attendance-view.tsx` |
| `learners/view/` | `esl-learners-view.tsx` |
| `lesson-plans/view/` | `esl-lesson-plans-view.tsx` |
| `materials/view/` | `esl-material-context-view.tsx` |
| `meeting-room/ui/` | `esl-whiteboard-canvas.tsx` |
| `meeting-room/utils/` | `esl-whiteboard-model.ts`, `esl-whiteboard-preview-route.ts` |
| `meeting-room/view/` | `esl-whiteboard-preview.tsx`, `esl-whiteboard-preview.test.tsx` |
| `overview/contents/` | `esl-overview-content.ts` |
| `overview/view/` | `esl-overview-view.tsx` |

The whiteboard canvas and model have separate responsibilities: keep drawing/keyboard handling in UI and pure board operations in utilities. Moving the preview route must not imply shared whiteboard transport, saved activity results, or gradebook data; verify route imports and tests before changing paths. Avoid remounting an active meeting just to reorganize views.

[All feature plans](../../../component-breakdowns.md)

<!-- BEGIN GENERATED CURRENT SOURCE -->

## Current source in `src/components/features/esl-teaching/`

Complete current code for files directly in this folder. These are documentation copies, not proposed replacements; imports still refer to the working source tree.

### Nested feature guides

- [`activities/`](activities/README.md)
- [`attendance/`](attendance/README.md)
- [`learners/`](learners/README.md)
- [`lesson-plans/`](lesson-plans/README.md)
- [`materials/`](materials/README.md)
- [`meeting-room/`](meeting-room/README.md)
- [`overview/`](overview/README.md)

No TypeScript, JavaScript, or CSS source files are directly in this folder.

<!-- END GENERATED CURRENT SOURCE -->
