# Notifications component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(notifications): add organized notification source copies`

Target: `src/components/features/notifications/`. Proposed destinations; notification examples are not delivered account events. [Folder rules](../../../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `contents/` | `notifications-content.ts`, `notifications-examples.ts` |
| `ui/` | `notification-filters.tsx`, `notification-item.tsx`, `notification-list.tsx`, `notifications-inbox.tsx`, `notifications-panel.tsx`, `notifications-state.tsx`, `notifications-trigger.tsx` |
| `view/` | `notifications-view.tsx`, `notifications.test.tsx` |
| Root contract | `notifications.types.ts` |

The header trigger is consumed by the dashboard layout and the role view by page adapters and tutor workspace; update those imports in the same future migration slice. Keep the filter local to each inbox; adding an app-wide context would share unrelated dialog/page state. Preserve unavailable versus sample notification wording and keyboard focus on close.

[All feature plans](../../../component-breakdowns.md)
