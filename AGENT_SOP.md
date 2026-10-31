# Owlio Agent SOP

Use this SOP to turn an authorized task into a scoped, verified change that follows Owlio's connected product plans and skills. It covers planning, documentation, UI previews, browser-local functionality, and backend integration work. It does not authorize additional features, permissions, services, dependencies, or deployment.

## Document responsibilities

| Source | Responsibility |
|---|---|
| [AGENTS.md](AGENTS.md) | Repository rules, architecture conventions, verification requirements, and implementation snapshots. |
| [Product plan](OWLIO_PRODUCT_PLAN.md) | Shared product direction, relationships between workspaces, ownership boundaries, and delivery dependencies. |
| Role workflow plans below | Detailed navigation, page requirements, component ownership, click flows, roadmaps, and acceptance criteria. |
| [Owlio Core](.agents/skills/owlio-core/SKILL.md), [Role Workflows](.agents/skills/owlio-role-workflows/SKILL.md), and relevant domain skills | Focused guidance for applying the plans within the repository. |
| Current source, runtime settings, and confirmed backend/API/security contracts | Evidence of implemented and enabled behavior; backend contracts govern server operations and resource access. |
| This SOP | Task execution, verification, documentation maintenance, and handoff. |

Plans define intended behavior; skills interpret them. Neither an existing route nor a client function proves a working backend feature or permission. Explicit owner decisions apply to product scope; unresolved conflicts between approved requirements need clarification before dependent implementation.

## 1. Identify the task

Identify the affected workspace, page or domain, requested outcome, and task type. Distinguish planning/documentation from UI previews, browser-local functionality, and connected services.

Inspect `git status` and the relevant existing changes before editing. Preserve unrelated work. A task affecting one role does not authorize changing another role or implementing its entire roadmap.

## 2. Read the relevant specifications

Read `AGENTS.md`, the relevant product-plan section, and the affected role plan's page requirements, click flow, component map, and acceptance criteria. Select only the skills relevant to the task.

| Workspace | Workflow specification | Role skill |
|---|---|---|
| Student | [Student workflow](OWLIO_STUDENT__WORKFLOW_PLAN.md) | [Student Workflows](.agents/skills/student-workflows/SKILL.md) |
| School educator | [Educator workflow](OWLIO_EDUCATOR_WORKFLOW_PLAN.md) | [Educator Classroom](.agents/skills/educator-classroom/SKILL.md) |
| ESL teacher | [ESL teacher workflow](OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md) | [ESL Teaching](.agents/skills/esl-teaching/SKILL.md) |
| Tutor | [Tutor workflow](OWLIO_TUTOR_WORKFLOW_PLAN.md) | [Tutoring Workflows](.agents/skills/tutoring-workflows/SKILL.md) |

For shared capabilities, use the product plan's [feature map](OWLIO_PRODUCT_PLAN.md#shared-capabilities-and-role-specific-destinations) and the relevant domain skill listed in `AGENTS.md`. For AI work, also read the [AI implementation plan](OWLIO_AI_IMPLEMENTATION_PLAN.md). Do not load every plan or skill for an unrelated small task.

## 3. Verify the current implementation

Inspect affected routes, navigation, feature components, shared controls, service clients, and applicable contracts. Check `src/lib/api-mode.ts` and the code that consumes it before describing integrations or route guards as active. Do not read `.env` contents.

Distinguish proposed/disabled behavior, sample data, in-memory state, browser-local persistence, preserved but disabled integrations, and enabled service behavior. Runtime verification is separate from finding integration code. Recheck `E`/`P`/`D` route labels in plan snapshots against current source.

An implementation gap does not redefine the intended workflow. Record unsupported behavior as a dependency rather than inventing endpoints, permissions, persistence, or success states. Do not enable unrelated integrations as a side effect of a page task.

## 4. Define the delivery scope

Choose the smallest complete change that satisfies the request. Identify the record owner, intended audience, persistence location, relevant class/space/learner/session context, and observable acceptance checks.

Use the relevant role roadmap for dependencies; stage numbers in different role plans do not represent equivalent releases. Continue authorized work independently. Ask when an unresolved product/backend decision affects required behavior, ownership, permissions, persistence, or privacy, and continue unaffected work while awaiting clarification. Do not seek repeated approval for routine implementation choices already within scope.

Follow `AGENTS.md` for delegation: do not start subagents without explicit authorization. When authorized, assign disjoint file ownership and retain responsibility for integration and verification.

## 5. Preserve workflow boundaries

| Workspace | Boundary to preserve |
|---|---|
| Student | Independent learning works without a class. Keep personal work, peer Study Spaces, and official classroom records distinct; show only permitted/released results. |
| School educator | Scope records to authorized classes. Keep Classwork & Assessments, Attendance, Gradebook, Lesson Planner, and Teaching Insights responsibilities distinct. |
| ESL teacher | Separate reusable Lesson Plans from dated Lesson Schedule entries and private notes from published feedback. Keep the constrained temporary whiteboard inside an authorized ESL session; permitted student learners may respond. |
| Tutor | Separate multi-session Learning Plans from session agendas, private Session Notes from published feedback, and tutoring evaluations from institutional grades. Do not impose school-only structures. |

Across roles, transient meeting presence/chat, hand raises, and whiteboard responses do not automatically become attendance, saved discussions, submissions, or progress records. Keep resource ownership and publication audience explicit. AI follows the approved role-specific drafting scope and human review requirements; student AI remains separately gated. Backend authorization remains the access boundary.

## 6. Implement and verify

Reuse project components, tokens, utilities, and form conventions. Keep new/refactored route folders to thin `index.tsx` adapters and substantive behavior in feature modules. For navigation changes, update registered routes, sidebar destinations, titles, active matching, and header search together; planned destinations must not create dead links.

Check affected interactions, applicable loading/empty/error/unavailable states, keyboard and touch access, visible focus, responsive layouts, ownership, and audience. Confirm server mutations only after successful service responses. A successful browser-local save must be labeled local rather than account-synced or shared.

Follow [AGENTS.md verification requirements](AGENTS.md#7-verification-and-handoff):

- Run focused ESLint on touched TS/TSX files, `npm run build` when feasible, repository lint, and `git diff --check` as specified there. A Vite-only build does not replace the TypeScript check.
- Run relevant existing tests and add focused coverage when meaningful behavior needs protection; avoid tests that merely mirror implementation or wording.
- For documentation/skills, also check links, anchors, document consistency, and skill frontmatter/reference structure. These checks do not silently replace required repository checks.
- Verify connected or cross-client behavior only when the required services/clients are available; otherwise report that behavior as unverified.

Inspect the final diff and status. Separate introduced failures from pre-existing findings and report any skipped or blocked check accurately; never suppress a rule globally to make a check pass.

## 7. Maintain alignment

Update shared product decisions in the product plan, detailed page behavior in the affected role plan, and applicable skill guidance when the task changes those requirements. Update implementation-status documentation when its described behavior changes. Preserve working links between these sources.

Keep rules in `AGENTS.md`, detailed product/page specifications in the plans, domain guidance in skills, and execution steps here. Avoid copying a temporary implementation snapshot into every document or rewriting approved product decisions to match a preview. Document unresolved assumptions instead of silently choosing a new contract.

## 8. Handoff accurately

Report the outcome, behavior changed, and modified files/routes. Include checks actually run with results, existing failures, skipped verification, backend dependencies, and any owner decisions still needed.

State whether delivered functionality is a preview, in-memory, browser-local, disabled integration, or verified connected behavior. Claim completion only for the requested scope and evidence available. Documentation alignment alone does not activate services or establish backend authorization.
