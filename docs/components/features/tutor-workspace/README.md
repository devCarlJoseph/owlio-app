# Tutor workspace component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(tutor-workspace): add organized tutor workspace source copies`

Target: `src/components/features/tutor-workspace/`. The role-specific views remain adapters to shared features; do not duplicate whole classroom, meeting-room, notifications, or activities implementations in this folder. [Folder rules](../../../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `ui/` | `tutor-workspace-ui.tsx` |
| `view/` | `tutor-workspace.test.tsx` (keep beside its eventual shared view/fixture) |
| `activities/view/` | `tutor-activities-view.tsx` |
| `ai/view/` | `tutor-ai-assistant-view.tsx` |
| `attendance/view/` | `tutor-attendance-view.tsx` |
| `communication/view/` | `tutor-announcements-view.tsx`, `tutor-discussions-view.tsx` |
| `learners/view/` | `tutor-learner-detail-view.tsx`, `tutor-learners-view.tsx` |
| `learning-plans/view/` | `learning-plans-view.tsx` |
| `materials/view/` | `tutor-materials-view.tsx` |
| `notes/view/` | `tutor-session-notes-view.tsx` |
| `notifications/view/` | `tutor-notifications-view.tsx` |
| `overview/contents/`, `overview/view/` | `tutor-overview-content.ts` -> contents; `tutor-overview-view.tsx` -> view |
| `progress/view/` | `tutor-student-progress-view.tsx` |
| `sessions/view/` | `tutor-sessions-view.tsx` |
| `settings/view/` | `tutor-settings-view.tsx` |

Small one-file subfeatures may stay flat until they genuinely need a folder. Keep private tutor notes separate from learner-visible feedback. A view under a tutor URL does not grant educator permissions; follow data ownership and tests before moving shared imports.

[All feature plans](../../../component-breakdowns.md)
