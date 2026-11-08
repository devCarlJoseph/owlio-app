# Classroom component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(classrooms): add organized classroom source copies`

Status: **proposed only**. This document maps the current files in `src/components/features/classrooms/` to a cleaner feature-local layout. The paths below are destinations for a manual migration, not imports that work today. Follow the shared [component rules](../../../sops/component-decomposition.md) and [classroom integration boundary](../../../CLASSROOM_API_INTEGRATION.md).

## Target shape

```text
src/components/features/classrooms/
  classroom-types.ts                 # Shared domain contract; keep at root initially
  contents/                          # Display metadata and labeled preview fixtures
  context/                           # Connected/preview providers and their store
  forms/                             # Input and validation surfaces
  hooks/                             # Stateful reusable hooks
  ui/                                # Classroom-specific tiles, posts, quiz controls
  utils/                             # Pure derivations and quiz calculations
  view/                              # Route screens and their behavioral tests
  tests/                             # Test fixtures only
```

Do not create an empty folder. Treat `src/pages/dashboard/classroom/` as route adapters, `src/services/api/classroom.service.ts` as the connected HTTP boundary, and `src/components/ui/` as domain-neutral primitives; none should be copied into this feature.

## File-to-folder map

All entries name files currently at the **root** of `src/components/features/classrooms/`. A test belongs beside its owner even when the test filename is broader than that owner.

| Proposed destination | Current files |
| --- | --- |
| `context/` | `classroom-prototype-context.ts`, `classroom-prototype-provider.tsx`, `classroom-preview-provider.tsx`, `classroom-preview-store.ts` |
| `contents/` | `classroom-covers.ts`, `classroom-list-meta.ts`, `classroom-preview-data.ts`, `discussion-reaction-data.ts` |
| `forms/` | `chat-composer.tsx`, `classroom-form-dialogs.tsx`, `discussion-composer.tsx`, `quiz-timer-settings.tsx` |
| `ui/` | `chat-header.tsx`, `chat-message-bubble.tsx`, `classroom-card.tsx`, `classroom-list-ui.tsx`, `classroom-preview-notice.tsx`, `classroom-ui.tsx`, `discussion-post.tsx`, `discussion-reactions.tsx`, `discussion-text.tsx`, `quiz-countdown.tsx`, `quiz-leaderboard.tsx`, `quiz-questions.tsx`, `quiz-result-card.tsx`, `quiz-timing-badges.tsx` |
| `utils/` | `classroom-utils.ts`, `quiz-answers.ts`, `quiz-timing.ts`, `quiz-timing.test.ts` |
| `hooks/` | `use-now.ts` |
| `view/` | `classroom-activity-view.tsx`, `classroom-chat-view.tsx`, `classroom-chat.test.tsx`, `classroom-classwork-view.tsx`, `classroom-detail-view.tsx`, `classroom-detail-tabs.test.tsx`, `classroom-discussion.test.tsx`, `classroom-feed-view.tsx`, `classroom-members-view.tsx`, `classroom-members-view.test.tsx`, `classroom-preview.test.tsx` (put beside `context/` instead if it directly tests the provider), `classroom-quiz.test.tsx`, `classroom-records-view.tsx`, `classrooms-view.tsx`, `classrooms-view-accessibility.test.tsx`, `classrooms-view.test.tsx`, `quiz-workspace.tsx` |
| `tests/` | `classroom-test-data.ts`, `classroom-test-fixtures.tsx` |
| Root contract | `classroom-types.ts` |

The two visual aggregators `classroom-ui.tsx` and `classroom-list-ui.tsx` may contain multiple exports; inspect their consumers before deciding whether to split them into separately named `ui/` files. `classroom-preview-data.ts` is example content; `classroom-preview-store.ts` is mutable preview state, **not** content.

## Split large views by responsibility

1. `classrooms-view.tsx`: keep route role, list orchestration, and create/join results in the view. Move only pure filter/sort derivations into `utils/` with tests, and reusable list controls into `ui/`. Keep the existing create/join dialogs in `forms/`; do not move their submission logic without tracing it.
2. `classroom-classwork-view.tsx`: extract activity list/detail presentation into `ui/` only after identifying ownership, submission state, and review/release boundaries. Keep student submission and teacher review paths distinct.
3. `classroom-records-view.tsx`: isolate attendance/results display units in `ui/`; preserve the distinction between preview attendance, live-room presence, and official records.
4. `quiz-workspace.tsx`: keep timing and answer evaluation in `utils/`, composer settings in `forms/`, and countdown/question/result components in `ui/`. Preserve timer cleanup and accessibility.
5. Keep `classroom-types.ts` as the shared contract until there is a real type-cycle or separate public contract; avoid a barrel that re-exports everything.

## Context and data boundaries

`ClassroomPrototypeProvider` currently selects the explicit preview provider when API integration is paused; otherwise it uses a connected session provider keyed by account/roles. Preserve its mounting in `src/pages/dashboard/layout.tsx`, account-switch remounting, canceled/stale request handling, and one-time join-code handling. Keep `classroom-prototype-context.ts` and the provider/store together, but do **not** merge preview examples with connected data or infer authorization from `/students` or `/educators` URLs. Connected writes still need confirmed service contracts.

The existing `classroom-preview.test.tsx` exercises this boundary. Move the test with the provider if that improves discoverability; whichever location you choose, keep its imports and fixture behavior intact. Do not create a second global classroom context.

## Manual cutover sequence

1. Record the current imports from `src/pages/dashboard/classroom/{index,detail,activity}.tsx`, `src/pages/dashboard/layout.tsx`, other features, tests, and docs. Make a baseline of the focused classroom tests.
2. Move one group at a time: pure `utils/` and `contents/`, then `ui/` and `forms/`, then views and route adapters, and **last** the provider/context boundary. Keep source paths working at each step; update imports and relevant doc links in the same slice.
3. Example after moving the list view (illustrative future code, **not** an import to use before the move):

```tsx
import { ClassroomsView } from "@/components/features/classrooms/view/classrooms-view"
```

4. Run focused classroom tests, `npm run build`, focused and repository lint, and `git diff --check`. Exercise student and educator preview routes; for connected behavior use confirmed contracts and an authorized environment rather than treating the preview as evidence of a live save.
5. Review the diff for remounts, changed data ownership, stale paths, duplicate exports, and missing empty/error/unavailable states before migrating the next group.

Debugging path: page adapter -> `view/` -> `context/` -> preview store or API service -> `ui/`/`forms/`. If a list is wrong, inspect its filter helper and provider source before restyling the card.

[All feature plans](../../../component-breakdowns.md) | [Verification](../../../sops/verification.md)
