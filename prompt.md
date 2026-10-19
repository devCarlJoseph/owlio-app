Use only these relevant Owlio skills:
- owlio-role-workflows
- student-workflows
- educator-classroom, for shared classroom membership and ownership boundaries

Do not load unrelated skills.

## Task
Improve the student’s join-by-code experience in My Classes. Make request status, success, and error feedback clear, and ensure the class list reflects a successful join only after the service confirms it.

## Workspace and target
- Workspace: Student
- Page: My Classes
- Current route: /students/classrooms
- Keep the existing standalone Meeting Room and unrelated role pages unchanged.

## Scope
In:
- Inspect and improve the join-by-code flow on the existing My Classes page.
- Use the existing classroom service and current response/error handling.
- Keep connected class records distinguishable from any demo or mock classroom previews.

Out:
- Do not add a new route, invitation method, backend endpoint, or permission.
- Do not change educator, ESL teacher, or tutor navigation.
- Do not build other planned classroom features.

## Authoritative context to inspect
1. Read the Student workflow plan’s My Classes requirements, route inventory, click-through flow, data-boundary rules, and acceptance criteria:
   OWLIO_STUDENT__WORKFLOW_PLAN.md
2. Inspect the current route in src/main.tsx and the components used by /students/classrooms.
3. Inspect src/services/api/classroom.service.ts and the current join flow before changing behavior. Confirm the endpoint and request/response shape from source.
4. Check AGENTS.md and the selected skills for route, ownership, accessibility, and authorization rules.

Known plan context:
- My Classes is the student’s entry to joined learning contexts.
- The plan includes join-by-code, but invitations or other join methods need their own confirmed contract.
- Classroom list/create/join API calls exist, while classroom prototypes may also include demo data. Verify and keep those sources distinct.

## Non-negotiable boundaries
- A join succeeds only when the classroom service confirms it.
- A visible route or control does not establish class membership or access; the backend is authoritative.
- Do not show demo classes as server-confirmed memberships.
- Do not expose private class, learner, grade, or feedback data.
- Do not invent duplicate-code, expiration, permission, or other error behavior. Use confirmed API errors; ask if an unresolved contract changes the interaction.
- Do not inspect or include .env values, credentials, tokens, or learner records in the prompt or output.

## Acceptance criteria
- The existing student-prefixed route remains /students/classrooms.
- The join form has a clear pending state and prevents accidental duplicate submission while a request is in progress.
- Success feedback and any list update happen only after the API confirms the join.
- Recoverable failure leaves the student with a clear next step and does not imply membership was created.
- Connected classes remain distinguishable from demo or mock previews.
- The flow works with keyboard and touch, has labeled controls and visible focus, and displays applicable loading, empty, and error states.
- No unrelated role, route, or feature is changed.

## Validation and handoff
- Verify the join flow against the actual API service and current response/error model.
- Run relevant tests if available, focused lint, npm run build, npm run lint when feasible, and git diff --check.
- Report changed files, behavior, checks actually run, and any unresolved API or product dependency.