# Owlio agent instructions

Owlio supports independent learning, peer study, and educator-led learning across student, school educator, ESL teacher, and tutor workspaces. This repository contains the React/TypeScript frontend and API clients; backend services and infrastructure live elsewhere.

## Task routing

Read only the context needed for the request. For substantive work, use the relevant parts of the [agent workflow](docs/sops/README.md); small edits need focused inspection and validation.

| Task | Read when applicable |
| --- | --- |
| Reproduce an image, mockup, or requested redesign | [Reference UI SOP](docs/sops/reference-ui.md) |
| Add/change behavior | [Feature delivery SOP](docs/sops/feature-delivery.md), relevant [product/role plan](docs/product/overview.md) |
| Investigate a defect | [Bug fix SOP](docs/sops/bug-fix.md) |
| Change API/session integration | [API integration SOP](docs/sops/api-integration.md), confirmed contract |
| Change navigation, shared UI, or persistence | Relevant [frontend architecture](docs/architecture/frontend.md) section |
| Establish what works or is enabled | [Capability status](docs/architecture/capability-status.md) and current source/configuration |
| Choose checks or report completion | [Verification](docs/sops/verification.md) |
| Find another document | [Documentation index](docs/index.md) |

## Scope and decisions

- Inspect the affected source and existing user changes before editing. Preserve unrelated changes and behavior.
- Continue authorized work through implementation, inspection, and correction. A short plan is not a mandatory approval gate.
- Make reasonable reversible layout and implementation decisions. Ask when missing information materially affects ownership, access, persistence, external contracts, or scope.
- Product/role plans describe intended behavior. Source describes implementation; runtime flags describe enablement; confirmed backend contracts describe external capabilities. Surface material disagreements.
- Keep changes focused. Use installed tools and existing patterns; introduce dependencies or broad configuration changes only when necessary and within the authorized task.
- Start subagents only when the user or higher-priority session instructions permit them. Coordinate shared-file ownership and verify integrated results.
- Commit, push, publish, deploy, or send messages only when authorized for that action.

## Reference images and UI

- When asked to match/recreate a reference, use it as the visual specification for the requested area. A reference described as inspiration allows interpretation.
- Match layout, proportions, spacing, typography, colors, density, and details. Existing fonts, theme tokens, layouts, and component defaults may be adapted within the redesign's scope.
- Reuse component behavior and accessibility; adapt variants/composition rather than letting default styling override the reference. Preserve unrelated shared surfaces.
- Preserve supported interactions, validation, data sources, storage formats, and authorization while restyling. A screenshot does not establish backend capabilities.
- Make sensible responsive decisions where the image is silent. Keep semantic controls, labels, visible focus, keyboard access, and reduced-motion support.
- Render the target, compare at the reference viewport, correct visible differences, and check a narrow layout when browser tools are available. Report unavailable visual checks and remaining mismatches.

## Product and data boundaries

- Keep student-owned work, peer study, and official classroom records distinct. Personal completion is not a grade; live-room presence is not official attendance.
- Keep private educator/tutor notes separate from learner-visible feedback. Respect the distinct school, ESL, and tutor contexts.
- Distinguish API-backed records, browser-local data, tab-memory previews, and transient meeting events. Label examples and unavailable actions honestly; preserve existing local records.
- Use confirmed routes, payloads, permissions, and persistence. Do not present UI-only actions as server success or silently replace connected failures with mock data.
- Inspect `src/lib/api-mode.ts` before integration work; preserve its setting unless changing operating mode is part of the request.
- Follow the [AI plan](OWLIO_AI_IMPLEMENTATION_PLAN.md) for AI work: professional outputs remain reviewable drafts; student generation remains gated; server-only inference/credentials stay outside the browser.

## Implementation conventions

- Use npm and `package-lock.json`. The app uses Vite, React Router, Tailwind, and local Base UI/shadcn wrappers.
- Routes: `src/main.tsx`; navigation: `src/components/common/dashboard-navigation.ts`. Synchronize affected hrefs, active matching, titles, and navigation search.
- Keep role-prefixed URLs (`/students`, `/educators`, `/tutors`, `/esl`). URL context is presentation, not authorization.
- Keep new/refactored route adapters thin; put substantive behavior in `src/components/features/<domain>/`. Shared domain-neutral controls belong in `src/components/ui/`; inspect their actual APIs.
- Use the `@/*` source alias, typed services under `src/services/api/`, and neighboring form/schema patterns. Avoid unrelated tree or styling rewrites.
- Preserve cookie/CSRF helpers, safe redirects, account-switch cleanup, token handling, and backend validation contracts. See [architecture](docs/architecture/frontend.md) for details.
- Do not inspect/print private `.env` values, credentials, or tokens. `.env.example` is public; browser-bundled `VITE_*` values must contain no secrets.

## Verification and maintenance

- Use [verification guidance](docs/sops/verification.md) to choose checks proportional to the change. UI work needs rendered inspection; runtime changes need relevant code checks.
- Commands: `npm run build`, `npm run lint`, `npm test -- --pool=threads`; focused tests/lint as appropriate. Use `npm.cmd`/`npx.cmd` on Windows if needed.
- Inspect results and final diff; run `git diff --check`. Fix introduced failures without suppressing checks or absorbing unrelated changes.
- Report resulting behavior, key files, checks actually performed, and material limitations. Separate mocked tests, browser previews, and live integration evidence.
- Update the owning product/architecture/integration document when its facts change. Keep feature inventories and historical check results out of this file.
- Select repository skills only when their descriptions match the task or the user requests them; see the [skill catalog and policy](.agents/README.md). Load the relevant skill rather than the entire catalog, and keep general task steps in SOPs.
 