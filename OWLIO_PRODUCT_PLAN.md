# Owlio Product Plan

## Purpose and authority

This document consolidates the owner-provided product vision so engineers and coding agents can keep features, workflows, and role boundaries aligned. It describes target product behavior, not a claim that every feature is already implemented.

Use this document for product intent. `AGENTS.md` sections 3–4 document the current frontend file/route map and implementation status; current source code and confirmed backend/API contracts remain authoritative for what is actually supported. Do not invent routes, endpoints, permissions, integrations, or saved data from roadmap descriptions alone. Where this plan has an unresolved or contradictory requirement, ask the product owner before encoding it as a permission or backend contract.

## 1. Product overview

Owlio is a unified teaching, learning, and study platform for formal education, independent student learning, peer collaboration, tutoring, ESL instruction, and other educator-led learning.

The product must remain useful to a student even when their school, instructor, or tutoring provider does not use Owlio. When educators use the platform, they can create learning spaces that bring classroom or tutoring workflows together: learners, lessons, schedules, materials, classwork, submissions, attendance, communication, evaluation, and progress.

The platform is subject-independent and may support English/ESL, languages, mathematics, science, IT/programming, business, social sciences, professional training, review classes, tutoring, and other learning activities.

### Product positioning

Owlio is not only a classroom management system, student productivity tool, or tutoring platform. It connects:

- Student organization
- Peer collaboration
- Virtual classrooms
- Online tutoring and ESL instruction
- Learning activities and assessment
- Academic records and feedback
- Progress tracking
- Educator-focused AI assistance

The differentiating idea is **a flexible all-in-one learning environment that works with or without an instructor**, rather than a school-only LMS.

## 2. Problem being addressed

Students and educators often coordinate notes, schedules, files, resources, assignments, group work, communication, assessments, attendance, grades, and progress across disconnected applications. Students may have no central learning workspace if their instructor or institution does not provide one. Tutors and ESL teachers often combine calendars, video meeting tools, file storage, activity tools, messaging, and spreadsheets to run lessons and track learner progress.

Owlio aims to reduce this fragmentation by providing a connected place to organize those learning and teaching workflows while preserving the difference between personal student work and official educator-controlled records.

## 3. Target users

### Students

Students are independent users and may also participate in educator-managed classrooms. Their personal workspace must not require an instructor. Student workflows include:

- Subjects, notes, personal tasks, study plans, schedules, deadlines, and personal resources
- Student-created peer study spaces
- Joining instructor or tutor classrooms
- Completing classwork and submitting work
- Viewing released grades/evaluations, feedback, permitted attendance, and personal learning history

### School teachers and college instructors

This includes elementary/secondary teachers, college instructors, university professors, laboratory instructors, and subject teachers. Educator workflows include creating and managing classrooms, enrolling learners, publishing materials, scheduling teaching, assigning classwork, recording attendance, reviewing submissions, providing grades/feedback, communicating with learners, and monitoring classroom progress.

### ESL teachers

ESL teachers use the shared educator classroom model with language-oriented lessons and activities. Use cases include one-to-one or group English lessons, conversation practice, grammar, reading, writing, vocabulary, speaking, listening, assessments, attendance, and learner feedback/progress.

### Online tutors, private tutors, and freelance educators

Independent educators may teach one learner or a group without belonging to a formal institution. Workflows include tutoring classrooms/sessions, flexible schedules, learner context, lesson materials, activities, attendance, evaluations, feedback, and progress. Do not force these users into school-only labels, grading, or calendar assumptions.

## 4. Four core learning experiences

### 4.1 Personal student workspace

A student organizes independent academic and personal learning, including:

- Subjects
- Notes
- Personal tasks and deadlines
- Study schedules/plans
- Learning resources and reference links
- Personal progress and learning history

This workspace remains useful without a teacher or classroom. Personal tasks and progress are not official grades or classroom records.

### 4.2 Student-created study space

Students can collaborate with peers without an instructor. The product vision describes inviting peers by code, link, or invitation and collaborating with shared resources, tasks, submissions, links, discussions, polls, announcements, and study notes. The creator may manage members and basic permissions once those permissions are defined.

A study space is for peer collaboration, not an official academic classroom. It must not be presented as the source of official grades, attendance, educator feedback, or institutional progress records.

**Open product decision:** the feature-access table in the original plan marked study-space creation/joining for all user types, while the experience description frames study spaces as student-created. Do not settle who can create or administer them until the owner confirms the rule.

### 4.3 Instructor-led virtual classroom

Educators create structured spaces for school courses, tutoring groups, ESL lessons, review classes, professional training, and other instruction. A classroom may contain learners, schedules, lessons, materials, classwork, attendance, discussions, announcements, grades/evaluations, feedback, and progress.

