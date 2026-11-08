# Schedule component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(schedule): add organized schedule source copies`

Target: `src/components/features/schedule/`. Organize the existing calendar preview, not a fictional scheduling service. [Folder rules](../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `contents/` | `schedule-colors.ts`, `schedule-content.ts` |
| `utils/` | `calendar-dates.ts`, `calendar-dates.test.ts` |
| `ui/` | `calendar-month.tsx`, `calendar-timeline.tsx`, `schedule-day-agenda.tsx`, `schedule-summary.tsx` |
| `view/` | `role-schedule-view.tsx`, `schedule-workspace-view.tsx`, `schedule-workspace-view.test.tsx` |
| Root contract | `schedule-types.ts` |

Move date calculations with their tests before UI. Keep event examples labeled, navigation/filters working, and the create action unavailable until a real persistence contract exists. Do not create a global calendar context for a local view selection.

[All feature plans](../component-breakdowns.md)
