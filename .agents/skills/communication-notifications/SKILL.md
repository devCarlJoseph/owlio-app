---
name: communication-notifications
description: Guide contextual classroom and study-space discussions, announcements, polls, and notification experiences.
---

# Communication and Notifications

Use for discussion threads, announcements, polls, and in-app or external notification UX. Keep each message attached to a classroom, lesson/session, or student-created study space so users can understand context and access boundaries.

## Product workflows

The plan describes educator classroom announcements and discussions, student study-space discussions/announcements/polls, replies, and notifications for invitations, new work/materials, deadlines, submissions, grades, feedback, replies, polls, attendance, and schedule changes. Confirm the supported channel, delivery, and event contract before implementing any send or delivery behavior.

## Ownership and privacy

Educators may publish classroom notices and supported classroom polls. Study-space creators may manage peer-space notices/polls only within approved permissions. Students may participate in allowed discussions but cannot impersonate educators or modify official records through communication features. Notification contents must not leak grades, private feedback, or learner information to unauthorized users or lock-screen previews without an approved privacy decision.

Do not claim that a post, poll response, email, push message, or notification was delivered unless the API/provider confirms it. Avoid duplicate or noisy alerts; respect read/unread state only when the backend contract supports it. Render untrusted user content safely and do not expose raw provider errors.

Provide accessible thread semantics, clear author/time/context, keyboard-friendly reply/poll controls, and loading/empty/error/permission states. See [study spaces](../study-spaces/SKILL.md), [educator classroom](../educator-classroom/SKILL.md), and [scheduling](../schedule-calendar/SKILL.md).