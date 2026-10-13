---
name: attendance
description: Guide official classroom and tutoring-session attendance workflows while protecting educator-controlled records.
---

# Attendance

Use for attendance check-in, educator roll call, attendance history, and related summaries. Attendance in an instructor-led or tutoring classroom is an official educator-controlled record; it is not a student personal task or study-space metric.

## Product direction

The plan describes educator-opened check-in periods, student self check-in during an active class/session, educator review/confirmation or modification, manual statuses (present, absent, late, excused), and history by session or learner. Implement only flows and states supported by an approved contract.

Network-based check-in is a proposed option for supported environments, not a default capability. Do not add location/network verification, device fingerprinting, or anti-fraud claims without explicit product, privacy, and backend requirements.

## Role boundaries

Educators can manage attendance only for classrooms they own or are authorized to manage. Students may view their own permitted records and use an active check-in flow if supported; they cannot edit official attendance. Tutors need flexible session history without school-only assumptions. Backend authorization and audit rules are authoritative.

Show clear session/date context, timezone, status labels beyond color alone, and accessible loading/error/empty/permission states. Do not present demo attendance totals as real data or say a record was saved without server confirmation.

See [educator classroom](../educator-classroom/SKILL.md), [tutoring workflows](../tutoring-workflows/SKILL.md), and [progress/reporting](../learner-progress-reporting/SKILL.md).