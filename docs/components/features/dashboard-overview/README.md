# Shared dashboard overview breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(dashboard-overview): add organized overview source copies`

Target: `src/components/features/dashboard-overview/`. These are proposed destinations, not existing imports. Use [folder rules](../../../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `ui/` | `overview-identity-card.tsx`, `overview-sidebar.tsx`, `overview-summary.tsx`, `overview-workspaces.tsx` |
| `view/` | `dashboard-overview.tsx`, `dashboard-overview.test.tsx` |
| Root contract | `overview-types.ts` |

Keep role-specific copy and current account information separate: a shared dashboard tile should not infer educator authorization from a URL. Migrate the view and test together after checking its role consumers; do not add `forms/` or context without a real form or shared state.

[All feature plans](../../../component-breakdowns.md)
