---
name: study-spaces
description: Guide student-created peer study spaces, collaboration workflows, and boundaries from official educator-led classrooms.
---

# Student-Created Study Spaces

Use for the student-created peer-learning workflow described in the [student workflow plan](../../../OWLIO_STUDENT__WORKFLOW_PLAN.md). A study space supports collaboration without an instructor; it is not an official classroom and must not be represented as an academic record source.

Connect this experience through the [product Student workspace](../../../OWLIO_PRODUCT_PLAN.md#41-student-workspace) and its distinct personal/peer/classroom contexts. Read the student plan's [Study Spaces flow](../../../OWLIO_STUDENT__WORKFLOW_PLAN.md#study-spaces-studentsstudy-spaces-e) and acceptance criteria; follow [owlio-core](../owlio-core/SKILL.md) for runtime/ownership rules. A browser-local room, avatar, invitation code, or hall animation does not establish server membership or shared collaboration.

## Product workflow

The product plans describe spaces the student creates or joins, and possible member management, shared resources, tasks, discussions, polls, announcements, and study notes. Treat each operation as planned until implemented and backed by an approved contract. The main product plan has an open decision about whether non-student roles may create or administer study spaces; do not grant those controls to educator, ESL, or tutor workspaces without an explicit decision.

Keep membership and shared content attached to the specific space so participants understand the context. The creator may have space-management actions, but do not invent detailed permissions or moderation powers without a product/API contract.

At the student-plan snapshot, create/join and space state are browser-local prototypes; invite codes are not server-verified. Do not describe local membership, contributions, or activity as shared with other users or persisted to an account.

## Boundaries

- Do not mix study-space tasks or notes with educator-assigned classwork unless the product explicitly links them.
- Do not imply study-space grades, attendance, teacher feedback, or official progress records.
- Keep student personal workspace data private unless the student intentionally shares it.
- Any join-code, invitation, upload, or member-management operation must be verified by the server when integrated; a visible control is not access control.

## UX checks

Provide clear membership and space context, accessible collaboration controls, mobile-friendly discussion/resource views, and useful empty/error/permission states. Avoid presenting demo members or activity as real data.

See [Owlio Core](../owlio-core/SKILL.md) for cross-product boundaries and [communication and notifications](../communication-notifications/SKILL.md) for shared discussion patterns.
