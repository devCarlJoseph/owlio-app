# Component breakdown: a manual migration guide

This is a **proposal, not an implemented tree**. Use it to reorganize one feature at a time. No import paths, runtime code, providers, or stored records should change just because this guide exists. The folder example in [Notes](../../src/components/features/personal-workspace/notes/) is the starting point; do not create empty directories simply to match a screenshot. For separate manuals within each docs feature folder, use the [per-feature breakdown index](../component-breakdowns.md); the inventories below are an overview, and the per-feature manuals are the place to maintain future file-by-file decisions.

Read [AGENTS.md](../../AGENTS.md), [frontend architecture](../architecture/frontend.md), and [verification](verification.md) before making a migration. Specialized skills apply only when the work actually changes their domain (for example, local storage, API integration, or LiveKit behavior). Routes in `src/pages/` remain thin adapters.

## Folder contract

Within `src/components/features/<feature>/`, or within a meaningful subfeature such as `auth/login/`:

| Folder | Put here | Do not put here |
| --- | --- | --- |
| `contents/` | Static copy, display metadata, labeled preview fixtures | Live records, API responses, editable state |
| `forms/` | Form controls, editing dialogs, validation schemas | Service clients or unrelated dialogs |
| `ui/` | Feature-specific cards, tiles, panels, visual controls | Route orchestration or domain-neutral primitives |
| `utils/` | Pure calculations, formatting, model helpers | Storage writes, effects hidden in a pure helper |
| `view/` | Screens, route composition, lifecycle orchestration | Generic primitives used by other domains |
| `context/` (only if needed) | Domain-owned provider, hook, store with a clear mount boundary | A global bucket for unrelated state |

Keep shared domain contracts in `<feature>/<feature>-types.ts` or a clearly named domain model at the feature root. Optional `hooks/` is better than calling a stateful hook a pure utility; optional `tests/` can hold fixtures, while behavioral tests stay next to the file they test. Reuse `src/components/ui/` for domain-neutral controls; keep HTTP in `src/services/api/` and genuinely cross-domain helpers in `src/lib/`. Do not move private classroom state into a global context. Use `@/*` for imports crossing feature boundaries.

**Not every folder is necessary.** Small or placeholder domains can stay flat. Keep existing subfeature boundaries (`auth/login`, `personal-workspace/subjects`, `study-spaces/detail`) and apply this pattern *inside* them when it makes debugging easier.

## Detailed example: `features/classrooms`

The existing `classrooms/` root is flat. Proposed destinations for every source file (relative to `src/components/features/classrooms/`; the names below describe files as they exist **now**, not paths that work yet):

| Target | Current files |
| --- | --- |
| `context/` | `classroom-prototype-context.ts`, `classroom-prototype-provider.tsx`, `classroom-preview-provider.tsx`, `classroom-preview-store.ts` |
| `contents/` | `classroom-covers.ts`, `classroom-list-meta.ts`, `classroom-preview-data.ts`, `discussion-reaction-data.ts` |
| `forms/` | `chat-composer.tsx`, `classroom-form-dialogs.tsx`, `discussion-composer.tsx`, `quiz-timer-settings.tsx` |
| `ui/` | `chat-header.tsx`, `chat-message-bubble.tsx`, `classroom-card.tsx`, `classroom-list-ui.tsx`, `classroom-preview-notice.tsx`, `classroom-ui.tsx`, `discussion-post.tsx`, `discussion-reactions.tsx`, `discussion-text.tsx`, `quiz-countdown.tsx`, `quiz-leaderboard.tsx`, `quiz-questions.tsx`, `quiz-result-card.tsx`, `quiz-timing-badges.tsx` |
| `utils/` | `classroom-utils.ts`, `quiz-answers.ts`, `quiz-timing.ts` |
| `hooks/` | `use-now.ts` |
| `view/` | `classroom-activity-view.tsx`, `classroom-chat-view.tsx`, `classroom-classwork-view.tsx`, `classroom-detail-view.tsx`, `classroom-feed-view.tsx`, `classroom-members-view.tsx`, `classroom-records-view.tsx`, `classrooms-view.tsx`, `quiz-workspace.tsx` |
| `tests/` (fixtures only) | `classroom-test-data.ts`, `classroom-test-fixtures.tsx` |
| Keep at domain root | `classroom-types.ts` |
| Next to the behavior tested | `classroom-chat.test.tsx` (chat view), `classroom-detail-tabs.test.tsx` (detail view), `classroom-discussion.test.tsx` (feed), `classroom-members-view.test.tsx` (members view), `classroom-preview.test.tsx` (preview context), `classroom-quiz.test.tsx` (quiz view), `classrooms-view-accessibility.test.tsx` and `classrooms-view.test.tsx` (list view), `quiz-timing.test.ts` (timing utility) |

