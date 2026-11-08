# Teaching activities breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(teaching-activities): add teaching activity source copies`

Target: `src/components/features/teaching-activities/`. This shared teaching feature is used across educator, ESL, and tutor contexts; preserve their audience and terminology. [Folder rules](../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `forms/` | `activity-composer.tsx` |
| `ui/` | `activity-collection.tsx`, `activity-details.tsx` |
| `model/` | `activity-workspace-model.ts` |
| `view/` | `teaching-activities-view.tsx`, `teaching-activities.test.tsx` |

Keep preview authoring/review behavior separate from connected classroom records and published learner feedback. Check the existing classroom provider dependency before moving the view; a failing test without its provider is a test-setup issue, not a reason to fabricate activity data.

[All feature plans](../component-breakdowns.md)
