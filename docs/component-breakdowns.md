# Per-feature component breakdown plans

**Documentation only:** the files below propose where the existing code should go when you manually refactor a feature. No folder in `src/components/` has been reorganized by these plans. Start with the [shared folder and context rules](sops/component-decomposition.md), then use the matching plan. All paths are based on the current component inventory and must be checked against source before a move.

Each feature folder now has `source/` with byte-for-byte `.ts.txt`, `.tsx.txt`, and (where used) `.css.txt` copies of its current source, grouped by the **proposed** folder. Use the linked `SOURCE_INDEX.md` in that feature's README to find each copy and its original path. They are reading/copying references, not working components: their imports still refer to the original layout, and the `.txt` suffix prevents duplicated tests or app files from entering TypeScript, ESLint, or Vitest. `materials/source/pending-split/library-records.ts.txt` holds a mixed file until you extract its contents and utilities manually. Non-code `.gitkeep` and placeholder `notes.md` files are not copied. These are snapshots, not a second implementation.

To check whether copies still match source, run `node docs/generate-feature-source-snapshots.mjs --check`. `--write` creates **missing** snapshots/indexes only and refuses to overwrite an existing file with different content; after source changes, review and update stale documentation deliberately. The generator verifies that every current feature `.ts`/`.tsx`/`.css` file is mapped exactly once. It does not modify `src/`.

| Current feature in `src/components/features/` | Proposed file-by-file plan |
| --- | --- |
| `auth/` | [Auth](auth-features/README.md) |
| `classrooms/` | [Classrooms](classroom-features/README.md) |
| `dashboard-overview/` | [Shared dashboard overview](dashboard-overview-features/README.md) |
| `educator-overview/` | [Educator overview](educator-overview-features/README.md) |
| `esl-teaching/` | [ESL teaching](esl-teaching-features/README.md) |
| `materials/` | [Materials and editor workspace](materials-features/README.md) |
| `meeting-room/` | [Meeting room](meeting-room-features/README.md) |
| `notifications/` | [Notifications](notifications-features/README.md) |
| `onboarding/` | [Onboarding](onboarding-features/README.md) |
| `personal-workspace/` | [Personal workspace: notes, subjects, tasks, study spaces, overview](personal-workspace-features/README.md) |
| `progress/` | [Progress](progress-features/README.md) |
| `schedule/` | [Schedule](schedule-features/README.md) |
| `teaching-activities/` | [Teaching activities](teaching-activities-features/README.md) |
| `tutor-workspace/` | [Tutor workspace](tutor-workspace-features/README.md) |

## Commit messages

These Conventional Commit subjects describe the **documentation copies** created here, not a completed source refactor. Use one per feature if committing separately; no commit has been made. Once you actually reorganize runtime code, use `refactor(<scope>): ...` instead.

| Feature | Suggested commit message |
| --- | --- |
| Auth | `docs(auth): add organized auth source copies` |
| Classrooms | `docs(classrooms): add organized classroom source copies` |
| Shared dashboard overview | `docs(dashboard-overview): add organized overview source copies` |
| Educator overview | `docs(educator-overview): add educator overview source copies` |
| ESL teaching | `docs(esl-teaching): add organized ESL source copies` |
| Materials | `docs(materials): add organized materials source copies` |
| Meeting room | `docs(meeting-room): add organized meeting source copies` |
| Notifications | `docs(notifications): add organized notification source copies` |
| Onboarding | `docs(onboarding): add organized onboarding source copies` |
| Personal workspace | `docs(personal-workspace): add organized personal workspace source copies` |
| Progress | `docs(progress): add organized progress source copies` |
| Schedule | `docs(schedule): add organized schedule source copies` |
| Teaching activities | `docs(teaching-activities): add teaching activity source copies` |
| Tutor workspace | `docs(tutor-workspace): add organized tutor workspace source copies` |

Top-level feature directories `attendance/`, `classwork/`, `communication/`, `grades/`, `study-spaces/`, and `submissions/` have no TypeScript source in them yet, so there is no code to map into a new folder. Existing UI for those subjects is nested in the domains listed above. `src/components/common/` and `src/components/ui/` are shared application and generic primitive layers; they are not feature domains and should not be copied into feature folders.

Work one feature at a time: confirm the owner, split by responsibility, move a small group, update imports/tests/docs, then verify that feature's behavior. Preserve session/provider mounts, local records, live-room media, and preview/connected distinctions. Do not treat a proposed path as already implemented.

[Documentation index](index.md) | [Verification](sops/verification.md)