Do not combine the connected provider and preview provider into one implicit data source. Keep the existing provider scope and the student/educator authorization boundary. `classroom-preview-store.ts` may contain stateful behavior: keep it in `context/`, not `contents/`. Check actual exports before moving `classroom-ui.tsx` or `classroom-list-ui.tsx`; split those files into named units only when their responsibilities really differ.

For a first manual slice, move `classrooms-view.tsx` and its two list-view tests to `view/`, then update the importing page and local imports. Run those tests before moving the next slice. When moving `classroom-prototype-context.ts` and its provider later, update the layout's provider import **without changing where it mounts**. In a debugger, follow `view/classrooms-view.tsx` -> `context/classroom-prototype-context.ts` -> connected or preview provider -> service/store; do not assume the URL grants classroom access.

## All other features: proposed destinations

In the lists below, each heading is the **current** directory relative to `src/components/features/`. Entries are current filenames grouped by **proposed** child folder. These are migration checklists, not claims that the destinations exist. Keep tests with the behavior indicated by the test name; no need for empty `forms/` or `context/` directories.

### `auth/`

- `context/`: `auth-session-context.ts`, `auth-session-provider.tsx`, `auth-session-provider.test.tsx`.
- `view/` (route guards and boundary): `no-workspace-view.tsx`, `require-auth.tsx`, `require-guest.tsx`, `require-role.tsx`, `session-boundary.tsx`, `preview-route-access.test.tsx`, `route-guards.test.tsx`.
- `account-security/view/`: `account-security-view.tsx`.
- `email-verification/forms/`: `email-verification.schema.ts`, `email-verification.schema.test.ts`, `resend-verification-form.tsx`, `verification-code-form.tsx`; `email-verification/view/`: `email-verification-view.tsx`.
- `forgot-password/forms/`: `forgot-password-form.tsx`, `forgot-password.schema.ts`; `forgot-password/view/`: `forgot-password-view.tsx`.
- `google/view/`: `google-oauth-callback-view.tsx`, `google-oauth-callback-view.test.tsx`.
- `login/forms/`: `login-form.tsx`, `login.schema.ts`; `login/view/`: `login-view.tsx`.
- `password-reset/forms/`: `password-reset-form.tsx`, `password-reset.schema.ts`; `password-reset/view/`: `password-reset-view.tsx`.
- `register/forms/`: `account-type-selector.tsx`, `register-form.tsx`, `register.schema.ts`; `register/view/`: `register-view.tsx`.
- `shared/contents/`: `auth-showcase-content.ts`.
- `shared/utils/`: `auth-input-styles.ts`, `development-action-path.ts`, `password-rules.ts`.
- `shared/ui/`: `auth-brand-panel.tsx`, `auth-feedback.tsx`, `auth-form-actions.tsx`, `auth-layout.tsx`, `auth-password-input.tsx`, `auth-preview-controls.tsx`, `auth-showcase-layout.tsx`, `auth-showcase.tsx`, `auth-split-layout.tsx`, `auth-status-page.tsx`, `google-auth-button.tsx`, `google-auth-button.test.tsx`, `owlio-owl.tsx`, `password-field.tsx`, `password-guidance.tsx`, `session-expired-state.tsx`.

Auth is a cross-route **feature**, not a generic global state bucket. Keep `AuthSessionProvider` mounted where it currently restores and clears sessions; preserve cookie/CSRF, redirects, and auth tests.

### `dashboard-overview/`, `educator-overview/`

