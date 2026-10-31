---
name: learning-materials
description: Guide organization and access to student, classroom, lesson, tutoring, and study-space learning resources.
---

# Learning Materials

Use for displaying, organizing, sharing, or uploading learning resources in the [student](../../../OWLIO_STUDENT__WORKFLOW_PLAN.md), [educator](../../../OWLIO_EDUCATOR_WORKFLOW_PLAN.md), [ESL teacher](../../../OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md), and [tutor](../../../OWLIO_TUTOR_WORKFLOW_PLAN.md) workflows. The product plan names possible resource categories; actual accepted formats, size limits, storage, and upload flows must come from the current backend contract.

Connect these destinations through the product scopes for [Learning materials](../../../OWLIO_PRODUCT_PLAN.md#learning-materials) and the [shared-feature map](../../../OWLIO_PRODUCT_PLAN.md#shared-capabilities-and-role-specific-destinations). Read the affected role plan's material/library page flow and acceptance criteria; apply [owlio-core](../owlio-core/SKILL.md) for runtime rules. A resource card, local file selection, or existing context route does not prove upload, sharing, download, or account persistence is connected.

## Context and ownership

Keep resource context explicit:

- Student-owned personal notes/resources belong to the student's workspace.
- Shared peer resources belong to a student-created study space.
- Educator-published materials belong to the relevant classroom, topic, lesson, or activity.
- ESL teaching materials may be reused in plans, activities, and lessons only with explicit owner/audience context.
- Tutoring resources may be organized by learner/group, topic, lesson, learning plan, or session where supported.

Do not expose a private personal resource to a class or peer group without an explicit share action and supported permission model. Keep official class materials distinct from student submissions and personal files.

The educator, ESL, and tutor plans each specify one Teaching Materials destination; do not add duplicate libraries or mix resource management with Progress/Insights. The student Study Library may aggregate sources for discovery, but must show the owner/context and preserve each source's access rules. Personal notes are not the same as uploaded resources.

Student Study Library personal documents/presentations use Owlio-owned editors in `components/features/materials/workspace/`, with `/students/materials/workspace/:resourceId` as a thin route adapter. They save only in the current browser and remain separate from sample collections and shared/classroom files. Keep save errors, revision conflicts, missing/unreadable local files, and backup export/import explicit. Linking a real personal task is context only; never mutate task completion, classwork, or submissions from editor changes. Owlio JSON backups do not establish Google sync, DOCX/PPTX compatibility, collaboration, or server storage.

## Safety and UX

Do not invent file limits, preview support, virus scanning, external provider integrations, or upload success states. Do not log sensitive file contents or expose raw storage errors. Verify access on the server; UI visibility is not authorization. Provide file/link labels, upload progress/errors when implemented, accessible actions, and empty/unavailable states.

Use [student workflows](../student-workflows/SKILL.md), [study spaces](../study-spaces/SKILL.md), [educator classroom](../educator-classroom/SKILL.md), [ESL teaching](../esl-teaching/SKILL.md), and [tutoring workflows](../tutoring-workflows/SKILL.md) for role-specific ownership context.
