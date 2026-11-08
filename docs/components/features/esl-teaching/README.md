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

<!-- BEGIN GENERATED PAGE ADAPTERS -->

## Page adapters (`src/pages/`)

Pages only select a view, pass route parameters when needed, or preserve an existing route guard/lazy boundary. Keep component composition, forms, state, and services in the owning feature. These paths are current paths; do not create another `index.tsx` for a shared route.

### `src/pages/dashboard/esl/attendance/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import EslAttendanceView from "@/components/features/esl-teaching/attendance/esl-attendance-view"

export default function EslAttendancePage() {
  return <EslAttendanceView />
}
```

### `src/pages/dashboard/esl/classwork/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import EslActivitiesView from "@/components/features/esl-teaching/activities/esl-activities-view"

export default function EslClassworkPage() {
  return <EslActivitiesView />
}
```

### `src/pages/dashboard/esl/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import EslOverviewView from "@/components/features/esl-teaching/overview/esl-overview-view"

export default function EslPage() {
  return <EslOverviewView />
}
```

### `src/pages/dashboard/esl/learners/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import EslLearnersView from "@/components/features/esl-teaching/learners/esl-learners-view"

export default function EslLearnersPage() {
  return <EslLearnersView />
}
```

### `src/pages/dashboard/esl/lessons/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import { EslLessonPlansView } from "@/components/features/esl-teaching/lesson-plans/esl-lesson-plans-view"

export default function EslLessonsPage() {
  return <EslLessonPlansView />
}
```

### `src/pages/dashboard/esl/materials/index.tsx`

Existing thin adapter (keep its guard, props, or lazy loading when migrating):

```tsx
import EslMaterialContextView from "@/components/features/esl-teaching/materials/esl-material-context-view"

export default function EslMaterialContextPage() {
  return <EslMaterialContextView />
}
```

<!-- END GENERATED PAGE ADAPTERS -->

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
