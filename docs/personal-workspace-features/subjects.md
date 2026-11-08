# Personal subjects

Target: `src/components/features/personal-workspace/subjects/`. All destinations below are proposals.

| Proposed destination | Current files |
| --- | --- |
| `contents/` | `subject-appearance.ts` (display metadata) |
| `forms/` | `subject-composer-dialog.tsx`, `subject-delete-dialog.tsx`, `subject-milestone-delete-dialog.tsx`, `subject-milestone-dialog.tsx` |
| `ui/` | `continue-learning.tsx`, `sample-data-notice.tsx`, `subject-action-button.tsx`, `subject-card.tsx`, `subject-congrats-dialog.tsx`, `subject-list-row.tsx`, `subject-milestones-card.tsx`, `subject-study-content.tsx`, `subjects-hero.tsx` |
| `model/` | `subject-records.ts` (browser-local data) |
| `view/` | `subject-detail-view.tsx`, `subjects-view.tsx`, `subjects-view.test.tsx` |

Separate the large subject detail view's independent panels only after tracing updates and storage revision behavior. Verify editing and deletion against existing local records; changing folders must not discard a student's work.

[Personal workspace plans](README.md)
