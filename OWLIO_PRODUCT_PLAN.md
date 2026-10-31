# Owlio Product Plan

The shared sidebar provides a browser-local Theme preference (Light, Dark, System) above its collapse control. System follows device appearance changes. Dark uses slate/navy surfaces and soft blue accents rather than pure black. This preference is not account-synced.

## Purpose and authority

This document consolidates the owner-provided product vision so engineers and coding agents can keep features, workflows, and role boundaries aligned. It describes target product behavior, not a claim that every feature is already implemented.

Use this document for shared product intent, ownership boundaries, and delivery dependencies. The four role workflow plans below define the detailed navigation, page responsibilities, component ownership, click-through flows, and acceptance criteria for each workspace. Read this plan together with the relevant role plan before implementing a feature.

| Workspace | Detailed workflow specification | Product responsibility |
|---|---|---|
| Student | [Student workflow plan](OWLIO_STUDENT__WORKFLOW_PLAN.md) | Independent learning, peer Study Spaces, and participation in educator-led classes. |
| School educator | [Educator workflow plan](OWLIO_EDUCATOR_WORKFLOW_PLAN.md) | Authorized classes, lesson planning, classwork, official attendance, Gradebook, and Teaching Insights. |
| ESL teacher | [ESL teacher workflow plan](OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md) | Individual/group language lessons, reusable plans, scheduled lessons, temporary in-room whiteboard, and scoped feedback/progress. |
| Tutor | [Tutor workflow plan](OWLIO_TUTOR_WORKFLOW_PLAN.md) | Individual/group tutoring, multi-session Learning Plans, flexible sessions, private Session Notes, and tutoring evaluations. |

[AGENTS.md](AGENTS.md) defines repository conventions and records an implementation snapshot. Current source, runtime flags, confirmed backend/API/security contracts, and explicit owner decisions remain authoritative for actual capability and access. For intended page behavior, use the relevant role workflow plan; use this product plan for how the four workspaces connect. An implementation gap is work to scope, not permission to invent an API or silently change the workflow. Ask the product owner when approved requirements conflict or an unresolved decision affects implementation.

The role plans use `E` for an existing frontend route, `P` for a proposed route/action, and `D` for a disabled/planned navigation entry. These are planning snapshots, not service guarantees; re-check the route tree before changing navigation. Keep sample, in-memory, browser-local, disabled integration code, and enabled service-backed behavior distinct. At this alignment, `src/lib/api-mode.ts` pauses API integrations globally for UI work. Preserved API clients and LiveKit room code do not establish that connected features are currently enabled or runtime-verified; do not change this mode as a side effect of implementing a page.

Maintain this plan for shared product changes and the corresponding role plan for detailed workflow changes. Cross-role changes must account for every affected workspace without copying one role's permissions or school-specific assumptions into the others. This alignment updates planning documents; it does not activate services or authorize implementation of every roadmap item.

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

## 4. Four role workspaces and their connected learning contexts

The four workspaces are Student, School Educator, ESL Teacher, and Tutor. Personal learning, peer Study Spaces, and educator-led classrooms are different learning contexts within this product; they do not replace the four role workflows. The following navigation is the target structure from the linked plans, not a declaration that all destinations or services are implemented.

### 4.1 Student workspace