Students may join through a class code, link, teacher invitation, or email invitation where implemented. Educators manage their authorized classrooms and associated records. Learners access permitted content, participate, complete activities, submit work, and view released results/feedback.

### 4.4 Tutoring and ESL classroom

Tutors and ESL teachers reuse core classroom capabilities where they fit, but need flexible class size, learner level, session format, and schedule. Use adaptable concepts such as learner, lesson, session, and learning group; do not assume a school or institution. Language-specific activities and objectives belong in the relevant lesson context.

## 5. Feature and workflow map

### Classrooms and enrollment

The product vision describes classroom setup including name, subject/course, description, section where applicable, class type, class code/link, schedule, and meeting information. Tutoring contexts may also need learner level, lesson type, tutoring format, and session frequency.

Learners may join by code, link, teacher invitation, or email invitation. The implementation must use an approved contract for which methods exist and who may manage each classroom. A route or hidden UI control is not authorization.

### Scheduling

Students can organize personal schedules, deadlines, exams, study sessions, and classroom schedules. Educators can schedule classes, tutoring sessions, recurring lessons, meeting details, activities, and deadlines. Personal events must remain distinct from official classroom sessions and deadlines.

Confirm timezone, recurrence, daylight-saving, and reminder behavior before implementing a calendar contract. External calendar synchronization and meeting integrations require explicit product/backend support.

### Classwork and assessments

The product supports two broad activity types:

- **Form-based:** quizzes, exams, tests, assessments, practice and review activities. Planned question types include multiple choice, multiple select, true/false, identification, short answer, and essay.
- **Non-form:** file/link submissions, practical or offline activities, presentations, demonstrations, group work, laboratory work, performance, speaking practice, discussion activities, and reading/content activities.

Educators create and distribute activities, set supported due dates/scoring rules, review submissions, provide grades/evaluations and feedback, and return work where supported. Students complete and submit work and view results released to them. Any lifecycle labels (for example, in progress, submitted, under review, graded, returned) must match the eventual API contract.

Objective auto-grading may use educator-defined answer keys and points when supported. Written-response evaluation may use rubrics or AI suggestions, but the educator retains final decision authority.

### Student personal tasks

Personal tasks support work such as studying for an exam, reading a chapter, practicing programming, preparing a presentation, or completing personal study work. A task may contain title, description, subject, due date, priority, status, and personal notes. Personal tasks must remain separate from educator-assigned classwork.

### Submissions

Educators may need to filter submissions by learner/activity, identify missing work, review files and links, grade/evaluate, provide feedback, and return work for revision. Students may submit or update work when permitted and view submission status, grades, and feedback. Supported file types, size limits, states, and revision rules must come from the backend contract.

### Attendance

The plan includes online check-in during an active class/session, educator review/confirmation or modification, offline roll call, attendance history, and statuses such as present, absent, late, and excused. Students may view their own permitted attendance records. Tutors may use session history to track learner participation.

Network-based check-in is a proposed option for supported environments, not a default capability. Do not add location/network verification, device tracking, or anti-fraud claims without explicit product, privacy, and backend requirements.

### Student and learner management

Educators may need learner profiles, classroom membership/enrollment status, classwork, grades/evaluations, attendance, feedback, activity, and progress history within classrooms they are authorized to manage. Quick insights may include missing work, incomplete activities, frequent absences, performance changes, and activity summaries. These are decision-support views and must not be presented as fabricated live data.

### Learning materials

Educators may organize documents, PDFs, presentations, images, videos, and links by classroom/topic/lesson/resource. Students may organize personal notes, files, references, and study resources. Tutors may organize materials by learner, topic, lesson, skill, or session.

Keep the owner and context visible: personal resource, peer-shared study-space resource, educator-published classroom resource, or student submission. Do not invent accepted file types, upload limits, integrations, or permissions.

### Discussions, announcements, and polls

Classroom discussions connect questions and replies to the relevant class or lesson. Study-space discussions support peer learning and collaboration. Educators may publish classroom announcements and polls; study-space creators may publish peer-space updates where the product permission model allows it. Context and authorship must be clear.

### Notifications

Potential notification events include classroom invitations, new classwork/materials, deadlines, announcements, submissions, grades, feedback, discussion replies, polls, attendance events, and schedule changes. Delivery channels, read state, and privacy rules require product/backend confirmation. Do not claim a message or notification was delivered unless the service confirms it.

### Progress and reports

Students may view personal task completion, study activity, released grades, permitted attendance, deadlines, feedback, and learning history. Educators may review classroom grades, attendance, submission completion, participation, assessment results, and progress. Tutors may review session history, attendance, evaluations, feedback, and progress without school-only assumptions.