- `dashboard-overview/ui/`: `overview-identity-card.tsx`, `overview-sidebar.tsx`, `overview-summary.tsx`, `overview-workspaces.tsx`.
- `dashboard-overview/view/`: `dashboard-overview.tsx`, `dashboard-overview.test.tsx`; root contract: `overview-types.ts`.
- `educator-overview/contents/`: `educator-overview-content.ts`; `educator-overview/view/`: `educator-overview-view.tsx`.

### `esl-teaching/`

Keep existing subfeatures; each single-file route view can stay flat until it grows:

- `activities/view/`: `esl-activities-view.tsx`; `attendance/view/`: `esl-attendance-view.tsx`; `learners/view/`: `esl-learners-view.tsx`; `lesson-plans/view/`: `esl-lesson-plans-view.tsx`; `materials/view/`: `esl-material-context-view.tsx`.
- `meeting-room/ui/`: `esl-whiteboard-canvas.tsx`; `meeting-room/utils/`: `esl-whiteboard-model.ts`, `esl-whiteboard-preview-route.ts`; `meeting-room/view/`: `esl-whiteboard-preview.tsx`, `esl-whiteboard-preview.test.tsx`.
- `overview/contents/`: `esl-overview-content.ts`; `overview/view/`: `esl-overview-view.tsx`.

Whiteboard transport and preview-only state must remain distinct. Moving canvas files must not remount an active LiveKit call.

### `materials/`

- `forms/`: `library-search-field.tsx`, `resource-source-filter.tsx`.
- `ui/`: `library-category-row.tsx`, `library-context-cards.tsx`, `library-gallery-card.tsx`, `library-theme.module.css` (scoped visual styles), `resource-card.tsx`, `resource-list-row.tsx`, `resource-list.tsx`.
- `view/`: `student-library-source-view.tsx`, `student-library-subject-view.tsx`, `student-library-subject-view.test.tsx`, `student-library-view.tsx`, `student-library-view.test.tsx`.
- Split `library-records.ts`: move `previewLibraryResources` and display metadata to `contents/`; move filtering, grouping, slug helpers to `utils/`. Keep a compatibility export at the old path until every consumer is migrated. Root contract: `library-types.ts`.
- `workspace/view/`: `document-editor.tsx`, `library-workspace-view.tsx`, `library-workspace.test.tsx`, `personal-library-work.tsx`, `presentation-editor.tsx`.
- `workspace/model/`: `work-drafts.ts`, `work-records.ts`. Keep revision recovery and browser-local storage formats unchanged.

### `meeting-room/`

- `contents/`: `classroom-meeting-preview.ts`, `coaching-meeting-preview.ts` (sample data only).
- `ui/`: `audio-track.tsx`, `coaching-meeting-parts.tsx`, `meeting-whiteboard.tsx`, `meeting-room-panels.tsx`, `participant-tile.tsx`.
- `utils/`: `meeting-grid.ts`, `meeting-whiteboard-model.ts`; `hooks/`: `use-participant-video.ts`.
- `view/`: `classroom-meeting-screen.tsx`, `coaching-meeting-screen.tsx`, `meeting-room-hub.tsx`, `meeting-room-hub.test.tsx`, `meeting-room-screen.tsx`, `meeting-room-screen.test.tsx`, `meeting-room-view.tsx`.
- Root contract: `meeting-room-types.ts`. Check whether the legacy `participant-tile.tsx` and `meeting-room-panels.tsx` still have consumers **before** deciding to keep or remove them.

Keep the `MeetingRoomView` route adapter import, category routing, active-call component identity, track cleanup, and sample-versus-live behavior intact.

### `notifications/`

- `contents/`: `notifications-content.ts`, `notifications-examples.ts`.
- `ui/`: `notification-filters.tsx`, `notification-item.tsx`, `notification-list.tsx`, `notifications-inbox.tsx`, `notifications-panel.tsx`, `notifications-state.tsx`, `notifications-trigger.tsx`.
- `view/`: `notifications-view.tsx`, `notifications.test.tsx`; root contract: `notifications.types.ts`.

Do not turn sample notifications into delivered records or create a context for a filter that is already local to one inbox.

### `onboarding/`