Detailed specification: [Student navigation and page workflows](OWLIO_STUDENT__WORKFLOW_PLAN.md#recommendation).

- **Overview:** the daily starting point across personal learning and joined classes.
- **Learning:** My Learning, My Classes, Study Library, Study Spaces.
- **Communication:** Meeting Room, Discussions, Notifications.
- **Academic:** Calendar & Schedule, Tasks & Assessments, Progress & Grades.
- **Tools & Support:** AI Study Assistant, Help & Support.
- **Account:** Profile & Settings.

My Learning owns subjects, notes, personal tasks/plans, and personal resources; it remains useful with no classroom membership. Overview answers what to do next and is distinct from that personal hub. Study Library preserves the source and ownership of personal, classroom-published, and peer-shared resources.

My Classes connects students to authorized school, tutoring, and ESL instruction, including permitted materials, activities, submissions, attendance, and released results/feedback. Tasks & Assessments keeps personal tasks and assigned classwork in visibly separate scopes. Progress & Grades separates personal learning from educator-controlled results.

Study Spaces support student-created peer collaboration with shared resources, tasks, notes, discussions, and optional polls/announcements under a confirmed membership model. They never create official grades, attendance, or educator records. Eligibility for non-student creators/admins remains an open decision; this workflow does not grant it. AI Study Assistant is a separate future student capability and stays disabled until its own product, safety, privacy, and service requirements are approved.

### 4.2 School educator workspace

Detailed specification: [Educator navigation and page workflows](OWLIO_EDUCATOR_WORKFLOW_PLAN.md#recommended-educator-sidebar).

- **Overview:** the teaching-day starting point and sourced action queue.
- **Teaching & Management:** My Classes, Classwork & Assessments, Students, Attendance, Gradebook.
- **Communication:** Meeting Room, Discussions, Announcements, Notifications.
- **Planning:** Lesson Planner, Calendar & Schedule, Teaching Materials.
- **AI & Insights:** AI Form Assistant, Teaching Insights.
- **Account:** Profile & Settings.

Authorized classes anchor school teaching, enrollment, lesson planning, resources, classwork, submissions, official records, and learner access. Classwork & Assessments owns activity authoring and submission review; Gradebook views/manages results sourced from those same activities under an approved grading policy. Attendance is a separate session-record workflow.

Lesson Planner connects objectives, teaching notes, resources, classwork, schedule, and meeting context without creating a second independent calendar. Teaching Materials has one library destination. Teaching Insights summarizes actual authorized records with sources and time ranges; it does not establish grades or opaque learner risk labels. AI Form Assistant supports editable drafts within the authoring workflow, with a target class and human review before a separate publish action.

### 4.3 ESL teacher workspace

Detailed specification: [ESL teacher navigation and page workflows](OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md#recommended-esl-teacher-sidebar).

- **Overview:** upcoming lessons, preparation, reviews, and follow-up from real records.
- **Teaching:** My Learners, Lesson Plans, Teaching Materials, Activities & Assessments, Lesson Attendance.
- **Live Learning:** Meeting Room, Lesson Schedule.
- **Communication:** Discussions, Announcements, Notifications.
- **Progress & AI:** Learner Progress, Feedback & Notes, AI Lesson Assistant.
- **Account:** Profile & Settings.

Support individual and group language learning where the service contract permits it. Lesson Plans are reusable teaching preparation; Lesson Schedule contains dated sessions linked to the learner/group, plan, and valid meeting context. Activities support language practice and assessment without silently turning every exercise into an official grade.

The constrained temporary whiteboard belongs only inside an active, authorized ESL Meeting Room. It uses built-in teacher prompts/objects and discrete learner select/circle/mark actions, with teacher clear/reset controls. Initial scope excludes uploads, unrestricted freehand drawing, persistence, export, and replay. Board interactions never mutate attendance, grades, submissions, feedback, or progress. The transport and permission contract must be confirmed before connected collaboration is claimed.

Feedback & Notes separates educator-private teaching notes from deliberately published learner feedback. Learner Progress uses actual activity/lesson evidence and supported skill criteria; neither attendance, board activity, nor AI output establishes proficiency or CEFR level. AI Lesson Assistant prepares drafts under teacher control.

### 4.4 Tutor workspace

Detailed specification: [Tutor navigation and page workflows](OWLIO_TUTOR_WORKFLOW_PLAN.md#recommended-tutor-sidebar).

- **Overview:** upcoming sessions, preparation, reviews, and learner follow-up.
- **Learner Management:** My Learners, Learning Plans, Activities & Evaluations.
- **Sessions & Communication:** Sessions & Schedule, Session Attendance, Session Notes, Meeting Room, Discussions, Announcements, Notifications.
- **Resources & Progress:** Teaching Materials, Student Progress, AI Tutor Assistant.
- **Account:** Profile & Settings.

Support individual and group tutoring without requiring a school, institutional term, or school grading scale. Learning Plans organize goals across multiple sessions; the agenda for one session belongs to that session. Online, in-person, and hybrid delivery are available only as the session contract supports them. A contextual Meeting Room link requires a valid online room; not every appointment is a video meeting.

Session Attendance is explicitly tutor-controlled and independent of meeting presence. Session Notes are tutor-private records, separate from learner-visible feedback that is deliberately published. Activities & Evaluations supports practice, learner work, and tutor judgments without treating evaluations as institutional grades. Teaching Materials owns resources; Student Progress owns sourced tutoring progress/insights. AI Tutor Assistant assists the tutor with editable preparation drafts; it is not an autonomous learner-facing tutor.

## 5. Feature and workflow map

### Shared capabilities and role-specific destinations

Use this map to trace a shared product capability to its role-specific page requirements. The linked role plans remain the detailed specifications; sharing a capability does not grant equal actions or record access to all roles.

| Capability | [Student](OWLIO_STUDENT__WORKFLOW_PLAN.md#page-content-and-student-workflows) | [School educator](OWLIO_EDUCATOR_WORKFLOW_PLAN.md#page-content-and-behavior) | [ESL teacher](OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md#page-content-and-intended-boundaries) | [Tutor](OWLIO_TUTOR_WORKFLOW_PLAN.md#page-responsibilities-and-content) |
|---|---|---|---|---|
| Learning context and people | My Learning, My Classes, Study Spaces | My Classes, Students | My Learners | My Learners |
| Teaching preparation | Personal study plans in My Learning | Lesson Planner | Lesson Plans | Learning Plans and session agenda |
| Dates and sessions | Calendar & Schedule | Calendar & Schedule | Lesson Schedule | Sessions & Schedule |
| Resources | Study Library | Teaching Materials | Teaching Materials | Teaching Materials |
| Activities and learner work | Tasks & Assessments, with separate personal and assigned scopes | Classwork & Assessments | Activities & Assessments | Activities & Evaluations |
| Attendance and results | Permitted attendance and released classroom results | Separate Attendance and Gradebook | Lesson Attendance and approved activity results | Session Attendance and tutor evaluations |
| Live teaching | Standalone Meeting Room participation | Standalone Meeting Room | Standalone Meeting Room with constrained temporary whiteboard | Standalone Meeting Room for eligible online sessions |
| Contextual communication | Discussions and Notifications; peer updates only within approved space permissions | Discussions, Announcements, Notifications | Discussions, Announcements, Notifications | Discussions, Announcements, Notifications |
| Notes and feedback | Personal notes; view released educator feedback | Class/lesson teaching notes and controlled feedback release | Feedback & Notes: private notes versus published feedback | Private Session Notes versus published feedback |
| Progress | Progress & Grades: personal versus released classroom records | Teaching Insights; Gradebook remains distinct | Learner Progress | Student Progress |
| AI | Separate future AI Study Assistant | AI Form Assistant | AI Lesson Assistant | Tutor-facing AI Tutor Assistant |

### Lesson and learning-plan preparation

Keep the different planning objects explicit: a student's own study plan, a school educator's class-linked lesson, an ESL teacher's reusable Lesson Plan and separate dated lesson, and a tutor's multi-session Learning Plan plus session-specific agenda. Connect plans to their authorized materials, activities, and sessions instead of duplicating schedules or assuming the same record type and permissions across all roles.

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

The target workflows include educator-controlled Attendance, ESL Lesson Attendance, and tutor Session Attendance. Roll call, optional learner check-in during eligible active sessions, confirmation/corrections, history, and status values such as present, absent, late, or excused require approved policy and API support. Students may view their own permitted attendance records.

LiveKit participant presence, connection duration, in-room chat, raised hands, and ESL whiteboard actions never automatically create or confirm attendance or engagement. One-to-one, group, and supported in-person/hybrid sessions retain their own explicit attendance workflow.

Network-based check-in is a proposed option for supported environments, not a default capability. Do not add location/network verification, device tracking, or anti-fraud claims without explicit product, privacy, and backend requirements.

### Student and learner management

Educators may need learner profiles, classroom membership/enrollment status, classwork, grades/evaluations, attendance, feedback, activity, and progress history within classrooms they are authorized to manage. Quick insights may include missing work, incomplete activities, frequent absences, performance changes, and activity summaries. These are decision-support views and must not be presented as fabricated live data.

### Learning materials

Educators may organize documents, PDFs, presentations, images, videos, and links by classroom/topic/lesson/resource. Students may organize personal notes, files, references, and study resources. Tutors may organize materials by learner, topic, lesson, skill, or session.

The student Study Library also supports Owlio-owned document and presentation editors. Students create/open personal work inside Owlio, optionally link an existing personal task, format document blocks, organize slides and speaker notes, preview/present, and export/import Owlio JSON backups. The current implementation saves only in the current browser, with save failures surfaced; it has no Google integration, account sync, collaboration, or classroom-submission behavior. Personal work remains separate from the labeled sample resource collections.

Keep the owner and context visible: personal resource, peer-shared study-space resource, educator-published classroom resource, or student submission. Do not invent accepted file types, upload limits, integrations, or permissions.

### Discussions, announcements, and polls

Classroom discussions connect questions and replies to the relevant class or lesson. Study-space discussions support peer learning and collaboration. Educators may publish classroom announcements and polls; study-space creators may publish peer-space updates where the product permission model allows it. Context and authorship must be clear.

All four role workflows use contextual Discussions in place of a general Messages inbox for the initial scope. Announcements are authored notices; Notifications are service-confirmed event updates. Transient Meeting Room chat is a separate interaction. Direct one-to-one/group messaging remains future until its own membership, delivery, privacy, moderation, and backend contracts are approved.

### Standalone Meeting Room and temporary ESL whiteboard

Meeting Room stays inside the dashboard shell, preserving the header and sidebar in the category page, invite lobby, call, and local ESL whiteboard preview. Its entry page offers Classroom (school educator), Tutor, and ESL choices. Students browse their enrolled classes in the selected category without switching workspace; teachers retain their own workspace and class scope. Only a real linked meeting may offer direct joining; otherwise use the teacher's invite. Current preview classes have no connected meetings. The classroom API does not yet provide owner teaching categories or linked meeting IDs, so connected category discovery depends on an extended backend contract; invite-based entry remains separate.

Meeting Room is a separate full page and sidebar destination in all four workspaces, with an invite/code lobby, connected-room state, recoverable connection feedback, and clean leave/end behavior. Classes and eligible scheduled lessons/sessions can deep-link into that same page with valid room context. Standalone entry does not imply room history, recordings, scheduled-room lists, or student host permissions.

Preserve opt-in microphone/camera and supported screen sharing, participants, room chat, and hand raises. Host/create/end actions require server authorization. Chat, hand raises, and participant presence remain transient room interactions, separate from saved Discussions, attendance, notes, and academic records.

Meeting presentation follows the viewer's workspace without changing room permissions: ESL and tutors use a reference-inspired coaching layout with a featured participant, thumbnail strip, participant/chat cards, and clearly unavailable AI notes/summary cards. Students and school educators use a Google Meet-inspired dark stage, grid/spotlight choices, bottom call controls, and optional side panels. Owlio retains its own LiveKit transport and invite/service contracts; this is not a Google Meet integration. A labeled `layout-preview=1` view demonstrates either layout without live participants, media requests, chat publishing, recording, or API calls. The existing ESL whiteboard preview remains separate. Recording, transcription, AI summaries, room history, and persistence require separately approved services/privacy contracts.

The ESL-only whiteboard scope is defined in [Meeting Room and live whiteboard](OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md#meeting-room-and-live-whiteboard). Its constrained built-in prompt/object workflow is included in the ESL delivery track; a persistent general-purpose collaborative canvas remains future. Connected delivery requires confirmed identity/permissions, bounded semantic events, ordering/deduplication, late-join/reconnect behavior, failed-publish feedback, and room isolation. A local whiteboard preview is not evidence of working multi-user synchronization.

### Notifications

Potential notification events include classroom invitations, new classwork/materials, deadlines, announcements, submissions, grades, feedback, discussion replies, polls, attendance events, and schedule changes. Delivery channels, read state, and privacy rules require product/backend confirmation. Do not claim a message or notification was delivered unless the service confirms it.

### Progress and reports

Students may view personal task completion, study activity, released grades, permitted attendance, deadlines, feedback, and learning history. Educators may review classroom grades, attendance, submission completion, participation, assessment results, and progress. Tutors may review session history, attendance, evaluations, feedback, and progress without school-only assumptions.

Potential exports include learner lists, grades, attendance, classwork results, and progress filtered by learner, classroom, activity, or date range. These are sensitive records and require authorization and an approved export contract. Never merge student-managed progress with official educator-controlled records as if they have the same owner.

School Gradebook remains a distinct official-result workflow sourced from assessment records, not a second grading authority inside Teaching Insights. Confirm calculation, weighting, rounding, overrides, release, and audit policy before implementation. ESL Learner Progress and tutor Student Progress use relevant teaching evidence without inferring language proficiency, mastery, school grades, or opaque risk scores from attendance, meeting activity, AI output, or sample data.

### Private teaching notes and published feedback

Private educator/ESL teaching notes and tutor Session Notes remain restricted to their authorized author/educator audience. Learner-facing feedback is a separate record or explicitly supported publication workflow with clear learner/group, lesson/session/activity, author, and audience. Saving a private note must not silently publish it, copy it into a discussion or notification, or include it in a learner/group report. Access, retention, edit/delete, and group privacy behavior require confirmed contracts.

### Lesson-centered workspace

A lesson/session may bring together lesson information, meeting details, materials, classwork/activities, attendance, discussion, and educator/tutor notes. Students see the permitted corresponding learning context, materials, activities, attendance, discussion, and submission actions. ESL/tutoring lessons may add objectives, speaking practice, and skill-related feedback when supported.

### AI assistance

AI is intended primarily to reduce repetitive educator work. Planned assistance includes question suggestions/refinement, grammar and clarity improvements, variations, answer choices, difficulty adjustment, organizing question sets, assignment instructions, discussion questions, activity ideas, lesson suggestions, written-response evaluation suggestions, and feedback drafts. ESL/tutoring examples include vocabulary, grammar, conversation, reading, writing, and speaking activities.

Generated material must remain a draft until reviewed. Educators must be able to review, edit, accept, reject, or override generated content. AI must not silently publish content, contact learners, change official records, or establish final grades. Do not call an AI provider directly from the browser or send learner/private data without an approved service, privacy, and backend contract.

The role-specific experiences are AI Form Assistant for educators, AI Lesson Assistant for ESL teachers, and AI Tutor Assistant for tutors. Student AI Study Assistant remains a separate future capability, disabled until its age/safety, sources, privacy, and service scope are approved. A shared page or route does not define equal permissions or prove generation exists.

Follow the [AI implementation plan](OWLIO_AI_IMPLEMENTATION_PLAN.md) for the proposed local/self-hosted inference architecture and staged rollout: professional preparation/drafting first, English-only initially, and only user-entered task context/settings. Do not include learner names, records, private notes, or submissions in initial prompts. The frontend calls an approved Owlio backend contract, not a model runtime directly. Model selection, infrastructure, and service schemas remain dependent on evaluation and backend agreement; enabling AI must not activate unrelated paused integrations.

## 6. Role and record boundaries

- Students own their personal notes, personal tasks, study plans, personal resources, and personal learning activity.
- Student-created study spaces contain peer collaboration; they are not official classrooms.
- Educators control official classroom classwork, submissions/review, grades/evaluations, attendance, feedback, announcements, and classroom progress for classrooms they own or are authorized to manage.
- Tutors and ESL teachers use the educator classroom model with flexible teaching context; tutoring evaluations must not be silently treated as institutional grades.
- Private teaching/session notes remain separate from intentionally published learner feedback, including in reports, progress summaries, discussions, and notifications.
- Meeting chat, raised hands, participant presence, and ESL whiteboard responses are transient interactions, not attendance, assessment submissions, or progress records.
- Backend authorization and classroom isolation are the security boundary. Client-side role selection, route visibility, and form validation are UX only.
- Preserve privacy of learner profiles, grades, attendance, feedback, submissions, and exported reports.

## 7. End-to-end workflows

These journeys summarize the linked page-level workflows. Each action depends on the relevant approved service, record ownership, and audience; the sequence is not a claim that all steps currently work.

### Independent student

Register/sign in → Overview → My Learning for subjects, notes, personal tasks/plans → organize personal resources in Study Library and dates in Calendar & Schedule → optionally create/join a Study Space under approved peer permissions → review personal learning in Progress & Grades.

Specification: [Student page workflows](OWLIO_STUDENT__WORKFLOW_PLAN.md#page-content-and-student-workflows). Joining a class is optional; personal learning must work independently.

### Student in an educator/tutoring classroom

My Classes → join/open an authorized school, tutoring, or ESL class → view permitted materials, activities, and schedule → enter the standalone Meeting Room when an eligible online lesson has a valid room → complete/submit assigned classwork → view released results/feedback and permitted attendance → review classroom results separately from personal progress.

Specification: [My Classes](OWLIO_STUDENT__WORKFLOW_PLAN.md#my-classes) and [Tasks & Assessments](OWLIO_STUDENT__WORKFLOW_PLAN.md#tasks--assessments). Participation never grants educator record-editing authority.

### Educator

Register/sign in → Overview → create/open an authorized class in My Classes → manage supported enrollment → prepare lessons in Lesson Planner and dates in Calendar & Schedule → attach Teaching Materials and draft/review/publish Classwork & Assessments → teach using the standalone Meeting Room where applicable → record Attendance explicitly → review submissions and feedback → manage official results/release through the activity and Gradebook workflows → communicate through Discussions/Announcements → review sourced Teaching Insights.

Specification: [Educator workflow model](OWLIO_EDUCATOR_WORKFLOW_PLAN.md#educator-workflow-model). Notifications link to confirmed source events; AI Form Assistant supplies drafts within the human-controlled authoring flow.

### ESL teacher

Register/sign in → Overview → select an authorized learner/group in My Learners → prepare a reusable Lesson Plan → attach Teaching Materials and Activities & Assessments → create a dated Lesson Schedule entry → teach in the standalone Meeting Room with the constrained temporary whiteboard when available → record Lesson Attendance explicitly → review work → save private notes and deliberately publish learner feedback through Feedback & Notes → review sourced Learner Progress.

Specification: [End-to-end ESL educator workflow](OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md#end-to-end-esl-educator-workflow). AI Lesson Assistant supplies teacher-reviewed preparation drafts; live whiteboard responses are never retained as learner records.

### Tutor

Register/sign in → Overview → establish an authorized learner/group relationship in My Learners → organize multi-session goals in Learning Plans → prepare the session agenda, Teaching Materials, and Activities & Evaluations → schedule a supported online/in-person/hybrid session in Sessions & Schedule → teach, using Meeting Room only for a valid online room → explicitly record Session Attendance → keep Session Notes private and publish learner feedback separately → review sourced Student Progress.

Specification: [End-to-end tutor workflow](OWLIO_TUTOR_WORKFLOW_PLAN.md#end-to-end-tutor-workflow). AI Tutor Assistant supports tutor-reviewed drafts; institutional grading and tutoring-business administration are not assumed.

## 8. Delivery roadmap aligned to the four workflows

### Shared delivery dependencies

Keep student independence as a product priority while developing the professional workspaces through their own staged roadmaps. The following sequence expresses shared dependencies, not a requirement to finish every role at each step before advancing another. Each role's linked roadmap defines its detailed order; stage numbers are local to that plan and do not mean equivalent releases across roles.

1. **Contracts and user foundation:** confirm account/profile mapping, record ownership, membership, backend authorization, privacy, and service lifecycles across student, educator, ESL, and tutor workspaces. Verify runtime integration mode and distinguish preview from connected functionality.
2. **Independent learning and teaching relationships:** build account-scoped student subjects/notes/tasks/resources; establish authorized school classes and ESL/tutor learner/group relationships. Keep useful first-run workflows and real-data/empty/error states in every workspace.
3. **Preparation, resources, and schedules:** connect educator Lesson Planner, ESL Lesson Plans and separate Lesson Schedule, and tutor Learning Plans and Sessions & Schedule. Define calendar and material-sharing contracts before offering persisted actions.
4. **Teaching, learner work, and records:** retain the standalone Meeting Room pattern; deliver the constrained ESL whiteboard after its transport/authorization spike. Connect activities, submissions, human-controlled evaluation/feedback, school Gradebook, and separate attendance workflows as their contracts become available. Keep private notes separate from published feedback.
5. **Collaboration and sourced progress:** connect student peer spaces, contextual Discussions, Announcements, Notifications, and role-specific progress/insights only with approved membership, persistence, delivery, and visibility contracts. Add authorized exports only after their contracts exist.
6. **Professional AI and account completion:** deliver educator/ESL/tutor preparation drafts through the approved AI service and human review flow; connect profile/preferences and support destinations when supported. Student AI requires a separate approval and delivery phase.

### Role delivery tracks

| Workflow roadmap | Ordered role-specific stages |
|---|---|
| [Student delivery roadmap](OWLIO_STUDENT__WORKFLOW_PLAN.md#delivery-roadmap) | Product/API decisions → student independence → classroom participation → academic organizer → peer collaboration/contextual communication → student tools and account completion. Student AI remains conditional. |
| [Educator delivery roadmap](OWLIO_EDUCATOR_WORKFLOW_PLAN.md#delivery-roadmap) | Product/data/access contracts → workspace and authorized classes → lesson/schedule/materials → classwork/submissions/Gradebook → attendance/student management → communication/live teaching → insights/AI → account completion/polish. |
| [ESL teacher delivery roadmap](OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md#delivery-roadmap) | Product/realtime contracts → learner/lesson foundation → preparation/schedule/materials → live Meeting Room and temporary whiteboard → activities/attendance/feedback → communication/progress → AI/account settings. |
| [Tutor delivery roadmap](OWLIO_TUTOR_WORKFLOW_PLAN.md#delivery-roadmap) | Product/data/access contracts → learner relationships → Learning Plans/sessions/schedule → activities/evaluations/attendance/notes → materials/communication/progress → AI/account settings. |

### Current live-learning scope and future enhancements

The standalone Meeting Room and the constrained temporary ESL whiteboard are part of the aligned workflow scope, subject to confirmed service/realtime contracts and verification. They must not be excluded merely because the older product roadmap deferred all video/whiteboard work. Existing room integration code and local previews still do not prove currently enabled or production-ready behavior.

Keep broader enhancements out of the initial role workflows unless separately approved: conferencing capabilities beyond the current room scope, recordings, persistent/general-purpose collaborative whiteboards, direct messaging, native mobile apps, autonomous student AI/personalized learning paths, advanced analytics/risk scoring, plagiarism detection, automated timetables, institution-wide administration, parent accounts, SIS integration, payments/subscriptions/invoicing, advanced tutoring-business scheduling, and additional third-party integrations. A planned sidebar destination does not by itself commit a feature to a release.

## 9. Open decisions agents must not guess

- Current registration accepts `student`, `educator`, `tutor`, and `esl`; onboarding still uses `student`, `educator`, and `others` with subtypes. Define profile/onboarding persistence and mapping against the confirmed account contract; do not infer authorization from local subtype choices.
- Student-created peer Study Spaces are the student workflow baseline. Confirm eligibility and powers for non-student creators/admins, plus the detailed creator/member/invitation/sharing model, before expanding access.
- Confirm school classroom ownership/membership and ESL/tutor learner/group relationships, enrollment methods, record isolation, and host permissions with the backend contract.
- Confirm activity/submission lifecycles, supported evidence types, revision windows, school grading/calculation/release/audit rules, tutoring evaluation policy, and learner-visible results.
- Confirm attendance status values, check-in eligibility, corrections/audit behavior, and permitted learner history. Presence and whiteboard activity are excluded as automatic record sources.
- Confirm private-note access/retention and feedback publication/audience rules, including individual records within groups.
- Confirm exact ESL whiteboard interaction authority and realtime transport behavior: payload/rate limits, attribution, ordering/deduplication, late join/reconnect, failure handling, and cleanup. The constrained workflow scope does not establish a transport contract.
- Confirm session modes, calendar timezone/recurrence/cancellation/reminders, material file/storage/sharing constraints, communication audiences, notification channels/read state, and protected report/export formats.
- Follow the AI implementation plan for professional drafting scope; agree on the backend schema, evaluated model/infrastructure, and privacy/retention policy before integration. Student AI requires separate age/safety/source/privacy decisions; a shared route does not grant access.
- Verify present source and runtime mode before reporting implementation status. Do not treat historical route/service snapshots, local previews, or this roadmap as proof of an enabled or completed backend feature.

## 10. Product success statement

Owlio should let a student organize learning independently and connect that learning to school, ESL, or tutoring instruction without losing ownership and privacy boundaries. Each professional workspace should provide a coherent preparation → teaching → review/feedback → progress journey suited to its role.

Product-level acceptance requires:

- Independent student learning works without joining a class; personal, peer, and official classroom records remain separate.
- Each workspace follows its linked role plan's navigation and page flows. New links resolve to registered role-prefixed routes; planned items remain non-navigable until implemented, and titles, active matching, and search stay coherent.
- School educators have separate Classwork & Assessments, Attendance, Gradebook, Lesson Planner, and Teaching Insights responsibilities. ESL teachers have separate plans, dated lessons, private notes, published feedback, and evidence-based progress. Tutors have distinct Learning Plans, sessions, private notes, evaluations, and non-school progress.
- Meeting Room remains standalone across roles. Its transient chat/presence and the room-only temporary ESL whiteboard cannot silently become attendance, saved discussions, submissions, or academic records.
- Resources, learner records, feedback, progress, and reports preserve their authorized owner, source, and audience. AI remains role-specific and human-reviewed; student AI is separately gated.
- Applicable loading, first-use empty, filtered-empty, unavailable, recoverable error, and permission states are usable with keyboard, touch, and responsive layouts. Sample/local behavior and enabled service-confirmed behavior are clearly distinguished.

Evaluate each delivered slice against these shared criteria and the relevant role plan's detailed acceptance criteria. This document connects the four workflows; it does not replace their page specifications or backend authorization requirements.
