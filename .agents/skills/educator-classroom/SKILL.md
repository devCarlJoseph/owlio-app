---
name: educator-classroom
description: Build educator-led classroom and lesson workflows for school educators and flexible independent educators, respecting classroom ownership and learner-record boundaries.
---

# Educator Classroom

Use for educator-owned classrooms and lesson-centered workflows. The product includes school/college teaching as well as tutoring, ESL, private, freelance, review, and professional instruction. Do not assume every educator has an institution, section, school calendar, or fixed grade system.

## Classroom lifecycle

The product plan describes classroom setup (name, subject/course, description, class type, schedule and join options), inviting/enrolling learners, and organizing lessons, materials, classwork, attendance, discussion, announcements, grades/evaluations, feedback, and progress. Treat individual fields, routes, join mechanisms, and integrations as proposals unless verified in source and an approved API contract.

Keep actions and content attached to the correct classroom or lesson. A lesson-centered view may bring together lesson information, meeting details, materials, activities, attendance, discussion, and educator notes, but only show capabilities that are actually implemented.

## Educator control and learner access

Educators manage classrooms they own or are authorized to manage. Classroom records (official classwork, submissions, grades/evaluations, attendance, feedback, and progress) must be isolated by classroom membership and enforced by the backend. Learners see permitted materials and activities, submit work, participate, and view released feedback/results; they must not gain educator controls through UI changes.

Use [tutoring workflows](../tutoring-workflows/SKILL.md) and [ESL teaching](../esl-teaching/SKILL.md) for flexible teaching variations. Use [scheduling](../schedule-calendar/SKILL.md), [materials](../learning-materials/SKILL.md), [attendance](../attendance/SKILL.md), [classwork and assessment](../classwork-assessment/SKILL.md), and [communication](../communication-notifications/SKILL.md) for focused domain rules.

## Implementation checks

Confirm ownership, membership, class type, and permitted actions before encoding assumptions. Include appropriate loading, empty, unavailable, error, and permission-denied states. Do not present placeholder dashboards or unsupported server operations as live functionality.