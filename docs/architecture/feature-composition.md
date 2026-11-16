# Feature composition

Runtime features are organized by responsibility inside each domain and existing subfeature. Pages, shared components, lazy entries, and tests import the owning module directly. Styling continues to use existing Tailwind utilities and project-owned UI wrappers.

| Folder | Responsibility |
| --- | --- |
| `view/` | Screen composition, route context, loading/error/empty states |
| `ui/` | Feature-specific styled cards, lists, panels, controls |
| `forms/` | Input flows, create/join dialogs, composers, editors |
| `hooks/` | Stateful orchestration and lifecycle behavior |
| `context/` | Domain providers, context contracts, scoped stores |
| `utils/` | Formatting, derivations, model and record helpers |
| `contents/` | Static copy, display metadata, labeled examples |
| `types/` | Shared domain TypeScript contracts |
| `schemas/` | Existing form validation contracts |
| `tests/` | Behavioral tests and fixtures for the domain/subfeature |

Create folders only for real modules. Retain subfeature ownership such as `auth/login`, `materials/workspace`, `personal-workspace/subjects`, and `study-spaces/detail`. Avoid barrels that eagerly import entire features. Use `@/*` across features and relative imports internally. Domain-neutral primitives stay in `src/components/ui/`; HTTP services stay in `src/services/api/`.

Existing model/record modules retain their implementations, including some mixed static data and persistence helpers. Further extraction should follow actual responsibilities and preserve storage compatibility; moving a module alone does not make it pure.

## Classroom example

```text
src/components/features/classrooms/
  context/     classroom providers, context contract, preview store
  contents/    classroom-preview-data.ts, discussion-reaction-data.ts
  forms/       classroom-form-dialogs.tsx, chat/discussion composers, quiz settings
  hooks/       use-classrooms.ts, use-classroom-chat.ts, use-now.ts
  tests/       behavioral tests and fixtures
  types/       classroom-types.ts
  ui/          classroom-card.tsx, classroom-list-toolbar.tsx, chat/quiz blocks
  utils/       classroom-utils.ts, classroom-list-meta.ts, quiz calculations
  view/        classrooms-view.tsx, classroom-detail-view.tsx, other screens
```

`ClassroomsView` composes the visual blocks and dialogs. `useClassrooms` owns list controls, pending-request guards, create/join submissions, notices, and focus refs. `ClassroomListToolbar` accepts controlled values and callbacks without owning records. Existing list and accessibility tests exercise their integrated behavior.

Classroom providers remain inside the dashboard. Connected account records, invite codes, preview state, and account/role remounting retain their original scope. URL prefixes do not grant authorization.

## App-wide providers

`src/context/app-providers.tsx` composes `ThemeProvider` and the existing feature-owned `AuthSessionProvider`. It mounts inside `BrowserRouter`, because session behavior observes routes. `initializeTheme()` still runs before the first render.

Use `src/hooks/use-theme.ts` for app-wide theme selection. The context exposes `theme` (`light`, `dark`, or `system`) and `setTheme`. It uses the existing `src/lib/theme.ts` store, preserving `owlio.theme.v1`, cross-tab synchronization, system listeners, and operation without local storage. Listener cleanup belongs to the provider. Auth consumers continue using `useAuthSession`; there is one session provider.

Add global state only when independent domains need it and its owner/reset lifecycle are clear. Keep domain records and high-frequency state scoped to avoid unnecessary app-wide renders.

## Historical plans

The guides under `docs/components/features/`, their embedded code, and `.txt` source copies are pre-migration planning snapshots. Proposed destinations may differ from this runtime organization. Their snapshot generators compare against the old layout and are not runtime verification commands for this migration. Inspect live `src/` modules for current implementations.