- `contents/`: `onboarding.constants.ts` (only display constants; if it defines domain rules keep it by the schema).
- `completed/view/`: `onboarding-completed.tsx`.
- `forms/`: `onboarding.schema.ts`, `educator/educator-details-step.tsx`, `entity-select/entity-select-step.tsx`, `others/others-details-step.tsx`, `profile-basics/profile-basics-step.tsx`, `review/review-step.tsx`, `student/student-details-step.tsx`.
- `ui/`: `entity-select/entity-card.tsx`, `shared/choice-checkbox-group.tsx`, `shared/field-error.tsx`, `shared/onboarding-layout.tsx`, `shared/onboarding-stepper.tsx`, `shared/optional-badge.tsx`, `shared/step-actions.tsx`, `shared/tag-input.tsx`.
- `view/`: `onboarding-view.tsx`, `onboarding-view.test.tsx`; root contract: `onboarding.types.ts`.

Keep onboarding's browser-local choices separate from assigned authenticated roles. When relocating nested steps, retain their existing logical subfeature names if that makes imports clearer.

### `personal-workspace/`

Apply the convention *inside each tool*, not around all personal data at once. Personal tasks, subjects, notes, and peer study spaces have separate storage and ownership.

- `classwork/contents/`: `sample-classwork.ts`; `classwork/ui/`: `classwork-card.tsx`; `classwork/view/`: `classwork-view.tsx`.
- `notes/`: **Already organized.** `contents/` has `note-card-actions.ts`, `note-records.ts`, `notes-content.ts`; `forms/` has `note-editor-dialog.tsx`; `ui/` has `note-card-menu.tsx`, `note-card.tsx`, `note-delete-dialog.tsx`, `note-label-chips.tsx`, `note-labels.tsx`, `note-list.tsx`; `utils/` has `handle-add-item.ts`, `note-records.ts`, `toggle-item.ts`; `view/` has `notes-view.tsx`, `notes-view.test.tsx`. Inspect the two different `note-records.ts` files before changing either one; keep stored formats compatible. `note-card-actions.ts` describes callback types rather than static copy, so consider moving that contract nearer `ui/` when you work on Notes.
- `student-overview/contents/`: `student-overview-content.ts`, `student-overview-copy.ts`.
- `student-overview/utils/`: `time-greeting.ts`; `student-overview/ui/`: `classwork-highlight.tsx`, `overview-tip-banner.tsx`, `personal-metrics.tsx`, `progress-summary.tsx`, `quick-links.tsx`, `study-consistency.tsx`, `subjects-table.tsx`, `upcoming-items.tsx`.
- `student-overview/view/`: `student-overview-view.tsx`.

For `personal-workspace/study-spaces/`, keep the existing `detail/` subfeature:

- `study-spaces/forms/`: `create-space-dialog.tsx`, `join-space-dialog.tsx`.
- `study-spaces/ui/` (scene and list presentation): `city-buildings.tsx`, `city-plaza.tsx`, `city-traffic.tsx`, `room-plan-preview.tsx`, `space-card-grid.tsx`, `space-map-art.tsx`, `space-map.tsx`, `study-hall-world.tsx`.
- `study-spaces/utils/`: `city-layout.ts`, `city-layout.test.ts`, `space-format.ts`, `space-map-layout.ts`, `space-roster.ts`, `traffic-paths.ts`, `traffic-paths.test.ts`.
- `study-spaces/model/` (browser-local records): `study-spaces-records.ts`; `study-spaces/hooks/`: `use-walk-keys.ts`.
- `study-spaces/view/`: `study-spaces-view.tsx`, `study-spaces-flow.test.tsx`; keep `space-map.test.tsx` next to `space-map.tsx` in `ui/`, and `study-space-room-features.test.ts` next to the room feature under `detail/`.
- `study-spaces/detail/forms/`: `character-dialog.tsx` (edits character settings).
- `study-spaces/detail/ui/`: `character-figure.tsx`, `drawer-panel.tsx`, `focus-music-panel.tsx`, `locker-panel.tsx`, `nap-banner.tsx`, `pomodoro-chip.tsx`, `room-chat-panel.tsx`, `room-extras.tsx`, `room-garden.tsx`, `room-zones.tsx`, `seat-panel.tsx`, `space-room-scene.tsx`, `task-board-panel.tsx`, `tv-panel.tsx`.
- `study-spaces/detail/model/`: `drawer-storage.ts`, `room-ambience.ts`, `room-lockers.ts`, `room-tasks.ts`, `room-tv.ts`, `study-space-seats.ts`; `study-spaces/detail/audio/`: `focus-music.ts` (Web Audio lifecycle); `study-spaces/detail/hooks/`: `use-focus-music.ts`, `use-pomodoro.ts`.
- `study-spaces/detail/view/`: `study-space-detail-view.tsx`, `study-space-detail.test.tsx`; `study-space-room-features.test.ts` can go here if it tests the full room.

