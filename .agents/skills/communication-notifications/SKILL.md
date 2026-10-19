---
name: communication-notifications
description: Implement contextual discussions, announcements, and notifications across Owlio's four workspaces without introducing an unapproved direct-message inbox.
---

# Communication and Notifications

Use for contextual communication in the [student](../../../OWLIO_STUDENT__WORKFLOW_PLAN.md), [educator](../../../OWLIO_EDUCATOR_WORKFLOW_PLAN.md), [ESL teacher](../../../OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md), and [tutor](../../../OWLIO_TUTOR_WORKFLOW_PLAN.md) workflows. Keep each item attached to a class, lesson/session, activity, learner/group, or student study space as permitted by the applicable role and service contract.

## Product workflows

The plan describes educator classroom announcements and discussions, student study-space discussions/announcements/polls, replies, and notifications for invitations, new work/materials, deadlines, submissions, grades, feedback, replies, polls, attendance, and schedule changes. Confirm the supported channel, delivery, and event contract before implementing any send or delivery behavior.

Across the four role plans, contextual Discussions replace a general Messages inbox for the active workflow. Direct Messages remain future until audience, membership, delivery, privacy, moderation, and service contracts are explicitly approved. A Meeting Room's in-call chat is transient and is not a saved Discussion.

Treat these as separate concepts:

- Discussions: contextual threads/replies with visible source, author, timestamp, and authorized audience.
- Announcements: educator/tutor-authored notices for a defined class, learner, or group audience; publication is not proof of notification delivery.
- Notifications: links to confirmed events and source records; read state/channels exist only if supported by service.
- Polls: only within a class or study-space workflow where its role permissions and persistence contract allow it.

## Ownership and privacy

Educators may publish classroom notices and supported classroom polls. Study-space creators may manage peer-space notices/polls only within approved permissions. Students may participate in allowed discussions but cannot impersonate educators or modify official records through communication features. Notification contents must not leak grades, private feedback, or learner information to unauthorized users or lock-screen previews without an approved privacy decision.

For tutor and ESL audiences, distinguish a learner/group thread from a private tutor/teacher note and from deliberately published feedback. Never expose Session Notes or private teaching notes in discussions, announcements, notifications, or previews. Keep a student study-space thread separate from educator-owned classroom communication.

Do not claim that a post, poll response, email, push message, or notification was delivered unless the API/provider confirms it. Avoid duplicate or noisy alerts; respect read/unread state only when the backend contract supports it. Render untrusted user content safely and do not expose raw provider errors.

Provide accessible thread semantics, clear author/time/context, keyboard-friendly reply/poll controls, and loading/empty/error/permission states. See [study spaces](../study-spaces/SKILL.md), [educator classroom](../educator-classroom/SKILL.md), and [scheduling](../schedule-calendar/SKILL.md).