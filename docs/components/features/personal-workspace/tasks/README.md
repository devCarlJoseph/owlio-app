# Personal tasks

Target: `src/components/features/personal-workspace/tasks/`. Proposed destinations:

| Folder | Current files |
| --- | --- |
| `forms/` | `task-composer-dialog.tsx`, `task-delete-dialog.tsx` |
| `ui/` | `task-board.tsx`, `task-detail-dialog.tsx`, `task-list.tsx`, `task-subject-groups.tsx` |
| `model/` | `task-records.ts` |
| `view/` | `tasks-view.tsx`, `tasks-view.test.tsx` |

The detail dialog delegates status/edit actions to the view; keep its keyboard focus return and error/retry behavior when extracting components. Personal task completion is not a grade or an assigned classroom submission.

[Personal workspace plans](../README.md)
