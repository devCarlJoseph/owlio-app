# Personal notes

Target: `src/components/features/personal-workspace/notes/`. This already follows the requested folder shape; use this list to debug or selectively improve it, **not** to duplicate the files.

| Existing folder | Current files |
| --- | --- |
| `contents/` | `note-card-actions.ts`, `note-records.ts`, `notes-content.ts` |
| `forms/` | `note-editor-dialog.tsx` |
| `ui/` | `note-card-menu.tsx`, `note-card.tsx`, `note-delete-dialog.tsx`, `note-label-chips.tsx`, `note-labels.tsx`, `note-list.tsx` |
| `utils/` | `handle-add-item.ts`, `note-records.ts`, `toggle-item.ts` |
| `view/` | `notes-view.tsx`, `notes-view.test.tsx` |

`contents/note-card-actions.ts` holds callback types; consider placing that contract next to its UI consumer in a future cleanup. `contents/note-records.ts` and `utils/note-records.ts` are **different modules** despite the same basename. Preserve local storage keys, migration/normalization behavior, and existing notes during any extraction.

[Personal workspace plans](README.md)
