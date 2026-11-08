# Progress component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(progress): add organized progress source copies`

Target: `src/components/features/progress/`; `src/components/progress/` is currently only a placeholder and should not receive copies of these screens.

| Proposed destination | Current files |
| --- | --- |
| `ui/` | `classroom-results-section.tsx`, `personal-progress-section.tsx` |
| `view/` | `student-progress-view.tsx`, `student-progress-view.test.tsx` |

Keep browser-local personal progress distinct from official classroom results. No data source or grade should be manufactured by moving a component. Add `contents/` or `context/` only for actual feature-owned content or shared state.

[All feature plans](../component-breakdowns.md)