The existing `study-spaces/{contents,forms,ui,view}/notes.md` files are documentation placeholders, not UI source files; do not confuse them with the Notes feature. Large Three.js scenes need resource and interaction profiling before splitting; a file move alone does not improve frame rate.

For `personal-workspace/subjects/`:

- `contents/`: `subject-appearance.ts` (display metadata).
- `forms/`: `subject-composer-dialog.tsx`, `subject-delete-dialog.tsx`, `subject-milestone-delete-dialog.tsx`, `subject-milestone-dialog.tsx`.
- `ui/`: `continue-learning.tsx`, `sample-data-notice.tsx`, `subject-action-button.tsx`, `subject-card.tsx`, `subject-congrats-dialog.tsx`, `subject-list-row.tsx`, `subject-milestones-card.tsx`, `subject-study-content.tsx`, `subjects-hero.tsx`.
- `model/`: `subject-records.ts` (browser-local data); `view/`: `subject-detail-view.tsx`, `subjects-view.tsx`, `subjects-view.test.tsx`.

For `personal-workspace/tasks/`:

- `forms/`: `task-composer-dialog.tsx`, `task-delete-dialog.tsx`.
- `ui/`: `task-board.tsx`, `task-detail-dialog.tsx` (detail panel with delegated edit/status actions), `task-list.tsx`, `task-subject-groups.tsx`.
- `model/`: `task-records.ts`; `view/`: `tasks-view.tsx`, `tasks-view.test.tsx`.

Storage models belong in a feature `model/` or `storage/` folder rather than `contents/`; preserve keys, migrations, and error recovery. Splitting a mixed file (such as `library-records.ts`) is more useful than merely moving it.

### `progress/`

- `ui/`: `classroom-results-section.tsx`, `personal-progress-section.tsx`.
- `view/`: `student-progress-view.tsx`, `student-progress-view.test.tsx`.

Do not call personal progress an official grade; the two sections have different data sources and audiences.

### `schedule/`

- `contents/`: `schedule-colors.ts`, `schedule-content.ts` (display metadata/examples, not saved events).
- `utils/`: `calendar-dates.ts`, `calendar-dates.test.ts`.
- `ui/`: `calendar-month.tsx`, `calendar-timeline.tsx`, `schedule-day-agenda.tsx`, `schedule-summary.tsx`.
- `view/`: `role-schedule-view.tsx`, `schedule-workspace-view.tsx`, `schedule-workspace-view.test.tsx`; root contract: `schedule-types.ts`.

### `teaching-activities/`

- `forms/`: `activity-composer.tsx`.
- `ui/`: `activity-collection.tsx`, `activity-details.tsx`.
- `model/`: `activity-workspace-model.ts`; `view/`: `teaching-activities-view.tsx`, `teaching-activities.test.tsx`.

Keep editable preview activity drafts distinct from a real published assignment.

### `tutor-workspace/`

- `ui/`: `tutor-workspace-ui.tsx`; `view/`: `tutor-workspace.test.tsx` (place next to the shared tutor view behavior it tests).
- `activities/view/`: `tutor-activities-view.tsx`; `ai/view/`: `tutor-ai-assistant-view.tsx`; `attendance/view/`: `tutor-attendance-view.tsx`.
- `communication/view/`: `tutor-announcements-view.tsx`, `tutor-discussions-view.tsx`.
- `learners/view/`: `tutor-learner-detail-view.tsx`, `tutor-learners-view.tsx`.
- `learning-plans/view/`: `learning-plans-view.tsx`; `materials/view/`: `tutor-materials-view.tsx`; `notes/view/`: `tutor-session-notes-view.tsx`.
- `notifications/view/`: `tutor-notifications-view.tsx`; `progress/view/`: `tutor-student-progress-view.tsx`; `sessions/view/`: `tutor-sessions-view.tsx`; `settings/view/`: `tutor-settings-view.tsx`.
- `overview/contents/`: `tutor-overview-content.ts`; `overview/view/`: `tutor-overview-view.tsx`.

