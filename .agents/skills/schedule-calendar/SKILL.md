---
name: schedule-calendar
description: Guide personal, classroom, lesson, tutoring-session, and deadline calendar workflows across Owlio.
---

# Schedule and Calendar

Use when designing scheduling, calendar, deadline, or reminder experiences. The product plan describes a shared view of personal schedules, classroom calendars, tutoring sessions, activities, and due dates; confirm which scope is implemented for the current task.

## User workflows

Students may organize personal study sessions, exams, tasks, and deadlines, and view schedules from joined classrooms. Educators may schedule classes, tutoring sessions, recurring lessons, meetings, and activity deadlines. Tutoring/ESL flows must support flexible formats and must not assume a school timetable.

Keep event ownership and context explicit: personal event, official classroom session, or tutoring/lesson session. A personal reminder must not become an official class deadline without an educator action and supported workflow.

## Date and integration rules

- Confirm timezone, recurrence, daylight-saving, locale, and all-day event behavior before encoding product assumptions.
- Use established date utilities/dependencies only after checking their actual project usage; do not add dependencies just for a calendar suggestion.
- Treat reminders, external calendar sync, and meeting links as integrations requiring approved contracts. Do not imply a reminder was sent or an event saved without server confirmation.
- Include time-zone-aware display, accessible event details, responsive views, and meaningful empty/loading/error states.

See [educator classroom](../educator-classroom/SKILL.md), [tutoring workflows](../tutoring-workflows/SKILL.md), and [communication/notifications](../communication-notifications/SKILL.md) for related context.