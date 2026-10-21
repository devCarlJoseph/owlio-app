Use only these relevant Owlio skills:
- owlio-role-workflows
- student-workflows
- educator-classroom, for shared classroom membership and ownership boundaries

Do not load unrelated skills.

## Task
Rebuild the student's My Classes page as an honest, API-backed class list with a reliable join-by-code flow. Every class the student sees must be traceable to a confirmed enrollment or be visibly labeled as a demo preview, and every list update must follow a confirmed service response.

## Workspace and target
- Workspace: Student
- Page: My Classes
- Current route: /students/classrooms
- Keep the existing standalone Meeting Room (/students/classrooms/meeting-room), the class detail route, and unrelated role pages unchanged.

## Scope
In:
- Inspect and improve the My Classes list page for the student workspace.
- Use the existing classroom service and current response/error handling.
- Keep connected class records distinguishable from demo or mock classroom previews.
- Keep the join-by-code action, including pending, success, and failure states.
- Keep the shared classroom component usable for educators, tutors, and ESL teachers without changing their behavior.

Out:
- Do not add a new route, invitation method, backend endpoint, permission, or dependency.
- Do not change educator, ESL teacher, or tutor navigation or pages.
- Do not rebuild classroom detail tabs, classwork submission, attendance, materials, schedule, or progress — those are separate pages and in-memory previews today.
- Do not flip `API_INTEGRATION_ENABLED` in src/lib/api-mode.ts without owner approval.

## Authoritative context to inspect
1. Read the Student workflow plan's My Classes requirements, route inventory, click-through flow, data-boundary rules, and acceptance criteria:
   OWLIO_STUDENT__WORKFLOW_PLAN.md
2. Inspect the current route in src/main.tsx and the components used by /students/classrooms:
   - src/pages/dashboard/classroom/index.tsx (thin adapter)
   - src/components/features/classrooms/classrooms-view.tsx (the My Classes screen)
   - src/components/features/classrooms/classroom-prototype-provider.tsx (list/create/join orchestration)
   - src/components/features/classrooms/classroom-prototype-context.ts and classroom-types.ts
   - src/components/features/classrooms/classroom-mock-data.ts (demo classes and demo join codes)
3. Inspect src/services/api/classroom.service.ts and confirm the endpoint and request/response shape from source:
   - GET /api/v1/classrooms -> ApiClassroom[]
   - POST /api/v1/classrooms (create)
   - POST /api/v1/classrooms/join with body { joinCode }
   - ApiClassroom = { id, name, subject, description, instructorName, joinCode, meetingId, access: 'owner' | 'student' }
   - Error handling goes through getApiErrorMessage in src/services/api/api-error.ts
4. Check AGENTS.md and the selected skills for route, ownership, accessibility, and authorization rules.

Known plan context:
- My Classes is the student's entry to joined learning contexts and a primary student destination.
- The plan includes join-by-code; invitations and join links need their own confirmed contract before they exist.
- Classroom list/create/join API calls exist, but the provider also injects demo classes, and class details, materials, classwork, submissions, attendance, and progress remain in-memory previews. Keep those sources distinct.
- src/lib/api-mode.ts currently exports API_INTEGRATION_ENABLED = false, so connected calls are paused. Treat re-enabling as an owner decision, not a side effect of this task.

## Non-negotiable boundaries
- A class appears in the student's list as connected only when the classroom service confirms it.
- A visible route or control does not establish class membership or access; the backend is authoritative.
- Do not show demo classes as server-confirmed memberships, and do not label a demo join as a saved enrollment.
- Do not expose private class, learner, grade, attendance, or feedback data.
- Do not invent duplicate-code, code-expiration, permission, or other error behavior. Use confirmed API errors and ask if an unresolved contract changes the interaction.
- Do not change shared educator, tutor, or ESL classroom behavior as a side effect of a student-facing change.
- Do not inspect or include .env values, credentials, tokens, or learner records in the prompt or output.

## Acceptance criteria
- The existing student-prefixed route remains /students/classrooms and the page title and active navigation still read My Classes.
- The list shows each joined class with educator/tutor identity and subject/context, and states clearly which entries are connected and which are demo previews.
- The join form has a clear pending state, prevents accidental duplicate submission while a request is in progress, and shows inline success feedback only after the API confirms the join.
- A recoverable failure leaves the student with a clear next step and does not imply membership was created; the list does not change on failure.
- The page defines loading, first-use empty, and API-unavailable/error states that match the real data source.
- No demo class, count, session, activity, or result is presented as live student data.
- The flow works with keyboard and touch, has labeled controls, visible focus, and uses appropriate status/alert semantics for pending, success, and error messages.
- No unrelated role, route, or feature is changed.

## Validation and handoff
- Verify the join flow against the actual API service and current response/error model.
- Run relevant tests if available, focused lint, npm run build, npm run lint when feasible, and git diff --check.
- Report changed files, behavior, checks actually run, and any unresolved API or product dependency.