Tutor views are role adapters around several shared features. Do not duplicate the shared feature into `tutor-workspace/`; do not move private session notes into a learner-visible `contents/` folder.

### Empty feature directories

`attendance/`, `classwork/`, `communication/`, `grades/`, `study-spaces/`, and `submissions/` at the top level of `features/` contain no TypeScript implementation today (some contain only `.gitkeep`). Do not manufacture folders for them. Their working UI is owned by the nested domains above or by other feature code; trace imports before assigning future ownership.

## Components outside `features/`

- `src/components/common/`: `app-sidebar.tsx`, `footer.tsx`, `navbar.tsx`, `platform-sidebar.tsx`, `theme-controller.tsx`, `theme-selector.tsx` are shared application UI. `dashboard-navigation.ts` and `dashboard-navigation.test.ts` define/test navigation configuration; `auth-route-redirect.tsx` and `require-onboarding.tsx` are route guards. `dashboard-chrome.ts` already defines a cross-workspace UI context/hook. Leave these paths alone unless a real split improves ownership.
- `src/components/ui/`: all existing generic wrappers (buttons, dialogs, tabs, inputs, menus, etc.) belong here. Do not nest them under each feature. If a large wrapper needs splitting, keep its public import API stable and test all consumers.
- `src/components/progress/`: only `.gitkeep`; the active progress implementation is `src/components/features/progress/`.

## Context: what is actually reusable?

There are already three useful contexts: `features/auth/auth-session-context.ts` (authenticated session), `features/classrooms/classroom-prototype-context.ts` (classroom data), and `common/dashboard-chrome.ts` (hide workspace chrome for immersive calls). They have different scopes. When you manually move them, update their consumers and provider mounts together; do not create a new shared `AppContext` or a context just to eliminate one prop.

Consider a **new feature-local context** only if several deep descendants need the same state/action and a local hook or direct props are insufficient. Define a typed value and hook, make required-provider failures explicit, memoize changing provider values when useful, and test unmount/reset. Put it in `<feature>/context/` next to its owner. A shared `src/components/context/` would be justified only for future *cross-feature UI state* with a documented lifetime; it must not combine account-owned data, browser-local drafts, and preview people. Context does not add persistence, authorization, or live synchronization.

## Manual migration sequence

1. Choose **one** feature or nested subfeature from the inventory. Record its entry route, external imports, active providers, data source, and regression tests. Confirm whether each proposed destination above fits what the file actually exports.
2. Split a large component by responsibility before moving files: pure calculation first, then one independent visual unit, then form state, and only then a context if real prop drilling remains. Keep hooks with the effect/cleanup they own. Do not split by line count alone.
3. Move a small cohesive set, keeping tests beside the behavior. Update all relative and `@/*` imports, `src/pages/` route adapters, lazy imports, documentation/skill links, and affected type exports in the same change. Avoid barrels that conceal cycles.
4. Run focused tests, `npm run build`, focused and repository ESLint, and `git diff --check`. For visual changes, render desktop/mobile and light/dark; for stored data, test compatibility; for live meetings, check participant/track cleanup without treating preview as a live call. Separate existing failures from new regressions.
5. Review the diff for accidental behavior changes, unreferenced components, stale links, duplicate exports, and changed provider lifetimes. Finish that feature before moving to another. Do not claim all features are migrated until every entry path and its tests have been checked.

For debugging: wrong copy/sample -> `contents/`; validation or submit -> `forms/`; layout/focus -> `ui/` and `view/`; filtering/calculation -> `utils/`; state leaking across routes -> provider mount and feature `context/`; missing records -> actual service/storage owner, not a visual wrapper.

[Agent workflow](README.md) | [Documentation index](../index.md)
