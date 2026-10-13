---
name: learning-materials
description: Guide organization and access to student, classroom, lesson, tutoring, and study-space learning resources.
---

# Learning Materials

Use for displaying, organizing, sharing, or uploading learning resources. The product plan includes documents, PDFs, presentations, images, videos, links, class notes, and personal reference materials; actual accepted formats, size limits, storage, and upload flows must come from the current backend contract.

## Context and ownership

Keep resource context explicit:

- Student-owned personal notes/resources belong to the student's workspace.
- Shared peer resources belong to a student-created study space.
- Educator-published materials belong to the relevant classroom, topic, lesson, or activity.
- Tutoring resources may be organized by learner, topic, lesson, skill, or session where supported.

Do not expose a private personal resource to a class or peer group without an explicit share action and supported permission model. Keep official class materials distinct from student submissions and personal files.

## Safety and UX

Do not invent file limits, preview support, virus scanning, external provider integrations, or upload success states. Do not log sensitive file contents or expose raw storage errors. Verify access on the server; UI visibility is not authorization. Provide file/link labels, upload progress/errors when implemented, accessible actions, and empty/unavailable states.

Use [student workflows](../student-workflows/SKILL.md), [study spaces](../study-spaces/SKILL.md), and [educator classroom](../educator-classroom/SKILL.md) for ownership context.