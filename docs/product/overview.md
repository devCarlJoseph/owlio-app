# Owlio product overview

This overview consolidates the direction already described in Owlio's role and AI plans. It defines shared product intent; it does not declare planned capabilities implemented or approve new backend contracts.

## Purpose

Owlio brings independent learning, educator-led learning, and peer study into distinct but connected workspaces. Students should find value before joining a class. School educators, ESL teachers, and tutors need teaching tools suited to their context, with clear ownership of materials, activities, feedback, and learner records.

This repository implements the browser frontend and API clients. Backend services, databases, model inference, and deployment infrastructure require their own source and confirmed contracts.

## Four role workspaces and their connected learning contexts

| Workspace | Primary purpose | Detailed plan |
| --- | --- | --- |
| Student (`/students`) | Personal subjects, notes, tasks, resources, peer study, and participation in authorized classes | [Student plan](../../OWLIO_STUDENT__WORKFLOW_PLAN.md) |
| School educator (`/educators`) | Prepare and manage formal classes, activities, learner feedback, attendance, and grades where supported | [Educator plan](../../OWLIO_EDUCATOR_WORKFLOW_PLAN.md) |
| ESL teacher (`/esl`) | Prepare flexible language lessons, learner activities, and live learning without assuming a school grading system | [ESL plan](../../OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md) |
| Tutor (`/tutors`) | Support one-to-one and group tutoring, learning plans, sessions, and learner feedback | [Tutor plan](../../OWLIO_TUTOR_WORKFLOW_PLAN.md) |

Accounts may hold multiple API-assigned roles. A URL, sidebar selection, or onboarding answer selects presentation context; it does not grant access. Each role's plan describes target experiences, not a required sidebar redesign for every task.

## Ownership and audience

| Context | Ownership and boundary |
| --- | --- |
| Personal learning | Student-owned subjects, notes, tasks, and editor files remain distinct from assigned classwork and official results. Browser-local storage is not account sync. |
| Peer study | Student-created study spaces support peer learning. Their local/demo membership is not proof of real shared access or official classroom authority. Wider creator/access policy requires an explicit product decision. |
| Educator-led learning | Official work and records belong to an authorized classroom or learning context. Read/write/release permissions come from confirmed service contracts. |
| Private teaching notes | Teacher/tutor notes remain separate from deliberately published learner feedback. |
| Progress and evaluation | Personal completion, tutor evaluation, ESL feedback, and institutional grades have distinct meanings. Summaries need real sources; sample metrics remain labeled. |
| Meetings | Live participant presence, chat, hand raises, and temporary whiteboard interactions do not create official attendance, saved discussions, or grades. |

## Shared experiences

- Keep Meeting Room a standalone destination; authorized class/session links can lead to the same experience.
- Contextual discussions, authored announcements, and event notifications serve different purposes. General direct messaging remains future until its product and service contracts exist.
- Materials retain source, ownership, and learning context. Personal editor files are separate from uploaded files, published class materials, and external-drive integrations.
- A lesson plan describes preparation; a scheduled session is a dated event. A calendar preview does not establish a scheduling service.
- Keep attendance and gradebook responsibilities distinct. Tutors and ESL teachers need context-appropriate language rather than automatic school terms or grading assumptions.
- Target ESL whiteboard scope is temporary interaction inside an authorized ESL meeting. The existing preview does not prove shared transport, persistence, replay, or assessment capability.

## AI direction

Follow the [AI implementation plan](../../OWLIO_AI_IMPLEMENTATION_PLAN.md) when touching AI behavior. Current generation is unavailable. The proposed inference path is browser -> authenticated Owlio backend -> private Owlio-controlled inference runtime.

Professional assistance produces editable drafts under educator/ESL/tutor review. Generation alone must not publish, assign, message learners, finalize grades, or modify official records. Initial prompt scope excludes learner identities, private notes, records, and submissions. Student generation remains disabled until its separate product, safety, privacy, and source decisions are approved.

## Design decisions and delivery boundaries

A request to reproduce a reference image defines the requested area's appearance. Existing layouts, typography, palette, and component defaults can be adapted for that task. Preserve working actions, accessible interactions, data ownership, and authorization while changing presentation.

A visual reference does not establish an API endpoint, account save, upload, notification delivery, or new permission. Represent unsupported actions honestly and keep authorized previews clearly identified. Make reasonable reversible visual decisions when the reference is silent; ask when a missing decision would change ownership, access, persistence, or the requested scope.

## Implementation status

Use [capability status](../architecture/capability-status.md) and inspect the relevant source/configuration before changing behavior. Plans describe intended behavior; source describes implemented behavior; runtime flags describe enabled behavior; live checks establish environment behavior. Disagreements should be surfaced rather than silently treated as resolved.

[Documentation index](../index.md) | [Agent workflow](../sops/README.md)
