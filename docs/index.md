# Owlio documentation

Start with the document that answers the task's question. Read only the relevant sections.

| Need | Entry point |
| --- | --- |
| Repository rules and task routing | [AGENTS.md](../AGENTS.md) |
| Product purpose, roles, ownership, and planned boundaries | [Product overview](product/overview.md) |
| Source organization, UI implementation, and security conventions | [Frontend architecture](architecture/frontend.md) |
| Breaking down components and choosing context ownership | [Component decomposition guide](sops/component-decomposition.md) |
| File-by-file migration plans for each feature | [Per-feature component breakdowns](component-breakdowns.md) |
| Page files that render feature views | [Thin page adapters](components/page-adapters.md) |
| What is implemented, paused, local, or illustrative | [Capability status](architecture/capability-status.md) |
| Task execution and completion | [Agent workflow](sops/README.md) |
| Screenshot or image implementation | [Reference UI SOP](sops/reference-ui.md) |
| Feature work | [Feature delivery SOP](sops/feature-delivery.md) |
| Defect investigation | [Bug fix SOP](sops/bug-fix.md) |
| Backend integration | [API integration SOP](sops/api-integration.md) |
| Choosing checks and reporting evidence | [Verification](sops/verification.md) |
| API integration skill | [Contract integration guidance](../.agents/skills/owlio-api-contract-integration/SKILL.md) |

## Detailed product plans

These existing documents retain detailed target navigation, page flows, acceptance criteria, and roadmaps. Their implementation snapshots must be rechecked against current source and configuration.

- [Student workspace](../OWLIO_STUDENT__WORKFLOW_PLAN.md)
- [School educator workspace](../OWLIO_EDUCATOR_WORKFLOW_PLAN.md)
- [ESL teacher workspace](../OWLIO_ESL_TEACHER_WORKFLOW_PLAN.md)
- [Tutor workspace](../OWLIO_TUTOR_WORKFLOW_PLAN.md)
- [AI implementation proposal and gates](../OWLIO_AI_IMPLEMENTATION_PLAN.md)
- [Earlier meeting integration proposal](../WEBRTC_SOCKET_IO_INTEGRATION_PLAN.md): historical planning; inspect the current LiveKit implementation before relying on it.

## Integration details

- [Authentication and role access](AUTH_ROUTE_ACCESS.md)
- [Classroom API integration](CLASSROOM_API_INTEGRATION.md)
- [Current API connection and remaining frontend integrations](API_CONNECTION.md)

## Maintaining this documentation

Keep each fact in its owning document: product intent in product docs, current behavior in architecture/integration docs, execution steps in SOPs, and specialized reusable procedures in skills. Link to the owner instead of copying its instructions.

Update the affected document when a change alters its contract or behavior. Keep dated verification results as historical evidence, not current guarantees. Add links here when adding a new durable document. Root role plans remain in place to preserve existing references; a future move should update all incoming links.

`note.md`, `prompt.md`, and `DEV_TEAM.md` are task-template/team notes, not an additional automatic instruction chain. They do not authorize commits, pushes, or unrelated work. For the current repository workflow, use the entry points above.
