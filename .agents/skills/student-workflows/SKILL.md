---
name: student-workflows
description: Design and implement student personal-workspace and classroom-participant workflows while keeping personal records separate from official class records.
---

# Student Workflows

Use for student-facing work across independent study, classroom participation, deadlines, and personal progress. Students must be able to use Owlio even when no instructor or institution uses it.

## Personal workspace

Support organization of subjects, notes, personal tasks, schedules, deadlines, and learning resources. Keep personal tasks distinct from educator-assigned classwork; clearly show the context and owner of each item. Personal progress is not an official gradebook or classroom record.

## Classroom participation

Students may join instructor-led or tutoring classrooms and, where implemented, view schedules, lessons, materials, classwork, discussions, attendance, grades/evaluations, and educator feedback. Show only actions supported by the current route, product contract, and permissions. Students do not edit official educator-controlled grades, attendance, feedback, or class records unless an approved contract explicitly permits it.

## Study spaces

Students can collaborate in student-created spaces, but a study space is not an official classroom. Use the [study-spaces skill](../study-spaces/SKILL.md) for membership, shared tasks/resources, discussions, and polls.

## UX and implementation checks

- Make independent-work actions useful without requiring a class join.
- Distinguish personal, shared peer, and official classroom items in labels and navigation.
- Surface relevant upcoming work and next actions without presenting mock values as real activity.
- Keep screens responsive, keyboard-operable, and accessible; include applicable empty, loading, error, and unavailable states.
- Do not infer role authorization from a student-facing route or client-side state; backend authorization is authoritative.

See [Owlio Core](../owlio-core/SKILL.md) for shared product and security boundaries.