---
name: owlio-local-data
description: Change or repair Owlio browser-local persistence, autosave, storage formats, or backup import/export while preserving existing records. Exclude styling-only edits and API-backed persistence.
---

# Owlio local data

Maintain compatibility and recoverability when changing browser-owned data. Use the [feature](../../../docs/sops/feature-delivery.md) or [bug](../../../docs/sops/bug-fix.md) SOP for task flow.

## Trace the actual storage boundary

Identify the affected collection, keys, format/version, readers, writers, validation, and UI recovery behavior. Inspect only the relevant source:

| Area | Starting point |
| --- | --- |
| Document/presentation records and revisions | [work-records.ts](../../../src/components/features/materials/workspace/work-records.ts) |
| Unsaved editor drafts and recovery | [work-drafts.ts](../../../src/components/features/materials/workspace/work-drafts.ts), [editor view](../../../src/components/features/materials/workspace/library-workspace-view.tsx) |
| Backup import and file listing | [personal-library-work.tsx](../../../src/components/features/materials/workspace/personal-library-work.tsx) |
| Personal tasks and subjects | [task records](../../../src/components/features/personal-workspace/tasks/task-records.ts), [subject records](../../../src/components/features/personal-workspace/subjects/subject-records.ts) |
| Personal notes | [note storage utilities](../../../src/components/features/personal-workspace/notes/utils/note-records.ts) |
| Study Spaces and characters | [space records](../../../src/components/features/personal-workspace/study-spaces/study-spaces-records.ts) |

Browser-local records are not account-scoped server records or a multi-user service. Inspect each collection's behavior rather than applying the editor's guarantees to all storage helpers.

## Preserve records across changes

- For a UI-only change, preserve storage keys, identifiers, and formats. A changed component hierarchy does not justify resetting collections.
- For a requested format change, define how existing records remain readable before writing the new format. Preserve recoverable originals until the new write succeeds; handle unsupported future versions without silently replacing them.
- Distinguish absent records from unreadable data and unavailable storage. Preserve user edits and offer the existing retry/copy/export recovery path rather than treating a failed save as success.
- Inspect validation and consumers before adding fields or tightening a schema. Valid old records should not become invisible accidentally.
- Use synthetic fixtures or isolated test/browser storage for reproduction. Do not clear the user's origin storage or overwrite actual student work to test a migration.

## Respect editor-specific invariants

The current editor stores each file under `owlio.study-library-work.v1.<id>`. `saveWork` compares the stored `updatedAt` with the caller's expected revision; `reviseWork` advances it. Preserve conflict detection and unsaved-draft recovery. This optimistic check is not an atomic cross-tab transaction; do not claim it eliminates every race.

Backup import validates Owlio JSON and creates a new identity rather than overwriting an existing file. Inspect the current import/export envelope before changing it; do not imply DOCX/PPTX or Google compatibility. Optional task links must not modify task completion or submit classroom work.

## Validate the changed behavior

Choose cases relevant to the patch: round-trip save/load, old valid records, malformed JSON, invalid/unknown versions, storage write failure, revision conflict, import identity collision, and navigation with unsaved edits. Check reload and cross-tab/focus refresh behavior when applicable.

Use existing [editor tests](../../../src/components/features/materials/workspace/library-workspace.test.tsx) as a starting point for editor changes; do not assume every collection has the same recovery behavior. Follow [verification](../../../docs/sops/verification.md).

Report the affected format/key, compatibility approach, failure recovery, checks actually run, and whether evidence used isolated fixtures or browser storage.

## Trigger boundaries

- Use: "Add a field to saved presentation files without losing old work"; "Recover an editor draft after localStorage rejects a write."
- Skip: "Restyle the document toolbar"; "Save classroom grades through the backend." A local-data display alone does not require this skill.
