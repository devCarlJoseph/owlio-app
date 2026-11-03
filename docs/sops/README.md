# Agent workflow

Use this workflow for substantive repository tasks. Small copy/document edits can go directly from focused inspection to the relevant check. Read only the SOP and product sections needed for the request.

## 1. Establish the task

Identify the requested outcome, affected screen/workspace, and constraints. Inspect relevant source and existing user changes. Give a short scope update; proceed with authorized work without introducing a routine approval gate.

For a visual task, distinguish "reproduce this" from "use as inspiration" using the request. For a behavior task, identify the owner, audience, data source, persistence, and success condition. Ask only when a missing answer materially blocks correct work; continue independent work where possible.

## 2. Load the relevant context

| Task | Primary procedure | Additional context only when needed |
| --- | --- | --- |
| Screenshot/reference implementation or redesign | [Reference UI](reference-ui.md) | Target view, local UI APIs, affected product boundary |
| New or changed behavior | [Feature delivery](feature-delivery.md) | [Product overview](../product/overview.md), matching role plan |
| Defect/regression | [Bug fix](bug-fix.md) | Relevant tests, state flow, contract |
| Connect/change HTTP behavior | [API integration](api-integration.md) | Confirmed backend contract, [capability status](../architecture/capability-status.md) |
| Documentation only | Edit the owning document and validate links | [Documentation index](../index.md) |
| Verification choice or handoff | [Verification](verification.md) | Changed behavior and available tools |

Combined tasks may use the relevant parts of two procedures. Avoid loading every SOP or every role plan.

Skills are optional specialized procedures, loaded only when explicitly requested or their description matches the task. A skill does not override user scope or establish a product/API contract. See the [skills policy](../../.agents/README.md).

## 3. Implement and inspect

Define completion in observable terms before editing. Keep a small in-chat plan for multi-step work; create a separate execution plan only for work that needs a durable roadmap. Separate product intent from current capability and from the requested change.

Make cohesive changes using current architecture. Preserve unrelated edits, working interactions, local user records, and service boundaries. Make reasonable reversible implementation decisions; surface unresolved access, ownership, persistence, or external contract decisions.

For authorized parallel work, assign disjoint file ownership and a coordinator for shared routes/contracts and final review. Start subagents only when the user or higher-priority session instructions permit them.

## 4. Validate and iterate

Choose checks with [verification](verification.md). Inspect results, fix issues caused by the change, and repeat the affected checks until completion criteria are met. A UI task includes rendered inspection when browser tools are available. A build alone does not establish visual fidelity.

If tooling or a missing contract prevents a required check/implementation, finish independent work and report the exact remaining limitation. Do not report a preview as live integration or a skipped check as passed.

## 5. Synchronize and hand off

Update only docs made inaccurate by the change: product intent, architecture/capability status, or integration details. Put a new recurring procedure in its owning SOP or optional skill; keep feature history out of `AGENTS.md`.

Report the resulting behavior, key files, actual verification, and remaining limitations. Commit, push, publish, deploy, or contact others only when authorized for that action.

## Resolving conflicting information

User instructions define the current task, subject to higher-priority session instructions. Product docs describe intended semantics; reference images describe requested appearance; source/configuration describe implemented/enabled behavior; confirmed API contracts describe external capabilities. None substitutes for the others. Resolve routine visual details locally; surface material product/contract conflicts.

[Repository rules](../../AGENTS.md) | [Documentation index](../index.md)
