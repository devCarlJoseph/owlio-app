# Onboarding component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(onboarding): add organized onboarding source copies`

Target: `src/components/features/onboarding/`. Paths below are proposals; keep existing step identity and validation intact. [Folder rules](../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `contents/` | `onboarding.constants.ts` (check whether a constant is a validation rule before moving it) |
| `forms/` | `onboarding.schema.ts` |
| `educator/forms/` | `educator-details-step.tsx` |
| `entity-select/forms/`, `entity-select/ui/` | `entity-select-step.tsx` -> forms; `entity-card.tsx` -> ui |
| `others/forms/` | `others-details-step.tsx` |
| `profile-basics/forms/` | `profile-basics-step.tsx` |
| `review/forms/` | `review-step.tsx` |
| `student/forms/` | `student-details-step.tsx` |
| `shared/ui/` | `choice-checkbox-group.tsx`, `field-error.tsx`, `onboarding-layout.tsx`, `onboarding-stepper.tsx`, `optional-badge.tsx`, `step-actions.tsx`, `tag-input.tsx` |
| `completed/view/` | `onboarding-completed.tsx` |
| `view/` | `onboarding-view.tsx`, `onboarding-view.test.tsx` |
| Root contract | `onboarding.types.ts` |

The plan preserves existing nested step directories (`educator`, `student`, `others`, etc.) and adds a folder inside each, rather than moving every step into one root `forms/`. Do not create both copies. Onboarding choices are browser-local and do not assign authenticated roles; keep completion messaging honest.

[All feature plans](../component-breakdowns.md)
