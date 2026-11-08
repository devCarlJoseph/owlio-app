# Page adapters for feature views

`src/main.tsx` registers URLs and auth/role boundaries; `src/pages/` contains route adapters; `src/components/features/` owns view composition, UI, forms, context, and behavior. A folder under `features/` does **not** automatically need its own page. Use the [mirrored feature guides](features/README.md): each domain README has a **Page adapters** section naming the exact current `src/pages/...` files and showing their complete, short adapter code. Shared pages are listed once under their owning feature, even when multiple roles use the route.

## What belongs in a page

For a basic route, add only a view import and default page export, as in the existing `src/pages/dashboard/classroom/index.tsx`:

```tsx
import { ClassroomsView } from "@/components/features/classrooms/classrooms-view"

export default function ClassroomsPage() {
  return <ClassroomsView />
}
```

The page may pass a **route-specific prop** (for example, `src/pages/dashboard/educators/classwork/index.tsx` passes `role="educators"`), read a path parameter required by the view, or keep an existing guard. Keep validation, fetches, card grids, dialogs, local storage, media effects, and sample data in the owning feature rather than adding them to an `index.tsx`.

There is no need to invent an `index.tsx` for every subfeature. The existing `src/pages/dashboard/classroom/index.tsx`, `detail.tsx`, and `activity.tsx` all render views owned by the same `classrooms/` feature. Student materials have distinct page adapters for source and subject routes because those URLs pass different route context to shared materials views.

## Preserve boundaries

- `src/pages/dashboard/classroom/meeting-room.lazy.tsx` and `src/pages/dashboard/students/study-spaces/detail/lazy.tsx` preserve lazy-loading boundaries. Their paired entry adapters render or re-export the feature view; `src/main.tsx` owns the Suspense fallback. Do not replace a lazy entry with a direct import just to make the adapter shorter.
- `src/pages/onboarding/index.tsx` keeps `RequireOnboarding` around `OnboardingView`. `src/pages/dashboard/layout.tsx` is the shared shell/provider boundary, **not** a one-view adapter.
- Reorganizing a feature under `view/` requires updating its actual page import and tests in the same future runtime change. The source paths shown in the per-feature guide are **current** paths, not proof that proposed destinations exist.

## Inline-page exceptions

The following current page files contain UI rather than only a feature view. Their feature READMEs show a **future-only** five-line page adapter; those imports do not exist yet. Extract and test the view first, then replace the inline page without altering role or data boundaries:

| Existing page | Future view owner to evaluate |
| --- | --- |
| `src/pages/dashboard/materials/index.tsx` | `materials/` (role-aware materials landing) |
| `src/pages/dashboard/progress/index.tsx` | `progress/` (shared progress placeholder) |
| `src/pages/dashboard/communication/index.tsx` | `communication/` (currently an empty feature directory) |
| `src/pages/dashboard/educators/attendance/index.tsx` | `attendance/` (currently an empty feature directory) |

`src/pages/dashboard/educators/learners/index.tsx` is also inline, but its feature owner has not been established; do not silently assign it to an unrelated overview. `src/pages/dashboard/ai-assistant/index.tsx` has no feature-owned view or connected generation workflow. `src/pages/App.tsx` is an unused placeholder. Keep these cases explicit rather than documenting nonexistent imports as working code.

All examples here describe source as it exists today unless marked **future-only**. These guides change documentation, not runtime page behavior.

[Frontend architecture](../architecture/frontend.md) | [Feature breakdown index](../component-breakdowns.md)