Potential exports include learner lists, grades, attendance, classwork results, and progress filtered by learner, classroom, activity, or date range. These are sensitive records and require authorization and an approved export contract. Never merge student-managed progress with official educator-controlled records as if they have the same owner.

### Lesson-centered workspace

A lesson/session may bring together lesson information, meeting details, materials, classwork/activities, attendance, discussion, and educator/tutor notes. Students see the permitted corresponding learning context, materials, activities, attendance, discussion, and submission actions. ESL/tutoring lessons may add objectives, speaking practice, and skill-related feedback when supported.

### AI assistance

AI is intended primarily to reduce repetitive educator work. Planned assistance includes question suggestions/refinement, grammar and clarity improvements, variations, answer choices, difficulty adjustment, organizing question sets, assignment instructions, discussion questions, activity ideas, lesson suggestions, written-response evaluation suggestions, and feedback drafts. ESL/tutoring examples include vocabulary, grammar, conversation, reading, writing, and speaking activities.

Generated material must remain a draft until reviewed. Educators must be able to review, edit, accept, reject, or override generated content. AI must not silently publish content, contact learners, change official records, or establish final grades. Do not call an AI provider directly from the browser or send learner/private data without an approved service, privacy, and backend contract.

A shared navigation entry may be visible across workspaces, but that does not imply every user has the same AI actions or that AI is already connected. Confirm the capability by role and feature contract.

## 6. Role and record boundaries

- Students own their personal notes, personal tasks, study plans, personal resources, and personal learning activity.
- Student-created study spaces contain peer collaboration; they are not official classrooms.
- Educators control official classroom classwork, submissions/review, grades/evaluations, attendance, feedback, announcements, and classroom progress for classrooms they own or are authorized to manage.
- Tutors and ESL teachers use the educator classroom model with flexible teaching context; tutoring evaluations must not be silently treated as institutional grades.
- Backend authorization and classroom isolation are the security boundary. Client-side role selection, route visibility, and form validation are UX only.
- Preserve privacy of learner profiles, grades, attendance, feedback, submissions, and exported reports.

## 7. End-to-end workflows

### Independent student

Register/sign in → set up workspace → organize subjects, notes, materials, tasks, and schedule → optionally create/join a study space → collaborate with peers → track personal learning.

### Student in an educator/tutoring classroom

Register/sign in → join an authorized classroom → view schedule and materials → participate in a lesson/session → complete classwork → submit work → receive released grades/feedback → review permitted progress.

### Educator

Register/sign in → create classroom → set classroom information → invite/enroll learners → schedule lessons → publish materials and classwork → conduct learning sessions → record attendance → review submissions → provide grades/feedback → monitor learner progress.

### Tutor or ESL teacher

Register/sign in → create a flexible learning/tutoring classroom → organize learners and lesson/session context → schedule sessions → share materials and activities → teach → record attendance → evaluate and provide feedback → monitor learner progress.

## 8. MVP delivery sequence

1. **User foundation:** authentication, student/educator accounts, profiles, and role-aware permissions.
2. **Student independence:** personal workspace, subjects, personal tasks, notes, and personal materials.
3. **Virtual classroom:** classroom creation, codes/links, enrollment, classroom dashboard, learning materials, and scheduling.
4. **Classwork:** quizzes, assignments, file/link submissions, grading, and feedback.
5. **Classroom management:** attendance, announcements, discussions, notifications, and learner management.
6. **AI assistance:** question generation/refinement, instruction assistance, and AI-assisted written-response evaluation with educator review.

Keep future items out of MVP unless explicitly reprioritized: full video conferencing, real-time collaborative whiteboards, native mobile apps, advanced AI tutor/personalized learning paths, advanced analytics, plagiarism detection, automated timetables, institution-wide/school administration, parent accounts, SIS integration, payments/subscriptions, advanced tutoring-business scheduling, and additional third-party integrations.

## 9. Open decisions agents must not guess

- The app's registration values (`student`/`teacher`/`other`) and onboarding values (`student`/`educator`/`others`) currently differ. Confirm the canonical account/role/subtype contract before role-aware authorization or API integration.
- Confirm who can create and manage student study spaces; the original plan's experience description and access table differ.
- Confirm detailed classroom ownership, membership, and teacher/tutor/ESL permission rules with the backend contract.
- Confirm which AI capabilities are available to students versus educators; a shared navigation link does not define permissions.
- Confirm file constraints, time-zone/recurrence behavior, notification channels, meeting integrations, and report/export formats before implementation.
- Do not claim the frontend scaffold, placeholder route, or design preview is a completed backend feature.

## 10. Product success statement

Owlio should let a student organize learning independently and also become a connected classroom/tutoring environment when an educator joins. Keep independent study, peer collaboration, formal classroom records, and flexible tutoring connected where useful but distinct in ownership, workflows, and permissions.
