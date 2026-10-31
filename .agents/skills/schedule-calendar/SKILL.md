---
name: schedule-calendar
description: Guide personal, classroom, lesson, tutoring-session, and deadline calendar workflows across Owlio.
---

# Schedule and Calendar

Use when designing scheduling, calendar, deadline, or reminder experiences. Read the relevant [student](../../../OWLIO_STUDENT__WORKFLOW_PLAN.md), [educator](../../../OWLIO_EDUCATOR_WORKFLOW_PLAN.md), [ESL teacher](../../../OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md), or [tutor](../../../OWLIO_TUTOR_WORKFLOW_PLAN.md) plan. The product plans describe target views; confirm actual route and service support before implementing behavior.

Use the product scopes for [Scheduling](../../../OWLIO_PRODUCT_PLAN.md#scheduling) and [plan preparation](../../../OWLIO_PRODUCT_PLAN.md#lesson-and-learning-plan-preparation) to connect these pages. Read the affected role plan's page flow/acceptance criteria and apply [owlio-core](../owlio-core/SKILL.md) for runtime rules. A navigable calendar or preview appointment does not establish persisted events, reminders, or meeting availability.

## User workflows

Students may organize personal study sessions, deadlines, and view joined-class schedules while keeping personal and educator-assigned events distinct. School educators may manage class lessons/sessions and activity deadlines. ESL Lesson Plans are reusable preparation, while Lesson Schedule entries are dated sessions. Tutor Learning Plans are multi-session goals, while Sessions & Schedule represents appointments; online, in-person, and hybrid modes exist only where supported by contract.

Keep event ownership and context explicit: personal event, official classroom session, or tutoring/lesson session. A personal reminder must not become an official class deadline without an educator action and supported workflow.

Do not make one workspace's schedule assumptions global: school terms are not required for tutors or ESL teachers, and not every tutoring appointment is a Meeting Room session.

## Date and integration rules

- Confirm timezone, recurrence, daylight-saving, locale, and all-day event behavior before encoding product assumptions.
- Use established date utilities/dependencies only after checking their actual project usage; do not add dependencies just for a calendar suggestion.
- Treat reminders, external calendar sync, and meeting links as integrations requiring approved contracts. Do not imply a reminder was sent or an event saved without server confirmation.
- Include time-zone-aware display, accessible event details, responsive views, and meaningful empty/loading/error states.

See [educator classroom](../educator-classroom/SKILL.md), [tutoring workflows](../tutoring-workflows/SKILL.md), and [communication/notifications](../communication-notifications/SKILL.md) for related context.
