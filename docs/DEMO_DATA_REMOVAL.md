# Demo data cleanup

Updated 17 November 2026. This change clears built-in demo records while keeping the existing page layouts, navigation, forms, task columns, room scene and panels. It does not connect additional APIs or change database records.

## Data boundaries for the next integration

| Area | Current data boundary | Existing API entry point |
| --- | --- | --- |
| Study Spaces | `src/components/features/personal-workspace/study-spaces/utils/study-spaces-records.ts`; list view and detail view still read browser-local records. Created/joined/discovery seeds are empty. | `src/services/api/study-space.service.ts`; use account-scoped asynchronous loading in the existing views when integrating. Room membership, presence, lockers and sharing require their own confirmed contracts. |
| Subjects | `src/components/features/personal-workspace/subjects/utils/subject-records.ts`; empty on a clean device. | `src/services/api/personal-workspace.service.ts` |
| Notes | `src/components/features/personal-workspace/notes/utils/note-records.ts`; empty on a clean device. | `src/services/api/personal-workspace.service.ts` |
| Tasks | `src/components/features/personal-workspace/tasks/utils/task-records.ts`; empty board, same three columns and creation controls. | `src/services/api/personal-workspace.service.ts` |
| Study Library | `src/components/features/materials/utils/library-records.ts`; empty resource collection. Existing personal editor files remain separate. | `src/components/features/connected-workspace/hooks/use-connected-library.ts` and confirmed material operations in `src/services/api/contract-client.ts` |
| Classwork collection | `src/components/features/personal-workspace/classwork/contents/sample-classwork.ts`; empty collection, original view retained. | `src/services/api/classwork-workspace.service.ts`; classroom ownership and learner scope must be retained. |
| Calendar | `src/components/features/schedule/contents/schedule-content.ts`; fictional events and example switch removed, calendar retained. | `src/services/api/meeting.service.ts`; the separate connected session workflow remains available. |
| Notifications | Example collection and switch removed; connected classroom mentions are unchanged. | `src/services/api/personal-workspace.service.ts`; existing separate account view remains. |
| Meeting layouts | Participant collections and authored whiteboard seeds start empty; layout and board controls retained. | Existing meeting services and LiveKit remain unchanged; preview layouts do not become live meetings. |

Keep real API errors distinct from empty responses. Do not use these empty initial collections as fallback success after failed API calls. Existing account views remain separate via `?source=account`; default page layouts are unchanged.

## Existing browser data

`src/lib/local-demo-records.ts` recognizes untouched legacy seeds using their original ID and a stable content fingerprint. Edited seeds and user-created records remain visible. Reading hides untouched seeds without writing storage. Before the next normal save removes them, the original serialized collection is retained under `<original-key>.before-demo-removal`. The backup is written once and is never replaced by this cleanup. Backup failure or malformed stored data prevents overwriting the original. Existing storage keys and record formats are unchanged.

The affected keys are `owlio.student-subjects.v1`, `owlio.student-notes.v1`, `owlio.student-tasks.v1`, `owlio.student-study-spaces.v1`, and `owlio.study-space-tasks.v1.<spaceId>`. No user-origin storage was cleared during verification. Synthetic data used by UI tests is isolated in test fixture modules and is not imported by application code.

## Verification

- Production build (TypeScript and Vite): passed; existing chunk-size warnings remain.
- Demo-removal/storage and original-UI regression checks: 10 passed.
- Broader affected UI suites: 233 passed; four city-layout assertions initially relied on removed app seeds. After switching those tests to explicit fixtures, the focused city-layout/traffic/progress rerun passed 18 tests.
- Full lint: 13 existing `react-refresh/only-export-components` errors in unchanged shared UI wrappers. The changed runtime/tests have no remaining reported lint errors.
- `git diff --check`: passed.
- Browser verification was attempted: protected routes required sign-in; an isolated component harness could not connect to the temporary local Vite server (connection timeout). Visual and narrow-layout inspection remain unverified. The temporary harness and server were removed/stopped.
- No live API/database writes, commits, pushes or deployments were performed.

## Files to stage

Run from the repository root. This command stages only the files belonging to this cleanup:

