# Classroom directory and learning hub

The four role-prefixed `/{role}/classrooms` directories share the card/list view and classroom detail routes. Student filters derive from each preview class's teaching workspace: School Classes, Tutoring, and ESL. Active previews appear before inactive previews by default. Search includes names, instructors, descriptions, subjects, and categories; no last-visited data is fabricated.

`classroom-preview-data.ts` seeds school, tutoring, and ESL classrooms with one shared learner, Alex Rivera, and sample teaching identities. `classroom-preview-store.ts` holds one record per classroom in memory. `classroom-preview-provider.tsx` connects the existing classroom context to those records only when `API_INTEGRATION_ENABLED` is false. The API setting is unchanged. Preview changes survive client-side role navigation in the same tab, including layout remounts, and reset on a full page refresh. They are not account data or shared between tabs/devices.

Use the classroom preview role links to review the same class as its instructor or enrolled learner. Use `OWL-CONVERSATION` in the student join dialog to enroll in the initially unenrolled ESL conversation club. A new class created in a teaching workspace starts empty and supplies its own demo code. Copy that code, switch to Student preview, and join it to exercise the shared relationship.

Discussion includes teacher-authored featured announcements, member discussions, comments, reactions, chronological sorting, and search/type filters. The supporting column shows future sessions and approaching published classwork deadlines. Schedules use explicitly labeled browser-local preview times. No meeting room or attendance is inferred from a session. Materials are metadata previews; no file storage or upload is implemented.

Published classwork can receive a preview response and teacher-reviewed, explicitly released feedback. Existing quiz components remain preview-only; no automatic official scoring is implemented. Attendance edits are local demonstrations of teacher-controlled records. Tutoring and ESL feedback is not an institutional grade. Private teacher/session notes are outside this feature and are never inserted into the feed.

Student projections remove invite codes, drafts, other learner submissions/attendance/results, and unreleased feedback before rendering. The student member view contains only the instructor and current learner. These preview projections demonstrate the intended UX; production authorization remains the backend's responsibility. Existing connected roster access stays owner-only.

## Backend dependencies

The existing classroom service supports list, create, detail, join by code, and an owner-only student roster. Connected records remain separate from seeds. On API failure, the interface shows an error rather than substituting preview data.

The API's classroom record does not currently include teaching workspace/category, active/inactive lifecycle, instructor display information for joined classes, cover selection, next session, or content summary fields. Connected category is therefore unavailable rather than inferred from a title or URL. A user's role does not establish a class's teaching category.

Discussion publication/replies/reactions, announcement permissions and moderation, classwork/submission/release lifecycle, materials ownership/storage, schedules/timezones, attendance visibility/audit rules, and progress need confirmed backend contracts before the preview operations can become connected features. Featured announcements in this preview are all teacher announcement posts, not a new persistent pinning API. Production student posting and membership visibility are unresolved permissions, explicitly labeled preview assumptions. No endpoints, notification delivery, grade scales, or API roles are added.

## Changed files and validation

All code changes are under `src/components/features/classrooms/`:

- Directory: `classrooms-view.tsx`, `classroom-card.tsx`, `classroom-list-meta.ts`, `classroom-form-dialogs.tsx`.
- Learning hub: `classroom-detail-view.tsx`, `classroom-feed-view.tsx`, `discussion-post.tsx`, `discussion-composer.tsx`.
- Activities and records: `classroom-activity-view.tsx`, `classroom-classwork-view.tsx`, `classroom-records-view.tsx`, `quiz-workspace.tsx`.
- Shared data and context: `classroom-types.ts`, `classroom-prototype-context.ts`, `classroom-prototype-provider.tsx`.
- New preview modules: `classroom-preview-data.ts`, `classroom-preview-store.ts`, `classroom-preview-provider.tsx`, `classroom-preview-notice.tsx`.
- Tests: new `classroom-preview.test.tsx`; `classroom-test-fixtures.tsx` and `classroom-quiz.test.tsx` explicitly select connected mode for existing API tests.
- Documentation: this `CLASSROOM_PREVIEW.md` file.

Validation performed:

- `npx vitest run src/components/features/classrooms --pool=threads`: 44 tests passed across nine files, including eight shared-preview tests.
- `npx eslint src/components/features/classrooms`: passed.
- `npm run build`: passed TypeScript and production bundling; Vite still warns about large chunks.
- `npm run lint`: 13 existing Fast Refresh export errors in untouched UI wrappers (`badge`, `button`, `combobox`, `marker`, `message-scroller`, `navigation-menu`, `tabs`, `toast`, `toggle`). No classroom lint failures.
- `git diff --check`: passed.
- Visual browser verification was attempted but not completed: the in-app browser could not reach the local server, and native browser automation stopped because it could not reliably determine the current URL. Responsive styling and interactive behavior have automated/source checks, but desktop/mobile visual QA remains outstanding.
