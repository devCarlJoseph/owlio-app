---
name: attendance
description: Implement school, ESL lesson, and tutoring-session attendance without deriving official records from meeting presence or student-owned work.
---

# Attendance

Use for educator-controlled attendance in the four role workflows. Read the relevant [educator](../../../OWLIO_EDUCATOR_WORKFLOW_PLAN.md), [ESL teacher](../../../OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md), [tutor](../../../OWLIO_TUTOR_WORKFLOW_PLAN.md), or [student](../../../OWLIO_STUDENT__WORKFLOW_PLAN.md) plan. Attendance is not a student personal task, study-space metric, or meeting-presence summary.

Follow the [product attendance scope](../../../OWLIO_PRODUCT_PLAN.md#attendance), the affected role plan's attendance page flow/acceptance criteria, and [owlio-core](../owlio-core/SKILL.md) for runtime/ownership rules. School Attendance, ESL Lesson Attendance, and tutor Session Attendance share safeguards without assuming identical record policies. An existing page, preview total, or meeting client does not establish an enabled attendance service.

## Product direction

Role plans require an explicit educator workflow tied to the actual class/session: school Attendance, ESL Lesson Attendance, or tutor Session Attendance. A student may view only permitted records; self check-in is a separate optional action only when its product/API contract is confirmed. Use only service-defined statuses, confirmation, correction, history, and audit behavior. Example statuses are not a specification.

Network-based check-in is a proposed option for supported environments, not a default capability. Do not add location/network verification, device fingerprinting, or anti-fraud claims without explicit product, privacy, and backend requirements.

## Role boundaries

School educators manage attendance only for classes they are authorized to manage. ESL teachers and tutors record attendance against their authorized lesson/session and learner/group; tutoring does not require school terms or class grade structures. Students view only their permitted attendance and do not edit official records unless an approved contract explicitly allows it. Backend authorization and audit rules are authoritative.

LiveKit roster, connection duration, chat, hand raises, and ESL whiteboard activity never create or confirm attendance. In-person/hybrid tutor sessions require an explicit supported attendance action rather than a meeting-presence substitute.

Show clear session/date context, timezone, status labels beyond color alone, and accessible loading/error/empty/permission states. Do not present demo attendance totals as real data or say a record was saved without server confirmation.

See [educator classroom](../educator-classroom/SKILL.md), [tutoring workflows](../tutoring-workflows/SKILL.md), and [progress/reporting](../learner-progress-reporting/SKILL.md).
