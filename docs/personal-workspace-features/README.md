# Personal workspace breakdown

[Browse the organized source copies](SOURCE_INDEX.md). These `.ts.txt`/`.tsx.txt` files are byte-for-byte reference copies, not runnable modules.

Suggested commit: `docs(personal-workspace): add organized personal workspace source copies`

Target: `src/components/features/personal-workspace/`. Each tool owns its own records, examples, and screens. Use the corresponding file map rather than creating a single global personal workspace context.

| Subfeature | Manual plan |
| --- | --- |
| Classwork | [classwork.md](classwork.md) |
| Notes (already organized) | [notes.md](notes.md) |
| Student overview | [student-overview.md](student-overview.md) |
| Study Spaces and room detail | [study-spaces.md](study-spaces.md) |
| Subjects | [subjects.md](subjects.md) |
| Tasks | [tasks.md](tasks.md) |

Keep browser-local personal records distinct from classroom assignments, official results, and account sync. Do not rename storage keys or convert a preview sample into a stored record while reorganizing source. Apply the [shared folder contract](../sops/component-decomposition.md) inside each subfeature.

[All feature plans](../component-breakdowns.md)
