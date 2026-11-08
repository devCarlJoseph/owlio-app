# Materials component breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt`/`.css.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(materials): add organized materials source copies`

Target: `src/components/features/materials/`. These are manual destinations, not existing import paths. Keep student-owned editor files separate from published classroom materials. [Folder rules](../sops/component-decomposition.md).

| Proposed destination | Current files |
| --- | --- |
| `forms/` | `library-search-field.tsx`, `resource-source-filter.tsx` |
| `ui/` | `library-category-row.tsx`, `library-context-cards.tsx`, `library-gallery-card.tsx`, `library-theme.module.css`, `resource-card.tsx`, `resource-list-row.tsx`, `resource-list.tsx` |
| `view/` | `student-library-source-view.tsx`, `student-library-subject-view.tsx`, `student-library-subject-view.test.tsx`, `student-library-view.tsx`, `student-library-view.test.tsx` |
| Root contract | `library-types.ts` |
| Split mixed root module | `library-records.ts`: `librarySourceMeta`, icons and labeled `previewLibraryResources` -> `contents/`; filter/count/group/slug helpers -> `utils/`; use a temporary compatibility export until consumers have migrated |
| `workspace/view/` | `document-editor.tsx`, `library-workspace-view.tsx`, `library-workspace.test.tsx`, `personal-library-work.tsx`, `presentation-editor.tsx` |
| `workspace/model/` | `work-drafts.ts`, `work-records.ts` (in-memory draft recovery and browser-local records) |

Prefer splitting the mixed `library-records.ts` by responsibility over moving the 500-line file unchanged. Preserve existing browser storage keys, document revisions, save-error recovery, and backup import/export. Move editor-related tests with the corresponding view; never represent preview resources as uploaded or synced.

[All feature plans](../component-breakdowns.md)