```powershell
$demoCleanupFiles = @(
  'docs/DEMO_DATA_REMOVAL.md'
  'docs/architecture/capability-status.md'
  'src/components/features/esl-teaching/meeting-room/tests/esl-whiteboard-preview.test.tsx'
  'src/components/features/esl-teaching/meeting-room/utils/esl-whiteboard-model.ts'
  'src/components/features/materials/tests/student-library-subject-view.test.tsx'
  'src/components/features/materials/tests/student-library-view.test.tsx'
  'src/components/features/materials/ui/resource-source-filter.tsx'
  'src/components/features/materials/utils/library-records.ts'
  'src/components/features/materials/view/student-library-source-view.tsx'
  'src/components/features/materials/view/student-library-view.tsx'
  'src/components/features/meeting-room/tests/meeting-room-screen.test.tsx'
  'src/components/features/meeting-room/utils/classroom-meeting-preview.ts'
  'src/components/features/meeting-room/utils/coaching-meeting-preview.ts'
  'src/components/features/meeting-room/utils/meeting-whiteboard-model.ts'
  'src/components/features/meeting-room/view/coaching-meeting-screen.tsx'
  'src/components/features/notifications/contents/notifications-examples.ts'
  'src/components/features/notifications/tests/notification-fixtures.ts'
  'src/components/features/notifications/tests/notifications.test.tsx'
  'src/components/features/notifications/ui/notifications-inbox.tsx'
  'src/components/features/notifications/ui/notifications-panel.tsx'
  'src/components/features/personal-workspace/classwork/contents/sample-classwork.ts'
  'src/components/features/personal-workspace/notes/contents/note-records.ts'
  'src/components/features/personal-workspace/notes/tests/notes-view.test.tsx'
  'src/components/features/personal-workspace/notes/utils/note-records.ts'
  'src/components/features/personal-workspace/study-spaces/detail/tests/study-space-detail.test.tsx'
  'src/components/features/personal-workspace/study-spaces/detail/utils/room-lockers.ts'
  'src/components/features/personal-workspace/study-spaces/detail/utils/room-tasks.ts'
  'src/components/features/personal-workspace/study-spaces/tests/city-layout.test.ts'
  'src/components/features/personal-workspace/study-spaces/tests/space-map.test.tsx'
  'src/components/features/personal-workspace/study-spaces/tests/study-space-room-features.test.ts'
  'src/components/features/personal-workspace/study-spaces/tests/study-spaces-flow.test.tsx'
  'src/components/features/personal-workspace/study-spaces/tests/traffic-paths.test.ts'
  'src/components/features/personal-workspace/study-spaces/utils/space-roster.ts'
  'src/components/features/personal-workspace/study-spaces/utils/study-spaces-records.ts'
  'src/components/features/personal-workspace/subjects/tests/subjects-view.test.tsx'
  'src/components/features/personal-workspace/subjects/ui/sample-data-notice.tsx'
  'src/components/features/personal-workspace/subjects/utils/subject-records.ts'
  'src/components/features/personal-workspace/tasks/tests/tasks-view.test.tsx'
  'src/components/features/personal-workspace/tasks/utils/task-records.ts'
  'src/components/features/personal-workspace/tasks/view/tasks-view.tsx'
  'src/components/features/personal-workspace/tests/demo-free-workspaces.test.tsx'
  'src/components/features/progress/tests/student-progress-view.test.tsx'
  'src/components/features/schedule/contents/schedule-content.ts'
  'src/components/features/schedule/tests/schedule-workspace-view.test.tsx'
  'src/components/features/schedule/view/schedule-workspace-view.tsx'
  'src/lib/local-demo-records.test.ts'
  'src/lib/local-demo-records.ts'
  'src/test/classroom-meeting-fixture.ts'
  'src/test/coaching-meeting-fixture.ts'
  'src/test/esl-whiteboard-fixture.ts'
  'src/test/legacy-demo-fixtures.ts'
  'src/test/meeting-whiteboard-fixture.ts'
  'src/test/room-locker-fixture.ts'
  'src/test/room-roster-fixture.ts'
  'src/test/room-task-fixtures.ts'
)
git add -- $demoCleanupFiles
```

Commit message:

```text
fix: remove workspace demo data while preserving existing UI
```
